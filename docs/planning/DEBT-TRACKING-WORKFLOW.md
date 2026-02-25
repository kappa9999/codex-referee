# Debt Tracking Workflow (No-Shortcut Policy)

Last updated: 2026-02-25

## Purpose

Operationalize the "no shortcuts" mandate with explicit handling when temporary compromises are unavoidable.

## Debt Record Trigger

Create a debt record whenever:

1. A temporary workaround is introduced.
2. A planned quality gate is deferred.
3. A dependency is pinned or bypassed for expediency.
4. A migration or contract cleanup is postponed.

## Debt Record Location

- Primary: `docs/planning/TECH-DEBT-REGISTER.md`
- Cross-reference in `docs/decisions/DECISION-LOG.md` and `docs/planning/BACKLOG.md`.

## Debt Record Template

- `debt_id`
- `date_opened`
- `owner`
- `scope`
- `reason`
- `risk`
- `removal_plan`
- `target_milestone`
- `status`

## Workflow

1. Open debt record before merging workaround.
2. Add explicit backlog task for removal.
3. Add decision log note with long-term impact.
4. Close debt only after removal is validated by tests.

## SLA Policy

- High-risk debt: remove within next milestone.
- Medium-risk debt: remove within two milestones.
- Low-risk debt: must have explicit sunset date.

## Enforcement

Release readiness check fails if:

1. High-risk debt has expired SLA.
2. Debt record has no owner or removal plan.
3. Workaround exists without debt_id link.
