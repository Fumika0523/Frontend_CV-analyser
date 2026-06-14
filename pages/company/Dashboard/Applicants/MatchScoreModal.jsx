import React from "react";

const MatchScoreModal = ({ data, onClose }) => {
  if (!data) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Match Details
            </h3>
            <p className="text-sm text-slate-500">
              {data.candidateName} - {data.title || data.jobTitle}
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
          <p className="text-sm text-slate-500">Match Score</p>
          <p className="text-3xl font-bold text-indigo-600">
            {data.matchScore || 0}%
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <h4 className="font-semibold text-slate-800 mb-2">
              Matching Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {data.matchedSkills?.length > 0 ? (
                data.matchedSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-400">No matching skills</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-800 mb-2">
              Location
            </h4>
            {data.locationMatch ? (
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">
                Location matched
              </span>
            ) : (
              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs">
                Location not matched
              </span>
            )}
          </div>

          <div>
            <h4 className="font-semibold text-slate-800 mb-2">
              Missing Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {data.missingSkills?.length > 0 ? (
                data.missingSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-400">
                  No missing skills
                </p>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-slate-900 text-white py-2 rounded-xl hover:bg-slate-800"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default MatchScoreModal;