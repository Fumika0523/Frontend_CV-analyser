import React, { useEffect } from "react";
import {
  FiBriefcase,
  FiCalendar,
  FiCheck,
  FiDollarSign,
  FiExternalLink,
  FiMapPin,
  FiMonitor,
  FiX,
} from "react-icons/fi";
import { formatLocation } from "./jobUtils";

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

export default function JobDetailsModal({ job, onClose, applyButton }) {
  // Close on Escape and stop the page behind from scrolling.
  useEffect(() => {
    if (!job) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [job, onClose]);

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 backdrop-blur-sm sm:items-center sm:px-6 sm:py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="job-details-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl ring-1 ring-black/5 sm:rounded-3xl">
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
            <div
              aria-hidden="true"
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl font-bold text-[#001342] shadow-lg shadow-black/20"
            >
              {companyInitial}
            </div>

            <div className="min-w-0">
              <h2
                id="job-details-title"
                className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl"
              >
                {job.title}
              </h2>
              <p className="mt-1 text-sm font-medium text-blue-200">
                {companyName}
              </p>
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
            <section>
              <h3 className="text-base font-semibold text-slate-900">
                About the role
              </h3>
              <p className="mt-3 max-w-prose whitespace-pre-line text-sm leading-7 text-slate-600">
                {job.roleSummary || "No role summary provided."}
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-slate-900">
                Minimum relevant experience
              </h3>
              <p className="mt-3 text-sm text-slate-600">
                {job.experience || "Not specified"}
              </p>
            </section>

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
            <div className="grid gap-5 lg:grid-cols-2">
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
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-200 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-9">
          {job.companyUrl && (
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
    </div>
  );
}
