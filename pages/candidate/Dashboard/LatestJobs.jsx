import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import LocationAutocomplete from "../../../components/common/LocationAutocomplete";
import { useRouter } from "next/router";
import Layout from "../../../components/Layout/Layout";
import { url } from "../../../utils/constant";
import CVUploadModal from "../../../components/Jobs/CVUploadModal";
import JobDetailsModal from "../../../components/Jobs/JobDetailsModal";
import JobCard from "../../../components/Jobs/JobCard";
import QuickApplyModal from "../../../components/Jobs/QuickApplyModal";
import useLatestJobScores from "../../../components/Jobs/useLatestJobScores";
import JobMatchIndicator from "../../../components/Jobs/JobMatchIndicator";
import { jobDetailsMatchState } from "../../../components/Jobs/jobDetailsMatchState";
import MatchScoreModal from "../../company/Dashboard/Applicants/MatchScoreModal";
import {
  isJobExpired,
  salaryFilterOptions,
  workModeOptions,
  passesJobFilters,
} from "../../../components/Jobs/jobUtils";
import {
  FiAlertCircle,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiDollarSign,
  FiFileText,
  FiHome,
  FiInbox,
  FiLoader,
  FiLock,
  FiLogIn,
  FiMapPin,
  FiRefreshCw,
  FiSearch,
  FiTarget,
} from "react-icons/fi";


