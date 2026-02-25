# Artifact Schema and Migration Strategy

Last updated: 2026-02-25

## Objectives

1. Deterministic, replayable run artifacts.
2. Backward-compatible reads across versions.
3. Explicit migration path when schemas evolve.

## Artifact Layout

- `runs/<run-id>/config.json`
- `runs/<run-id>/candidates/<candidate-id>/diff.patch`
- `runs/<run-id>/candidates/<candidate-id>/eval.json`
- `runs/<run-id>/report.json`
- `runs/<run-id>/report.md`

## Versioning Model

Each JSON artifact must include:

- `schemaVersion` (semver-like string)
- `generatedAt` (ISO timestamp)
- `generator` (package/version)

Example:
`{"schemaVersion":"1.0.0","generatedAt":"...","generator":"@referee/report@0.1.0",...}`

## Compatibility Rules

1. Patch/minor schema bumps must keep backward read compatibility.
2. Major schema bumps may break compatibility but require migration handlers.
3. Readers must reject unknown major versions with explicit remediation message.

## Migration Framework

- Migration functions live in `@referee/store`.
- Naming: `migrate_<from>_to_<to>.ts`.
- All migrations must be idempotent and tested.

## Migration Execution Policy

1. On read, detect artifact `schemaVersion`.
2. If version < current, apply ordered migration steps.
3. Persist migrated artifact only when `--write-migrations` is enabled.
4. Keep original artifact by default for auditability.

## Validation

- `@referee/schemas` owns zod definitions for each version.
- Pre-migration and post-migration validation are both required.

## Failure Handling

1. Migration failure marks run as `migration_failed`.
2. Emit full error trace + failing artifact path.
3. Never silently coerce invalid structures.
