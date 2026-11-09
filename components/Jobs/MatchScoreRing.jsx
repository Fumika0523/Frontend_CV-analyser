import React from "react";

export default function MatchScoreRing({ score, label, onClick }) {
  if (typeof score !== "number" || !Number.isFinite(score)) return null;
  const value = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const tone =
    value >= 75
      ? { stroke: "stroke-emerald-500", text: "text-emerald-700" }
      : value >= 50
        ? { stroke: "stroke-amber-500", text: "text-amber-700" }
        : { stroke: "stroke-slate-400", text: "text-slate-600" };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${label}: ${value}%. View breakdown`}
      className="group flex w-[72px] shrink-0 flex-col items-center gap-1 rounded-xl p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
    >
      <span className="relative flex h-14 w-14 items-center justify-center">
        <svg
          viewBox="0 0 56 56"
          className="absolute inset-0 h-full w-full -rotate-90"
          aria-hidden="true"
        >
          <circle
            cx="28"
            cy="28"
            r={radius}
            fill="none"
            strokeWidth="5"
            className="stroke-slate-100"
          />
          <circle
            cx="28"
            cy="28"
            r={radius}
            fill="none"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={tone.stroke}
          />
        </svg>
        <span className={`relative text-sm font-bold ${tone.text}`}>
          {`${value}%`}
        </span>
      </span>

      <span className="text-center text-[11px] font-medium leading-tight text-slate-500 transition group-hover:text-blue-700 group-hover:underline">
        {label}
      </span>
    </button>
  );
}
