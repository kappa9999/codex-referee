# Endgame Optimization Mandate

Status: Active and mandatory
Owner: Project rule set by user
Last updated: 2026-02-25

## Core Rule (Hard-Coded)

Build for long-term endgame optimization. No shortcuts.

Interpretation:

1. Prefer durable architecture over fast hacks.
2. Prefer provable correctness over quick output.
3. Prefer maintainability, observability, and security over short-term convenience.
4. If a trade-off is required, choose the option with stronger long-term compounding value.

## Non-Negotiable Engineering Constraints

1. No temporary workaround may be merged without a tracked replacement plan.
2. No hidden debt: every compromise must be documented in decision log and backlog.
3. No ambiguous quality bar: all key modules must have tests and quality gates.
4. No opaque scoring: winner recommendation must be auditable and reproducible.

## Required Decision Checklist

Each major decision must explicitly state:

1. Long-term maintainability impact.
2. Performance impact at scale.
3. Reliability and failure-mode impact.
4. Security and abuse-resistance impact.
5. Testability and observability impact.

## Enforcement Points

1. `docs/decisions/DECISION-LOG.md` must include long-term impact line for each new decision.
2. `docs/planning/BACKLOG.md` must include debt-removal tasks for any temporary compromise.
3. CLI and evaluator design must keep full report artifacts for auditability.
4. Policy file `references/optimization-policy.json` must remain active unless user explicitly overrides.

## Override Rule

Only an explicit user instruction can override this mandate.
