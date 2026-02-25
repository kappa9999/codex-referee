import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { CandidateExecution, CheckResult } from "@referee/core";
import { describe, expect, it } from "vitest";
import { evaluateCandidate, runScriptCheck } from "./index.js";

function makeExecution(): CandidateExecution {
  return {
    candidateId: "safe-01",
    strategy: "safe",
    worktreePath: "C:/repo/worktree/safe",
    command: "placeholder.write-file",
    outputPath: ".referee/placeholder/safe.md",
    startedAt: "2026-02-25T00:00:00.000Z",
    finishedAt: "2026-02-25T00:00:01.000Z",
    durationMs: 1000,
    exitCode: 0
  };
}

function makeCheck(name: CheckResult["name"], status: CheckResult["status"]): CheckResult {
  return {
    name,
    status,
    command: `npm run --silent ${name}`,
    summary: status,
    startedAt: "2026-02-25T00:00:00.000Z",
    finishedAt: "2026-02-25T00:00:00.500Z",
    durationMs: 500
  };
}

describe("evaluateCandidate", () => {
  it("keeps candidate eligible but reduced-confidence when tests are skipped", () => {
    const evaluation = evaluateCandidate({
      candidateId: "safe-01",
      strategy: "safe",
      execution: makeExecution(),
      diffStats: {
        filesChanged: 1,
        insertions: 10,
        deletions: 2,
        touchedPaths: ["src/client.ts"]
      },
      checks: [makeCheck("test", "skip"), makeCheck("lint", "pass"), makeCheck("typecheck", "pass")]
    });

    expect(evaluation.gateStatus).toBe("pass");
    expect(evaluation.reducedConfidence).toBe(true);
    expect(evaluation.riskFlags).toContain("reduced-confidence");
  });

  it("marks candidate ineligible when lint fails", () => {
    const evaluation = evaluateCandidate({
      candidateId: "safe-01",
      strategy: "safe",
      execution: makeExecution(),
      diffStats: {
        filesChanged: 2,
        insertions: 20,
        deletions: 7,
        touchedPaths: ["src/client.ts", "src/retry.ts"]
      },
      checks: [makeCheck("test", "pass"), makeCheck("lint", "fail"), makeCheck("typecheck", "pass")]
    });

    expect(evaluation.gateStatus).toBe("fail");
    expect(evaluation.gates.find((gate) => gate.name === "lint_health")?.passed).toBe(false);
  });
});

describe("runScriptCheck", () => {
  it("returns skip when execution is disabled", async () => {
    const result = await runScriptCheck({
      name: "test",
      cwd: process.cwd(),
      enabled: false
    });

    expect(result.status).toBe("skip");
  });

  it("returns skip when script is not defined", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "referee-eval-test-"));
    await writeFile(
      join(tempDir, "package.json"),
      JSON.stringify({ name: "tmp", scripts: {} }),
      "utf8"
    );

    const result = await runScriptCheck({
      name: "lint",
      cwd: tempDir,
      enabled: true
    });

    expect(result.status).toBe("skip");
    expect(result.summary).toContain("not found");
  });
});
