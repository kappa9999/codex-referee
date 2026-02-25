# Package Contracts (v0.1)

Last updated: 2026-02-25

## Purpose

Define stable package boundaries and API responsibilities before deeper implementation.

## Core Contracts

### `@referee/core`

- Owns canonical domain types:
  - run request/response,
  - candidate state,
  - score breakdown,
  - winner decision payload.
- Rules:
  - no infrastructure code,
  - no process execution,
  - no filesystem access.

### `@referee/git`

- Owns git/worktree operations:
  - create/remove/list isolated worktrees,
  - capture patch/diff metadata,
  - safety checks around branch state.
- Rules:
  - no scoring logic,
  - no UI/report formatting.

### `@referee/runner`

- Owns strategy execution lifecycle:
  - command execution,
  - timeout/retry policy,
  - stdout/stderr capture.
- Rules:
  - no ranking decisions,
  - no database writes (except via interfaces).

### `@referee/eval`

- Owns hard gates and measured signals:
  - tests/lint/typecheck/security adapters,
  - normalized metrics from candidate outputs.
- Rules:
  - no final winner selection.

### `@referee/rank`

- Owns weighted scoring and winner selection algorithm.
- Inputs:
  - normalized evaluation outputs,
  - scoring profile,
  - policy constraints.
- Outputs:
  - ranked candidates,
  - winner + confidence + rationale.

### `@referee/store`

- Owns persistence:
  - run metadata,
  - candidate artifacts index,
  - feedback events,
  - migration execution.
- Rules:
  - schema changes must be versioned.

### `@referee/report`

- Owns human/machine outputs:
  - markdown summary,
  - JSON report serialization,
  - terminal summary helpers.

### `@referee/schemas`

- Owns zod contracts for:
  - optimization policy,
  - run artifacts,
  - report payloads.
- Rules:
  - shared by CLI and internal packages.

### `@referee/cli`

- Owns command surface and policy enforcement at entrypoint.
- Delegates all business logic to package interfaces.

## Dependency Direction Rules

Allowed direction (high-level):

1. `cli` -> `core|runner|eval|rank|store|report|schemas|git`
2. `runner|eval|rank|store|report|git` -> `core|schemas`
3. `core|schemas` -> no internal package dependencies

Forbidden examples:

- `core` importing `store`.
- `rank` importing `cli`.
- `eval` importing `report`.

## Stability Levels

- `stable`: contracts consumed across package boundaries.
- `internal`: helper APIs not consumed externally.

Initial stable contracts should be tagged in source via comments:
`// @contract:stable`
