import type { RunReport } from "@referee/core";

function toTableRow(cells: string[]): string {
  return `| ${cells.join(" | ")} |`;
}

export function formatSummary(report: RunReport): string {
  if (report.winner.status !== "winner") {
    return `Run ${report.runId}: no-safe-winner`;
  }

  const winnerCandidateId = report.winner.winnerCandidateId ?? "unknown";
  const score = report.winner.winnerScore ?? 0;
  const confidence = report.winner.winnerConfidence ?? "low";
  return `Run ${report.runId}: winner ${winnerCandidateId} (${score.toFixed(2)}, ${confidence})`;
}

export function createMarkdownReport(report: RunReport): string {
  const lines: string[] = [
    "# Codex Referee Run Report",
    "",
    toTableRow(["Field", "Value"]),
    toTableRow(["---", "---"]),
    toTableRow(["Run ID", report.runId]),
    toTableRow(["Task", report.task]),
    toTableRow(["Repo", report.repoPath]),
    toTableRow(["Profile", report.profile]),
    toTableRow(["Started", report.startedAt]),
    toTableRow(["Finished", report.finishedAt]),
    toTableRow(["Artifacts", report.artifactsPath]),
    "",
    "## Winner",
    "",
    toTableRow([
      "Status",
      "Candidate",
      "Strategy",
      "Score",
      "Confidence",
      "Manual Review",
      "Advisory"
    ]),
    toTableRow(["---", "---", "---", "---", "---", "---", "---"])
  ];

  if (report.winner.status === "winner") {
    lines.push(
      toTableRow([
        report.winner.status,
        report.winner.winnerCandidateId ?? "n/a",
        report.winner.winnerStrategy ?? "n/a",
        (report.winner.winnerScore ?? 0).toFixed(2),
        report.winner.winnerConfidence ?? "low",
        String(report.winner.manualReviewRequired),
        String(report.winner.advisory)
      ])
    );
  } else {
    lines.push(
      toTableRow([
        report.winner.status,
        report.winner.salvageCandidateId ?? "n/a",
        "n/a",
        "n/a",
        "n/a",
        String(report.winner.manualReviewRequired),
        String(report.winner.advisory)
      ])
    );
  }

  lines.push("");
  lines.push("## Candidates");
  lines.push("");
  lines.push(
    toTableRow([
      "Candidate",
      "Strategy",
      "Eligible",
      "Score",
      "Confidence",
      "Correctness",
      "Safety",
      "Maintainability",
      "Efficiency",
      "Personal Fit"
    ])
  );
  lines.push(toTableRow(["---", "---", "---", "---", "---", "---", "---", "---", "---", "---"]));

  for (const candidate of report.candidates) {
    lines.push(
      toTableRow([
        candidate.candidateId,
        candidate.strategy,
        String(candidate.eligible),
        candidate.score.total.toFixed(2),
        candidate.confidence,
        candidate.score.correctness.toFixed(2),
        candidate.score.safety.toFixed(2),
        candidate.score.maintainability.toFixed(2),
        candidate.score.efficiency.toFixed(2),
        candidate.score.personalFit.toFixed(2)
      ])
    );
  }

  lines.push("");
  lines.push("## Selection Reason");
  lines.push("");
  lines.push(report.winner.selectionReason);
  lines.push("");

  return lines.join("\n");
}
