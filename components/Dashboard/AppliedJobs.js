import React from "react";

const statusStyles = {
  pending: {
    badge: { background: "#fffbeb", color: "#b45309", borderColor: "#fde68a" },
    card: { background: "rgba(255, 251, 235, 0.45)" },
  },
  review: {
    badge: { background: "#eff6ff", color: "#1d4ed8", borderColor: "#bfdbfe" },
    card: { background: "rgba(239, 246, 255, 0.45)" },
  },
  interview: {
    badge: { background: "#eef2ff", color: "#4338ca", borderColor: "#c7d2fe" },
    card: { background: "rgba(238, 242, 255, 0.45)" },
  },
  rejected: {
    badge: { background: "#fff1f2", color: "#be123c", borderColor: "#fecdd3" },
    card: { background: "rgba(255, 241, 242, 0.45)" },
  },
  accepted: {
    badge: { background: "#ecfdf5", color: "#047857", borderColor: "#a7f3d0" },
    card: { background: "rgba(236, 253, 245, 0.45)" },
  },
};

const AppliedJobs = () => {
  const appliedJobs = [
    { id: 1, title: "Frontend Developer", company: "Tech Corp", appliedDate: "2026-04-20", status: "interview" },
    { id: 2, title: "React Developer", company: "StartupXYZ", appliedDate: "2026-04-18", status: "pending" },
    { id: 3, title: "Full Stack Engineer", company: "BigTech Inc", appliedDate: "2026-04-15", status: "rejected" },
    { id: 4, title: "UI/UX Designer", company: "Design Studio", appliedDate: "2026-04-10", status: "review" },
  ];

  return (
    <div
      className="bg-white rounded-lg shadow-md p-6"
      style={{ border: "1px solid #dbeafe" }}
    >
      <h2
        className="text-xl font-semibold mb-4"
        style={{ color: "#0f172a" }}
      >
        📋 Applied Jobs Status
      </h2>

      <div className="space-y-4">
        {appliedJobs.map((job) => {
          const styles = statusStyles[job.status];

          return (
            <div
              key={job.id}
              className="rounded-lg p-4 hover:shadow-md transition-shadow"
              style={{
                border: "1px solid #dbeafe",
                ...(styles?.card || {}),
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium" style={{ color: "#0f172a" }}>
                    {job.title}
                  </h3>
                  <p className="text-sm" style={{ color: "#475569" }}>
                    {job.company}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#64748b" }}>
                    Applied: {job.appliedDate}
                  </p>
                </div>

                <span
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    border: "1px solid",
                    ...(styles?.badge || {
                      background: "#f8fafc",
                      color: "#334155",
                      borderColor: "#e2e8f0",
                    }),
                  }}
                >
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {appliedJobs.length === 0 && (
        <p className="text-center py-8" style={{ color: "#64748b" }}>
          No applications yet. Start applying for jobs!
        </p>
      )}
    </div>
  );
};

export default AppliedJobs;