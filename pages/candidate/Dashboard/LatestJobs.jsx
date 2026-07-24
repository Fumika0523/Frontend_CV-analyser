import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Layout from "../../../components/Layout/Layout";
import { url } from "../../../utils/constant";

const LatestJobs = () => {
  // Next.js router allows us to redirect the user to another page.
  const router = useRouter();

  // Stores all jobs retrieved from the backend.
  const [jobs, setJobs] = useState([]);

  // Stores the text entered into the job search input.
  const [searchTerm, setSearchTerm] = useState("");

  // Controls the loading message while jobs are being retrieved.
  const [loading, setLoading] = useState(false);

  // Stores the ID of the job currently being applied for.
  const [applyingId, setApplyingId] = useState("");

  // Tracks whether the user has a JWT token in localStorage.
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  /*
   * Stores the application status for each job.
   *
   * Example:
   * {
   *   "jobId1": "pending",
   *   "jobId2": "reviewing"
   * }
   */
  const [applicationStatuses, setApplicationStatuses] = useState({});

  /**
   * Converts a job location into readable text.
   *
   * The backend might return location as:
   * 1. "Norwich, United Kingdom"
   * 2. { city: "Norwich", country: "United Kingdom" }
   */
  const formatLocation = (location) => {
    // Return an empty string when no location exists.
    if (!location) {
      return "";
    }

    // Return the location directly when it is already a string.
    if (typeof location === "string") {
      return location;
    }

    /*
     * Put city and country inside an array.
     * Remove empty values with filter(Boolean).
     * Join the remaining values with a comma.
     */
    return [location.city, location.country]
      .filter(Boolean)
      .join(", ");
  };

  /**
   * Retrieves all available jobs from the backend.
   */
  const fetchJobs = async () => {
    try {
      // Show the loading message.
      setLoading(true);

      // Send a GET request to the all-jobs endpoint.
      const res = await axios.get(`${url}/all-jobs`);

      console.log("Jobs API response:", res.data);

      /*
       * Support both common backend response formats:
       *
       * res.json(jobs)
       *
       * or:
       *
       * res.json({
       *   success: true,
       *   jobs
       * })
       */
      const jobsData = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.jobs)
          ? res.data.jobs
          : [];

      // Save the jobs in component state.
      setJobs(jobsData);
    } catch (error) {
      // Log detailed information to help identify backend errors.
      console.error("Fetch latest jobs error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      // Use an empty array if the request fails.
      setJobs([]);
    } finally {
      // Hide the loading message whether the request succeeds or fails.
      setLoading(false);
    }
  };

  /**
   * Retrieves all applications belonging to the logged-in candidate.
   *
   * The result is converted into an object where:
   * - the key is the job ID
   * - the value is the application status
   */
  const fetchMyApplications = async (token) => {
    // Do not send the request when there is no authentication token.
    if (!token) {
      return;
    }

    try {
      // Retrieve the candidate's existing applications.
      const res = await axios.get(`${url}/applications`, {
        headers: {
          // Send the JWT token to the authentication middleware.
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("My applications response:", res.data);

      /*
       * Support several possible backend response formats:
       *
       * res.json(applications)
       *
       * res.json({ applications })
       *
       * res.json({ data: applications })
       */
      const applications = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.applications)
          ? res.data.applications
          : Array.isArray(res.data?.data)
            ? res.data.data
            : [];

      // Create an empty object that will store job IDs and statuses.
      const statusMap = {};

      // Go through every application returned by the backend.
      applications.forEach((application) => {
        /*
         * jobId might be returned as:
         *
         * "687123..."
         *
         * or as a populated object:
         *
         * {
         *   _id: "687123...",
         *   title: "Developer"
         * }
         */
        const applicationJobId =
          typeof application.jobId === "object"
            ? application.jobId?._id
            : application.jobId;

        // Only add the status when the application has a valid job ID.
        if (applicationJobId) {
          statusMap[String(applicationJobId)] =
            application.status || "pending";
        }
      });

      // Save the application status map in state.
      setApplicationStatuses(statusMap);
    } catch (error) {
      console.error("Fetch applications error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      /*
       * If the JWT token has expired, remove it and update the page
       * so the user is treated as logged out.
       */
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setApplicationStatuses({});
      }
    }
  };

  /**
   * Runs once when the page loads.
   *
   * It:
   * 1. Checks whether a JWT token exists.
   * 2. Retrieves all jobs.
   * 3. Retrieves existing applications when logged in.
   */
  useEffect(() => {
    // Get the authentication token from the browser.
    const token = localStorage.getItem("token");

    // Convert the token into a true or false login value.
    setIsLoggedIn(Boolean(token));

    // Retrieve jobs for logged-in users and guests.
    fetchJobs();

    // Retrieve application statuses only for logged-in users.
    if (token) {
      fetchMyApplications(token);
    }
  }, []);

  /**
   * Submits an application for the selected job.
   *
   * The backend automatically uses the candidate's latest CV
   * because cvId is sent as null.
   */
  const handleApply = async (jobId) => {
    // Retrieve the JWT token before submitting the application.
    const token = localStorage.getItem("token");

    // Redirect guests to the signup page.
    if (!token) {
      router.push("/signup");
      return;
    }

    try {
      // Store this job ID so its button displays "Applying...".
      setApplyingId(jobId);

      // Submit the job application to the backend.
      const res = await axios.post(
        `${url}/applications/apply`,
        {
          // ID of the job the candidate wants to apply for.
          jobId,

          // Null tells the backend to use the candidate's latest CV.
          cvId: null,
        },
        {
          headers: {
            // Send the authentication token.
            Authorization: `Bearer ${token}`,

            // Tell Express that the request body contains JSON.
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Apply response:", res.data);

      /*
       * Immediately update the button after a successful application.
       *
       * The backend normally returns "pending".
       * If no status is returned, use "pending" as the fallback.
       */
      setApplicationStatuses((previousStatuses) => ({
        ...previousStatuses,
        [String(jobId)]:
          res.data?.application?.status || "pending",
      }));

      // Show the backend success message.
      alert(
        res.data?.message ||
        "Application submitted successfully with your latest CV!"
      );
    } catch (error) {
      // Store the backend message so it can be reused below.
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

      /*
       * If the token has expired, log the user out and redirect
       * them to the sign-in page.
       */
      if (error.response?.status === 401) {
        alert("Your login session has expired. Please sign in again.");

        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setApplicationStatuses({});

        router.push("/signin");
        return;
      }

      /*
       * If the backend says the candidate has already applied,
       * retrieve their applications again.
       *
       * This updates the button even if the original application
       * was submitted before this page was refreshed.
       */
      if (
        error.response?.status === 400 &&
        serverMessage.toLowerCase().includes("already applied")
      ) {
        await fetchMyApplications(token);
      }

      // Show the backend error message.
      alert(serverMessage);
    } finally {
      // Clear the applying state after the request finishes.
      setApplyingId("");
    }
  };

  /**
   * Converts application statuses into readable button text.
   */
  const getApplicationButtonLabel = (status) => {
    // Normalize the value in case the backend returns uppercase text.
    const normalizedStatus = status?.toLowerCase();

    switch (normalizedStatus) {
      case "pending":
        return "Application Pending";

      case "reviewing":
        return "Application in Review";

      case "interview":
        return "Interview Stage";

      case "accepted":
        return "Application Accepted";

      case "rejected":
        return "Application Rejected";

      default:
        return "Already Applied";
    }
  };

  /**
   * Checks whether the application deadline has passed.
   */
  const isJobExpired = (job) => {
    // A job without an application deadline is not treated as expired.
    if (!job.applicationEndDate) {
      return false;
    }

    // Compare the job deadline with the current date and time.
    return new Date(job.applicationEndDate) < new Date();
  };

  // Remove spaces and convert the search text to lowercase.
  const searchValue = searchTerm.trim().toLowerCase();

  /**
 * Filters the jobs shown on the Latest Jobs page.
 *
 * It:
 * 1. Hides jobs the candidate has already applied for.
 * 2. Filters the remaining jobs by title, company or location.
 */
  const filteredJobs = jobs.filter((job) => {
    // Check whether this job exists in the candidate's applications.
    const hasAlreadyApplied = Boolean(
      applicationStatuses[String(job._id)]
    );

    // Do not show jobs the candidate has already applied for.
    if (hasAlreadyApplied) {
      return false;
    }

    // Prepare the job information for case-insensitive searching.
    const title = job.title || "";
    const companyName = job.companyId?.companyName || "";
    const locationText = formatLocation(job.location);

    return (
      title.toLowerCase().includes(searchValue) ||
      companyName.toLowerCase().includes(searchValue) ||
      locationText.toLowerCase().includes(searchValue)
    );
  });

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 py-10">
        <div className="max-w-screen-xl mt-24 px-6 sm:px-8 lg:px-16 mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">
              Latest Jobs
            </h1>

            <p className="text-slate-500 mt-2">
              Browse company-posted jobs and apply using your uploaded CV.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
            <input
              type="text"
              placeholder="Search by title, company, or location..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full px-4 py-3 border border-blue-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 mb-6"
            />

            {loading ? (
              <p className="text-slate-500">Loading jobs...</p>
            ) : filteredJobs.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                No jobs found.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredJobs.map((job) => {
                  /*
                   * Retrieve this job's application status.
                   *
                   * If there is no status, the candidate has not
                   * applied for this job.
                   */

                  // A job is unavailable when closed or expired.
                  const unavailable =
                    job.status !== "Open" || isJobExpired(job);

                  // Check whether this particular job is being submitted.
                  const isApplying = applyingId === job._id;

                  return (
                    <div
                      key={job._id}
                      className="border border-slate-200 rounded-xl p-5 bg-white hover:shadow-md hover:border-blue-200 transition"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <h3 className="font-bold text-slate-900">
                            {job.title}
                          </h3>

                          <p className="text-sm text-slate-500">
                            {job.companyId?.companyName || "Company"}
                          </p>
                        </div>

                        <span
                          className={`text-xs px-3 py-1 rounded-full ${unavailable
                              ? "bg-red-100 text-red-700"
                              : "bg-emerald-100 text-emerald-700"
                            }`}
                        >
                          {unavailable ? "Closed" : job.status}
                        </span>
                      </div>

                      <p className="text-sm text-slate-600 mt-3 line-clamp-3">
                        {job.roleSummary ||
                          job.description ||
                          "No description provided."}
                      </p>

                      <div className="mt-4 space-y-1">
                        <p className="text-xs text-slate-500">
                          📍{" "}
                          {formatLocation(job.location) ||
                            "Location not specified"}
                        </p>

                        <p className="text-xs text-slate-500">
                          💼 {job.jobType || "Job type not specified"}
                        </p>

                        <p className="text-xs text-slate-500">
                          💰 {job.salary || "Salary not specified"}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4">
                        {job.keySkills
                          ?.slice(0, 4)
                          .map((skill, index) => (
                            <span
                              key={`${skill}-${index}`}
                              className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleApply(job._id)}
                        disabled={isApplying || unavailable}
                        className={`mt-5 w-full py-2.5 rounded-lg text-sm font-semibold text-white transition ${unavailable
                            ? "bg-slate-400 cursor-not-allowed"
                            : "bg-blue-700 hover:bg-blue-800 disabled:opacity-50"
                          }`}
                      >
                        {!isLoggedIn
                          ? "Sign up to Apply"
                          : isApplying
                            ? "Applying..."
                            : unavailable
                              ? "Applications Closed"
                              : "Apply with CV"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LatestJobs;