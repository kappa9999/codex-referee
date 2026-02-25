# Scoring Rubric (v0.1)

## Purpose

Turn candidate patch quality into a transparent, repeatable score.

## Scoring Model

- Final score range: 0 to 100.
- Only candidates that pass hard gates are eligible for winner selection.

## Hard Gates (Pass/Fail)

1. Patch applies cleanly in isolated worktree.
2. No forbidden path modifications (configurable deny list).
3. No destructive git operations in run logs.
4. No high-severity security finding from configured scanners (if scanner configured).
5. Minimum functional viability:

- if tests exist: no failing mandatory test group.
- if no tests: candidate enters reduced-confidence mode.

Candidates failing any hard gate are marked `ineligible`.

## Weighted Criteria (Eligible Candidates)

1. Correctness (40)

- Test pass ratio: 25
- Type/lint/static check health: 10
- Intent match (task compliance grader): 5

2. Safety and Risk (25)

- Diff blast radius (files and modules touched): 10
- Risky change penalty (auth/pay/security/core infra): 10
- Dependency change risk: 5

3. Maintainability (20)

- Complexity delta penalty/bonus: 8
- Code readability/style conformance: 7
- Added documentation/tests quality: 5

4. Efficiency (10)

- Runtime-to-completion score: 5
- Token/cost efficiency score: 5

5. Personal Fit (5)

- Historical acceptance of strategy in this repo/task cluster: 5

## Normalization Rules

- Every metric is normalized to 0..1 before weighting.
- Missing metric data uses neutral fallback (0.5) and adds confidence penalty.
- Reduced-confidence mode caps final confidence level even with high score.

## Confidence Bands

- High: score >= 85 and no degraded signals.
- Medium: score 70..84 or some degraded signals.
- Low: score < 70 or no-test/reduced-confidence mode.

## Anti-Gaming Rules

1. Score includes penalty for excessive file churn.
2. Empty or superficial test additions do not earn full maintainability credit.
3. Reformat-only diffs receive low intent-match score unless task requests refactor/format.
4. Strategy self-reported success is ignored; only evaluator outputs count.

## Output Fields

- `hard_gate_status`
- `score_total`
- `score_breakdown`
- `confidence`
- `risk_flags`
- `explanation`
