import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import axios from "axios";

const API_URL = "http://localhost:8002/api";

export default function Applications() {
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
      const response = await axios.get(`${API_URL}/cv/latest`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUploadedCV(response.data.fileName);
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
        alert("Please upload a PDF or Word document");
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a CV");

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("cv", file);

      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${API_URL}/cv/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUploadedCV(res.data.cv.fileName);
      alert("CV uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
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
      <Layout>
        <div className="bg-gray-50 py-8">
          <div className="max-w-screen-xl mt-24 px-8 xl:px-16 mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">My Applications</h1>
            
            {/* CV Upload Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                📄 Upload Your CV
              </h2>
              <p className="text-gray-600 mb-4">
                Upload your CV to apply for jobs. We'll match you with relevant positions.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="block w-full sm:w-auto text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    cursor-pointer"
                />
                
                {file && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>📎 {file.name}</span>
                    <span className="text-gray-400">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                )}
                
                <button
                  onClick={handleUpload}
                  disabled={!file || loading}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white shadow-md flex items-center justify-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #1d4ed8, #0f172a)",
                    opacity: !file || loading ? 0.6 : 1,
                    cursor: !file || loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                      Uploading...
                    </>
                  ) : (
                    <>📤 Upload CV</>
                  )}
                </button>
              </div>

              {uploadedCV && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 text-sm">
                    ✅ CV uploaded: {uploadedCV}
                  </p>
                </div>
              )}
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
          </div>
        </div>
      </Layout>
    </>
  );
}