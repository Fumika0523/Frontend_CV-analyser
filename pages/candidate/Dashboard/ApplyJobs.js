import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { url } from "../../../utils/constant";

import {
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiDollarSign,
  FiExternalLink,
  FiFileText,
  FiHome,
  FiInbox,
  FiLoader,
  FiLogIn,
  FiMapPin,
  FiSearch,
  FiX,
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

  // Login
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Applications
  const [applicationsByJob, setApplicationsByJob] =
    useState({});

  const [applyingJobId, setApplyingJobId] =
    useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] =
    useState("");
  const [minSalary, setMinSalary] = useState(0);
  const [workModeFilter, setWorkModeFilter] =
    useState("");

  const salaryFilterOptions = [
    { label: "Any salary", value: 0 },
    { label: "£15,000+", value: 15000 },
    { label: "£20,000+", value: 20000 },
    { label: "£25,000+", value: 25000 },
    { label: "£30,000+", value: 30000 },
    { label: "£35,000+", value: 35000 },
    { label: "£40,000+", value: 40000 },
    { label: "£50,000+", value: 50000 },
    { label: "£60,000+", value: 60000 },
    { label: "£70,000+", value: 70000 },
  ];

  const workModeOptions = [
    "Office",
    "Hybrid",
    "Remote",
  ];

  /**
   * Convert location object into readable text.
   *
   * Example:
   *
   * {
   *   city: "London",
   *   country: "United Kingdom"
   * }
   *
   * becomes:
   *
   * London, United Kingdom
   */
  const formatLocation = (location) => {
    if (!location) {
      return "";
    }

    if (typeof location === "string") {
      return location;
    }

    return [location.city, location.country]
      .filter(Boolean)
      .join(", ");
  };

  /**
   * Extract the minimum salary from the salary string.
   *
   * Examples:
   *
   * £30,000 - £35,000 -> 30000
   * £70,000+          -> 70000
   * Competitive       -> null
   */
  const parseSalaryMin = (salaryString) => {
    if (
      !salaryString ||
      typeof salaryString !== "string"
    ) {
      return null;
    }

    const cleanedSalary =
      salaryString.replace(/,/g, "");

    const match =
      cleanedSalary.match(/\d+/);

    if (!match) {
      return null;
    }

    return Number(match[0]);
  };

  /**
   * Check whether a job satisfies the selected
   * minimum salary.
   */
  const passesSalaryFilter = (job) => {
    // 0 means "Any salary".
    if (minSalary === 0) {
      return true;
    }

    const salaryText = String(job.salary || "")
      .trim()
      .toLowerCase();

    // We don't know the exact salary, so keep
    // Competitive jobs visible.
    if (salaryText === "competitive") {
      return true;
    }

    const jobMinSalary =
      parseSalaryMin(job.salary);

    if (jobMinSalary === null) {
      return false;
    }

    return jobMinSalary >= minSalary;
  };

  /**
   * Check whether the application deadline
   * has passed.
   */
  const isJobExpired = (job) => {
    if (!job.applicationEndDate) {
      return false;
    }

    return (
      new Date(job.applicationEndDate) <
      new Date()
    );
  };

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
        applicationMap
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

  /**
   * Load jobs and application history.
   */
  useEffect(() => {
    const token =
      localStorage.getItem("token");

    setIsLoggedIn(Boolean(token));

    getJobsData();

    if (token) {
      getApplicationsData();
    }
  }, []);

  /**
   * Apply for a job.
   */
  const handleApply = async (job) => {
    const token =
      localStorage.getItem("token");

    // Guests must sign up first.
    if (!token) {
      router.push("/signup");
      return;
    }

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

    try {
      setApplyingJobId(job._id);

      const response = await axios.post(
        `${url}/applications/apply`,
        {
          jobId: job._id,
          cvId: null,
        },
        getAuthConfig()
      );

      const newApplication =
        response.data?.application;

      if (newApplication) {
        setApplicationsByJob(
          (previousApplications) => ({
            ...previousApplications,
            [job._id]: newApplication,
          })
        );
      } else {
        // If backend did not return the application,
        // refresh from the server.
        await getApplicationsData();
      }

      toast.success(
        response.data?.message ||
          "Application submitted successfully"
      );
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

        router.push("/signin");
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
    } finally {
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
      : "mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition";

    const colourClass =
      hasApplied || isApplying
        ? "cursor-not-allowed bg-slate-200 text-slate-600"
        : "bg-blue-700 text-white hover:bg-blue-800";

    return (
      <button
        type="button"
        onClick={() =>
          handleApply(job)
        }
        disabled={
          hasApplied || isApplying
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

            Apply with CV
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
   * Filter All Jobs.
   *
   * IMPORTANT:
   * Unlike Latest Jobs, there is NO
   * 14-day restriction here.
   */
  const filteredJobs = jobData
    .filter((job) => {
      const title =
        String(job.title || "");

      const companyName =
        String(
          job.companyId?.companyName ||
            job.companyName ||
            ""
        );

      const locationText =
        formatLocation(job.location);

      const skillsText =
        Array.isArray(job.keySkills)
          ? job.keySkills.join(" ")
          : "";

      /*
       * Keyword:
       * title, company, or skill.
       */
      const matchesSearch =
        !searchValue ||
        title
          .toLowerCase()
          .includes(searchValue) ||
        companyName
          .toLowerCase()
          .includes(searchValue) ||
        skillsText
          .toLowerCase()
          .includes(searchValue);

      /*
       * Location filter.
       */
      const matchesLocation =
        !locationValue ||
        locationText
          .toLowerCase()
          .includes(locationValue);

      /*
       * Work mode filter.
       */
      const matchesWorkMode =
        !workModeFilter ||
        String(job.workMode || "")
          .toLowerCase() ===
          workModeFilter.toLowerCase();

      /*
       * Job must be Open.
       */
      const isOpen =
        String(job.status || "")
          .toLowerCase() === "open";

      /*
       * Job must also be non-expired.
       */
      const isAvailable =
        isOpen &&
        !isJobExpired(job);

      return (
        matchesSearch &&
        matchesLocation &&
        matchesWorkMode &&
        passesSalaryFilter(job) &&
        isAvailable
      );
    })
    /*
     * Newest jobs first.
     */
    .sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    );

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

          {/* Location */}
          <div>
            <label
              htmlFor="all-jobs-location"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Location
            </label>

            <div className="relative">
              <FiMapPin
                aria-hidden="true"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />

              <input
                id="all-jobs-location"
                type="text"
                placeholder="e.g. London or United Kingdom"
                value={locationFilter}
                onChange={(event) =>
                  setLocationFilter(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
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
            {filteredJobs.map((job) => {
              const companyName =
                job.companyId?.companyName ||
                job.companyName ||
                "Company";

              const keySkills =
                Array.isArray(job.keySkills)
                  ? job.keySkills
                  : [];

              return (
                <article
                  key={job._id}
                  className="group flex h-full flex-col rounded-xl border border-l-4 border-slate-200 border-l-blue-500 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
                >
                  {/* Title */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 transition group-hover:bg-blue-700 group-hover:text-white">
                        <FiBriefcase
                          size={19}
                        />
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900">
                          {job.title ||
                            "Untitled job"}
                        </h3>

                        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
                          <FiHome
                            className="shrink-0 text-slate-400"
                            size={14}
                          />

                          <span>
                            {companyName}
                          </span>
                        </p>

                        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                          <FiCalendar
                            className="shrink-0 text-slate-400"
                            size={13}
                          />

                          <span>
                            Posted{" "}
                            {job.createdAt
                              ? new Date(
                                  job.createdAt
                                ).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )
                              : "Date unavailable"}
                          </span>
                        </p>
                      </div>
                    </div>

                    <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                      <FiCheckCircle
                        size={13}
                      />
                      Open
                    </span>
                  </div>

                  {/* Summary */}
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                    {job.roleSummary ||
                      job.description ||
                      "No description provided."}
                  </p>

                  {/* Details */}
                  <div className="mt-4 space-y-2 rounded-lg bg-slate-50 p-3">
                    <p className="flex items-center gap-2 text-xs text-slate-600">
                      <FiMapPin
                        className="shrink-0 text-blue-600"
                        size={15}
                      />

                      <span>
                        {formatLocation(
                          job.location
                        ) ||
                          "Location not specified"}
                      </span>
                    </p>

                    <p className="flex items-center gap-2 text-xs text-slate-600">
                      <FiBriefcase
                        className="shrink-0 text-blue-600"
                        size={15}
                      />

                      <span>
                        {job.jobType ||
                          "Job type not specified"}
                      </span>
                    </p>

                    <p className="flex items-center gap-2 text-xs text-slate-600">
                      <FiHome
                        className="shrink-0 text-blue-600"
                        size={15}
                      />

                      <span>
                        {job.workMode ||
                          "Work mode not specified"}
                      </span>
                    </p>

                    <p className="flex items-center gap-2 text-xs text-slate-600">
                      <FiDollarSign
                        className="shrink-0 text-blue-600"
                        size={15}
                      />

                      <span>
                        {job.salary ||
                          "Salary not specified"}
                      </span>
                    </p>
                  </div>

                  {/* Skills */}
                  {keySkills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {keySkills
                        .slice(0, 4)
                        .map(
                          (
                            skill,
                            index
                          ) => (
                            <span
                              key={`${skill}-${index}`}
                              className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                            >
                              {skill}
                            </span>
                          )
                        )}
                    </div>
                  )}

                  {/* Description */}
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedJob(job)
                    }
                    className="mt-4 text-left text-sm font-semibold text-blue-700 transition hover:text-blue-900 hover:underline"
                  >
                    See full description
                  </button>

                  {/* Apply */}
                  {getApplicationButton(
                    job
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Full description modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            {/* Modal heading */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {selectedJob.title}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {formatLocation(
                    selectedJob.location
                  ) ||
                    "Location not specified"}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedJob(null)
                }
                aria-label="Close job details"
                className="text-slate-500 transition hover:text-slate-800"
              >
                <FiX size={22} />
              </button>
            </div>

            {/* Main details */}
            <p className="mb-4 mt-3 text-sm text-slate-600">
              {selectedJob.salary ||
                "Salary not specified"}{" "}
              ·{" "}
              {selectedJob.jobType ||
                "Job type not specified"}{" "}
              ·{" "}
              {selectedJob.workMode ||
                "Work mode not specified"}
            </p>

            {/* Role summary */}
            <h3 className="mb-1 text-sm font-bold text-slate-900">
              Role Summary
            </h3>

            <p className="mb-4 text-sm leading-6 text-slate-600">
              {selectedJob.roleSummary ||
                "No role summary provided."}
            </p>

            {/* Requirements */}
            <h3 className="mb-1 text-sm font-bold text-slate-900">
              Requirements
            </h3>

            {Array.isArray(
              selectedJob.requirements
            ) &&
            selectedJob.requirements
              .length > 0 ? (
              <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-slate-600">
                {selectedJob.requirements.map(
                  (item, index) => (
                    <li
                      key={`${item}-${index}`}
                    >
                      {item}
                    </li>
                  )
                )}
              </ul>
            ) : (
              <p className="mb-4 text-sm text-slate-500">
                No requirements provided.
              </p>
            )}

            {/* Responsibilities */}
            <h3 className="mb-1 text-sm font-bold text-slate-900">
              Responsibilities
            </h3>

            {Array.isArray(
              selectedJob.responsibilities
            ) &&
            selectedJob.responsibilities
              .length > 0 ? (
              <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-slate-600">
                {selectedJob.responsibilities.map(
                  (item, index) => (
                    <li
                      key={`${item}-${index}`}
                    >
                      {item}
                    </li>
                  )
                )}
              </ul>
            ) : (
              <p className="mb-4 text-sm text-slate-500">
                No responsibilities provided.
              </p>
            )}

            {/* Modal actions */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              {selectedJob.companyUrl && (
                <a
                  href={
                    selectedJob.companyUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-slate-50"
                >
                  <FiExternalLink
                    size={15}
                  />

                  Company Website
                </a>
              )}

              {getApplicationButton(
                selectedJob,
                true
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplyJobs;