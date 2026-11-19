
import React from "react";
import {
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiDollarSign,
  FiExternalLink,
  FiHome,
  FiLock,
  FiMapPin,
} from "react-icons/fi";
import { formatLocation } from "./jobUtils";

export default function JobCard({
  job,
  onViewDetails,
  applyButton,
  matchIndicator,
  detailsLoading = false,
  maxSkills = 4,
  unavailable = false,
  guestPreview = false,
}) {
  // If no job data exists, display nothing.
  if (!job) {
    return null;
  }

  // Get the company name.
  const companyName =
    job.companyId?.companyName ||
    job.companyName ||
    "Company";

  // Get required skills as an array.
  const keySkills = Array.isArray(job.keySkills)
    ? job.keySkills
    : [];
  let companyWebsite = null;
  try {
    const website = new URL(job.companyUrl || job.companyId?.companyUrl);
    if (["https:", "http:"].includes(website.protocol) && !website.username && !website.password) companyWebsite = website.href;
  } catch { /* A missing or unsafe website remains plain text. */ }

  // Check whether the job is unavailable.
  const isUnavailable =
    unavailable ||
    String(job.status || "").toLowerCase() !== "open";

  // Format the job posting date.
  const postedDate = job.createdAt
    ? new Date(job.createdAt).toLocaleDateString(
        "en-GB",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      )
    : "Date unavailable";

  return (
    <article
      className={`group flex h-full flex-col rounded-xl border border-l-4 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
        isUnavailable
          ? "border-slate-200 border-l-red-400"
          : "border-slate-200 border-l-blue-500 hover:border-blue-200"
      }`}
    >
      {/* Job title and company */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <FiBriefcase size={19} />
          </div>

          <div className="min-w-0">
            <h3 className="break-words font-semibold leading-snug text-slate-900">
              <button type="button" onClick={onViewDetails} disabled={detailsLoading}
                className="text-left hover:text-blue-700 hover:underline focus-visible:outline-blue-600 disabled:opacity-50">
                {job.title || "Untitled job"}
              </button>
            </h3>

            {!guestPreview && <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
              {!companyWebsite && <FiHome size={14} className="shrink-0" />}
              {companyWebsite ? <a href={companyWebsite} target="_blank" rel="noopener noreferrer" className="inline-flex min-w-0 items-start gap-1 text-blue-700 hover:underline focus-visible:outline-blue-600"><FiExternalLink size={13} className="mt-0.5 shrink-0" /><span className="min-w-0 break-words">{companyName}</span></a>
                : <span className="min-w-0 break-words">{companyName}</span>}
            </p>}

            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <FiCalendar size={13} />
              Posted {postedDate}
            </p>


{/* Application deadline */}
{job.applicationEndDate && (
  <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-blue-700">
    <FiCalendar size={13} />

    Apply by{" "}
    {new Date(job.applicationEndDate).toLocaleDateString(
      "en-GB",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    )}
  </p>
)}

          </div>
        </div>

        <div className="flex w-[88px] max-w-[35%] shrink-0 flex-col items-center gap-2">
          {matchIndicator}
        {/* Job availability */}
        <span
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
            isUnavailable
              ? "bg-red-100 text-red-700"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {isUnavailable ? (
            <FiLock size={13} />
          ) : (
            <FiCheckCircle size={13} />
          )}

          {isUnavailable ? "Closed" : "Open"}
        </span>
        </div>
      </div>

      {/* Job information */}
      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg bg-slate-50 p-3">
        {/* Location */}
        <p className="flex min-w-0 items-start gap-2 text-xs leading-5 text-slate-600">
          <FiMapPin
            className="mt-0.5 shrink-0 text-blue-600"
            size={15}
          />
          <span className="min-w-0 [overflow-wrap:anywhere]">
            {formatLocation(job.location) || "Location not specified"}
          </span>
        </p>
            {/* Job Type */}
        <p className="flex min-w-0 items-start gap-2 text-xs leading-5 text-slate-600">
          <FiBriefcase
            className="mt-0.5 shrink-0 text-blue-600"
            size={15}
          />
          <span className="min-w-0  [overflow-wrap:anywhere]">
            {job.jobType || "Job type not specified"}
          </span>
        </p>
{/* WorkMode */}
        <p className="flex min-w-0 items-start gap-2 text-xs leading-5 text-slate-600">
          <FiHome
            className="mt-0.5 shrink-0 text-blue-600"
            size={15}
          />
          <span className="min-w-0 [overflow-wrap:anywhere]">
            {job.workMode || "Work mode not specified"}
          </span>
        </p>
{/* Salary */}
        <p className="flex min-w-0 items-start gap-2 text-xs leading-5 text-slate-600">
          <FiDollarSign
            className="mt-0.5 shrink-0 text-blue-600"
            size={15}
          />
          <span className="min-w-0  [overflow-wrap:anywhere]">
            {job.salary || "Salary not specified"}
          </span>
        </p>
      </div>
      {/* Required skills */}
      {keySkills.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {keySkills.slice(0, maxSkills).map((skill, index) => (
            <span
              key={`${skill}-${index}`}
              className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
            >
              {skill}
            </span>
          ))}
          {keySkills.length > maxSkills && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">+{keySkills.length - maxSkills} more</span>}
        </div>
      )}

        {/* Role summary */}
      {!guestPreview && (job.roleSummary || job.description) && <p className="mt-2 line-clamp-3 text-sm leading-tight text-slate-600">
        {job.roleSummary ||
          job.description ||
          "No description provided."}
      </p>}

      {/* Full job description */}
      <div className="mt-auto flex items-center gap-2 pt-4">
      <button
        type="button"
        onClick={onViewDetails}
        disabled={detailsLoading}
        className="flex flex-1 items-center justify-center rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 focus-visible:outline-blue-600 disabled:opacity-50"
      >
        {detailsLoading ? "Loading..." : "View Details"}
      </button>

      {/* Application button supplied by parent */}
      {applyButton}
      </div>
    </article>
  );
}
