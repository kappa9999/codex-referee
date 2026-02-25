# Stack Optimization Research (2026-02-25)

## Question

Is the current TypeScript stack plan optimal for long-term endgame execution, or should it be upgraded?

## Decision Summary

A materially better stack was identified.

Selected stack:

1. Node.js 24 Active LTS runtime.
2. pnpm 10 workspaces with supply-chain hardening settings.
3. Nx task runner/orchestrator for project graph, affected execution, and cache-aware CI optimization.
4. TypeScript strict mode with project references and `tsc -b` builds.
5. ESLint + typescript-eslint typed linting (`projectService`) plus Prettier formatting.
6. Vitest 4 test projects for monorepo-aware testing.
7. Drizzle ORM + better-sqlite3 for typed schema and migration control.
8. Zod for runtime config and artifact validation.

## Why This Is Better Than Prior Draft

The prior draft used pnpm workspaces alone with no dedicated task graph orchestrator. Adding Nx materially improves long-term CI and monorepo scaling via:

- affected-only task execution,
- explicit task graph orchestration,
- robust caching and remote cache workflows,
- stronger cache-security guidance.

## Key Comparisons

### Runtime: Node 24 vs Bun

- Node 24 is Active LTS and explicitly recommended production line in Node release policy context.
- Bun is fast but Bun’s own compatibility docs still show partially implemented Node APIs in several modules.
- Result: choose Node 24 for reliability over speculative runtime speed gains.

### Orchestrator: Nx vs Turborepo

- Turborepo provides strong task orchestration and caching.
- Nx adds first-class affected-by-PR execution and detailed cache security model documentation.
- For long-term optimization mandate, Nx’s broader orchestration and CI controls are favored.

### Linting: typescript-eslint typed lint vs Biome-only

- typed linting provides deeper semantic checks and bug-finding power.
- Biome is fast and useful, but its own docs highlight a formatter compatibility target (not parity) and plugin model centered on GritQL.
- Result: keep typed ESLint as default quality gate; Biome can be an optional future formatter experiment.

### Local persistence: node:sqlite vs Drizzle + better-sqlite3

- Node `node:sqlite` remains `Stability: 1.1 - Active development`.
- Drizzle supports SQLite with better-sqlite3 driver and explicit migration workflows.
- Result: use Drizzle + better-sqlite3 for mature typed schema/migration behavior.

## Final Recommendation

Adopt the upgraded stack now and scaffold with Nx-based monorepo governance.
