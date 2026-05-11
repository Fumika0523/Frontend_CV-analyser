import React, { useEffect, useState } from "react";
import axios from "axios";

export default function PostedJobs() {
  const [jobs, setJobs] = useState([]);

  const fetchMyJobs = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:8002/jobs/my-jobs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setJobs(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMyJobs();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-xl font-bold text-slate-900 mb-4">Posted Jobs</h2>

      {jobs.length === 0 ? (
        <p className="text-slate-500">No jobs posted yet.</p>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="border border-slate-200 rounded-xl p-4 hover:shadow-sm transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900">{job.title}</h3>
                  <p className="text-sm text-slate-500">{job.location}</p>
                </div>

                <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
                  {job.status}
                </span>
              </div>

              <p className="text-sm text-slate-600 mt-3 line-clamp-2">
                {job.description}
              </p>

              <div className="flex flex-wrap gap-2 mt-3">
                {job.skills?.map((skill, index) => (
                  <span
                    key={index}
                    className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <p className="text-sm font-medium text-slate-700 mt-3">
                {job.salary || "Salary not specified"} · {job.jobType}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}