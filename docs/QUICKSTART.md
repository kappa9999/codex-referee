# Quickstart

Codex Referee helps pick the best patch by running multiple strategies and ranking the results.

## Requirements

- Node `24.x`
- `pnpm` `10.x`
- `git`

## Install

```bash
pnpm install
```

## Validate Setup

```bash
pnpm format
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Run Your First Tournament

```bash
pnpm --filter @referee/cli dev -- run \
  --task "add retry logic to api client" \
  --repo /path/to/repo \
  --strategies "safe,balanced,aggressive" \
  --max-parallel 3
```

## Output You Will See

- A recommended winner candidate
- A confidence level
- A run artifacts path

Example:

```text
Run 20260225-203558-ibr6: winner safe-01 (69.50, low)
Artifacts: /path/to/repo/runs/20260225-203558-ibr6
```
