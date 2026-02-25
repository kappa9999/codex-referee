#!/usr/bin/env node
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import type { RunReport as RunReportModel, RunRequest, ScoringProfile } from "@referee/core";
import { evaluateCandidate, runScriptCheck } from "@referee/eval";
import {
  assertCleanWorkingTree,
  assertGitRepository,
  collectDiffStats,
  createIsolatedWorktree,
  writeDiffPatch
} from "@referee/git";
import { rankCandidates, scoreCandidate, selectWinner } from "@referee/rank";
import { createMarkdownReport, formatSummary } from "@referee/report";
import { runPlaceholderStrategy } from "@referee/runner";
import { OptimizationPolicySchema, RunReportSchema } from "@referee/schemas";
import pino from "pino";
import { z } from "zod";

const logger = pino({ name: "referee-cli" });

async function findPolicyPath(): Promise<string> {
  const starts = [process.cwd(), fileURLToPath(new URL(".", import.meta.url))];

  for (const start of starts) {
    let current = resolve(start);

    for (let depth = 0; depth < 12; depth += 1) {
      const candidate = resolve(current, "references", "optimization-policy.json");

      try {
        await access(candidate);
        return candidate;
      } catch {
        // try parent directory
      }

      current = resolve(current, "..");
    }
  }

  throw new Error("optimization policy file not found in current or parent directories");
}

async function loadPolicy() {
  const policyPath = await findPolicyPath();
  const raw = await readFile(policyPath, "utf8");
  const parsed = JSON.parse(raw) as unknown;
  return OptimizationPolicySchema.parse(parsed);
}

function createRunId(): string {
  const iso = new Date().toISOString();
  const base = iso.replace(/[-:]/g, "").replace("T", "-").slice(0, 15);
  const random = Math.random().toString(36).slice(2, 6);
  return `${base}-${random}`;
}

function parseStrategies(csv: string): string[] {
  const entries = csv
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
  return [...new Set(entries)];
}