const LatestJobs = () => {
  const router = useRouter();

  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [jobsError, setJobsError] = useState("");
  const [applyingId, setApplyingId] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [applicationStatuses, setApplicationStatuses] =
    useState({});

  const [selectedJob, setSelectedJob] = useState(null);
  const [quickApplyJob, setQuickApplyJob] = useState(null);
  const [scoreJobId, setScoreJobId] = useState(null);
  const applicationInFlight = useRef(false);
  const submittedIds = useRef(new Set());
  const localApplications = useRef({});
  // Controls the CV upload modal.
  const [showCVUploadModal, setShowCVUploadModal] = useState(false);
  const applicationStatusLabels = {
    pending: "Application Submitted",
    reviewing: "Application Under Review",
    interview: "Interview Stage",
    accepted: "Application Accepted",
    rejected: "Application Unsuccessful",
  };

const [locationFilter, setLocationFilter] = useState("");
// Track whether the user is editing a selected location.
const [isEditingLocation, setIsEditingLocation] = useState(false);
const [minSalary, setMinSalary] = useState(0);

  const [workModeFilter, setWorkModeFilter] = useState("");

  /** * Retrieve all jobs. */
  const fetchJobs = async () => {
    try {
      setLoading(true);
      setJobsError("");

      const response = await axios.get(`${url}/all-jobs`);

      console.log("Jobs API response:", response.data);

      const jobsData = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.jobs)
          ? response.data.jobs
          : [];

      setJobs(jobsData);
    } catch (error) {
      console.error("Fetch latest jobs error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      setJobs([]);

      setJobsError(
        error.response?.data?.message ||
        "We could not load the latest jobs."
      );
    } finally {
      setLoading(false);
    }
  };

  /*** Retrieve the candidate's existing applications.   */
  const fetchMyApplications = async (token) => {
    if (!token) {
      return;
    }

    try {
      const response = await axios.get(
        `${url}/applications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "My applications response:",
        response.data
      );

      const applications = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.applications)
          ? response.data.applications
          : Array.isArray(response.data?.data)
            ? response.data.data
            : [];

      const statusMap = {};

      applications.forEach((application) => {
        const applicationJobId =
          typeof application.jobId === "object"
            ? application.jobId?._id
            : application.jobId;

        if (applicationJobId) {
          statusMap[String(applicationJobId)] =
            application.status || "pending";
        }
      });

      setApplicationStatuses({ ...localApplications.current, ...statusMap });
    } catch (error) {
      console.error("Fetch applications error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setApplicationStatuses({});
      }
    }
  };

  /** * Load jobs and application history when the page opens. */
  useEffect(() => {
    const token = localStorage.getItem("token");

    setIsLoggedIn(Boolean(token));

    fetchJobs();

    if (token) {
      fetchMyApplications(token);
    }
  }, []);

  /*** Apply for a job.*/
  const handleApply = async (jobId, cvId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/signup");
      return;
    }

    if (!cvId || applicationInFlight.current || submittedIds.current.has(String(jobId))) return false;
    applicationInFlight.current = true;

    try {
      setApplyingId(jobId);

      const response = await axios.post(
        `${url}/applications/apply`,
        {
          jobId,
          cvId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Apply response:", response.data);

      submittedIds.current.add(String(jobId));
      localApplications.current[String(jobId)] = response.data?.application?.status || "pending";
      setApplicationStatuses((previousStatuses) => ({
        ...previousStatuses,
        [String(jobId)]:
          response.data?.application?.status || "pending",
      }));

      alert(
        response.data?.message ||
        "Application submitted successfully!"
      );
      setQuickApplyJob(null);
      return true;
    } catch (error) {
      const serverMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to apply for this job.";

      console.error("Apply job error details:", {
        message: error.message,
        status: error.response?.status,
        responseData: error.response?.data,
        requestUrl: `${url}/applications/apply`,
        jobId,
      });

      if (error.response?.status === 401) {
        alert(
          "Your login session has expired. Please sign in again."
        );

        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setApplicationStatuses({});

        router.push("/signin");
        return;
      }

      // The backend rejected the application
      // because the candidate has no CV.
      if (
        error.response?.status === 400 &&
        serverMessage
          .toLowerCase()
          .includes("please upload a cv")
      ) {
        // Open our reusable CV upload modal.
        setShowCVUploadModal(true);
        return;
      }
      if (
        error.response?.status === 400 &&
        serverMessage
          .toLowerCase()
          .includes("already applied")
      ) {
        await fetchMyApplications(token);
      }

      alert(serverMessage);
      return false;
    } finally {
      applicationInFlight.current = false;
      setApplyingId("");
    }
  };


  // Check if its Recently added
  const isRecentJob = (job) => {
    if (!job.createdAt) {
      return false
    }
    //Take a job.

    // If the job doesn't have a created date:
    //     say false.

    // Convert the job's created date into a Date.

    // Create today's date.

    // Move today's date backwards 14 days.

    // Check:
    // Is the job's date on or after that date?

    // Yes → true
    // No  → false
    //give you the created date and concert mongoDB' date into a JavaScript Date
    // e.g job.createdAt = "2026-08-20T13:32:10.000Z";
    const jobDate = new Date(job.createdAt);
    // Today
    const fourteenDaysAgo = new Date()
    // setDate(10)
    // change the date from 24 Aug to 10 Aug
    fourteenDaysAgo.setDate(
      //getDate() >> the day of the month
      // eg >> 24 (24th Aug)
      // 24 - 14 = 10
      fourteenDaysAgo.getDate() - 14
    )
    // 20 Aug >= 10 Aug // true
    return jobDate >= fourteenDaysAgo
  }

  const searchValue = searchTerm.trim().toLowerCase();
  const locationValue =
    locationFilter.trim().toLowerCase();

  const hasActiveFilters =
    Boolean(searchValue) ||
    Boolean(locationValue) ||
    Boolean(workModeFilter) ||
    minSalary > 0;

const clearFilters = () => {
  setSearchTerm("");
  setLocationFilter("");
  setIsEditingLocation(false);
  setMinSalary(0);
  setWorkModeFilter("");
};

/**
 * Filter Latest Jobs.
 * Shared filters:
 * - Keyword
 * - Location
 * - Minimum salary
 * - Work mode
 * - Job availability
 * Latest Jobs only:
 * - Posted within the last 14 days
 */
const filteredJobs = jobs
  .filter((job) => {
    // Check the common job filters.
const matchesFilters = passesJobFilters(job, {
  searchTerm,
  locationFilter: isEditingLocation ? "" : locationFilter,
  minSalary,
  workModeFilter,
});
    // Latest Jobs has an additional 14-day restriction.
    const isRecent = isRecentJob(job);

    // Both conditions must be true.
    return matchesFilters && isRecent;
  })
  .sort(
    (a, b) =>
      new Date(b.createdAt) -
      new Date(a.createdAt)
  );

  const scoring = useLatestJobScores(filteredJobs, isLoggedIn);
  const openQuickApply = (job) => {
    if (!localStorage.getItem("token")) { router.push("/signup"); return; }
    if (applicationInFlight.current || applicationStatuses[String(job._id)] || submittedIds.current.has(String(job._id))) return;
    setSelectedJob(null);
    setScoreJobId(null);
    setQuickApplyJob({ ...job, jobId: String(job._id) });
  };
  const selectScoringCv = (cv) => { setScoreJobId(null); scoring.selectCv(cv); };
  const scoreJob = filteredJobs.find((job) => String(job._id) === scoreJobId);
  const scoreEntry = scoreJob && scoring.scoreFor(scoreJob);

  const getMatchIndicator = (job) => isLoggedIn ? (
    <JobMatchIndicator job={job} scoring={scoring}
      onView={() => setScoreJobId(String(job._id))}
      onUpload={() => setShowCVUploadModal(true)} />
  ) : null;

  /**
   * Create the Apply button for a job.
   * This function can be used by both
   * JobCard and JobDetailsModal.
   */
  const getApplicationButton = (job, modalButton = false) => {
    // Check whether the candidate already applied.
    const applicationStatus =
      applicationStatuses[String(job._id)];

    const hasAlreadyApplied = Boolean(applicationStatus);

    // Check whether this application is processing.
    const isApplying = applyingId === job._id;

    // Check whether the job is closed or expired.
    const unavailable =
      String(job.status || "").toLowerCase() !== "open" ||
      isJobExpired(job);

    // Use different button sizes for cards and modals.
    const baseClass = modalButton
      ? "flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition"
      : "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition";

    const colourClass =
      unavailable || hasAlreadyApplied
        ? "cursor-not-allowed bg-slate-200 text-slate-600"
        : "bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-50";

    return (
      <button
        type="button"
        onClick={() => openQuickApply(job)}
        disabled={Boolean(applyingId) || unavailable || hasAlreadyApplied || (isLoggedIn && ["guest", "loading"].includes(scoring.status))}
        className={`${baseClass} ${colourClass}`}
      >
        {isApplying ? (
          <>
            <FiLoader className="animate-spin" size={16} />
            Applying...
          </>
        ) : unavailable ? (
          <>
            <FiLock size={16} />
            Applications Closed
          </>
        ) : !isLoggedIn ? (
          <>
            <FiLogIn size={16} />
            Sign up to Apply
          </>
        ) : hasAlreadyApplied ? (
          <>
            <FiCheckCircle size={16} />
            {applicationStatusLabels[applicationStatus] ||
              "Already Applied"}
          </>
        ) : (
          <>
            <FiFileText size={16} />
            Quick Apply
          </>
        )}
      </button>
    );
  };


  return (
    <Layout>
      <main className="min-h-screen pb-12 pt-28">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-950/10">
            {/* Page heading */}
            <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 p-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-600/20">
                    <FiBriefcase
                      aria-hidden="true"
                      size={24}
                    />
                  </div>

                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                      Latest Jobs
                    </h1>

                    <p className="mt-1 text-sm text-slate-600">
                      Browse company-posted jobs and apply
                      using your uploaded CV.
                    </p>
                  </div>
                </div>

                <div className="flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
                  <FiBriefcase
                    aria-hidden="true"
                    className="text-blue-700"
                    size={16}
                  />

                  <span>
                    Showing {filteredJobs.length}{" "}
                    {filteredJobs.length === 1
                      ? "job"
                      : "jobs"}
                  </span>
                </div>
              </div>
            </div>

            {/* Search area */}
            {/* Search and filters */}
            <div className="border-b border-slate-200 bg-white px-6 py-5">

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

                {/* Keyword */}
                <div>
                  <label
                    htmlFor="job-search"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Keyword
                  </label>

                  <div className="relative">
                    <FiSearch
                      aria-hidden="true"
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />

                    <input
                      id="job-search"
                      type="text"
                      placeholder="Title, company or skill..."
                      value={searchTerm}
                      onChange={(event) =>
                        setSearchTerm(event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>


{/* Location filter with Geoapify autocomplete */}
<div>
  <label
    htmlFor="location-filter"
    className="mb-2 block text-sm font-semibold text-slate-700"
  >
    Location
  </label>

  <LocationAutocomplete
    id="location-filter"
    value={locationFilter}

    // Called when the user starts editing.
    onTyping={() => {
      setIsEditingLocation(true);
    }}

    // Called when the user selects a location.
    onChange={(location) => {
      setLocationFilter(location.displayName);
      setIsEditingLocation(false);
    }}

    placeholder="Search city or country..."
  />
</div>

                {/* Minimum salary */}
                <div>
                  <label
                    htmlFor="salary-filter"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Minimum Salary
                  </label>

                  <div className="relative">
                    <FiDollarSign
                      aria-hidden="true"
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />

                    <select
                      id="salary-filter"
                      value={minSalary}
                      onChange={(event) =>
                        setMinSalary(
                          Number(event.target.value)
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 transition focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                    >
                      {salaryFilterOptions.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Work mode */}
                <div>
                  <label
                    htmlFor="work-mode-filter"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Work Mode
                  </label>

                  <div className="relative">
                    <FiHome
                      aria-hidden="true"
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />

                    <select
                      id="work-mode-filter"
                      value={workModeFilter}
                      onChange={(event) =>
                        setWorkModeFilter(
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 transition focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">
                        All work modescription
                      </option>

                      {workModeOptions.map((mode) => (
                        <option key={mode} value={mode}>
                          {mode}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

              </div>

              {/* Filter footer */}
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">
                  Latest Jobs shows available jobs posted
                  within the last 14 days.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                  className="w-fit text-sm font-semibold text-blue-700 transition hover:text-blue-900 disabled:cursor-not-allowed disabled:text-slate-400"
                >
                  Clear filters
                </button>
              </div>

            </div>

            {/* Page content */}
            <div className="p-6">
              {loading ? (
                /* Loading state */
                <div className="flex flex-col items-center justify-center py-14">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                    <FiLoader
                      aria-hidden="true"
                      className="animate-spin"
                      size={27}
                    />
                  </div>

                  <p className="mt-4 text-sm font-medium text-slate-600">
                    Loading the latest jobs...
                  </p>
                </div>
              ) : jobsError ? (
                /* Error state */
                <div className="flex flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50 py-12 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
                    <FiAlertCircle
                      aria-hidden="true"
                      size={27}
                    />
                  </div>

                  <p className="mt-4 font-semibold text-red-800">
                    Unable to load jobs
                  </p>

                  <p className="mt-1 text-sm text-red-600">
                    {jobsError}
                  </p>

                  <button
                    type="button"
                    onClick={fetchJobs}
                    className="mt-5 flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                  >
                    <FiRefreshCw
                      aria-hidden="true"
                      size={15}
                    />
                    Try Again
                  </button>
                </div>
              ) : filteredJobs.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 py-14 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <FiInbox
                      aria-hidden="true"
                      size={30}
                    />
                  </div>

                  <h2 className="mt-4 font-semibold text-slate-800">
                    No jobs found
                  </h2>

                  <p className="mt-1 max-w-md text-sm text-slate-500">
                    {hasActiveFilters
                      ? "No recent jobs match your selected filters. Try changing or clearing one of the filters."
                      : "There are currently no available jobs posted within the last 14 days."}
                  </p>
                </div>
              ) : (
                /* Job cards */
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

                  {filteredJobs.map((job) => (
                    <JobCard
                      key={job._id}
                      job={job}
                      onViewDetails={() => { setScoreJobId(null); setSelectedJob(job); }}
                      applyButton={getApplicationButton(job)}
                      matchIndicator={getMatchIndicator(job)}
                      unavailable={
                        String(job.status || "").toLowerCase() !== "open" ||
                        isJobExpired(job)
                      }
                    />
                  ))}

                </div>
              )}
            </div>
          </section>
        </div>

        {/* Shared Job Description Modal */}
        <JobDetailsModal
          job={selectedJob}
          matchState={jobDetailsMatchState(scoring, selectedJob, undefined, !isLoggedIn)}
          onRetryMatch={scoring.retry}
          onUploadCv={() => { setSelectedJob(null); setShowCVUploadModal(true); }}
          onClose={() => setSelectedJob(null)}
          applyButton={
            selectedJob
              ? getApplicationButton(selectedJob, true)
              : null
          }
        />

      </main>

      {quickApplyJob && (
        <QuickApplyModal
          key={quickApplyJob.jobId}
          job={quickApplyJob}
          initialCv={scoring.status === "ready" ? scoring.cv : undefined}
          loadMatch={scoring.status === "ready" && scoring.cv ? scoring.getMatch : undefined}
          onCvUploaded={selectScoringCv}
          submitting={Boolean(applyingId)}
          onClose={() => { if (!applicationInFlight.current) setQuickApplyJob(null); }}
          onConfirm={(cvId) => handleApply(quickApplyJob.jobId, cvId)}
        />
      )}
      {scoreEntry?.status === "ready" && (
        <MatchScoreModal data={{ ...scoreEntry.match, title: scoreJob.title, candidateName: "Your Profile" }} isGuest={false} onClose={() => setScoreJobId(null)} />
      )}

      {/* Reusable CV upload modal */}
      <CVUploadModal
        isOpen={showCVUploadModal}
        onClose={() => {
          setShowCVUploadModal(false);
        }}
        uploadOnly
        onUploadSuccess={(cv) => {
          // Close the modal after uploading.
          setShowCVUploadModal(false);
          if (cv?._id) selectScoringCv(cv);
        }}
      />
    </Layout>
  );
};

export default LatestJobs;
