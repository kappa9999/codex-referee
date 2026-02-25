# Winner Selection Algorithm (v0.1)

## Inputs

- Candidate set with hard-gate results.
- Weighted score breakdown per eligible candidate.
- Risk flags and confidence signals.

## Algorithm

1. Filter

- Remove all `ineligible` candidates.

2. Rank

- Sort remaining candidates by `score_total` descending.

3. Tie Breakers
   Apply in order when scores are within `tie_delta` (default 2.0 points):
1. Higher Correctness subscore.
1. Lower Safety/Risk penalty.
1. Lower blast radius.
1. Lower runtime.

1. Confidence Guard

- If top candidate confidence is `low`, mark recommendation as `advisory`.
- If top two candidates are within `review_delta` (default 3.0 points), require explicit user choice unless `--auto-accept` is set.

5. No Eligible Candidate Path

- Return `no-safe-winner`.
- Optionally return best salvage candidate with explicit warning and failed-gate list.

## Pseudocode

`eligible = candidates where hard_gate_status == pass`
`if eligible is empty: return no_safe_winner`
`ranked = sort(eligible by score_total desc)`
`top = ranked[0]`
`runner_up = ranked[1] if exists`
`if abs(top.score - runner_up.score) <= tie_delta: apply tie breakers`
`if top.confidence == low: recommendation = advisory`
`return winner + rationale + alternatives`

## Output Contract

- `winner_candidate_id`
- `winner_strategy`
- `winner_score`
- `winner_confidence`
- `selection_reason`
- `runner_up_candidate_id`
- `runner_up_delta`
- `manual_review_required`
