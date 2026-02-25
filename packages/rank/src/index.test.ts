import type { CandidateEvaluation, GateStatus } from "@referee/core";
import { describe, expect, it } from "vitest";
import { scoreCandidate, selectWinner } from "./index.js";

function makeEvaluation(
  candidateId: string,
  strategy: string,
  metrics: CandidateEvaluation["metrics"],
  gateStatus: GateStatus = "pass"
): CandidateEvaluation {
  return {
    candidateId,
    strategy,
    gateStatus,
    gates: [
      {
        name: "patch_apply",
        passed: gateStatus === "pass",
        reason: gateStatus
      }
    ],
    checks: [],
    reducedConfidence: false,
    riskFlags: [],
    explanation: [],
    metrics,
    diffStats: {
      filesChanged: 2,
      insertions: 20,
      deletions: 10,
      touchedPaths: ["src/index.ts", "src/retry.ts"]
    },
    runtimeMs: 1200
  };
}

describe("scoreCandidate", () => {
  it("produces a high-confidence perfect score for a perfect eligible candidate", () => {
    const scored = scoreCandidate(
      makeEvaluation("safe-01", "safe", {
        correctness: 1,
        safety: 1,
        maintainability: 1,
        efficiency: 1,
        personalFit: 1
      }),
      "balanced"
    );

    expect(scored.eligible).toBe(true);
    expect(scored.score.total).toBe(100);
    expect(scored.confidence).toBe("high");
  });
});

describe("selectWinner", () => {
  it("requires manual review for close candidates without auto-accept", () => {
    const top = scoreCandidate(
      makeEvaluation("balanced-01", "balanced", {
        correctness: 0.9,
        safety: 0.85,
        maintainability: 0.8,
        efficiency: 0.75,
        personalFit: 0.7
      })
    );
    const runner = scoreCandidate(
      makeEvaluation("safe-01", "safe", {
        correctness: 0.89,
        safety: 0.84,
        maintainability: 0.8,
        efficiency: 0.73,
        personalFit: 0.68
      })
    );

    const winner = selectWinner([top, runner], { autoAccept: false });
    expect(winner.status).toBe("winner");
    expect(winner.winnerCandidateId).toBe("balanced-01");
    expect(winner.manualReviewRequired).toBe(true);
  });

  it("returns no-safe-winner when all candidates are ineligible", () => {
    const failed = scoreCandidate(
      makeEvaluation(
        "aggressive-01",
        "aggressive",
        {
          correctness: 0.8,
          safety: 0.7,
          maintainability: 0.6,
          efficiency: 0.8,
          personalFit: 0.4
        },
        "fail"
      )
    );

    const winner = selectWinner([failed]);
    expect(winner.status).toBe("no-safe-winner");
    expect(winner.salvageCandidateId).toBe("aggressive-01");
  });
});
