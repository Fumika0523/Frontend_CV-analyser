import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import LocationAutocomplete from "../../../components/common/LocationAutocomplete";
import { toast } from "react-toastify";
import { url } from "../../../utils/constant";
import CVUploadModal from "../../../components/Jobs/CVUploadModal";
import JobDetailsModal from "../../../components/Jobs/JobDetailsModal";
import JobCard from "../../../components/Jobs/JobCard";
import QuickApplyModal from "../../../components/Jobs/QuickApplyModal";
import JobMatchIndicator from "../../../components/Jobs/JobMatchIndicator";
import { jobDetailsMatchState } from "../../../components/Jobs/jobDetailsMatchState";
import useLatestJobScores from "../../../components/Jobs/useLatestJobScores";
import MatchScoreModal from "../../company/Dashboard/Applicants/MatchScoreModal";
import {
  salaryFilterOptions,
  workModeOptions,
  passesJobFilters,
} from "../../../components/Jobs/jobUtils";
import {
  FiBriefcase, FiCalendar, FiCheckCircle, FiDollarSign, FiExternalLink,
  FiFileText, FiHome, FiInbox, FiLoader, FiLogIn, FiMapPin, FiSearch, FiX,
} from "react-icons/fi";
const applicationStatusLabels = {
  pending: "Application Submitted",
  reviewing: "Application Under Review",
  interview: "Interview Stage",
  accepted: "Application Accepted",
  rejected: "Application Unsuccessful",
};

