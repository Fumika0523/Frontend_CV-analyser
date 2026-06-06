import React, { useState, useEffect } from "react";
import axios from "axios";
import { url } from "../../../utils/constant";

const ApplyJobs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [jobData, setJobData] = useState([]);

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

  const filteredJobs = jobData.filter(
    (job) =>
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.companyId?.companyName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApply = (jobId) => {
    console.log("Apply job:", jobId);
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
                📍 {job.location}
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
              onClick={() => handleApply(job._id)}
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
    </div>
  );
};

export default ApplyJobs;