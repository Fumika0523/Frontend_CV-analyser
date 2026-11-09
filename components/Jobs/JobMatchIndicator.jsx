import React from "react";
import { FiLoader } from "react-icons/fi";
import MatchScoreRing from "./MatchScoreRing";

// A missing score is distinct from a genuine 0%. Never filter cards here.
export default function JobMatchIndicator({ job, scoring, match, onView, onUpload }) {
  const base = "inline-flex max-w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600";
  if (scoring.status === "error") return <button type="button" onClick={scoring.retry} className={`${base} bg-slate-100 text-slate-600`}>Match unavailable · Retry</button>;
  if (scoring.status === "ready" && !scoring.cv) return <button type="button" onClick={onUpload} className={`${base} bg-blue-50 text-blue-700`}>Upload CV to see your match</button>;
  const entry = match ? { status: "ready", match } : scoring.scoreFor(job);
  if (scoring.status !== "ready" || !entry || entry.status === "loading") return <span role="status" className={`${base} text-slate-500`}><FiLoader size={14} className="shrink-0 animate-spin" />Calculating match...</span>;
  if (entry.status === "error") return <button type="button" onClick={scoring.retry} className={`${base} bg-slate-100 text-slate-600`}>Match unavailable · Retry</button>;
  return <MatchScoreRing score={entry.match.matchScore} label="Match score" onClick={onView} />;
}
