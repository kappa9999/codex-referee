import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import type { CandidateExecution } from "@referee/core";

export interface PlaceholderStrategyRequest {
  runId: string;
  candidateId: string;
  task: string;
  strategy: string;
  worktreePath: string;
}

function createPlaceholderContent(input: PlaceholderStrategyRequest): string {
  return [
    "# Referee Placeholder Strategy Output",
    "",
    `- run_id: ${input.runId}`,
    `- candidate_id: ${input.candidateId}`,
    `- strategy: ${input.strategy}`,
    `- generated_at: ${new Date().toISOString()}`,
    "",
    "## Task",
    input.task,
    "",
    "## Placeholder Plan",
    "1. Analyze repository structure and identify impacted modules.",
    "2. Implement strategy-specific patch proposal.",
    "3. Execute quality checks and emit artifacts."
  ].join("\n");
}

export async function runPlaceholderStrategy(
  input: PlaceholderStrategyRequest
): Promise<CandidateExecution> {
  const startMs = Date.now();
  const startedAt = new Date(startMs).toISOString();

  const safeStrategyFileName = input.strategy.replace(/[^a-zA-Z0-9._-]/g, "-");
  const relativeOutputPath = join(".referee", "placeholder", `${safeStrategyFileName}.md`);
  const outputPath = resolve(input.worktreePath, relativeOutputPath);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, createPlaceholderContent(input), "utf8");

  const endMs = Date.now();
  return {
    candidateId: input.candidateId,
    strategy: input.strategy,
    worktreePath: input.worktreePath,
    command: "placeholder.write-file",
    outputPath: relative(input.worktreePath, outputPath),
    startedAt,
    finishedAt: new Date(endMs).toISOString(),
    durationMs: endMs - startMs,
    exitCode: 0
  };
}
