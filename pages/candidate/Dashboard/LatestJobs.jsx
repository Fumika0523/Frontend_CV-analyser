import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../../../components/Layout/Layout";
import { url } from "../../../utils/constant";

const LatestJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [applyingId, setApplyingId] = useState("");

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${url}/all-jobs`);
      setJobs(res.data);
    } catch (error) {
      console.error("Fetch latest jobs error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleApply = async (jobId) => {
    try {
      setApplyingId(jobId);

      const token = localStorage.getItem("token");

      await axios.post(
        `${url}/applications/apply`,
        { jobId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Application sent with your CV!");
    } catch (error) {
      console.error("Apply error:", error);
      alert(error.response?.data?.message || "Failed to apply");
    } finally {
      setApplyingId("");
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const companyName = job.companyId?.companyName || "";

    return (
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase())
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
              onChange={(e) => setSearchTerm(e.target.value)}
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
                {filteredJobs.map((job) => (
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

                      <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
                        {job.status}
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 mt-3 line-clamp-3">
                      {job.description}
                    </p>

                    <div className="mt-4 space-y-1">
                      <p className="text-xs text-slate-500">
                        📍 {job.location}
                      </p>
                      <p className="text-xs text-slate-500">
                        💼 {job.jobType}
                      </p>
                      <p className="text-xs text-slate-500">
                        💰 {job.salary || "Salary not specified"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {job.skills?.slice(0, 4).map((skill, index) => (
                        <span
                          key={index}
                          className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => handleApply(job._id)}
                      disabled={applyingId === job._id}
                      className="mt-5 w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 transition"
                    >
                      {applyingId === job._id ? "Applying..." : "Apply with CV"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LatestJobs;