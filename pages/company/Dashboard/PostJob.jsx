import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../../../components/Layout/Layout";

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

export default function PostJob() {
const [formData, setFormData] = useState({
  title: "",
  jobType: "Full-time",
  // designation: "",
  education: "",
  keySkills: "",
  experience: "",
  location: "",
  responsibility: "",
  roleSummary: "",
  compensationBenefits: "",
  description: "",
  applicationEndDate: "",
  salary: "",
});

  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationResults, setLocationResults] = useState([]);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setMessage("");

    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  useEffect(() => {
    const city = formData.location.trim();

    if (city.length < 2) {
      setLocationResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLocationLoading(true);

        const res = await axios.get(
          `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=6&language=en&format=json`
        );

        setLocationResults(res.data.results || []);
      } catch (error) {
        console.error("Location API error:", error);
      } finally {
        setLocationLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.location]);

  const selectLocation = (place) => {
    const selected = `${place.name}, ${place.country}`;

    setFormData((prev) => ({
      ...prev,
      location: selected,
    }));

    setLocationResults([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const token = localStorage.getItem("token");

const payload = {
  ...formData,

  keySkills: formData.keySkills
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean),

  responsibility: formData.responsibility
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean),
};

      await axios.post("http://localhost:8002/create", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(formData)
      setMessage("success");

     setFormData({
  title: "",
  jobType: "Full-time",
  // designation: "",
  education: "",
  keySkills: "",
  experience: "",
  location: "",
  responsibility: "",
  roleSummary: "",
  compensationBenefits: "",
  description: "",
  applicationEndDate: "",
  salary: "",
});

    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
  <Layout>
  <div className="min-h-screen bg-slate-50 py-8">
    <div className="max-w-screen-xl mt-24 px-8 xl:px-16 mx-auto">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex justify-between items-start mb-5">
        <div>
          <h2 className="text-xl font-semibold" style={{ color: "#0f172a" }}>
            📝 Post a New Job
          </h2>
          <p className="text-sm mt-1" style={{ color: "#64748b" }}>
            Create a job post for candidates to discover and apply.
          </p>
        </div>
      </div>

      {message && (
        <div
          className="mb-4 px-4 py-3 rounded-lg text-sm font-medium"
          style={{
            background: message === "success" ? "#ecfdf5" : "#fff1f2",
            color: message === "success" ? "#047857" : "#be123c",
            border:
              message === "success"
                ? "1px solid #a7f3d0"
                : "1px solid #fecdd3",
          }}
        >
          {message === "success"
            ? "✅ Job posted successfully."
            : `⚠️ ${message}`}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-700 mb-1 block">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Junior MERN Stack Developer"
              className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
              style={{ borderColor: "#dbeafe" }}
              required
            />
          </div>

          <div className="relative">
            <label className="text-xs font-semibold text-slate-700 mb-1 block">
              Location <span className="text-red-500">*</span>
            </label>

            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Type city name, e.g. London"
              className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
              style={{ borderColor: "#dbeafe" }}
              autoComplete="off"
              required
            />

            {locationLoading && (
              <p className="text-xs mt-1" style={{ color: "#64748b" }}>
                Searching location...
              </p>
            )}

            {locationResults.length > 0 && (
              <div className="absolute z-20 mt-1 w-full bg-white rounded-lg shadow-lg border border-blue-100 overflow-hidden bg-white-500">
                {locationResults.map((place) => (
                  <button
                    type="button"
                    key={`${place.id}-${place.name}`}
                    onClick={() => selectLocation(place)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50"
                    style={{ color: "#0f172a" }}
                  >
                    {place.name}
                    {place.admin1 ? `, ${place.admin1}` : ""}, {place.country}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">
              Salary Range
            </label>

            <select
              name="salary"
              value={formData.salary}
              onChange={handleChange}
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
              value={formData.jobType}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
              style={{ borderColor: "#dbeafe" }}
            >
              {jobTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </div>
        {/* Key skills */}
          <div>
  <label className="text-xs font-semibold text-slate-700 mb-1 block">
    Key Skills <span className="text-red-500">*</span>
  </label>

  <input
    name="keySkills"
    value={formData.keySkills}
    onChange={handleChange}
    placeholder="React, Node.js, MongoDB"
    className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
    style={{ borderColor: "#dbeafe" }}
    required
  />

  <p className="text-xs mt-1" style={{ color: "#64748b" }}>
    Separate skills with commas.
  </p>
</div>
     {/* Designation */}
              {/* <div>
  <label className="text-xs font-semibold text-slate-700 mb-1 block">
    Designation <span className="text-red-500">*</span>
  </label>

  <input
    name="designation"
    value={formData.designation}
    onChange={handleChange}
    placeholder="Software Engineer"
    className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
    style={{ borderColor: "#dbeafe" }}
    required
  />
</div> */}
{/* Education */}
<div>
  <label className="text-xs font-semibold text-slate-700 mb-1 block">
    Education <span className="text-red-500">*</span>
  </label>

  <input
    name="education"
    value={formData.education}
    onChange={handleChange}
    placeholder="Bachelor's degree or equivalent"
    className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
    style={{ borderColor: "#dbeafe" }}
    required
  />
</div>

<div>
  <label className="text-xs font-semibold text-slate-700 mb-1 block">
    Experience <span className="text-red-500">*</span>
  </label>

  <input
    name="experience"
    value={formData.experience}
    onChange={handleChange}
    placeholder="1-2 years"
    className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
    style={{ borderColor: "#dbeafe" }}
    required
  />
</div>

<div className="md:col-span-2">
  <label className="text-xs font-semibold text-slate-700 mb-1 block">
    Responsibilities <span className="text-red-500">*</span>
  </label>

  <textarea
    name="responsibility"
    value={formData.responsibility}
    onChange={handleChange}
    placeholder="Develop features, fix bugs, collaborate with the team..."
    className="w-full border rounded-lg px-4 py-3 text-sm min-h-[110px] resize-y focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
    style={{ borderColor: "#dbeafe" }}
    required
  />

  <p className="text-xs mt-1" style={{ color: "#64748b" }}>
    You can separate responsibilities with commas.
  </p>
</div>

<div className="md:col-span-2">
  <label className="text-xs font-semibold text-slate-700 mb-1 block">
    Role Summary <span className="text-red-500">*</span>
  </label>

  <textarea
    name="roleSummary"
    value={formData.roleSummary}
    onChange={handleChange}
    placeholder="Briefly explain what this role is about..."
    className="w-full border rounded-lg px-4 py-3 text-sm min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
    style={{ borderColor: "#dbeafe" }}
    required
  />
</div>

<div className="md:col-span-2">
  <label className="text-xs font-semibold text-slate-700 mb-1 block">
    Compensation & Benefits <span className="text-red-500">*</span>
  </label>

  <textarea
    name="compensationBenefits"
    value={formData.compensationBenefits}
    onChange={handleChange}
    placeholder="Pension, holidays, training, flexible working..."
    className="w-full border rounded-lg px-4 py-3 text-sm min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
    style={{ borderColor: "#dbeafe" }}
    required
  />
</div>

<div>
  <label className="text-xs font-semibold text-slate-700 mb-1 block">
    Application End Date <span className="text-red-500">*</span>
  </label>

  <input
    type="date"
    name="applicationEndDate"
    value={formData.applicationEndDate}
    onChange={handleChange}
    className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
    style={{ borderColor: "#dbeafe" }}
    required
  />
</div>

        </div>

        <div className="flex justify-end pt-2">
          <button
            disabled={loading}
            className="px-6 py-3 rounded-lg text-sm font-semibold text-white transition disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #1d4ed8, #1e3a8a)",
              boxShadow: "0 8px 18px rgba(29, 78, 216, 0.22)",
            }}
          >
            {loading ? "Posting..." : "Post Job"}
          </button>
        </div>
      </form>
        </div>
          </div>
     </div>
    </Layout>
    </>
  );
}