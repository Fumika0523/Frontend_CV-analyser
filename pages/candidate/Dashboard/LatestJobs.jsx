import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Layout from "../../../components/Layout/Layout";
import { url } from "../../../utils/constant";

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

  const applicationStatusLabels = {
    pending: "Application Submitted",
    reviewing: "Application Under Review",
    interview: "Interview Stage",
    accepted: "Application Accepted",
    rejected: "Application Unsuccessful",
  };

const [locationFilter, setLocationFilter] = useState("");
const [minSalary, setMinSalary] = useState(0);
const [workModeFilter, setWorkModeFilter] = useState("");

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

const parseSalaryMin = (salaryString) => {
  if (!salaryString || typeof salaryString !== "string") {
    return null;
  }

  const cleanedSalary = salaryString.replace(/,/g, "");

  const match = cleanedSalary.match(/\d+/);

  if (!match) {
    return null;
  }

  return Number(match[0]);
};

const passesSalaryFilter = (job) => {
  if (minSalary === 0) {
    return true;
  }

  const salaryText = String(job.salary || "")
    .trim()
    .toLowerCase();

  if (salaryText === "competitive") {
    return true;
  }

  const jobMinSalary = parseSalaryMin(job.salary);

  if (jobMinSalary === null) {
    return false;
  }

  return jobMinSalary >= minSalary;
};

  /*** Convert a location object or string into readable text.*/
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

      setApplicationStatuses(statusMap);
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
  const handleApply = async (jobId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/signup");
      return;
    }

    try {
      setApplyingId(jobId);

      const response = await axios.post(
        `${url}/applications/apply`,
        {
          jobId,
          cvId: null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Apply response:", response.data);

      setApplicationStatuses((previousStatuses) => ({
        ...previousStatuses,
        [String(jobId)]:
          response.data?.application?.status || "pending",
      }));

      alert(
        response.data?.message ||
        "Application submitted successfully with your latest CV!"
      );
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

      if (
        error.response?.status === 400 &&
        serverMessage
          .toLowerCase()
          .includes("already applied")
      ) {
        await fetchMyApplications(token);
      }

      alert(serverMessage);
    } finally {
      setApplyingId("");
    }
  };

  /*** Check whether the application deadline has passed. */
  const isJobExpired = (job) => {
    if (!job.applicationEndDate) {
      return false;
    }

    return (
      new Date(job.applicationEndDate) < new Date()
    );
  };

  // Check if its Recently added 
  const isRecentJob = (job)=>{
    if(!job.createdAt){
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
  setMinSalary(0);
  setWorkModeFilter("");
};

const filteredJobs = jobs
  .filter((job) => {
    const title = String(job.title || "");

    const companyName = String(
      job.companyId?.companyName ||
      job.companyName ||
      ""
    );

    const locationText =
      formatLocation(job.location);

    const skillsText = Array.isArray(job.keySkills)
      ? job.keySkills.join(" ")
      : "";

    // Keyword search
    const matchesSearch =
      !searchValue ||
      title.toLowerCase().includes(searchValue) ||
      companyName.toLowerCase().includes(searchValue) ||
      skillsText.toLowerCase().includes(searchValue);

    // Location filter
    const matchesLocation =
      !locationValue ||
      locationText
        .toLowerCase()
        .includes(locationValue);

    // Work mode filter
    const matchesWorkMode =
      !workModeFilter ||
      String(job.workMode || "")
        .toLowerCase() ===
        workModeFilter.toLowerCase();

    // Job must still be open
    const isOpen =
      String(job.status || "")
        .toLowerCase() === "open";

    // And application deadline must not
    // have passed
    const isAvailable =
      isOpen && !isJobExpired(job);

    return (
      matchesSearch &&
      matchesLocation &&
      matchesWorkMode &&
      passesSalaryFilter(job) &&
      isRecentJob(job) &&
      isAvailable
    );
  })
  .sort((a, b) => {
    return (
      new Date(b.createdAt) -
      new Date(a.createdAt)
    );
  });

const selectedJobApplicationStatus = selectedJob
  ? applicationStatuses[String(selectedJob._id)]
  : null;

const selectedJobHasApplied =
  Boolean(selectedJobApplicationStatus);

const selectedJobIsApplying =
  selectedJob &&
  applyingId === selectedJob._id;

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

    {/* Location */}
    <div>
      <label
        htmlFor="location-filter"
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
  id="location-filter"
  type="text"
  placeholder="e.g. London or United Kingdom"
  value={locationFilter}
  onChange={(event) =>
    setLocationFilter(event.target.value)
  }
  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
/>
      </div>
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
            All work modes
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
                  {filteredJobs.map((job) => {
const applicationStatus =
  applicationStatuses[String(job._id)];

const hasAlreadyApplied =
  Boolean(applicationStatus);
                    const isOpen =
                      String(
                        job.status || ""
                      ).toLowerCase() === "open";

                    const unavailable =
                      !isOpen || isJobExpired(job);

                    const isApplying =
                      applyingId === job._id;

                    const companyName =
                      job.companyId?.companyName ||
                      job.companyName ||
                      "Company";

                    const keySkills = Array.isArray(
                      job.keySkills
                    )
                      ? job.keySkills
                      : [];

                    return (
                      <article
                        key={job._id}
                        className={`group flex h-full flex-col rounded-xl border border-l-4 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg ${unavailable
                          ? "border-slate-200 border-l-red-400 hover:border-red-200"
                          : "border-slate-200 border-l-blue-500 hover:border-blue-200"
                          }`}
                      >
                        {/* Job title and status */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 transition group-hover:bg-blue-700 group-hover:text-white">
                              <FiBriefcase
                                aria-hidden="true"
                                size={19}
                              />
                            </div>

                          <div className="min-w-0">
  <h2 className="font-semibold text-slate-900">
    {job.title || "Untitled job"}
  </h2>

  <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
    <FiHome
      aria-hidden="true"
      className="shrink-0 text-slate-400"
      size={14}
    />

    <span>{companyName}</span>
  </p>

  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
    <FiCalendar
      aria-hidden="true"
      className="shrink-0 text-slate-400"
      size={13}
    />

    <span>
      Posted{" "}
      {new Date(job.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}
    </span>
  </p>
</div>
                          </div>

                          <span
                            className={`flex w-fit shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${unavailable
                              ? "bg-red-100 text-red-700"
                              : "bg-emerald-100 text-emerald-700"
                              }`}
                          >
                            {unavailable ? (
                              <FiLock
                                aria-hidden="true"
                                size={13}
                              />
                            ) : (
                              <FiCheckCircle
                                aria-hidden="true"
                                size={13}
                              />
                            )}

                            {unavailable
                              ? "Closed"
                              : "Open"}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                          {job.roleSummary ||
                            job.description ||
                            "No description provided."}
                        </p>

                        {/* Job details */}
                        <div className="mt-4 space-y-2 rounded-lg bg-slate-50 p-3">
                          <p className="flex items-center gap-2 text-xs text-slate-600">
                            <FiMapPin
                              aria-hidden="true"
                              className="shrink-0 text-blue-600"
                              size={15}
                            />

                            <span>
                              {formatLocation(job.location) ||
                                "Location not specified"}
                            </span>
                          </p>

                          <p className="flex items-center gap-2 text-xs text-slate-600">
                            <FiBriefcase
                              aria-hidden="true"
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
    aria-hidden="true"
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
                              aria-hidden="true"
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
                              .map((skill, index) => (
                                <span
                                  key={`${skill}-${index}`}
                                  className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                                >
                                  {skill}
                                </span>
                              ))}
                          </div>
                        )}
{/* see full description */}
<button
  type="button"
  onClick={() => setSelectedJob(job)}
  className="mt-4 text-sm font-semibold text-blue-700 hover:underline"
>
  See full description
</button>

                        {/* Apply button */}
                        <button
                          type="button"
                          onClick={() =>
                            handleApply(job._id)
                          }
                          disabled={
                            isApplying ||
                            unavailable ||
                            hasAlreadyApplied
                          }
                          className={`mt-2 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white 
                           transition ${keySkills.length > 0
                              ? "pt-2.5"
                              : ""
                            } ${unavailable
                              ? "mt-5 cursor-not-allowed bg-slate-400"
                              : "mt-5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50"
                            }`}
                        >
                          {/* If Applying >> Show Applying... , else if unavailable >> Show Application Closed, else if not logged in  >> show sign up to Apply, else if already applied >> show application submitted , else >> Show apply with CV*/}
                          {isApplying ? (
                            <>
                              <FiLoader
                                className="animate-spin"
                                size={17}
                              />
                              Applying...
                            </>
                          ) : unavailable ? (
                            <>
                              <FiLock size={17} />
                              Applications Closed
                            </>
                          ) : !isLoggedIn ? (
                            <>
                              <FiLogIn size={17} />
                              Sign up to Apply
                            </>
                          ) : hasAlreadyApplied ? (
                            <>
                              <FiCheckCircle size={17} />
                              {applicationStatusLabels[applicationStatus] ||
                                "Already Applied"}
                            </>
                          ) : (
                            <>
                              <FiFileText size={17} />
                              Apply with CV
                            </>
                          )}
                        </button>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
        {selectedJob && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
    <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {selectedJob.title}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {formatLocation(selectedJob.location)}
          </p>

          <p className="mb-4 text-sm text-slate-600">
  {selectedJob.salary} · {selectedJob.jobType} ·{" "}
  {selectedJob.workMode}
</p>

<h3 className="mb-1 text-sm font-bold">
  Role Summary
</h3>

<p className="mb-4 text-sm text-slate-600">
  {selectedJob.roleSummary}
</p>

<h3 className="mb-1 text-sm font-bold">
  Requirements
</h3>

<ul className="mb-4 list-disc pl-5 text-sm text-slate-600">
  {selectedJob.requirements?.map((item, index) => (
    <li key={`${item}-${index}`}>
      {item}
    </li>
  ))}
</ul>

<h3 className="mb-1 text-sm font-bold">
  Responsibilities
</h3>

<ul className="mb-4 list-disc pl-5 text-sm text-slate-600">
  {selectedJob.responsibilities?.map((item, index) => (
    <li key={`${item}-${index}`}>
      {item}
    </li>
  ))}
</ul>
<div className="mt-6 flex justify-end gap-3">
  {selectedJob.companyUrl && (
    <a
      href={selectedJob.companyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-slate-50"
    >
      Company Website
    </a>
  )}
</div>

<button
  type="button"
  onClick={() => handleApply(selectedJob._id)}
  disabled={
    selectedJobIsApplying ||
    selectedJobHasApplied
  }
  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
    selectedJobHasApplied
      ? "cursor-not-allowed bg-slate-200 text-slate-600"
      : "bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-50"
  }`}
>
  {selectedJobIsApplying ? (
    <>
      <FiLoader
        className="mr-2 inline animate-spin"
        size={16}
      />
      Applying...
    </>
  ) : !isLoggedIn ? (
    <>
      <FiLogIn
        className="mr-2 inline"
        size={16}
      />
      Sign up to Apply
    </>
  ) : selectedJobHasApplied ? (
    <>
      <FiCheckCircle
        className="mr-2 inline"
        size={16}
      />

      {applicationStatusLabels[
        selectedJobApplicationStatus
      ] || "Already Applied"}
    </>
  ) : (
    <>
      <FiFileText
        className="mr-2 inline"
        size={16}
      />
      Apply with CV
    </>
  )}
</button>
        </div>

        <button
          type="button"
          onClick={() => setSelectedJob(null)}
          className="text-xl text-slate-500 hover:text-slate-800"
        >
          ×
        </button>
      </div>
    </div>
  </div>
)}
      </main>
    </Layout>
    
  );
};

export default LatestJobs;