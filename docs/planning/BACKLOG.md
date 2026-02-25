# Backlog

## P0

- [x] Build source-backed competitor matrix for Codex Referee concept.
- [x] Classify each competitor overlap (low/medium/high).
- [x] Decide go/no-go for current concept.

## P1

- [x] Define MVP architecture (local runner, worktree isolation, evaluator pipeline).
- [x] Draft first CLI UX for running a tournament on one task.
- [x] Define scoring rubric and weight presets (`safe`, `balanced`, `aggressive`).
- [x] Define winner-selection policy (hard gates plus weighted score).

## P2

- [x] Choose implementation language and long-term stack direction.
- [x] Hard-code project mandate: endgame optimization, no shortcuts.
- [x] Define TypeScript implementation plan and package boundaries.

## P3

- [x] Finalize package manager/build tooling decisions for TypeScript monorepo.
- [x] Define package-level API contracts (`core`, `eval`, `rank`, `cli`, `store`).
- [x] Define run artifact JSON schemas and migration strategy.
- [x] Define debt-tracking workflow required by no-shortcut policy.

## P4

- [x] Scaffold TypeScript monorepo and strict quality gates.
- [x] Scaffold runnable CLI with placeholder commands (`run`, `inspect`, `accept`, `feedback`, `list-runs`).
- [x] Implement worktree manager and artifact directory writer.
- [x] Implement evaluator adapters (tests, lint, typecheck with optional execution/skip handling).

## P5

- [x] Implement ranking engine from scoring rubric.
- [ ] Implement learning loop persistence (accept/reject feedback).
- [ ] Add first real unit tests for store module.
- [x] Add first real unit tests for rank/eval modules.
- [ ] Add CI workflow with affected-only checks.

## Parking Lot

- [ ] Mobile notification companion once core engine works.
- [ ] Team mode and remote collaboration features.
