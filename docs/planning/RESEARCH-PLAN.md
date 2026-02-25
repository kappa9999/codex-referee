# Research Plan

## Goal

Determine whether Codex Referee is sufficiently unique and valuable to pursue.

## Research Questions

1. Who already offers multi-agent or multi-run patch comparison?
2. Who offers objective auto-scoring and winner selection?
3. Who offers learning loops from user acceptance outcomes?
4. Which users are underserved by existing tools?

## Method

1. Build competitor list across AI coding assistants, orchestration frameworks, and evaluation tools.
2. Score each competitor on capability matrix:

- parallel attempts,
- automated scoring,
- test synthesis,
- explainability,
- personal learning loop,
- solo-user usability.

3. Mark overlap levels: low, medium, high.
4. Identify white-space opportunities.

## Deliverables

- `docs/research/COMPETITOR-LANDSCAPE.md`: narrative + matrix.
- `docs/research/SOURCE-LOG.md`: URL-backed claim log.
- `docs/planning/BACKLOG.md`: prioritized implementation steps.

## Go / No-Go Threshold

Go if fewer than two direct competitors provide all of:

1. multi-strategy patch tournament,
2. objective winner scoring,
3. per-user learned strategy selection,
4. easy solo-user workflow.
