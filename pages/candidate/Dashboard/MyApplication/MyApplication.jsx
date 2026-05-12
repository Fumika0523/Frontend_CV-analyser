import React, { useState, useEffect } from "react";
import Layout from "../../../../components/Layout/Layout";
import axios from "axios";
import {url} from "../../../../utils/constant"
import { toast } from "react-toastify";
import { AiOutlineFileSearch } from "react-icons/ai";
import { FiEye } from "react-icons/fi";


export default function MyApplication() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadedCV, setUploadedCV] = useState(null);
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch applications from backend
  const fetchApplications = async () => {
    try {
      setApplicationsLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/applications?status=${statusFilter}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("response fetch applications",response.data)
      setApplications(response.data);
    } catch (error) {
      console.error("Error fetching applications:", error);
      // Use mock data if API fails
      setApplications([
        {
          _id: "1",
          jobTitle: "Frontend Developer",
          company: "Tech Corp",
          appliedDate: "2026-04-20",
          status: "pending",
        },
        {
          _id: "2",
          jobTitle: "React Developer",
          company: "StartupXYZ",
          appliedDate: "2026-04-18",
          status: "interview",
        },
        {
          _id: "3",
          jobTitle: "Full Stack Engineer",
          company: "BigTech Inc",
          appliedDate: "2026-04-15",
          status: "rejected",
        },
      ]);
    } finally {
      setApplicationsLoading(false);
    }
  };

  // Fetch latest CV on mount
  const fetchLatestCV = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${url}/cv/latest`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUploadedCV(response.data);
    } catch (error) {
      console.error("Error fetching CV:", error);
    }
  };

  useEffect(() => {
    fetchLatestCV();
    fetchApplications();
  }, [statusFilter]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error("Please upload a PDF or Word document");
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return toast.error("Please select a CV");

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("cv", file);
      console.log("formData",formData)
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${url}/cv/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("res from application",res.data)
      setUploadedCV(res.data.cv);
      toast.success("CV uploaded successfully!");
    } catch (err) {
  console.error("Upload error:", err);

  if (err.response) {
    console.log("Backend error:", err.response.data);
    toast.error(err.response.data.message || "Upload failed from backend");
  } else {
    toast.error("Upload failed. Backend may not be running.");
  }
} finally {
      setLoading(false);
    }
  };

  const statusColors = {
    pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
    review: { bg: "bg-blue-100", text: "text-blue-800", label: "In Review" },
    interview: { bg: "bg-purple-100", text: "text-purple-800", label: "Interview" },
    rejected: { bg: "bg-red-100", text: "text-red-800", label: "Rejected" },
    accepted: { bg: "bg-green-100", text: "text-green-800", label: "Accepted" },
  };

  const statusOptions = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "review", label: "In Review" },
    { value: "interview", label: "Interview" },
    { value: "accepted", label: "Accepted" },
    { value: "rejected", label: "Rejected" },
  ];

  return (
    <>
     <div >
      {/* CV Upload Section */}
<div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">

  {/* Header Row */}
  <div className="flex items-center justify-between gap-4 mb-5">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
        <AiOutlineFileSearch className="text-xl" />
      </div>
      <div>
        <h2 className="text-base font-semibold text-slate-900 leading-tight">Your CV</h2>
        <p className="text-xs text-slate-400 mt-0.5">Upload your CV to apply for jobs instantly</p>
      </div>
    </div>

    {uploadedCV && (
      
        href={`${url}${uploadedCV.filePath}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition shrink-0"
      >
        <FiEye className="text-sm" />
        View CV
      </a>
    )}
  </div>

  {/* Uploaded status pill */}
  {uploadedCV && (
    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 mb-4">
      <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center shrink-0">
        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
      <span className="text-xs font-medium text-green-800 truncate">{uploadedCV.fileName}</span>
      <span className="ml-auto text-xs text-green-500 font-medium shrink-0">Uploaded</span>
    </div>
  )}

  {/* Drop zone */}
  <label className={`flex items-center gap-3 w-full border-2 border-dashed rounded-xl px-4 py-4 cursor-pointer transition mb-3 ${
    file
      ? "border-blue-300 bg-blue-50/50"
      : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/30"
  }`}>
    <input
      type="file"
      accept=".pdf,.doc,.docx"
      onChange={handleFileChange}
      className="sr-only"
    />

    {file ? (
      <>
        <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
          <span className="text-[10px] font-bold text-blue-700 tracking-wide">
            {file.name.split(".").pop().toUpperCase()}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {(file.size / 1024).toFixed(0)} KB · Click to change
          </p>
        </div>
      </>
    ) : (
      <>
        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </div>
        <div>
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-blue-600">Click to upload</span> or drag & drop
          </p>
          <p className="text-xs text-slate-400 mt-0.5">PDF, DOC, DOCX — max 5MB</p>
        </div>
      </>
    )}
  </label>

  {/* Upload Button */}
  <button
    onClick={handleUpload}
    disabled={!file || loading}
    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
    style={{
      background: !file || loading ? undefined : "linear-gradient(135deg, #1d4ed8, #1e3a8a)",
      backgroundColor: !file || loading ? "#94a3b8" : undefined,
    }}
  >
    {loading ? (
      <>
        <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        Uploading…
      </>
    ) : (
      <>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        Upload CV
      </>
    )}
  </button>

</div>

            {/* Application Status Section with Filter */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  📋 Application History
                </h2>
                
                {/* Status Filter */}
                <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setStatusFilter(option.value)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        statusFilter === option.value
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {applicationsLoading ? (
                <div className="flex justify-center py-8">
                  <span className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></span>
                </div>
              ) : applications.length > 0 ? (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div
                      key={app._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{app.jobTitle}</h3>
                          <p className="text-sm text-gray-600">{app.company}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Applied: {new Date(app.appliedDate).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            statusColors[app.status]?.bg || "bg-gray-100"
                          } ${
                            statusColors[app.status]?.text || "text-gray-800"
                          }`}
                        >
                          {statusColors[app.status]?.label || app.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No applications found with status "{statusFilter}".
                </p>
              )}
            </div>
          {/* </div> */}
        </div>
    </>
  );
}