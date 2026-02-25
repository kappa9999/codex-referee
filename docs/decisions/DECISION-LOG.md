# Decision Log

Use this file for immutable decision records. Append entries, never rewrite history.

## 2026-02-25 - D001

- Decision: Create a dedicated continuity-first workspace (`codex-referee-project`) before deeper research.
- Reason: User requested strong handoff capability across context-window/session resets.
- Long-term impact: Enables durable project memory and lower restart friction.
- Impact: Future sessions can start from local docs without relying on chat history.

## 2026-02-25 - D002

- Decision: Track Codex Referee as primary concept candidate.
- Reason: Preliminary analysis indicates generic mobile control workflows are increasingly crowded.
- Long-term impact: Focuses effort on defensible product surface (selection quality).
- Impact: Next research cycle focuses on patch tournament + scoring + learning moat.

## 2026-02-25 - D003

- Decision: Go forward with Codex Referee after deep competitor pass.
- Reason: No direct competitor was found in reviewed sources that explicitly combines parallel runs, objective scoring, automatic winner selection, and adaptive per-user strategy routing in one product.
- Long-term impact: Moves project from discovery to execution with a defensible wedge.
- Impact: Shift effort from market discovery to MVP architecture and execution planning.

## 2026-02-25 - D004

- Decision: Use local-first CLI as initial wedge.
- Reason: Fastest path to measurable value for solo developers and easiest to validate against baseline single-run workflows.
- Long-term impact: Establishes reusable local core that can later power remote surfaces.
- Impact: P1 work focuses on worktree orchestration, evaluator pipeline, ranking logic, and transparent scorecards.

## 2026-02-25 - D005

- Decision: Adopt hard-gate plus weighted-score winner selection model for v0.1.
- Reason: This balances safety (must-pass checks) and flexibility (comparative scoring) while keeping decisions auditable.
- Long-term impact: Provides stable evaluation contract and migration path for future scoring upgrades.
- Impact: Scoring and winner-selection specs are now stable enough to start implementation planning.

## 2026-02-25 - D006

- Decision: Lock implementation language to TypeScript.
- Reason: User explicitly chose TypeScript.
- Long-term impact: Strong static contracts and ecosystem support for maintainable CLI/core packages.
- Impact: Planning and scaffolding now centered on TypeScript monorepo architecture.

## 2026-02-25 - D007

- Decision: Hard-code "endgame optimization, no shortcuts" project mandate.
- Reason: User explicitly required long-term optimization over speed and requested hard-coded rule.
- Long-term impact: Reduces architectural drift and prevents hidden debt accumulation.
- Impact: Governance docs and machine-readable policy now enforce no-shortcut behavior unless user overrides.

## 2026-02-25 - D008

- Decision: Enforce optimization policy in CLI contract at startup.
- Reason: Rule must not remain documentation-only; runtime contract must include policy enforcement behavior.
- Long-term impact: Keeps implementation aligned with mandate during future feature growth.
- Impact: `CLI-SPEC.md` now includes startup policy loading and override governance.

## 2026-02-25 - D009

- Decision: Upgrade stack from initial pnpm-only orchestration draft to Node 24 + pnpm + Nx + strict typed linting baseline.
- Reason: Stack research showed better long-term CI/task graph optimization and cache-aware scaling with Nx while retaining TypeScript ecosystem compatibility.
- Long-term impact: Stronger monorepo scalability and safer evolution under strict quality gates.
- Impact: `TS-IMPLEMENTATION-PLAN.md` and scaffolding updated to Nx-based architecture.

## 2026-02-25 - D010

- Decision: Scaffold full TypeScript monorepo with package boundaries before implementing business logic.
- Reason: Endgame policy prioritizes architecture and quality baselines before feature velocity.
- Long-term impact: Lowers future refactor cost and enforces clean dependency direction from day one.
- Impact: `packages/*` scaffold, lint/type/test/build pipelines, and policy-aware CLI command surface are now live.

## 2026-02-25 - D011

- Decision: Implement vertical-slice `referee run` with worktree isolation, placeholder execution, hard-gate evaluation, weighted ranking, and JSON/Markdown artifacts.
- Reason: Move from architecture-only scaffold to auditable end-to-end behavior while preserving strict package boundaries.
- Long-term impact: Establishes a stable artifact pipeline (`execution/eval/score/report`) that future learning and accept/reject workflows can build on.
- Impact: `@referee/git`, `@referee/runner`, `@referee/eval`, `@referee/rank`, `@referee/report`, `@referee/schemas`, and CLI `run` are now integrated and executable.

## 2026-02-25 - D012

- Decision: Use `tsc -b tsconfig.json` for package `typecheck` scripts.
- Reason: Project-reference consumers were reading stale declaration outputs after core-type changes; build-mode typecheck resolves reference consistency.
- Long-term impact: Reduces false-negative type errors in multi-package evolution.
- Impact: All package `typecheck` scripts now validate through project references and pass in CI-style full-gate runs.
