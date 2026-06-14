import React from "react";

const MatchScoreModal = ({ applicant, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Match Score Details
            </h2>
            <p className="text-sm text-slate-500">
              {applicant.candidateName} — {applicant.title}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xl"
          >
            ×
          </button>
        </div>

        <div className="mb-5">
          <p className="text-sm text-slate-500">Overall Match Score</p>
          <p className="text-3xl font-bold text-blue-700">
            {applicant.matchScore || 0}%
          </p>
        </div>

        <Section
          title="Matching Skills"
          items={applicant.matchedSkills || []}
          emptyText="No matching skills found."
          color="green"
        />

        <Section
          title="Missing Skills"
          items={applicant.missingSkills || []}
          emptyText="No missing skills found."
          color="red"
        />

        <div className="mt-5 border border-slate-200 rounded-xl p-4">
          <h3 className="font-bold text-slate-800 mb-2">Location</h3>
          <p
            className={`text-sm font-semibold ${
              applicant.locationMatch ? "text-green-700" : "text-red-600"
            }`}
          >
            {applicant.locationMatch
              ? "Location matched"
              : "Location does not match"}
          </p>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, items, emptyText, color }) => {
  const colorClass =
    color === "green"
      ? "bg-green-50 text-green-700 border-green-200"
      : "bg-red-50 text-red-700 border-red-200";

  return (
    <div className="mt-5 border border-slate-200 rounded-xl p-4">
      <h3 className="font-bold text-slate-800 mb-3">{title}</h3>

      {items.length === 0 ? (
        <p className="text-sm text-slate-400">{emptyText}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span
              key={index}
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${colorClass}`}
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchScoreModal;