# TypeScript Implementation Plan (Endgame-Oriented)

Last updated: 2026-02-25

## Stack Lock (Revised After Research)

- Language: TypeScript (strict mode, project references).
- Runtime: Node.js 24 Active LTS.
- Package manager: pnpm 10 workspaces.
- Monorepo orchestrator: Nx.
- Testing: Vitest 4 projects.
- Linting: ESLint 9 + typescript-eslint typed linting (`projectService`).
- Formatting: Prettier.
- Runtime validation: Zod.
- CLI framework: Commander.
- Logging: Pino.
- Local data store: SQLite via better-sqlite3 + Drizzle ORM migrations.
- Versioning/release workflow: Changesets.

## Why This Stack

1. Reliability: Node 24 Active LTS is stable for production workloads.
2. Scale: Nx adds task graph orchestration, affected-only CI execution, and cache tooling for monorepo growth.
3. Code quality: typed linting + strict TS catches deeper correctness issues than syntax-only linting.
4. Data durability: Drizzle + better-sqlite3 gives typed schema control and migration discipline.
5. Governance: aligns with no-shortcut mandate by making quality gates explicit and enforceable.

## Monorepo Package Layout

1. `packages/core`

- run orchestration contracts, domain models, shared types.

2. `packages/git`

- worktree lifecycle, patch extraction, repo safety checks.

3. `packages/runner`

- strategy execution adapters, process isolation, timeout controls.

4. `packages/eval`

- hard gates, tests/lint/static/security adapters, metric normalization.

5. `packages/rank`

- scoring rubric engine, tie-breakers, winner-selection logic.

6. `packages/store`

- run artifact index, feedback persistence, strategy history.

7. `packages/report`

- markdown/json output contracts, terminal summary tables.

8. `packages/cli`

- `run`, `inspect`, `accept`, `feedback`, `list-runs` command surface.

9. `packages/schemas`

- shared zod schemas for config, run artifacts, and reports.

## Root Tooling Contracts

- `pnpm-workspace.yaml` defines workspace boundaries.
- `nx.json` defines named inputs, target defaults, and cache policy.
- `tsconfig.base.json` defines strict compiler baseline.
- `tsconfig.json` solution references workspace projects.
- `vitest.workspace.ts` configures multi-project tests.
- ESLint config enforces typed rules for production packages.

## Supply-Chain Hardening

Use pnpm security settings in workspace config:

1. `minimumReleaseAge`
2. `trustPolicy`
3. `blockExoticSubdeps`

## Quality Gates (No-Shortcut Mode)

1. `pnpm lint` must pass for all packages.
2. `pnpm typecheck` must pass under strict TS.
3. `pnpm test` must pass for affected and full runs.
4. Ranking and scoring modules require unit + property tests.
5. CLI output contracts require schema/contract tests.
6. Any bypass requires explicit debt tracking entry.

## Implementation Phases

### Phase 1: Foundation

1. Initialize monorepo workspace + Nx orchestration.
2. Add shared configs (tsconfig, eslint, prettier, vitest).
3. Define core schemas and artifact contracts.

### Phase 2: Core Execution

1. Implement worktree manager.
2. Implement strategy runner contract.
3. Implement run artifact writer and loader.

### Phase 3: Evaluation and Ranking

1. Implement hard-gate engine.
2. Implement weighted rubric calculator.
3. Implement winner-selection algorithm.
4. Add deterministic report generation.

### Phase 4: Feedback Loop

1. Record accept/reject outcomes.
2. Implement strategy priors and weighting adjustments.
3. Add explainable recommendation metadata.

### Phase 5: Hardening

1. Add fault-injection tests.
2. Add anti-gaming checks for scoring.
3. Add versioned artifact migration strategy.
4. Add cache-safety and artifact-integrity checks in CI.

## Long-Term Optimization Hooks

1. Strategy performance history indexed by task class.
2. Confidence calibration using real acceptance outcomes.
3. Optional policy profiles per repo.
4. Deterministic replay from artifact bundles.
5. Affected-only CI for fast but safe iteration loops.
