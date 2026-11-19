// Adapt existing page data for display only; never fetch or calculate a score.
export const jobDetailsMatchState = (scoring, job, match, isGuest = false) => {
  if (!job || isGuest) return { status: "guest" };
  const contextKey = `${scoring.cv?._id || ""}:${job.jobId || job._id}:${job.updatedAt || ""}`;
  if (scoring.status === "error") return { status: "unavailable", contextKey };
  if (scoring.status !== "ready") return { status: "loading", contextKey };
  if (!scoring.cv) return { status: "no-cv", contextKey };
  const entry = match ? { status: "ready", match } : scoring.scoreFor?.(job);
  if (!entry || entry.status === "loading") return { status: "loading", contextKey };
  if (entry.status !== "ready" || typeof entry.match?.matchScore !== "number" || !Number.isFinite(entry.match.matchScore)) {
    return { status: "unavailable", contextKey };
  }
  return { status: "ready", match: entry.match, contextKey };
};
