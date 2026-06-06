import React, { useEffect, useState } from "react";
import axios from "axios";

const formatLocation = (location) => {
  if (!location) return "";
  if (typeof location === "string") return location;

  return `${location.city || ""}, ${location.country || ""}`;
};

const MatchingJobs = () => {
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const getMatchedJob = async () => {
    try {
      setLoading(true);
      setMessage("");

      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:8002/candidate/matched-jobs",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("matched jobs response", res.data);

      setMatchedJobs(res.data.matchedJobs || []);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "Failed to fetch matched jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMatchedJob();
  }, []);

  const formatLocation = (location) => {
  if (!location) return "";

  if (typeof location === "string") {
    return location;
  }

  return `${location.city || ""}, ${location.country || ""}`;
};


  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        🎯 Jobs Matching Your Profile
      </h2>

      {loading && <p className="text-gray-500">Loading matched jobs...</p>}

      {message && !loading && (
        <p className="text-red-500 text-sm">{message}</p>
      )}

      {!loading && !message && matchedJobs.length === 0 && (
        <p className="text-gray-500 text-center py-8">
          No matching jobs found. Update your profile to get better matches.
        </p>
      )}

      <div className="space-y-4">
        {matchedJobs.map((job) => (
          <div
            key={job.jobId}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <h3 className="font-medium text-gray-900">{job.title}</h3>

            <p className="text-xs text-gray-500 mt-1">
              {formatLocation(job.location)}
            </p>

            <p className="text-sm text-gray-600 mt-1">
              {job.salary} · {job.jobType} · {job.workMode}
            </p>

            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">Match Score</span>
                <span className="text-xs font-medium text-green-600">
                  {job.matchScore}%
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${job.matchScore}%` }}
                ></div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {job.matchedSkills?.map((skill, index) => (
                <span
                  key={index}
                  className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="flex justify-end items-center gap-3 mt-4">
              {job.companyUrl && (
                <a
                  href={job.companyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-800 hover:text-blue-500 "
                >
                 🔗 URL
                </a>
              )}

              {
                <a
                  href={job.companyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800"
                >
                  Apply Now
                </a>
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchingJobs;