# CLI Spec (v0.1)

## Command Surface

1. `referee run`
2. `referee inspect`
3. `referee accept`
4. `referee feedback`
5. `referee list-runs`

## Global Policy Enforcement

- CLI loads `references/optimization-policy.json` at startup.
- If policy is active, no-shortcut constraints are enforced by default.
- Any policy override requires explicit user approval and must be logged in decision and session logs.

## 1) referee run

Runs a tournament for one task.

Example:
`referee run --task "add retry logic to api client" --strategies safe,balanced,aggressive --max-parallel 3`

Key flags:

- `--task <text>` required.
- `--repo <path>` default current directory.
- `--strategies <csv>` default `safe,balanced,aggressive`.
- `--max-parallel <n>` default `3`.
- `--profile <name>` scoring profile (`safe`, `balanced`, `speed`).
- `--allow-dirty` default false.
- `--json-out <path>` optional.
- `--auto-accept` optional, only when confidence and policy permit.

Output:

- Ranked table of candidates.
- Winner recommendation and confidence.
- Path to full report artifacts.

## 2) referee inspect

Inspect details for a prior run.

Example:
`referee inspect --run-id 20260225-193455`

Output:

- Candidate breakdown, failed gates, score contributions, and raw evaluator logs.

## 3) referee accept

Mark winner or override and emit patch application instructions.

Example:
`referee accept --run-id 20260225-193455 --candidate balanced`

Output:

- Apply instructions and feedback record.

## 4) referee feedback

Record user outcome to train strategy weighting.

Example:
`referee feedback --run-id 20260225-193455 --candidate balanced --label accepted --reason "cleanest diff"`

Labels:

- `accepted`
- `rejected`
- `accepted_after_edit`

## 5) referee list-runs

List historical runs with quick metadata.

Example:
`referee list-runs --limit 20`

## Exit Codes

- `0` success with winner.
- `2` no-safe-winner.
- `3` invalid config or dirty repo policy violation.
- `4` runtime/evaluator failure.

## Report Schema (Minimum)

- `run_id`
- `repo`
- `task`
- `strategies`
- `candidates[]`
- `winner`
- `confidence`
- `artifacts_path`
