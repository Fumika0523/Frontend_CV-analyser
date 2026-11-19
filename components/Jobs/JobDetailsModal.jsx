import React, { useEffect, useRef, useState } from "react";
import {
  FiBriefcase,
  FiArrowRight,
  FiCalendar,
  FiCheck,
  FiDollarSign,
  FiExternalLink,
  FiMapPin,
  FiMonitor,
  FiLoader,
  FiTarget,
  FiX,
} from "react-icons/fi";
import { formatLocation } from "./jobUtils";
import MatchScoreModal from "../../pages/company/Dashboard/Applicants/MatchScoreModal";
import { restoreModalFocus, trapModalFocus } from "./modalFocus";

function Fact({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 px-5 py-4">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#001342]/5 text-[#082c72]">
        <Icon size={15} />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-0.5 break-words text-sm font-semibold text-slate-900">
          {value || "Not specified"}
        </p>
      </div>
    </div>
  );
}

function BulletSection({ title, items, emptyText }) {
  const hasItems = Array.isArray(items) && items.length > 0;

  return (
    <section>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>

      {hasItems ? (
        <ul className="mt-4 space-y-3">
          {items.map((item, index) => (
            <li
              key={index}
              className="flex items-start gap-3 text-sm leading-6 text-slate-600"
            >
              <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <FiCheck size={12} strokeWidth={3} />
              </span>
              <span className="max-w-prose">{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-500">{emptyText}</p>
      )}
    </section>
  );
}

export default function JobDetailsModal({ job, onClose, applyButton, matchState, onUploadCv, onRetryMatch, guestPreview = false, onGuestSignup }) {
  const isOpen = Boolean(job);
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const panel = useRef(null);
  const scoreTrigger = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;
  const rawMatchScore = guestPreview ? job?.matchScore : matchState?.match?.matchScore;
  const validScore = (guestPreview || matchState?.status === "ready") && typeof rawMatchScore === "number" && Number.isFinite(rawMatchScore) && rawMatchScore >= 0 && rawMatchScore <= 100;
  const showBreakdown = breakdownOpen && validScore;
  const nestedActive = useRef(false);
  nestedActive.current = showBreakdown;
  const jobKey = job?.jobId || job?._id;
  useEffect(() => { setBreakdownOpen(false); }, [jobKey, matchState?.contextKey, matchState?.status]);

  // Close on Escape and stop the page behind from scrolling.
  useEffect(() => {
    if (!isOpen) return undefined;
    const previousFocus = document.activeElement;
    const handleKeyDown = (event) => {
      if (nestedActive.current) return;
      if (event.key === "Escape") {
        event.preventDefault();
        close.current?.();
      } else trapModalFocus(event, panel.current);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    panel.current?.querySelector("button")?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      restoreModalFocus(previousFocus);
    };
  }, [isOpen]);

  // Do not display the modal if no job is selected.
  if (!job) {
    return null;
  }

  const companyName =
    job.companyId?.companyName ||
    job.companyName ||
    "Company name not specified";

  const companyInitial = companyName.trim().charAt(0).toUpperCase() || "?";

  const deadlineDate = job.applicationEndDate
    ? new Date(job.applicationEndDate)
    : null;

  const deadline =
    deadlineDate && !Number.isNaN(deadlineDate.getTime())
      ? deadlineDate.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : null;

  const hasSkills = Array.isArray(job.keySkills) && job.keySkills.length > 0;
  const matchPercent = validScore ? rawMatchScore : null;
  // Presentation categories only; application scoring and eligibility stay upstream.
  const matchStrength = matchPercent >= 80
    ? { label: "Strong match", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200", bar: "bg-emerald-500" }
    : matchPercent >= 60
      ? { label: "Good match", badge: "bg-amber-50 text-amber-700 ring-amber-200", bar: "bg-amber-500" }
      : { label: "Lower match", badge: "bg-slate-100 text-slate-600 ring-slate-200", bar: "bg-slate-400" };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 backdrop-blur-sm sm:items-center sm:px-6 sm:py-6"
      role={showBreakdown ? undefined : "dialog"}
      aria-modal={showBreakdown ? undefined : "true"}
      aria-labelledby="job-details-title"
      onMouseDown={(event) => {
        if (!showBreakdown && event.target === event.currentTarget) onClose?.();
      }}
    >
      <div ref={panel} tabIndex={-1} aria-hidden={showBreakdown ? "true" : undefined} inert={showBreakdown ? "" : undefined}
        className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl ring-1 ring-black/5 sm:rounded-3xl">
        {/* HEADER */}
        <header className="relative shrink-0 bg-[#001342] px-6 pb-7 pt-6 text-white sm:px-9 sm:pt-8">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-300/40 to-transparent" />

          <button
            type="button"
            onClick={onClose}
            aria-label="Close job details"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-6 sm:top-6"
          >
            <FiX size={20} />
          </button>

          <div className="flex items-center gap-4 pr-10">
            {!guestPreview && <div
              aria-hidden="true"
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl font-bold text-[#001342] shadow-lg shadow-black/20"
            >
              {companyInitial}
            </div>}

            <div className="min-w-0">
              <h2
                id="job-details-title"
                className="break-words text-2xl font-bold leading-tight tracking-tight [overflow-wrap:anywhere] sm:text-3xl"
              >
                {job.title}
              </h2>
              {!guestPreview && <p className="mt-1 break-words text-sm font-medium text-blue-200 [overflow-wrap:anywhere]">
                {companyName}
              </p>}
            </div>
          </div>

          {(job.jobType || job.workMode) && (
            <div className="mt-5 flex flex-wrap gap-2">
              {job.jobType && (
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white ring-1 ring-inset ring-white/15">
                  {job.jobType}
                </span>
              )}
              {job.workMode && (
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white ring-1 ring-inset ring-white/15">
                  {job.workMode}
                </span>
              )}
            </div>
          )}
        </header>

        {/* SCROLLABLE CONTENT */}
        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/60">
          {(guestPreview ? validScore : matchState && matchState.status !== "guest") && (
            <section aria-label="Your match for this job" className="min-w-0 border-b border-slate-200 bg-white px-6 py-4 sm:px-9">
              <div className="min-w-0 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/60 via-white to-white p-4 sm:p-5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100/60 text-[#082c72] ring-1 ring-blue-100"><FiTarget size={18} aria-hidden="true" /></span>
                  <h3 className="text-xs font-semibold tracking-wider text-slate-500">YOUR CV MATCH</h3>
                </div>
                {validScore ? (
                  <>
                    <div className="mt-3 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
                      <p className="text-3xl font-bold tracking-tight text-[#001342] tabular-nums sm:text-4xl">{`${matchPercent}%`}</p>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${matchStrength.badge}`}>{matchStrength.label}</span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{guestPreview ? "Based on skills in your CV" : "Based on your current CV"}</p>
                    <div role="progressbar" aria-label="CV match score" aria-valuemin={0} aria-valuemax={100} aria-valuenow={matchPercent}
                      className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full transition-[width] ${matchStrength.bar}`} style={{ width: `${matchPercent}%` }} />
                    </div>
                    <button type="button" onClick={(event) => {
                      scoreTrigger.current = event.currentTarget;
                      setBreakdownOpen(true);
                    }} className="mt-3 inline-flex max-w-full items-center gap-1.5 rounded text-sm font-semibold text-blue-700 transition hover:text-blue-800 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">
                      View match breakdown<FiArrowRight size={15} className="shrink-0" aria-hidden="true" />
                    </button>
                  </>
                ) : matchState.status === "no-cv" ? (
                  <button type="button" onClick={onUploadCv} className="mt-3 rounded-lg border border-blue-200 bg-white px-3 py-2 text-left text-sm font-medium text-blue-700 transition hover:bg-blue-50 focus-visible:outline-blue-600">Upload a CV to see your match</button>
                ) : matchState.status === "loading" ? (
                  <div role="status" aria-live="polite" className="mt-3">
                    <p className="flex items-center gap-2 text-sm text-slate-500"><FiLoader size={15} className="shrink-0 animate-spin text-blue-600" aria-hidden="true" />Calculating your match...</p>
                    <div aria-hidden="true" className="mt-3 h-2 w-full rounded-full bg-slate-100 motion-safe:animate-pulse" />
                  </div>
                ) : (
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                    <p className="text-slate-600">Match score unavailable</p>
                    {onRetryMatch && <button type="button" onClick={onRetryMatch} className="rounded px-1 font-semibold text-blue-700 hover:underline focus-visible:outline-blue-600">Retry</button>}
                  </div>
                )}
              </div>
            </section>
          )}
          {/* KEY FACTS */}
          <div className="border-b border-slate-200 bg-white">
            <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
              <Fact
                icon={FiMapPin}
                label="Location"
                value={formatLocation(job.location)}
              />
              <Fact icon={FiDollarSign} label="Salary" value={job.salary} />
              <Fact icon={FiBriefcase} label="Job type" value={job.jobType} />
              <Fact icon={FiMonitor} label="Work mode" value={job.workMode} />
            </div>
          </div>

          <div className="space-y-8 px-6 py-8 sm:px-9">
            {/* DEADLINE */}
            {deadline && (
              <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <FiCalendar size={18} />
                </span>
                <p className="text-sm text-amber-900">
                  Apply by <span className="font-bold">{deadline}</span>
                </p>
              </div>
            )}

            {/* ABOUT THE ROLE */}
            {!guestPreview && <section>
              <h3 className="text-base font-semibold text-slate-900">
                About the role
              </h3>
              <p className="mt-3 max-w-prose whitespace-pre-line text-sm leading-7 text-slate-600">
                {job.roleSummary || "No role summary provided."}
              </p>
            </section>}

            {!guestPreview && <section>
              <h3 className="text-base font-semibold text-slate-900">
                Minimum relevant experience
              </h3>
              <p className="mt-3 text-sm text-slate-600">
                {job.experience || "Not specified"}
              </p>
            </section>}

            {/* KEY SKILLS */}
            {hasSkills && (
              <section>
                <h3 className="text-base font-semibold text-slate-900">
                  Key skills
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {job.keySkills.map((skill, index) => (
                    <span
                      key={index}
                      className="rounded-full border border-blue-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#082c72]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* REQUIREMENTS + RESPONSIBILITIES */}
            {!guestPreview && <div className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <BulletSection
                  title="Requirements"
                  items={job.requirements}
                  emptyText="No requirements provided."
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <BulletSection
                  title="Key responsibilities"
                  items={job.responsibilities}
                  emptyText="No responsibilities provided."
                />
              </div>
            </div>}
          </div>
        </div>

        {/* FOOTER */}
        <footer className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-200 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-9">
          {!guestPreview && job.companyUrl && (
            <a
              href={job.companyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#082c72] hover:text-[#082c72] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#082c72]"
            >
              <FiExternalLink size={16} />
              Company website
            </a>
          )}

          {applyButton}
        </footer>
      </div>
      {showBreakdown && (
        <MatchScoreModal nested returnFocus={scoreTrigger.current}
          isGuest={guestPreview}
          onSignUp={onGuestSignup}
          data={guestPreview ? job : { ...matchState.match, title: job.title, candidateName: "Your Profile" }}
          onClose={() => setBreakdownOpen(false)} />
      )}
    </div>
  );
}
