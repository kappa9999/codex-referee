// @contract:stable
export type CheckStatus = "pass" | "fail" | "skip";

// @contract:stable
export type GateStatus = "pass" | "fail";

// @contract:stable
export type Confidence = "high" | "medium" | "low";

// @contract:stable
export type ScoringProfile = "safe" | "balanced" | "speed";

// @contract:stable
export type CheckName = "test" | "lint" | "typecheck";

// @contract:stable
export interface RunRequest {
  task: string;
  repoPath: string;
  strategies: string[];
  profile: ScoringProfile;
  maxParallel: number;
  allowDirty: boolean;
  autoAccept: boolean;
  runChecks: boolean;
}

// @contract:stable
export interface CandidateExecution {
  candidateId: string;
  strategy: string;
  worktreePath: string;
  command: string;
  outputPath: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  exitCode: number;
}

// @contract:stable
export interface DiffStats {
  filesChanged: number;
  insertions: number;
  deletions: number;
  touchedPaths: string[];
}

// @contract:stable
export interface CheckResult {
  name: CheckName;
  status: CheckStatus;
  command: string;
  summary: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  outputPath?: string;
}

// @contract:stable
export interface GateResult {
  name: string;
  passed: boolean;
  reason: string;
}

// @contract:stable
export interface EvaluationMetrics {
  correctness: number;
  safety: number;
  maintainability: number;
  efficiency: number;
  personalFit: number;
}

// @contract:stable
export interface CandidateEvaluation {
  candidateId: string;
  strategy: string;
  gateStatus: GateStatus;
  gates: GateResult[];
  checks: CheckResult[];
  reducedConfidence: boolean;
  riskFlags: string[];
  explanation: string[];
  metrics: EvaluationMetrics;
  diffStats: DiffStats;
  runtimeMs: number;
}

// @contract:stable
export interface ScoreBreakdown {
  correctness: number;
  safety: number;
  maintainability: number;
  efficiency: number;
  personalFit: number;
  total: number;
}

// @contract:stable
export interface ScoredCandidate {
  candidateId: string;
  strategy: string;
  eligible: boolean;
  confidence: Confidence;
  advisory: boolean;
  evaluation: CandidateEvaluation;
  score: ScoreBreakdown;
}

// @contract:stable
export interface WinnerSelection {
  status: "winner" | "no-safe-winner";
  selectionReason: string;
  manualReviewRequired: boolean;
  advisory: boolean;
  winnerCandidateId?: string;
  winnerStrategy?: string;
  winnerScore?: number;
  winnerConfidence?: Confidence;
  runnerUpCandidateId?: string;
  runnerUpDelta?: number;
  salvageCandidateId?: string;
}

// @contract:stable
export interface RunReport {
  schemaVersion: string;
  generatedAt: string;
  generator: string;
  runId: string;
  repoPath: string;
  task: string;
  strategies: string[];
  profile: ScoringProfile;
  startedAt: string;
  finishedAt: string;
  artifactsPath: string;
  candidates: ScoredCandidate[];
  winner: WinnerSelection;
}
