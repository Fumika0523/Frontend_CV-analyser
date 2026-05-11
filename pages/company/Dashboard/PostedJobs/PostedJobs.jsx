import React, { useEffect, useState } from "react";
import axios from "axios";

const salaryOptions = [
  "£15,000 - £20,000",
  "£20,000 - £25,000",
  "£25,000 - £30,000",
  "£30,000 - £35,000",
  "£35,000 - £40,000",
  "£40,000 - £50,000",
  "£50,000 - £60,000",
  "£60,000 - £70,000",
  "£70,000+",
  "Competitive",
];

const jobTypes = ["Full-time", "Part-time", "Contract", "Internship", "Remote"];


const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
  </svg>
);

export default function PostedJobs() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchMyJobs = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:8002/my-jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setJobs(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const openModal = (job) => {
    setSelectedJob(job);
    setEditForm({
      title: job.title || "",
      description: job.description || "",
      requirements: job.requirements?.join(", ") || "",
      location: job.location || "",
      salary: job.salary || "",
      jobType: job.jobType || "Full-time",
      skills: job.skills?.join(", ") || "",
      status: job.status || "Open",
    });
    setIsEditing(false);
  };

  const closeModal = () => {
    setSelectedJob(null);
    setEditForm(null);
    setIsEditing(false);
  };

  const handleEditChange = (e) => {
    setEditForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      const payload = {
        ...editForm,
        requirements: editForm.requirements
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        skills: editForm.skills
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };

      const res = await axios.put(
        `http://localhost:8002/jobs/${selectedJob._id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedJob = res.data.jobPost || res.data.job || res.data;

      setJobs((prev) =>
        prev.map((job) => (job._id === selectedJob._id ? updatedJob : job))
      );

      setSelectedJob(updatedJob);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to update job");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
    {/* <Layout> */}
  {/* <div className="min-h-screen bg-slate-50 py-10"> */}
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-5">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Posted Jobs</h2>

        {jobs.length === 0 ? (
          <p className="text-slate-500">No jobs posted yet.</p>
        ) : (
          <div className="space-y-4">
            {jobs.map((job, index) => (
              <div
                key={job._id}
                onClick={() => openModal(job)}
                className="border border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-blue-200 transition cursor-pointer bg-white"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">
                      Posted Job {index + 1}
                    </p>
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
        </div>
        {/* </div> */}
      {/* </Layout> */}
      {selectedJob && editForm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-blue-100">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-5 flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                  Job Details
                </p>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                  {isEditing ? "Edit Job Post" : selectedJob.title}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                    title="Edit job"
                  >
                    <EditIcon />
                  </button>
                )}

                <button
                  onClick={closeModal}
                  className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {!isEditing ? (
                <div className="space-y-5">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
                      {selectedJob.status}
                    </span>
                    <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                      {selectedJob.jobType}
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                      {selectedJob.salary || "Salary not specified"}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">
                      Location
                    </h3>
                    <p className="text-sm text-slate-600">{selectedJob.location}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">
                      Description
                    </h3>
                    <p className="text-sm text-slate-600 leading-6 whitespace-pre-line">
                      {selectedJob.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-2">
                      Requirements
                    </h3>
                    <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                      {selectedJob.requirements?.length > 0 ? (
                        selectedJob.requirements.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))
                      ) : (
                        <li>No requirements added.</li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-2">
                      Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.skills?.length > 0 ? (
                        selectedJob.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">No skills added.</p>
                      )}
                    </div>
                  </div>
                </div>
            ) : (
  <div
    className="bg-white rounded-lg shadow-md p-6"
    style={{ border: "1px solid #dbeafe" }}
  >
    <div className="mb-5">
      <h2 className="text-xl font-semibold text-slate-900">
        ✏️ Edit Job Post
      </h2>
      <p className="text-sm mt-1 text-slate-500">
        Update your job details and save changes.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <label className="text-xs font-semibold text-slate-700 mb-1 block">
          Job Title <span className="text-red-500">*</span>
        </label>
        <input
          name="title"
          value={editForm.title}
          onChange={handleEditChange}
          placeholder="Junior MERN Stack Developer"
          className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
          style={{ borderColor: "#dbeafe" }}
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-700 mb-1 block">
          Location
        </label>
        <input
          name="location"
          value={editForm.location}
          onChange={handleEditChange}
          placeholder="London, United Kingdom"
          className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
          style={{ borderColor: "#dbeafe" }}
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-700 mb-1 block">
          Salary Range
        </label>
        <select
          name="salary"
          value={editForm.salary}
          onChange={handleEditChange}
          className="w-full border rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
          style={{ borderColor: "#dbeafe" }}
        >
          <option value="">Select salary range</option>
          {salaryOptions.map((salary) => (
            <option key={salary} value={salary}>
              {salary}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-700 mb-1 block">
          Job Type
        </label>
        <select
          name="jobType"
          value={editForm.jobType}
          onChange={handleEditChange}
          className="w-full border rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
          style={{ borderColor: "#dbeafe" }}
        >
          {jobTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-700 mb-1 block">
          Status
        </label>
        <select
          name="status"
          value={editForm.status}
          onChange={handleEditChange}
          className="w-full border rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
          style={{ borderColor: "#dbeafe" }}
        >
          <option value="Open">Open</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-700 mb-1 block">
          Skills
        </label>
        <input
          name="skills"
          value={editForm.skills}
          onChange={handleEditChange}
          placeholder="React, Node.js, MongoDB"
          className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
          style={{ borderColor: "#dbeafe" }}
        />
        <p className="text-xs mt-1 text-slate-500">
          Separate skills with commas.
        </p>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-700 mb-1 block">
          Requirements
        </label>
        <input
          name="requirements"
          value={editForm.requirements}
          onChange={handleEditChange}
          placeholder="React experience, teamwork"
          className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
          style={{ borderColor: "#dbeafe" }}
        />
        <p className="text-xs mt-1 text-slate-500">
          Separate requirements with commas.
        </p>
      </div>

      <div className="md:col-span-2">
        <label className="text-xs font-semibold text-slate-700 mb-1 block">
          Job Description
        </label>
        <textarea
          name="description"
          value={editForm.description}
          onChange={handleEditChange}
          placeholder="Describe the role, responsibilities, and candidate..."
          className="w-full border rounded-lg px-4 py-3 text-sm min-h-[130px] resize-y focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
          style={{ borderColor: "#dbeafe" }}
        />
      </div>

      <div className="md:col-span-2 flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="px-6 py-3 rounded-lg text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 rounded-lg text-sm font-semibold text-white transition disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, #1d4ed8, #1e3a8a)",
            boxShadow: "0 8px 18px rgba(29, 78, 216, 0.22)",
          }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  </div>
)}
            </div>
          </div>
        </div>
      )}
    </>
  );
}