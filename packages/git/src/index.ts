import { execFile as execFileCallback } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { promisify } from "node:util";
import type { DiffStats } from "@referee/core";

const execFile = promisify(execFileCallback);

interface ExecFileFailure extends Error {
  stdout?: string;
  stderr?: string;
  code?: number | string;
}

async function runGit(
  directory: string,
  args: string[]
): Promise<{ stdout: string; stderr: string }> {
  try {
    const result = await execFile("git", ["-C", directory, ...args], {
      windowsHide: true,
      maxBuffer: 16 * 1024 * 1024
    });
    return {
      stdout: result.stdout.trimEnd(),
      stderr: result.stderr.trimEnd()
    };
  } catch (error) {
    const failure = error as ExecFileFailure;
    const details = failure.stderr?.trim() ?? failure.stdout?.trim() ?? failure.message;
    throw new Error(`git ${args.join(" ")} failed in ${directory}: ${details}`, { cause: error });
  }
}

function sanitizeName(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export async function assertGitRepository(repoPath: string): Promise<void> {
  const result = await runGit(repoPath, ["rev-parse", "--is-inside-work-tree"]);
  if (result.stdout !== "true") {
    throw new Error(`Path is not a git worktree: ${repoPath}`);
  }
}

export async function assertCleanWorkingTree(repoPath: string): Promise<void> {
  const result = await runGit(repoPath, ["status", "--porcelain"]);
  if (result.stdout.length > 0) {
    throw new Error(
      "Repository has uncommitted changes. Re-run with --allow-dirty to bypass this hard gate."
    );
  }
}

export interface WorktreeSpec {
  repoPath: string;
  runId: string;
  strategy: string;
  baseRef?: string;
  worktreeRoot?: string;
}

export interface WorktreeHandle {
  runId: string;
  strategy: string;
  branch: string;
  path: string;
}

export async function createIsolatedWorktree(spec: WorktreeSpec): Promise<WorktreeHandle> {
  const safeRunId = sanitizeName(spec.runId);
  const safeStrategy = sanitizeName(spec.strategy);
  const branch = `referee/${safeRunId}/${safeStrategy}`;
  const worktreeRoot =
    spec.worktreeRoot ?? resolve(spec.repoPath, "runs", spec.runId, "worktrees", safeStrategy);
  await mkdir(dirname(worktreeRoot), { recursive: true });

  const baseRef = spec.baseRef ?? "HEAD";
  await runGit(spec.repoPath, ["worktree", "add", "--force", "-b", branch, worktreeRoot, baseRef]);

  return {
    runId: spec.runId,
    strategy: spec.strategy,
    branch,
    path: worktreeRoot
  };
}

export async function collectDiffStats(worktreePath: string): Promise<DiffStats> {
  const result = await runGit(worktreePath, ["diff", "--numstat", "--", "."]);
  if (!result.stdout) {
    return {
      filesChanged: 0,
      insertions: 0,
      deletions: 0,
      touchedPaths: []
    };
  }

  const lines = result.stdout.split(/\r?\n/).filter((line) => line.length > 0);
  let insertions = 0;
  let deletions = 0;
  const touchedPaths: string[] = [];

  for (const line of lines) {
    const parts = line.split("\t");
    if (parts.length < 3) {
      continue;
    }

    const added = Number.parseInt(parts[0] ?? "0", 10);
    const removed = Number.parseInt(parts[1] ?? "0", 10);

    if (Number.isFinite(added)) {
      insertions += added;
    }
    if (Number.isFinite(removed)) {
      deletions += removed;
    }

    const path = parts.slice(2).join("\t").trim();
    if (path.length > 0) {
      touchedPaths.push(path);
    }
  }

  return {
    filesChanged: touchedPaths.length,
    insertions,
    deletions,
    touchedPaths
  };
}

export async function writeDiffPatch(worktreePath: string, destinationPath: string): Promise<void> {
  const result = await runGit(worktreePath, ["diff", "--", "."]);
  await mkdir(dirname(destinationPath), { recursive: true });
  await writeFile(destinationPath, result.stdout, "utf8");
}
