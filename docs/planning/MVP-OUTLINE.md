# MVP Outline (v0.1)

## Objective

Ship a local-first CLI that runs multiple Codex strategies for one task, scores each candidate, and recommends the highest-confidence patch.

## Primary User Story

"As a solo developer, I want one command that gives me the best patch among multiple strategy attempts so I spend less time manually comparing outputs."

## Non-Goals (v0.1)

- Mobile app.
- Team workflows.
- Cloud-hosted orchestration.
- Automatic merge to main branch.

## System Architecture

1. Orchestrator

- Creates run id.
- Expands strategy set (`safe`, `balanced`, `aggressive`).
- Schedules strategy executions with configurable parallelism.

2. Worktree Manager

- Creates isolated git worktree per strategy.
- Applies strategy-specific prompt envelope.
- Captures diffs and metadata.

3. Strategy Runner

- Invokes Codex for each strategy.
- Stores stdout/stderr, timing, and exit status.

4. Evaluator Pipeline

- Hard-gate checks (repo cleanliness, forbidden paths, patch apply sanity).
- Tests/lint/type-check/security checks.
- Diff heuristics (blast radius, churn, risky file touch).

5. Ranker

- Applies weighted scoring rubric.
- Runs winner-selection algorithm.
- Produces recommendation and confidence.

6. Reporter

- Prints terminal table.
- Writes machine-readable run report (`json`).
- Writes human summary (`md`).

7. Outcome Store

- Persists run outcomes.
- Persists user feedback (`accepted`, `rejected`, `edited`).
- Feeds future strategy weighting.

## End-to-End Flow

1. User runs `referee run --task "..."`.
2. Referee creates 3 worktrees and launches strategy runners.
3. Each candidate patch is evaluated.
4. Candidates failing hard gates are marked `ineligible`.
5. Eligible candidates are scored and ranked.
6. Winner and rationale are shown.
7. User accepts one candidate or overrides recommendation.
8. Feedback is stored for learning loop.

## Artifacts Produced Per Run

- `runs/<run-id>/config.json`
- `runs/<run-id>/candidates/<strategy>/diff.patch`
- `runs/<run-id>/candidates/<strategy>/eval.json`
- `runs/<run-id>/report.json`
- `runs/<run-id>/report.md`

## Failure Handling

- If all candidates fail hard gates: report `no-safe-winner` and show top salvage candidate by partial score.
- If repo is dirty and `--allow-dirty` is false: fail fast with clear remediation.
- If tests are missing: use reduced rubric profile and mark confidence downgrade.

## Success Metrics (MVP)

1. First-pass acceptance rate vs baseline single strategy.
2. Median time-to-acceptable patch.
3. Regression rate after user acceptance.
4. Recommendation precision (winner accepted by user).

## Exit Criteria for v0.1

- One-command tournament works on real repos.
- Report output is understandable without opening raw logs.
- Winner recommendation is reproducible and auditable.
- Outcome feedback is recorded for future optimization.
