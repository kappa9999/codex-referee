import { z } from "zod";

export const OptimizationPolicySchema = z.object({
  policy_version: z.string(),
  policy_name: z.string(),
  active: z.boolean(),
  owner: z.string(),
  last_updated: z.string(),
  hard_rules: z.array(z.string()),
  decision_requirements: z.array(z.string())
});

export type OptimizationPolicy = z.infer<typeof OptimizationPolicySchema>;

export const CheckStatusSchema = z.enum(["pass", "fail", "skip"]);
export const GateStatusSchema = z.enum(["pass", "fail"]);
export const ConfidenceSchema = z.enum(["high", "medium", "low"]);
export const ScoringProfileSchema = z.enum(["safe", "balanced", "speed"]);
export const CheckNameSchema = z.enum(["test", "lint", "typecheck"]);

export const DiffStatsSchema = z.object({
  filesChanged: z.number().int().nonnegative(),
  insertions: z.number().int().nonnegative(),
  deletions: z.number().int().nonnegative(),
  touchedPaths: z.array(z.string())
});

export const CheckResultSchema = z.object({
  name: CheckNameSchema,
  status: CheckStatusSchema,
  command: z.string(),
  summary: z.string(),
  startedAt: z.string(),
  finishedAt: z.string(),
  durationMs: z.number().nonnegative(),
  outputPath: z.string().optional()
});

export const GateResultSchema = z.object({
  name: z.string(),
  passed: z.boolean(),
  reason: z.string()
});

export const EvaluationMetricsSchema = z.object({
  correctness: z.number().min(0).max(1),
  safety: z.number().min(0).max(1),
  maintainability: z.number().min(0).max(1),
  efficiency: z.number().min(0).max(1),
  personalFit: z.number().min(0).max(1)
});

export const CandidateEvaluationSchema = z.object({
  candidateId: z.string(),
  strategy: z.string(),
  gateStatus: GateStatusSchema,
  gates: z.array(GateResultSchema),
  checks: z.array(CheckResultSchema),
  reducedConfidence: z.boolean(),
  riskFlags: z.array(z.string()),
  explanation: z.array(z.string()),
  metrics: EvaluationMetricsSchema,
  diffStats: DiffStatsSchema,
  runtimeMs: z.number().nonnegative()
});

export const ScoreBreakdownSchema = z.object({
  correctness: z.number().min(0).max(100),
  safety: z.number().min(0).max(100),
  maintainability: z.number().min(0).max(100),
  efficiency: z.number().min(0).max(100),
  personalFit: z.number().min(0).max(100),
  total: z.number().min(0).max(100)
});

export const ScoredCandidateSchema = z.object({
  candidateId: z.string(),
  strategy: z.string(),
  eligible: z.boolean(),
  confidence: ConfidenceSchema,
  advisory: z.boolean(),
  evaluation: CandidateEvaluationSchema,
  score: ScoreBreakdownSchema
});

export const WinnerSelectionSchema = z
  .object({
    status: z.enum(["winner", "no-safe-winner"]),
    selectionReason: z.string(),
    manualReviewRequired: z.boolean(),
    advisory: z.boolean(),
    winnerCandidateId: z.string().optional(),
    winnerStrategy: z.string().optional(),
    winnerScore: z.number().min(0).max(100).optional(),
    winnerConfidence: ConfidenceSchema.optional(),
    runnerUpCandidateId: z.string().optional(),
    runnerUpDelta: z.number().min(0).max(100).optional(),
    salvageCandidateId: z.string().optional()
  })
  .superRefine((winner, ctx) => {
    if (winner.status !== "winner") {
      return;
    }

    if (!winner.winnerCandidateId) {
      ctx.addIssue({
        code: "custom",
        message: "winnerCandidateId required when status=winner",
        path: ["winnerCandidateId"]
      });
    }
    if (!winner.winnerStrategy) {
      ctx.addIssue({
        code: "custom",
        message: "winnerStrategy required when status=winner",
        path: ["winnerStrategy"]
      });
    }
    if (winner.winnerScore === undefined) {
      ctx.addIssue({
        code: "custom",
        message: "winnerScore required when status=winner",
        path: ["winnerScore"]
      });
    }
    if (!winner.winnerConfidence) {
      ctx.addIssue({
        code: "custom",
        message: "winnerConfidence required when status=winner",
        path: ["winnerConfidence"]
      });
    }
  });

export const RunReportSchema = z.object({
  schemaVersion: z.string(),
  generatedAt: z.string(),
  generator: z.string(),
  runId: z.string(),
  repoPath: z.string(),
  task: z.string(),
  strategies: z.array(z.string()).min(1),
  profile: ScoringProfileSchema,
  startedAt: z.string(),
  finishedAt: z.string(),
  artifactsPath: z.string(),
  candidates: z.array(ScoredCandidateSchema).min(1),
  winner: WinnerSelectionSchema
});

export type RunReport = z.infer<typeof RunReportSchema>;
