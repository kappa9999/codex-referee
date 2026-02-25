# Product Thesis: Codex Referee

## One-Liner

Codex Referee runs multiple solution strategies for the same task, scores the resulting patches with objective gates, and recommends the highest-confidence patch to merge.

## User

- Individual developers using ChatGPT Pro + Codex for personal projects, side projects, or random coding tasks.

## Core Pain

Single-agent outputs are variable. Users spend time manually comparing attempts, rerunning tests, and deciding what to trust.

## Value Proposition

- Better patch quality per task.
- Lower decision fatigue.
- Faster path to trustworthy merges.

## Product Pillars

1. Parallel strategy execution.
2. Objective scoring and ranking.
3. Explainable winner selection.
4. Continuous personalization from accept/reject history.

## Why It Could Be Defensible

- Builds private performance history per user and per repo.
- Learns strategy effectiveness by task type.
- Can outperform one-shot workflows through meta-optimization.

## Initial Success Metrics

1. Win rate over baseline single-run Codex.
2. Time-to-acceptable-patch reduction.
3. Reduction in post-merge regressions.
4. User acceptance rate of top-ranked patch.
