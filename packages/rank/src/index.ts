import type {
  CandidateEvaluation,
  Confidence,
  ScoredCandidate,
  ScoreBreakdown,
  ScoringProfile,
  WinnerSelection
} from "@referee/core";

interface WeightProfile {
  correctness: number;
  safety: number;
  maintainability: number;
  efficiency: number;
  personalFit: number;
}

const WEIGHTS = {
  safe: {
    correctness: 45,
    safety: 30,
    maintainability: 15,
    efficiency: 5,
    personalFit: 5
  },
  balanced: {
    correctness: 40,
    safety: 25,
    maintainability: 20,
    efficiency: 10,
    personalFit: 5
  },
  speed: {
    correctness: 35,
    safety: 20,
    maintainability: 15,
    efficiency: 25,
    personalFit: 5
  }
} satisfies Record<ScoringProfile, WeightProfile>;

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function deriveConfidence(
  totalScore: number,
  reducedConfidence: boolean,
  riskFlags: string[]
): Confidence {
  if (reducedConfidence) {
    return "low";
  }
  if (totalScore >= 85 && riskFlags.length === 0) {
    return "high";
  }
  if (totalScore >= 70) {
    return "medium";
  }
  return "low";
}

export function scoreCandidate(
  evaluation: CandidateEvaluation,
  profile: ScoringProfile = "balanced"
): ScoredCandidate {
  const weights = WEIGHTS[profile];
  const score: ScoreBreakdown = {
    correctness: round2(evaluation.metrics.correctness * weights.correctness),
    safety: round2(evaluation.metrics.safety * weights.safety),
    maintainability: round2(evaluation.metrics.maintainability * weights.maintainability),
    efficiency: round2(evaluation.metrics.efficiency * weights.efficiency),
    personalFit: round2(evaluation.metrics.personalFit * weights.personalFit),
    total: 0
  };
  score.total = round2(
    score.correctness + score.safety + score.maintainability + score.efficiency + score.personalFit
  );

  const eligible = evaluation.gateStatus === "pass";
  const confidence = eligible
    ? deriveConfidence(score.total, evaluation.reducedConfidence, evaluation.riskFlags)
    : "low";

  return {
    candidateId: evaluation.candidateId,
    strategy: evaluation.strategy,
    eligible,
    confidence,
    advisory: confidence === "low",
    evaluation,
    score
  };
}

export function rankCandidates(candidates: ScoredCandidate[]): ScoredCandidate[] {
  return [...candidates].sort((left, right) => {
    if (right.score.total !== left.score.total) {
      return right.score.total - left.score.total;
    }
    if (right.score.correctness !== left.score.correctness) {
      return right.score.correctness - left.score.correctness;
    }
    if (right.score.safety !== left.score.safety) {
      return right.score.safety - left.score.safety;
    }
    if (left.evaluation.diffStats.filesChanged !== right.evaluation.diffStats.filesChanged) {
      return left.evaluation.diffStats.filesChanged - right.evaluation.diffStats.filesChanged;
    }
    if (left.evaluation.runtimeMs !== right.evaluation.runtimeMs) {
      return left.evaluation.runtimeMs - right.evaluation.runtimeMs;
    }
    return left.candidateId.localeCompare(right.candidateId);
  });
}

export interface WinnerSelectionOptions {
  tieDelta?: number;
  reviewDelta?: number;
  autoAccept?: boolean;
}

export function selectWinner(
  candidates: ScoredCandidate[],
  options: WinnerSelectionOptions = {}
): WinnerSelection {
  const tieDelta = options.tieDelta ?? 2;
  const reviewDelta = options.reviewDelta ?? 3;
  const eligibleRanked = rankCandidates(candidates.filter((candidate) => candidate.eligible));

  if (eligibleRanked.length === 0) {
    const salvage = rankCandidates(candidates)[0];
    const noSafeWinner: WinnerSelection = {
      status: "no-safe-winner",
      selectionReason: "all candidates failed hard gates",
      manualReviewRequired: true,
      advisory: true
    };
    if (salvage) {
      noSafeWinner.salvageCandidateId = salvage.candidateId;
    }
    return noSafeWinner;
  }

  const winner = eligibleRanked[0];
  if (!winner) {
    return {
      status: "no-safe-winner",
      selectionReason: "no eligible candidates after ranking",
      manualReviewRequired: true,
      advisory: true
    };
  }

  const runnerUp = eligibleRanked[1];
  const reasonParts: string[] = ["top eligible candidate by weighted score"];
  let runnerUpDelta: number | undefined;
  let manualReviewRequired = false;

  if (runnerUp) {
    runnerUpDelta = round2(winner.score.total - runnerUp.score.total);
    if (runnerUpDelta <= tieDelta) {
      reasonParts.push("tie-breakers applied (correctness, safety, blast radius, runtime)");
    }
    if (runnerUpDelta <= reviewDelta && !options.autoAccept) {
      manualReviewRequired = true;
      reasonParts.push("manual review required because top candidates are close");
    }
  }

  if (winner.confidence === "low") {
    reasonParts.push("winner confidence is low; recommendation is advisory");
  }

  const result: WinnerSelection = {
    status: "winner",
    winnerCandidateId: winner.candidateId,
    winnerStrategy: winner.strategy,
    winnerScore: winner.score.total,
    winnerConfidence: winner.confidence,
    selectionReason: reasonParts.join("; "),
    manualReviewRequired,
    advisory: winner.confidence === "low"
  };
  if (runnerUp) {
    result.runnerUpCandidateId = runnerUp.candidateId;
  }
  if (runnerUpDelta !== undefined) {
    result.runnerUpDelta = runnerUpDelta;
  }
  return result;
}
