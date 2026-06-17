import React, { useState } from "react";
import MatchScoreModal from "./MatchScoreModal";
import { url } from "../../../../utils/constant";

const RecommendedCandidatesTable = ({ candidates }) => {
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900">
          Recommended Candidates
        </h2>
        <p className="text-sm text-slate-500">
          Candidates ranked by matching score. Already applied candidates are excluded.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-slate-500">
              <th className="py-3 px-3">Name</th>
              <th className="py-3 px-3">Job Title</th>
              <th className="py-3 px-3">View CV</th>
              <th className="py-3 px-3">Matched Score</th>
              {/* <th className="py-3 px-3">Note</th> */}
            </tr>
          </thead>

          <tbody>
            {candidates?.map((candidate, index) => (
              <tr key={index} className="border-b hover:bg-slate-50">
                <td className="py-3 px-3 font-medium text-slate-800">
                  {candidate.candidateName}
                </td>

                <td className="py-3 px-3">{candidate.jobTitle}</td>

                <td className="py-3 px-3">
                  {candidate.cvFilePath ? (
                    <a
            href={`${url}${candidate.cvFilePath}`}
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
                  <button
                    onClick={() => setSelectedCandidate(candidate)}
                    className="font-semibold text-indigo-600 hover:underline"
                  >
                    {candidate.matchScore || 0}%
                  </button>
                </td>

                {/* <td className="py-3 px-3">
                  <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">
                    {candidate.contactStatus}
                  </span>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCandidate && (
        <MatchScoreModal
          data={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
};

export default RecommendedCandidatesTable;