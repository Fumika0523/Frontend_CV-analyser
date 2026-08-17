import React, { useEffect, useState } from "react";
import axios from "axios";
import { url } from "../../../../utils/constant";

import {
  FiAlertCircle,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiClipboard,
  FiClock,
  FiEye,
  FiInbox,
  FiLayers,
  FiLoader,
  FiRefreshCw,
  FiUsers,
  FiXCircle,
} from "react-icons/fi";

const statusConfig = {
  pending: {
    label: "Pending",
    icon: FiClock,
    background: "bg-amber-100",
    text: "text-amber-800",
    border: "border-l-amber-400",
  },

  reviewing: {
    label: "In Review",
    icon: FiEye,
    background: "bg-blue-100",
    text: "text-blue-800",
    border: "border-l-blue-500",
  },

  interview: {
    label: "Interview",
    icon: FiUsers,
    background: "bg-purple-100",
    text: "text-purple-800",
    border: "border-l-purple-500",
  },

  accepted: {
    label: "Accepted",
    icon: FiCheckCircle,
    background: "bg-emerald-100",
    text: "text-emerald-800",
    border: "border-l-emerald-500",
  },

  rejected: {
    label: "Rejected",
    icon: FiXCircle,
    background: "bg-red-100",
    text: "text-red-800",
    border: "border-l-red-500",
  },

  default: {
    label: "Unknown",
    icon: FiClipboard,
    background: "bg-slate-100",
    text: "text-slate-700",
    border: "border-l-slate-400",
  },
};

const statusOptions = [
  {
    value: "all",
    label: "All",
    icon: FiLayers,
  },
  {
    value: "pending",
    label: "Pending",
    icon: FiClock,
  },
  {
    value: "reviewing",
    label: "In Review",
    icon: FiEye,
  },
  {
    value: "interview",
    label: "Interview",
    icon: FiUsers,
  },
  {
    value: "accepted",
    label: "Accepted",
    icon: FiCheckCircle,
  },
  {
    value: "rejected",
    label: "Rejected",
    icon: FiXCircle,
  },
];

const normalizeStatus = (status) => {
  const normalizedStatus = String(status || "").toLowerCase();

  // Support old data that might contain "review".
  if (normalizedStatus === "review") {
    return "reviewing";
  }

  return normalizedStatus;
};

const formatApplicationDate = (date) => {
  if (!date) {
    return "Date unavailable";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function MyApplication() {
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [applicationsError, setApplicationsError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredApplications =
  statusFilter === "all"
    ? applications
    : applications.filter(
        (application) =>
          normalizeStatus(application.status) === statusFilter
      );

      
  const fetchApplications = async () => {
    try {
      setApplicationsLoading(true);
      setApplicationsError("");

      const token = localStorage.getItem("token");

      const response = await axios.get(
  `${url}/applications`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

      console.log("Applications response:", response.data);

      /*
       * Support both:
       * res.json(applications)
       * res.json({ applications })
       */
      const applicationsData = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.applications)
          ? response.data.applications
          : [];

      setApplications(applicationsData);
    } catch (error) {
      console.error("Error fetching applications:", error);

      setApplications([]);

      setApplicationsError(
        error.response?.data?.message ||
          "We could not load your applications."
      );
    } finally {
      setApplicationsLoading(false);
    }
  };

useEffect(() => {
  fetchApplications();
}, []);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-950/10">
      {/* Heading */}
      <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-600/20">
              <FiClipboard aria-hidden="true" size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Application History
              </h1>

              <p className="mt-1 text-sm text-slate-600">
                Track the progress of all your job applications.
              </p>
            </div>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
            <FiBriefcase
              aria-hidden="true"
              className="text-blue-700"
              size={16}
            />

            <span>
Showing {filteredApplications.length}            </span>
          </div>
        </div>
      </div>

      {/* Status filters */}
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => {
            const FilterIcon = option.icon;
            const isActive = statusFilter === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatusFilter(option.value)}
                aria-pressed={isActive}
                className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-blue-700 text-white shadow-md shadow-blue-700/20"
                    : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                <FilterIcon aria-hidden="true" size={14} />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6">
        {applicationsLoading ? (
          /* Loading state */
          <div className="flex flex-col items-center justify-center py-14">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-700">
              <FiLoader
                aria-hidden="true"
                className="animate-spin"
                size={27}
              />
            </div>

            <p className="mt-4 text-sm font-medium text-slate-600">
              Loading your applications...
            </p>
          </div>
        ) : applicationsError ? (
          /* Error state */
          <div className="flex flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
              <FiAlertCircle aria-hidden="true" size={27} />
            </div>

            <p className="mt-4 font-semibold text-red-800">
              Unable to load applications
            </p>

            <p className="mt-1 text-sm text-red-600">
              {applicationsError}
            </p>

            <button
              type="button"
              onClick={fetchApplications}
              className="mt-5 flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              <FiRefreshCw aria-hidden="true" size={15} />
              Try Again
            </button>
          </div>
        ) : filteredApplications.length > 0 ? (
          /* Application cards */
          <div className="space-y-4">
            {filteredApplications.map((application) => {
              const normalizedStatus = normalizeStatus(
                application.status
              );

              const currentStatus =
                statusConfig[normalizedStatus] ||
                statusConfig.default;

              const StatusIcon = currentStatus.icon;

              /*
               * Your Application model uses "title", but this
               * also supports responses containing "jobTitle".
               */
              const jobTitle =
                application.jobTitle ||
                application.title ||
                application.jobId?.title ||
                "Job title unavailable";

              const companyName =
                application.companyName ||
                application.companyId?.companyName ||
                application.jobId?.companyId?.companyName ||
                "Company not specified";

              const appliedDate =
                application.appliedDate ||
                application.createdAt;

              return (
                <article
                  key={application._id}
                  className={`group rounded-xl border border-l-4 border-slate-200 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg ${currentStatus.border}`}
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="flex min-w-0 items-start gap-3">
                      {/* Job icon */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 transition group-hover:bg-blue-700 group-hover:text-white">
                        <FiBriefcase
                          aria-hidden="true"
                          size={19}
                        />
                      </div>

                      <div className="min-w-0">
                        <h2 className="font-semibold text-slate-900">
                          {jobTitle}
                        </h2>

                        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
                          <FiBriefcase
                            aria-hidden="true"
                            className="shrink-0 text-slate-400"
                            size={14}
                          />

                          <span>{companyName}</span>
                        </p>
                      </div>
                    </div>

                    {/* Status */}
                    <span
                      className={`flex w-fit shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${currentStatus.background} ${currentStatus.text}`}
                    >
                      <StatusIcon
                        aria-hidden="true"
                        size={14}
                      />

                      {currentStatus.label}
                    </span>
                  </div>

                  {/* Application date */}
                  <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                    <FiCalendar
                      aria-hidden="true"
                      className="text-blue-600"
                      size={14}
                    />

                    <span>
                      Applied on{" "}
                      {formatApplicationDate(appliedDate)}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 py-14 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-700">
              <FiInbox aria-hidden="true" size={30} />
            </div>

            <h2 className="mt-4 font-semibold text-slate-800">
              No applications found
            </h2>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {statusFilter === "all"
                ? "You have not submitted any job applications yet."
                : `You do not have any ${statusConfig[statusFilter]?.label.toLowerCase()} applications.`}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}