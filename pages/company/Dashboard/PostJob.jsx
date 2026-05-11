import React, { useState } from "react";
import axios from "axios";

export default function PostJob() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    salary: "",
    jobType: "Full-time",
    skills: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const payload = {
        ...formData,
        requirements: formData.requirements
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        skills: formData.skills
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };

      await axios.post("http://localhost:8002/jobs/create", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Job posted successfully");

      setFormData({
        title: "",
        description: "",
        requirements: "",
        location: "",
        salary: "",
        jobType: "Full-time",
        skills: "",
      });
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-xl font-bold text-slate-900 mb-4">Post a New Job</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Job title"
          className="border rounded-lg px-4 py-3"
          required
        />

        <input
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Location"
          className="border rounded-lg px-4 py-3"
          required
        />

        <input
          name="salary"
          value={formData.salary}
          onChange={handleChange}
          placeholder="Salary e.g. £35,000"
          className="border rounded-lg px-4 py-3"
        />

        <select
          name="jobType"
          value={formData.jobType}
          onChange={handleChange}
          className="border rounded-lg px-4 py-3"
        >
          <option>Full-time</option>
          <option>Part-time</option>
          <option>Contract</option>
          <option>Internship</option>
          <option>Remote</option>
        </select>

        <input
          name="skills"
          value={formData.skills}
          onChange={handleChange}
          placeholder="Skills: React, Node, MongoDB"
          className="border rounded-lg px-4 py-3 md:col-span-2"
        />

        <input
          name="requirements"
          value={formData.requirements}
          onChange={handleChange}
          placeholder="Requirements: 2 years experience, teamwork"
          className="border rounded-lg px-4 py-3 md:col-span-2"
        />

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Job description"
          className="border rounded-lg px-4 py-3 md:col-span-2 min-h-[120px]"
          required
        />

        <button
          disabled={loading}
          className="bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? "Posting..." : "Post Job"}
        </button>
      </form>
    </div>
  );
}