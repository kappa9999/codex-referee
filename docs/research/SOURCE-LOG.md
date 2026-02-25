# Source Log

Purpose: map every external claim to a URL and date for auditability.

## 2026-02-25

### OpenAI ecosystem

- URL: https://openai.com/index/introducing-upgrades-to-codex/
- Claim used: Codex runs across terminal, IDE, web, GitHub, and phone surfaces; includes code review and cloud task positioning.

- URL: https://openai.com/index/introducing-the-codex-app/
- Claim used: Codex app supports multiple agents in parallel, worktrees, and long-running background workflows.

- URL: https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan/
- Claim used: Codex supports cloud delegation, background execution, isolated sandbox tasks, and Slack/SDK access.

- URL: https://developers.openai.com/codex/integrations/slack
- Claim used: Slack thread task delegation to Codex with cloud-task execution and result posting.

### GitHub ecosystem

- URL: https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent
- Claim used: Copilot coding agent runs in background, uses an ephemeral environment, executes tests/linters, and produces PRs.

- URL: https://github.blog/news-insights/product-news/agents-panel-launch-copilot-coding-agent-tasks-anywhere-on-github/
- Claim used: agents panel launches tasks from anywhere, supports parallel tasks, and tracks progress.

- URL: https://github.blog/changelog/2025-09-24-start-and-track-copilot-coding-agent-tasks-in-github-mobile/
- Claim used: mobile task delegation and status tracking with optional push notifications.

### Cursor ecosystem

- URL: https://cursor.com/changelog/1-1
- Claim used: background agents can be launched from Slack and return updates/PR links.

- URL: https://cursor.com/changelog/1-2
- Claim used: queued messages, memory improvements, and background-agent workflow improvements.

### OpenHands ecosystem

- URL: https://docs.openhands.dev/sdk/guides/agent-delegation
- Claim used: sub-agent delegation runs tasks in parallel and returns consolidated results.

- URL: https://openhands.dev/
- Claim used: cloud coding agent platform supports broad integrations and multi-agent scale positioning.

### Kilo ecosystem

- URL: https://kilo.ai/features/parallel-agents-cli
- Claim used: multiple agents in parallel using isolated git worktrees and PR-based review.

- URL: https://kilo.ai/docs/automate/agent-manager
- Claim used: parallel mode with worktree isolation, approvals, and cloud-synced sessions.

- URL: https://kilo.ai/docs/automate
- Claim used: AI code reviews and multi-agent orchestration in automation workflows.

### Adjacent evaluation tooling

- URL: https://github.com/angular/web-codegen-scorer
- Claim used: objective codegen quality checks, comparison workflows, and evaluation reporting.

- URL: https://developers.openai.com/api/docs/guides/agent-evals
- Claim used: reproducible agent evals, trace grading, and external-model evaluation options.

### Stack optimization research

- URL: https://nodejs.org/en/about/previous-releases
- Claim used: Node 24 is Active LTS; production guidance favors Active/Maintenance LTS lines.

- URL: https://nodejs.org/download/release/latest/docs/api/corepack.html
- Claim used: Corepack is experimental and no longer distributed starting Node v25.

- URL: https://pnpm.io/workspaces
- Claim used: pnpm has built-in monorepo support, workspace protocol guarantees, and points to Changesets for release workflows.

- URL: https://pnpm.io/settings
- Claim used: pnpm supports supply-chain hardening controls (`minimumReleaseAge`, `trustPolicy`, `blockExoticSubdeps`).

- URL: https://turborepo.dev/docs/crafting-your-repository/configuring-tasks
- Claim used: Turborepo provides parallel task graph execution and cacheable task inputs/outputs.

- URL: https://nx.dev/docs/how-nx-works
- Claim used: Nx is built around project/task graphs, affected commands, and caching model.

- URL: https://nx.dev/ci/features/affected
- Claim used: Nx can run only tasks affected by a PR using git diff and project graph.

- URL: https://nx.dev/docs/concepts/ci-concepts/cache-security
- Claim used: Nx documents cache poisoning risks and token safety model for remote cache usage.

- URL: https://typescript-eslint.io/getting-started/typed-linting
- Claim used: typed linting gives deeper static analysis power and is recommended despite performance cost.

- URL: https://typescript-eslint.io/packages/parser/
- Claim used: `projectService` is recommended for typed linting configuration and consistency with editor type services.

- URL: https://biomejs.dev/
- Claim used: Biome positions itself as fast formatter/linter with 97% Prettier compatibility target.

- URL: https://biomejs.dev/pt-br/linter/plugins/
- Claim used: Biome linter plugin model currently supports GritQL plugins.

- URL: https://vitest.dev/guide/workspace.html
- Claim used: Vitest supports monorepo test projects (workspace replacement).

- URL: https://vitest.dev/guide/migration
- Claim used: Vitest 4 introduces major updates and monorepo-relevant migration considerations.

- URL: https://www.typescriptlang.org/docs/handbook/project-references
- Claim used: project references + `tsc -b` improve build times and component separation.

- URL: https://nodejs.org/api/sqlite.html
- Claim used: Node `node:sqlite` is still stability level 1.1 active development.

- URL: https://orm.drizzle.team/docs/get-started/sqlite-new
- Claim used: Drizzle supports SQLite using better-sqlite3/libsql with migration workflow options.

## Notes

- Deep pass completed for competitor overlap scoring.
- Stack pass completed and used to revise implementation direction.
- Re-validate stack assumptions quarterly because tool maturity moves quickly.
