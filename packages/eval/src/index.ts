import { execFile as execFileCallback } from "node:child_process";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import type {
  CandidateEvaluation,
  CandidateExecution,
  CheckName,
  CheckResult,
  DiffStats,
  GateResult
} from "@referee/core";

const execFile = promisify(execFileCallback);

interface ExecFailure extends Error {
  stdout?: string;
  stderr?: string;
  signal?: NodeJS.Signals;
  code?: number | string;
}

interface PackageManifest {
  scripts?: Record<string, string>;
}

function clampUnit(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function toScore(status: CheckResult["status"]): number {
  if (status === "pass") {
    return 1;
  }
  if (status === "fail") {
    return 0;
  }
  return 0.5;
}

function findCheck(checks: CheckResult[], name: CheckName): CheckResult | undefined {
  return checks.find((item) => item.name === name);
}

async function readScripts(cwd: string): Promise<Record<string, string>> {
  const packageJsonPath = join(cwd, "package.json");
  try {
    const raw = await readFile(packageJsonPath, "utf8");
    const parsed = JSON.parse(raw) as PackageManifest;
    return parsed.scripts ?? {};
  } catch {
    return {};
  }
}

export interface ScriptCheckRequest {
  name: CheckName;
  cwd: string;
  enabled: boolean;
  timeoutMs?: number;
}

export async function runScriptCheck(request: ScriptCheckRequest): Promise<CheckResult> {
  const startMs = Date.now();
  const startedAt = new Date(startMs).toISOString();
  const finished = (status: CheckResult["status"], summary: string): CheckResult => {
    const endMs = Date.now();
    return {
      name: request.name,
      status,
      command: `npm run --silent ${request.name}`,
      summary,
      startedAt,
      finishedAt: new Date(endMs).toISOString(),
      durationMs: endMs - startMs
    };
  };

  if (!request.enabled) {
    return finished("skip", "check execution disabled");
  }

  const scripts = await readScripts(request.cwd);
  if (!(request.name in scripts)) {
    return finished("skip", `script '${request.name}' not found`);
  }

  try {
    await execFile("npm", ["run", "--silent", request.name], {
      cwd: request.cwd,
      windowsHide: true,
      timeout: request.timeoutMs ?? 10 * 60 * 1000,
      maxBuffer: 16 * 1024 * 1024
    });
    return finished("pass", "script completed successfully");
  } catch (error) {
    const failure = error as ExecFailure;
    if (failure.signal === "SIGTERM") {
      return finished("fail", "script timed out");
    }

    if (typeof failure.code === "number") {
      return finished("fail", `script exited with code ${String(failure.code)}`);
    }

    const stderr = failure.stderr?.trim();
    if (stderr && stderr.length > 0) {
      return finished("fail", stderr);
    }

    return finished("fail", failure.message);
  }
}

export interface EvaluateCandidateInput {
  candidateId: string;
  strategy: string;
  execution: CandidateExecution;
  diffStats: DiffStats;
  checks: CheckResult[];
  forbiddenPathPrefixes?: string[];
  strategyHistoricalAcceptance?: number;
}

function evaluateGates(input: EvaluateCandidateInput): {
  gates: GateResult[];
  reducedConfidence: boolean;
} {
  const forbiddenPrefixes = input.forbiddenPathPrefixes ?? [".git/", "node_modules/"];
  const touched = input.diffStats.touchedPaths;
  const forbiddenTouched = touched.filter((path) =>
    forbiddenPrefixes.some((prefix) => path.toLowerCase().startsWith(prefix.toLowerCase()))
  );
  const lintCheck = findCheck(input.checks, "lint");
  const typecheck = findCheck(input.checks, "typecheck");
  const tests = findCheck(input.checks, "test");

  const gates: GateResult[] = [
    {
      name: "patch_apply",
      passed: input.execution.exitCode === 0,
      reason:
        input.execution.exitCode === 0
          ? "runner completed with successful exit code"
          : `runner exited with code ${String(input.execution.exitCode)}`
    },
    {
      name: "forbidden_paths",
      passed: forbiddenTouched.length === 0,
      reason:
        forbiddenTouched.length === 0
          ? "no forbidden path changes detected"
          : `forbidden path changes: ${forbiddenTouched.join(", ")}`
    },
    {
      name: "lint_health",
      passed: lintCheck ? lintCheck.status !== "fail" : true,
      reason: lintCheck ? lintCheck.summary : "lint check not configured"
    },
    {
      name: "typecheck_health",
      passed: typecheck ? typecheck.status !== "fail" : true,
      reason: typecheck ? typecheck.summary : "typecheck not configured"
    },
    {
      name: "functional_viability",
      passed: tests ? tests.status !== "fail" : true,
      reason: tests ? tests.summary : "tests not configured"
    }
  ];

  const reducedConfidence = tests?.status !== "pass";
  return { gates, reducedConfidence };
}

function calculateMetrics(input: EvaluateCandidateInput, reducedConfidence: boolean) {
  const lint = findCheck(input.checks, "lint");
  const typecheck = findCheck(input.checks, "typecheck");
  const tests = findCheck(input.checks, "test");
  const totalDiffLines = input.diffStats.insertions + input.diffStats.deletions;
  const touchesDocsOrTests = input.diffStats.touchedPaths.some(
    (path) =>
      path.toLowerCase().includes("readme") ||
      path.toLowerCase().includes("docs/") ||
      path.toLowerCase().includes("test")
  );
  const touchesRiskyArea = input.diffStats.touchedPaths.some((path) =>
    /(auth|payment|security|infra|core)/i.test(path)
  );

  const correctness = clampUnit(
    toScore(tests?.status ?? "skip") * 0.625 +
      toScore(lint?.status ?? "skip") * 0.1875 +
      toScore(typecheck?.status ?? "skip") * 0.1875
  );
  const blastRadiusScore = clampUnit(1 - input.diffStats.filesChanged / 40);
  const churnScore = clampUnit(1 - totalDiffLines / 800);
  const safetyPenalty = touchesRiskyArea ? 0.2 : 0;
  const safety = clampUnit(blastRadiusScore * 0.6 + churnScore * 0.4 - safetyPenalty);

  const maintainabilityPenalty = Math.min(totalDiffLines / 1200, 0.45);
  const maintainability = clampUnit(
    0.55 + (touchesDocsOrTests ? 0.15 : 0) - maintainabilityPenalty
  );
  const efficiency = clampUnit(1 - input.execution.durationMs / (2 * 60 * 1000));
  const fallbackPersonalFit =
    input.strategy === "safe" ? 0.7 : input.strategy === "balanced" ? 0.6 : 0.5;
  const personalFit = clampUnit(input.strategyHistoricalAcceptance ?? fallbackPersonalFit);

  const riskFlags: string[] = [];
  if (input.diffStats.filesChanged > 20) {
    riskFlags.push("wide-blast-radius");
  }
  if (totalDiffLines > 500) {
    riskFlags.push("high-diff-churn");
  }
  if (touchesRiskyArea) {
    riskFlags.push("touches-sensitive-area");
  }
  if (reducedConfidence) {
    riskFlags.push("reduced-confidence");
  }

  const explanation: string[] = [
    `correctness derived from checks (test/lint/typecheck) => ${correctness.toFixed(2)}`,
    `safety derived from blast radius and churn => ${safety.toFixed(2)}`,
    `maintainability adjusted by diff churn and docs/tests touch => ${maintainability.toFixed(2)}`,
    `efficiency derived from strategy runtime => ${efficiency.toFixed(2)}`,
    `personal fit baseline for strategy '${input.strategy}' => ${personalFit.toFixed(2)}`
  ];

  return {
    metrics: {
      correctness,
      safety,
      maintainability,
      efficiency,
      personalFit
    },
    riskFlags,
    explanation
  };
}

export function allGatesPassed(results: GateResult[]): boolean {
  return results.every((item) => item.passed);
}

export function evaluateCandidate(input: EvaluateCandidateInput): CandidateEvaluation {
  const { gates, reducedConfidence } = evaluateGates(input);
  const { metrics, riskFlags, explanation } = calculateMetrics(input, reducedConfidence);

  return {
    candidateId: input.candidateId,
    strategy: input.strategy,
    gateStatus: allGatesPassed(gates) ? "pass" : "fail",
    gates,
    checks: input.checks,
    reducedConfidence,
    riskFlags,
    explanation,
    metrics,
    diffStats: input.diffStats,
    runtimeMs: input.execution.durationMs
  };
}
