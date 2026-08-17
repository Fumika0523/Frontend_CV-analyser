import React, { useEffect, useState } from "react";
import axios from "axios";
import { url } from "../../../utils/constant";
import { toast } from "react-toastify";

const applicationStatusLabels = {
  pending: "Application Submitted",
  reviewing: "Application Under Review",
  interview: "Interview Stage",
  accepted: "Application Accepted",
  rejected: "Application Unsuccessful",
};

const ApplyJobs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [jobData, setJobData] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  // Stores applications using the job ID:
  // {
  //   "jobId123": { status: "pending", ...applicationData }
  // }
  const [applicationsByJob, setApplicationsByJob] = useState({});

  // Stores the job currently sending an application request.
  const [applyingJobId, setApplyingJobId] = useState(null);

  const formatLocation = (location) => {
    if (!location) return "";

    if (typeof location === "string") {
      return location;
    }

    return [location.city, location.country]
      .filter(Boolean)
      .join(", ");
  };

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const getJobsData = async () => {
    try {
      const response = await axios.get(
        `${url}/all-jobs`,
        getAuthConfig()
      );

      // Use this if the backend directly returns an array.
      setJobData(response.data || []);

      // If your backend returns { jobs: [...] }, use this instead:
      // setJobData(response.data.jobs || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load jobs");
    }
  };

  const getApplicationsData = async () => {
    try {
      const response = await axios.get(
        `${url}/applications`,
        getAuthConfig()
      );

      const applications = response.data.applications || {};

      const applicationMap = applications.reduce(
        (result, application) => {
          // jobId might be a string or a populated object.
          const jobId =
            typeof application.jobId === "object"
              ? application.jobId?._id
              : application.jobId;

          if (jobId) {
            result[jobId.toString()] = application;
          }

          return result;
        },
        {}
      );

      setApplicationsByJob(applicationMap);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  useEffect(() => {
    getJobsData();
    getApplicationsData();
  }, []);

  const handleApply = async (job) => {
    const existingApplication = applicationsByJob[job._id];

    // Extra frontend protection.
    if (existingApplication) {
      toast.info(
        applicationStatusLabels[existingApplication.status] ||
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

      const newApplication = response.data.application;

      // Immediately update the button without fetching everything again.
      setApplicationsByJob((previousApplications) => ({
        ...previousApplications,
        [job._id]: newApplication,
      }));
      console.log("response new application", response.data)
      toast.success(
        response.data.message ||
          "Application submitted successfully"
      );
     }
     // catch (error) {
    //   const message =
    //     error.response?.data?.message || "Failed to apply";
    //   console.log("error message",error.response?.data?.message)
    //   toast.error(message);

    //   // If the backend says the candidate already applied,
    //   // reload applications so the UI is corrected.
    //   if (message.toLowerCase().includes("already applied")) {
    //     getApplicationsData();
    //   }
    // } 
    finally {
      setApplyingJobId(null);
    }
  };

  const getApplicationButton = (job, modalButton = false) => {
    const application = applicationsByJob[job._id];
    const isApplying = applyingJobId === job._id;
    const hasApplied = Boolean(application);

    let buttonLabel = "Apply Now";

    if (isApplying) {
      buttonLabel = "Submitting...";
    } else if (hasApplied) {
      buttonLabel =
        applicationStatusLabels[application.status] ||
        "Already Applied";
    }

    const baseClass = modalButton
      ? "px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
      : "mt-4 w-full py-2 px-4 rounded-lg transition-colors";

    const colourClass =
      hasApplied || isApplying
        ? "bg-gray-200 text-gray-600 cursor-not-allowed"
        : "bg-blue-700 text-white hover:bg-blue-800";

    return (
      <button
        type="button"
        onClick={() => handleApply(job)}
        disabled={hasApplied || isApplying}
        className={`${baseClass} ${colourClass}`}
      >
        {buttonLabel}
      </button>
    );
  };

  const filteredJobs = jobData.filter((job) => {
    const normalizedSearch = searchTerm.toLowerCase().trim();
    const locationText = formatLocation(job.location).toLowerCase();

    return (
      job.title?.toLowerCase().includes(normalizedSearch) ||
      job.companyId?.companyName
        ?.toLowerCase()
        .includes(normalizedSearch) ||
      locationText.includes(normalizedSearch)
    );
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        💼 All jobs
      </h2>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJobs.map((job) => (
          <div
            key={job._id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <h3 className="font-medium text-gray-900">
              {job.title}
            </h3>

            <p className="text-sm text-gray-600">
              {job.companyId?.companyName || "Company"}
            </p>

            <div className="mt-2 space-y-1">
              <p className="text-xs text-gray-500">
                📍 {formatLocation(job.location)}
              </p>

              <p className="text-xs text-gray-500">
                💼 {job.jobType}
              </p>

              <p className="text-xs text-gray-500">
                💰 {job.salary}
              </p>

              <p className="text-xs text-gray-400">
                Posted:{" "}
                {new Date(job.createdAt).toLocaleDateString()}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedJob(job)}
              className="mt-3 text-sm font-semibold text-blue-700 hover:underline"
            >
              See full description
            </button>

            {getApplicationButton(job)}
          </div>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <p className="text-gray-500 text-center py-8">
          No jobs found matching your search.
        </p>
      )}

      {selectedJob && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {selectedJob.title}
                </h2>

                <p className="text-sm text-slate-500">
                  {formatLocation(selectedJob.location)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="text-xl text-slate-500 hover:text-slate-800"
              >
                ×
              </button>
            </div>

            <p className="text-sm text-slate-600 mb-3">
              {selectedJob.salary} · {selectedJob.jobType} ·{" "}
              {selectedJob.workMode}
            </p>

            <h3 className="font-bold text-sm mb-1">
              Role Summary
            </h3>

            <p className="text-sm text-slate-600 mb-4">
              {selectedJob.roleSummary}
            </p>

            <h3 className="font-bold text-sm mb-1">
              Requirements
            </h3>

            <ul className="list-disc pl-5 text-sm text-slate-600 mb-4">
              {selectedJob.requirements?.map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>

            <h3 className="font-bold text-sm mb-1">
              Responsibilities
            </h3>

            <ul className="list-disc pl-5 text-sm text-slate-600 mb-4">
              {selectedJob.responsibilities?.map(
                (item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                )
              )}
            </ul>

            <div className="flex justify-end gap-3 mt-6">
              {selectedJob.companyUrl && (
                <a
                  href={selectedJob.companyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg border text-sm font-semibold text-blue-700"
                >
                  Company URL
                </a>
              )}

              {getApplicationButton(selectedJob, true)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplyJobs;