import React from "react";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  review: "bg-blue-100 text-blue-800",
  interview: "bg-purple-100 text-purple-800",
  rejected: "bg-red-100 text-red-800",
  accepted: "bg-green-100 text-green-800",
};

const AppliedJobs = () => {
  // Mock data - replace with API call
  const appliedJobs = [
    {
      id: 1,
      title: "Frontend Developer",
      company: "Tech Corp",
      appliedDate: "2026-04-20",
      status: "interview",
    },
    {
      id: 2,
      title: "React Developer",
      company: "StartupXYZ",
      appliedDate: "2026-04-18",
      status: "pending",
    },
    {
      id: 3,
      title: "Full Stack Engineer",
      company: "BigTech Inc",
      appliedDate: "2026-04-15",
      status: "rejected",
    },
    {
      id: 4,
      title: "UI/UX Designer",
      company: "Design Studio",
      appliedDate: "2026-04-10",
      status: "review",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        📋 Applied Jobs Status
      </h2>
      
      <div className="space-y-4">
        {appliedJobs.map((job) => (
          <div
            key={job.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">{job.title}</h3>
                <p className="text-sm text-gray-600">{job.company}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Applied: {job.appliedDate}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  statusColors[job.status] || "bg-gray-100 text-gray-800"
                }`}
              >
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {appliedJobs.length === 0 && (
        <p className="text-gray-500 text-center py-8">
          No applications yet. Start applying for jobs!
        </p>
      )}
    </div>
  );
};

export default AppliedJobs;