async function writeJson(path: string, payload: unknown): Promise<void> {
  await writeFile(path, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  task: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  if (items.length === 0) {
    return [];
  }

  const safeLimit = Math.max(1, Math.min(limit, items.length));
  const results: (R | undefined)[] = Array.from({ length: items.length }, () => undefined);
  let nextIndex = 0;

  const runWorker = async (): Promise<void> => {
    const currentIndex = nextIndex;
    nextIndex += 1;
    if (currentIndex >= items.length) {
      return;
    }
    const item = items[currentIndex];
    if (item === undefined) {
      return;
    }
    results[currentIndex] = await task(item, currentIndex);
    await runWorker();
  };

  const workers = Array.from({ length: safeLimit }, async () => runWorker());

  await Promise.all(workers);
  return results.map((result, index) => {
    if (result === undefined) {
      throw new Error(`Missing candidate result at index ${String(index)}`);
    }
    return result;
  });
}

const RunOptionsSchema = z.object({
  task: z.string().min(1),
  repo: z.string().min(1),
  strategies: z.string().min(1),
  maxParallel: z.coerce.number().int().positive(),
  profile: z.enum(["safe", "balanced", "speed"]),
  allowDirty: z.boolean(),
  jsonOut: z.string().optional(),
  autoAccept: z.boolean(),
  runChecks: z.boolean()
});

type RunOptions = z.infer<typeof RunOptionsSchema>;

function commandStub(name: string, description: string): Command {
  return new Command(name).description(description).action(() => {
    logger.info({ command: name }, "command skeleton ready");
    console.log(`${name}: not implemented yet`);
  });
}

const program = new Command();
program
  .name("referee")
  .description("Codex Referee CLI")
  .version("0.1.0")
  .option(
    "--policy-override",
    "override active optimization policy (requires REFEREE_POLICY_OVERRIDE_CONFIRM=YES)"
  );

program.hook("preAction", async (command) => {
  const policy = await loadPolicy();
  const opts = command.optsWithGlobals<{ policyOverride?: boolean }>();

  if (!policy.active) {
    return;
  }

  if (opts.policyOverride && process.env.REFEREE_POLICY_OVERRIDE_CONFIRM !== "YES") {
    throw new Error(
      "Policy override blocked. Set REFEREE_POLICY_OVERRIDE_CONFIRM=YES only with explicit user approval."
    );
  }

  if (opts.policyOverride) {
    logger.warn({ policy: policy.policy_name }, "policy override enabled for this invocation");
  }
});

program
  .command("run")
  .description("run a patch tournament")
  .requiredOption("--task <text>", "task description")
  .option("--repo <path>", "repository path", process.cwd())
  .option("--strategies <csv>", "strategy list", "safe,balanced,aggressive")
  .option("--max-parallel <n>", "max candidate concurrency", "3")
  .option("--profile <name>", "scoring profile", "balanced")
  .option("--allow-dirty", "allow dirty repository", false)
  .option("--json-out <path>", "optional report output path")
  .option("--auto-accept", "allow auto-accept winner decisions", false)
  .option("--run-checks", "run test/lint/typecheck scripts inside each worktree", false)
  .action(async (rawOptions: RunOptions) => {
    const parsedOptions = RunOptionsSchema.parse(rawOptions);
    const strategies = parseStrategies(parsedOptions.strategies);
    if (strategies.length === 0) {
      throw new Error("No strategies provided.");
    }

    const repoPath = resolve(parsedOptions.repo);
    const runId = createRunId();
    const runRoot = resolve(repoPath, "runs", runId);
    const candidatesRoot = resolve(runRoot, "candidates");
    const worktreesRoot = resolve(runRoot, "worktrees");

    await mkdir(candidatesRoot, { recursive: true });
    await mkdir(worktreesRoot, { recursive: true });

    await assertGitRepository(repoPath);
    if (!parsedOptions.allowDirty) {
      await assertCleanWorkingTree(repoPath);
    }

    const runRequest: RunRequest = {
      task: parsedOptions.task,
      repoPath,
      strategies,
      profile: parsedOptions.profile as ScoringProfile,
      maxParallel: parsedOptions.maxParallel,
      allowDirty: parsedOptions.allowDirty,
      autoAccept: parsedOptions.autoAccept,
      runChecks: parsedOptions.runChecks
    };

    const runStartedAt = new Date().toISOString();

    const scoredCandidates = await mapWithConcurrency(
      runRequest.strategies,
      runRequest.maxParallel,
      async (strategy, index) => {
        const candidateId = `${strategy}-${String(index + 1).padStart(2, "0")}`;
        const candidateRoot = resolve(candidatesRoot, strategy);
        await mkdir(candidateRoot, { recursive: true });

        const worktree = await createIsolatedWorktree({
          repoPath: runRequest.repoPath,
          runId,
          strategy,
          worktreeRoot: resolve(worktreesRoot, strategy)
        });

        const execution = await runPlaceholderStrategy({
          runId,
          candidateId,
          task: runRequest.task,
          strategy,
          worktreePath: worktree.path
        });
        await writeJson(resolve(candidateRoot, "execution.json"), {
          schemaVersion: "1.0.0",
          generatedAt: new Date().toISOString(),
          generator: "@referee/cli@0.1.0",
          data: execution
        });

        const diffStats = await collectDiffStats(worktree.path);
        await writeDiffPatch(worktree.path, resolve(candidateRoot, "diff.patch"));

        const checks = await Promise.all([
          runScriptCheck({
            name: "test",
            cwd: worktree.path,
            enabled: runRequest.runChecks
          }),
          runScriptCheck({
            name: "lint",
            cwd: worktree.path,
            enabled: runRequest.runChecks
          }),
          runScriptCheck({
            name: "typecheck",
            cwd: worktree.path,
            enabled: runRequest.runChecks
          })
        ]);

        const evaluation = evaluateCandidate({
          candidateId,
          strategy,
          execution,
          diffStats,
          checks
        });
        await writeJson(resolve(candidateRoot, "eval.json"), {
          schemaVersion: "1.0.0",
          generatedAt: new Date().toISOString(),
          generator: "@referee/eval@0.1.0",
          data: evaluation
        });

        const scoredCandidate = scoreCandidate(evaluation, runRequest.profile);
        await writeJson(resolve(candidateRoot, "score.json"), {
          schemaVersion: "1.0.0",
          generatedAt: new Date().toISOString(),
          generator: "@referee/rank@0.1.0",
          data: scoredCandidate.score
        });

        logger.info(
          {
            runId,
            candidateId,
            strategy,
            eligible: scoredCandidate.eligible,
            score: scoredCandidate.score.total
          },
          "candidate evaluated"
        );

        return scoredCandidate;
      }
    );

    const rankedCandidates = rankCandidates(scoredCandidates);
    const winner = selectWinner(rankedCandidates, {
      autoAccept: runRequest.autoAccept
    });
    const runFinishedAt = new Date().toISOString();

    const report: RunReportModel = {
      schemaVersion: "1.0.0",
      generatedAt: runFinishedAt,
      generator: "@referee/cli@0.1.0",
      runId,
      repoPath: runRequest.repoPath,
      task: runRequest.task,
      strategies: runRequest.strategies,
      profile: runRequest.profile,
      startedAt: runStartedAt,
      finishedAt: runFinishedAt,
      artifactsPath: runRoot,
      candidates: rankedCandidates,
      winner
    };

    RunReportSchema.parse(report);
    await writeJson(resolve(runRoot, "report.json"), report);
    const markdown = createMarkdownReport(report);
    await writeFile(resolve(runRoot, "report.md"), markdown, "utf8");

    if (parsedOptions.jsonOut) {
      await writeJson(resolve(parsedOptions.jsonOut), report);
    }

    console.log(formatSummary(report));
    console.log(`Artifacts: ${runRoot}`);

    process.exitCode = winner.status === "winner" ? 0 : 2;
  });

program.addCommand(commandStub("inspect", "inspect run details"));
program.addCommand(commandStub("accept", "accept a candidate"));
program.addCommand(commandStub("feedback", "record outcome feedback"));
program.addCommand(commandStub("list-runs", "list historical runs"));

program.parseAsync(process.argv).catch((error: unknown) => {
  if (error instanceof Error) {
    logger.error(
      {
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack
      },
      "cli execution failed"
    );
    console.error(error.message);
  } else {
    logger.error({ error }, "cli execution failed");
  }

  process.exitCode = 1;
});
