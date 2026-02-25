<p align="center">
  <img src="./assets/brand/hero.svg" alt="Codex Referee hero banner" width="100%" />
</p>

<p align="center">
  <img src="./assets/brand/icon.svg" alt="Codex Referee logo" width="92" />
</p>

<h1 align="center">Codex Referee</h1>

<p align="center">
  A decision layer for Codex that helps you pick the best patch, not just generate one.
</p>

<p align="center">
  It runs multiple approaches to the same task, scores them, and recommends the safest winner with proof.
</p>

## What This Is (Plain English)

Most people using AI coding tools hit the same problem:

- You can generate code quickly.
- You still spend time deciding which output to trust.
- A weak choice can create bugs or technical debt.

Codex Referee solves that decision problem.

Instead of one AI answer, it creates a small “tournament” of patch candidates and gives you one ranked recommendation based on quality gates.

## Why People Would Use It

1. Better odds of a good first result without manually re-prompting.
2. Less time comparing multiple AI outputs by hand.
3. Safer merges thanks to explicit pass/fail gates.
4. Clear audit trail for what was tested, scored, and selected.
5. Works for hobby scripts, side projects, and serious production code.

## How It Works

1. You give one task, such as “add retry logic to my API client.”
2. Referee runs multiple strategies in isolated git worktrees.
3. Each candidate is evaluated with hard gates and scoring signals.
4. Candidates are ranked and a winner is selected.
5. You get a readable report plus machine artifacts you can inspect later.

## What You Get After a Run

- `report.md`: human-friendly summary.
- `report.json`: machine-readable run result.
- Per-candidate artifacts:
- `diff.patch`
- `execution.json`
- `eval.json`
- `score.json`

## Real-World Use Cases

1. “Give me the safest patch for a bug fix under time pressure.”
2. “I want an AI-assisted refactor, but I need confidence before merge.”
3. “I’m learning coding and want a clearer explanation of why one solution is better.”
4. “I want consistent AI output quality across many small tasks.”

## What Makes It Different From “Just Use Codex Once”

- Single run: one output, manual trust decision.
- Referee run: multiple outputs, objective scoring, clear winner rationale.

It does not replace Codex.  
It makes Codex decisions more reliable.

## Current Project Status

This repository is in **alpha** and already has a working end-to-end `run` flow:

- strategy worktree isolation,
- candidate execution artifacts,
- hard-gate evaluation,
- weighted ranking and winner selection,
- markdown + JSON reporting.

## Quick Start

Requirements:

- Node `24.x`
- `pnpm` `10.x`
- `git`

Install:

```bash
pnpm install
```

Run quality checks:

```bash
pnpm format
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Run Referee:

```bash
pnpm --filter @referee/cli dev -- run \
  --task "add retry logic to api client" \
  --repo /path/to/repo \
  --strategies "safe,balanced,aggressive" \
  --max-parallel 3
```

Example output:

```text
Run 20260225-203558-ibr6: winner safe-01 (69.50, low)
Artifacts: /path/to/repo/runs/20260225-203558-ibr6
```

## FAQ

Is this only for enterprise teams?  
No. It was designed for individual ChatGPT Pro + Codex users first.

Do I need to understand all the internals?  
No. You can start with one command and read the markdown report.

Does it auto-merge code?  
No. It recommends a winner and gives transparent artifacts so you stay in control.

## Roadmap

1. Add persistence and run history indexing.
2. Implement `inspect`, `accept`, and `feedback` commands.
3. Add learning loop from accept/reject outcomes.
4. Add CI workflows for affected-only checks.

## Technical Notes

Monorepo packages:

- `@referee/core`
- `@referee/git`
- `@referee/runner`
- `@referee/eval`
- `@referee/rank`
- `@referee/report`
- `@referee/schemas`
- `@referee/store`
- `@referee/cli`

Policy files:

- `docs/product/ENDGAME-OPTIMIZATION-MANDATE.md`
- `references/optimization-policy.json`
