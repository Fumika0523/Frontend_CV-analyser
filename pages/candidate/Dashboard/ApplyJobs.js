import React, { useState, useEffect } from "react";
import axios from "axios";
import { url } from "../../../utils/constant";
import { toast } from "react-toastify";

const ApplyJobs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [jobData, setJobData] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  const formatLocation = (location) => {
  if (!location) return "";
  if (typeof location === "string") return location;
  return `${location.city || ""}, ${location.country || ""}`;
};

  const getJobsData = async () => {
    try {
      const token = localStorage.getItem("token");

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const res = await axios.get(`${url}/all-jobs`, config);

      console.log("jobs data", res.data);

      setJobData(res.data);
    } catch (error) {
      console.error("Error fetching Jobs:", error);
    }
  };

  useEffect(() => {
    getJobsData();
  }, []);

 const filteredJobs = jobData.filter((job) => {
  const locationText = formatLocation(job.location).toLowerCase();

  return (
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.companyId?.companyName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    locationText.includes(searchTerm.toLowerCase())
  );
});

  const handleApply = async (job) => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.post(
      `${url}/apply`,
      {
        jobId: job._id,
        jobTitle: job.title,
        companyName: job.companyId?.companyName || "Company",
        companyId: job.companyId?.userId,
        cvId: null,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success(res.data.message || "Application submitted successfully");
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to apply");
  }
};
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        💼 Apply for New Jobs
      </h2>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Job Cards */}
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
  onClick={() => setSelectedJob(job)}
  className="text-sm font-semibold text-blue-700 hover:underline"
>
  See full description
</button>

            <button
              onClick={() => handleApply(job)}
              className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Now
            </button>
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
          onClick={() => setSelectedJob(null)}
          className="text-xl text-slate-500 hover:text-slate-800"
        >
          ×
        </button>
      </div>

      <p className="text-sm text-slate-600 mb-3">
        {selectedJob.salary} · {selectedJob.jobType} · {selectedJob.workMode}
      </p>

      {/* <p className="text-sm text-green-700 font-semibold mb-4">
        Match Score: {selectedJob.matchScore}%
      </p> */}

      <h3 className="font-bold text-sm mb-1">Role Summary</h3>
      <p className="text-sm text-slate-600 mb-4">{selectedJob.roleSummary}</p>

      <h3 className="font-bold text-sm mb-1">Requirements</h3>
      <ul className="list-disc pl-5 text-sm text-slate-600 mb-4">
        {selectedJob.requirements?.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      <h3 className="font-bold text-sm mb-1">Responsibilities</h3>
      <ul className="list-disc pl-5 text-sm text-slate-600 mb-4">
        {selectedJob.responsibilities?.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
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

     <button
  onClick={() => handleApply(selectedJob)}
  className="px-4 py-2 rounded-lg bg-blue-700 text-white text-sm font-semibold"
>
  Apply Now
</button>

      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default ApplyJobs;