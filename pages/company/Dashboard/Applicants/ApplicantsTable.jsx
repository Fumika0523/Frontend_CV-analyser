import axios from "axios";
import React, { useState } from "react";
import { url } from "../../../../utils/constant";
import MatchScoreModal from "./MatchScoreModal";

const statusOptions = [
  "pending",
  "reviewing",
  "interview",
  "rejected",
  "accepted",
];

const statusStyle = {
  pending: "bg-yellow-100 text-yellow-700",
  reviewing: "bg-blue-100 text-blue-700",
  interview: "bg-purple-100 text-purple-700",
  rejected: "bg-red-100 text-red-700",
  accepted: "bg-green-100 text-green-700",
};

const ApplicantsTable = ({ applicantsData, setApplicantsData }) => {
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [statusEditApplicant, setStatusEditApplicant] = useState(null);

  const updateStatus = async (applicationId, newStatus) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `${url}/update-applications/${applicationId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("res",res)

      setApplicantsData((prev) =>
        prev.map((app) =>
          app._id === applicationId
            ? { ...app, status: res.data.application.status }
            : app
        )
      );

      setStatusEditApplicant(null);
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900">
          Applied Candidates
        </h2>
        <p className="text-sm text-slate-500">
          Candidates who already applied from their dashboard.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-slate-500">
              <th className="py-3 px-3">Name</th>
              <th className="py-3 px-3">Applied Date</th>
              <th className="py-3 px-3">Job Title</th>
              <th className="py-3 px-3">View CV</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Matched Score</th>
              <th className="py-3 px-3">Note</th>
            </tr>
          </thead>

          <tbody>
            {applicantsData?.map((applicant) => (
              <tr
                key={applicant._id}
                className="border-b bg-green-50/40 hover:bg-green-50"
              >
                <td className="py-3 px-3 font-medium text-slate-800">
                  {applicant.candidateName}
                  {/* <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Already applied
                  </span> */}
                </td>

                <td className="py-3 px-3">
                  {new Date(applicant.appliedDate).toLocaleDateString()}
                </td>

                <td className="py-3 px-3">{applicant.title}</td>

                <td className="py-3 px-3">
                  {applicant.cvFilePath ? (
                    <a
                      href={`${url}${applicant.cvFilePath}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 font-medium hover:underline"
                    >
                      View CV
                    </a>
                  ) : (
                    <span className="text-slate-400">No CV</span>
                  )}
                </td>

                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                        statusStyle[applicant.status] ||
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {applicant.status}
                    </span>

                    <button
                      onClick={() => setStatusEditApplicant(applicant)}
                      className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-100 text-slate-600"
                      title="Edit status"
                    >
                      ✏️
                    </button>
                  </div>
                </td>

                <td className="py-3 px-3">
                  <button
                    onClick={() => setSelectedApplicant(applicant)}
                    className="font-semibold text-indigo-600 hover:underline"
                  >
                    {applicant.matchScore}%
                  </button>
                </td>

                <td className="py-3 px-3 text-slate-600">
                  {applicant.note || "No note"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedApplicant && (
        <MatchScoreModal
          data={selectedApplicant}
          onClose={() => setSelectedApplicant(null)}
        />
      )}

      {statusEditApplicant && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Update Status
                </h3>
                <p className="text-sm text-slate-500">
                  {statusEditApplicant.candidateName}
                </p>
              </div>

              <button
                onClick={() => setStatusEditApplicant(null)}
                className="text-slate-400 hover:text-slate-700 text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-2">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => updateStatus(statusEditApplicant._id, status)}
                  className={`w-full text-left px-4 py-3 rounded-xl border capitalize transition ${
                    statusEditApplicant.status === status
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantsTable;