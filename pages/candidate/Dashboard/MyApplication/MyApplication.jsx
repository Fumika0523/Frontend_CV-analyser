import React, { useState, useEffect } from "react";
import axios from "axios";
import { url } from "../../../../utils/constant";
import CVUpload from "../../../../pages/candidate/Dashboard/CVUpload";

export default function MyApplication() {
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchApplications = async () => {
    try {
      setApplicationsLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${url}/applications?status=${statusFilter}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Applications:", response.data.applications);
setApplications(response.data.applications || []);    } catch (error) {
      console.error("Error fetching applications:", error);

      // setApplications([
      //   {
      //     _id: "1",
      //     jobTitle: "Frontend Developer",
      //     company: "Tech Corp",
      //     appliedDate: "2026-04-20",
      //     status: "pending",
      //   },
      //   {
      //     _id: "2",
      //     jobTitle: "React Developer",
      //     company: "StartupXYZ",
      //     appliedDate: "2026-04-18",
      //     status: "interview",
      //   },
      //   {
      //     _id: "3",
      //     jobTitle: "Full Stack Engineer",
      //     company: "BigTech Inc",
      //     appliedDate: "2026-04-15",
      //     status: "rejected",
      //   },
      // ]);
    } finally {
      setApplicationsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

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
    <div className="space-y-6">
      {/* <CVUpload isGuest={false} /> */}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            📋 Application History
          </h2>

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
                    <h3 className="font-medium text-gray-900">
                      {app.jobTitle}
                    </h3>
                    <p className="text-sm text-gray-600">{app.companyName}</p>
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
  );
}