const ApplyJobs = () => {
  const router = useRouter();

  // Jobs
  const [jobData, setJobData] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [quickApplyJob, setQuickApplyJob] = useState(null);
  const [scoreJobId, setScoreJobId] = useState(null);
  const applicationInFlight = useRef(false);
  const submittedIds = useRef(new Set());
  const localApplications = useRef({});

  // Login
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Controls whether the CV upload modal is visible.
  const [showCVUploadModal, setShowCVUploadModal] = useState(false);

  // Applications
  const [applicationsByJob, setApplicationsByJob] = useState({});
  const [applyingJobId, setApplyingJobId] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  // Track whether the candidate is editing the location.
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [minSalary, setMinSalary] = useState(0);
  const [workModeFilter, setWorkModeFilter] = useState("");

  /**
   * Create authorization headers.
   */
  const getAuthConfig = () => {
    const token =
      localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  /**
   * Fetch all jobs.
   *
   * This request remains public so guests
   * can browse jobs.
   */
  const getJobsData = async () => {
    try {
      const response = await axios.get(
        `${url}/all-jobs`
      );

      const jobs = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.jobs)
          ? response.data.jobs
          : [];

      setJobData(jobs);
    } catch (error) {
      console.error(
        "Error fetching jobs:",
        error
      );

      setJobData([]);

      toast.error("Failed to load jobs");
    }
  };

  /**
   * Fetch the logged-in candidate's
   * existing applications.
   */
  const getApplicationsData = async () => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      setApplicationsByJob({});
      return;
    }

    try {
      const response = await axios.get(
        `${url}/applications`,
        getAuthConfig()
      );

      const applications = Array.isArray(
        response.data
      )
        ? response.data
        : Array.isArray(
          response.data?.applications
        )
          ? response.data.applications
          : Array.isArray(
            response.data?.data
          )
            ? response.data.data
            : [];

      const applicationMap =
        applications.reduce(
          (result, application) => {
            const jobId =
              typeof application.jobId ===
                "object"
                ? application.jobId?._id
                : application.jobId;

            if (jobId) {
              result[String(jobId)] =
                application;
            }

            return result;
          },
          {}
        );

      setApplicationsByJob(
        { ...localApplications.current, ...applicationMap }
      );
    } catch (error) {
      console.error(
        "Error fetching applications:",
        error
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("token");

        setIsLoggedIn(false);
        setApplicationsByJob({});
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    setIsLoggedIn(Boolean(token));

    // Load available jobs.
    getJobsData();

    if (token) {
      // Load existing applications.
      getApplicationsData();

    }
  }, []);


  // Apply for job
  const openQuickApply = async (job) => {
    const token =
      localStorage.getItem("token");

    // Guests must sign up first.
    if (!token) {
      router.push("/signup");
      return;
    }

    if (applicationInFlight.current || submittedIds.current.has(String(job._id))) return;

    const existingApplication =
      applicationsByJob[job._id];

    // Extra frontend duplicate protection.
    if (existingApplication) {
      toast.info(
        applicationStatusLabels[
        existingApplication.status
        ] ||
        "You have already applied for this job"
      );

      return;
    }

    // Wait until we know whether the candidate has a CV.
    if (cvStatus === "checking") {
      toast.info("Checking your uploaded CV. Please wait.");
      return;
    }

    // Do not submit when the CV check has failed.
    if (cvStatus === "error") {
      toast.error(
        "Unable to check your CV. Please refresh the page and try again."
      );
      return;
    }

    // Candidate has no CV: keep the existing upload flow.
    if (cvStatus === "missing") {
      // Open the CV upload modal instead of leaving the page.
      setShowCVUploadModal(true);
      return;
    }

    setSelectedJob(null);
    setScoreJobId(null);
    setQuickApplyJob({ ...job, jobId: String(job._id) });
  };

  const handleApply = async (job, cvId) => {
    if (!localStorage.getItem("token")) { router.push("/signup"); return false; }
    if (!cvId || applicationInFlight.current || submittedIds.current.has(String(job._id)) || applicationsByJob[job._id]) return false;
    applicationInFlight.current = true;
    try {
      setApplyingJobId(job._id);

      const response = await axios.post(
        `${url}/applications/apply`,
        {
          jobId: job._id,
          cvId,
        },
        getAuthConfig()
      );

      const newApplication = response.data?.application || { jobId: job._id, status: "pending" };

      submittedIds.current.add(String(job._id));
      localApplications.current[String(job._id)] = newApplication;
      setApplicationsByJob((previousApplications) => ({
        ...previousApplications,
        [job._id]: newApplication,
      }));
      if (!response.data?.application) {
        // If backend did not return the application,
        // refresh from the server.
        await getApplicationsData();
      }
      toast.success(
        response.data?.message ||
        "Application submitted successfully"
      );
      setQuickApplyJob(null);
      return true;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Failed to apply for this job";

      console.error(
        "Apply job error:",
        error
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("token");

        setIsLoggedIn(false);
        setApplicationsByJob({});

        toast.error(
          "Your session has expired. Please sign in again."
        );

        router.replace("/?auth=signin");
        return;
      }

      if (
        message
          .toLowerCase()
          .includes("already applied")
      ) {
        await getApplicationsData();
      }

      toast.error(message);
      return false;
    } finally {
      applicationInFlight.current = false;
      setApplyingJobId(null);
    }
  };

  /**
   * Reusable Apply button.
   *
   * Used both on the job card and inside
   * the full-description modal.
   */
  const getApplicationButton = (
    job,
    modalButton = false
  ) => {
    const application =
      applicationsByJob[job._id];

    const isApplying =
      applyingJobId === job._id;

    const hasApplied =
      Boolean(application);

    const baseClass = modalButton
      ? "flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition"
      : "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition";

    const colourClass =
      hasApplied || isApplying
        ? "cursor-not-allowed bg-slate-200 text-slate-600"
        : "bg-blue-700 text-white hover:bg-blue-800";

    return (
      <button
        type="button"
        onClick={() =>
          openQuickApply(job)
        }
        disabled={
          hasApplied || Boolean(applyingJobId)
        }
        className={`${baseClass} ${colourClass}`}
      >
        {isApplying ? (
          <>
            <FiLoader
              className="animate-spin"
              size={16}
            />

            Applying...
          </>
        ) : !isLoggedIn ? (
          <>
            <FiLogIn size={16} />

            Sign up to Apply
          </>
        ) : hasApplied ? (
          <>
            <FiCheckCircle
              size={16}
            />

            {applicationStatusLabels[
              application.status
            ] || "Already Applied"}
          </>
        ) : (
          <>
            <FiFileText
              size={16}
            />

            Quick Apply
          </>
        )}
      </button>
    );
  };


  /*
   * Prepare filter values.
   */
  const searchValue =
    searchTerm
      .trim()
      .toLowerCase();

  const locationValue =
    locationFilter
      .trim()
      .toLowerCase();

  /*
   * Used to enable / disable Clear Filters.
   */
  const hasActiveFilters =
    Boolean(searchValue) ||
    Boolean(locationValue) ||
    Boolean(workModeFilter) ||
    minSalary > 0;

  /*
   * Reset all filters.
   */
  const clearFilters = () => {
    setSearchTerm("");
    setLocationFilter("");
    setMinSalary(0);
    setWorkModeFilter("");
  };

  /**
   * Filter available jobs using our shared function.
   *
   * Each job is checked against the candidate's
   * selected search and filter values.
   */
  const filteredJobs = jobData
    .filter((job) =>
    passesJobFilters(job, {
  searchTerm,
  locationFilter: isEditingLocation ? "" : locationFilter,
  minSalary,
  workModeFilter,
})
    )
    // Display the newest jobs first.
    .sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    );

  const scoring = useLatestJobScores(filteredJobs, isLoggedIn);
  const cvStatus = scoring.status === "ready" ? (scoring.cv ? "ready" : "missing")
    : scoring.status === "error" ? "error" : "checking";
  const selectScoringCv = (cv) => { setScoreJobId(null); scoring.selectCv(cv); };
  const scoreJob = filteredJobs.find((job) => String(job._id) === scoreJobId);
  const scoreEntry = scoreJob && scoring.scoreFor(scoreJob);



  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-950/10">
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
              <h2 className="text-2xl font-bold text-slate-900">
                All Jobs
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Browse all currently available
                jobs and apply using your CV.
              </p>
            </div>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
            <FiBriefcase
              className="text-blue-700"
              size={16}
            />

            <span>
              Showing{" "}
              {filteredJobs.length}{" "}
              {filteredJobs.length === 1
                ? "job"
                : "jobs"}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* Keyword */}
          <div>
            <label
              htmlFor="all-jobs-search"
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
                id="all-jobs-search"
                type="text"
                placeholder="Title, company or skill..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Location filter with autocomplete */}
          <div>
            <label
              htmlFor="all-jobs-location"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Location
            </label>

        <LocationAutocomplete
          id="all-jobs-location"
          value={locationFilter}

          // Called when the candidate starts typing.
          onTyping={() => {
            setIsEditingLocation(true);
          }}

          // Called when the candidate selects a location.
          onChange={(location) => {
            setLocationFilter(location.displayName);
            setIsEditingLocation(false);
          }}

          placeholder="Search city or country..."
        />

          </div>

          {/* Salary */}
          <div>
            <label
              htmlFor="all-jobs-salary"
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
                id="all-jobs-salary"
                value={minSalary}
                onChange={(event) =>
                  setMinSalary(
                    Number(
                      event.target.value
                    )
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 transition focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                {salaryFilterOptions.map(
                  (option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {/* Work mode */}
          <div>
            <label
              htmlFor="all-jobs-work-mode"
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
                id="all-jobs-work-mode"
                value={workModeFilter}
                onChange={(event) =>
                  setWorkModeFilter(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 transition focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="">
                  All work modes
                </option>

                {workModeOptions.map(
                  (mode) => (
                    <option
                      key={mode}
                      value={mode}
                    >
                      {mode}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Filter footer */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

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

      {/* Jobs */}
      <div className="p-6">
        {filteredJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 py-14 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-700">
              <FiInbox
                aria-hidden="true"
                size={30}
              />
            </div>

            <h3 className="mt-4 font-semibold text-slate-800">
              No jobs found
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-500">
              {hasActiveFilters
                ? "No jobs match your selected filters. Try changing or clearing one of the filters."
                : "There are currently no available jobs."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

            {filteredJobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                onViewDetails={() => { setScoreJobId(null); setSelectedJob(job); }}
                applyButton={getApplicationButton(job)}
                matchIndicator={isLoggedIn ? <JobMatchIndicator job={job} scoring={scoring}
                  onView={() => setScoreJobId(String(job._id))}
                  onUpload={() => setShowCVUploadModal(true)} /> : null}
              />
            ))}

          </div>
        )}
      </div>

      {/* Shared job description modal */}
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

      {quickApplyJob && <QuickApplyModal key={quickApplyJob.jobId} job={quickApplyJob}
        initialCv={scoring.status === "ready" ? scoring.cv : undefined}
        loadMatch={scoring.status === "ready" && scoring.cv ? scoring.getMatch : undefined}
        onCvUploaded={selectScoringCv} submitting={Boolean(applyingJobId)}
        onClose={() => { if (!applicationInFlight.current) setQuickApplyJob(null); }}
        onConfirm={(cvId) => handleApply(quickApplyJob, cvId)} />}
      {scoreEntry?.status === "ready" && <MatchScoreModal
        data={{ ...scoreEntry.match, title: scoreJob.title, candidateName: "Your Profile" }} isGuest={false}
        onClose={() => setScoreJobId(null)} />}

      {/* CV upload modal */}
      {showCVUploadModal && (
        <CVUploadModal
          isOpen={showCVUploadModal}
          onClose={() => {
            // Close the modal.
            setShowCVUploadModal(false);
          }}
          uploadOnly
          onUploadSuccess={(cv) => {
            // The candidate now has a CV.
            if (cv?._id) selectScoringCv(cv);

            // Close the modal after successful upload.
            setShowCVUploadModal(false);
          }}
        />
      )}
    </div>
  );
};

export default ApplyJobs;
