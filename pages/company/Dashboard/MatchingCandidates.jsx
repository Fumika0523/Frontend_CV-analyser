import React, { useEffect, useState } from "react";
import axios from "axios";

export default function MatchingCandidates({ jobId }) {
  const [matches, setMatches] = useState([]);
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchMatches = async () => {
    console.log("calling fetch matches function");
    console.log("jobId ", jobId);

    if (!jobId) {
      console.log("No jobId yet, stopping fetchMatches");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const token = localStorage.getItem("token");

      const res = await axios.get(
        `http://localhost:8002/jobs/${jobId}/matches`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("response from fetchMatches", res.data);

      setJobTitle(res.data.title);
      setMatches(res.data.matchedCandidates || []);
    } catch (error) {
      console.error("fetchMatches error:", error);
      setMessage(error.response?.data?.message || "Failed to fetch matches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [jobId]);

  console.log("matches state:", matches);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-xl font-bold text-slate-900 mb-1">
        Matching Candidates
      </h2>

      {jobTitle && (
        <p className="text-sm text-slate-500 mb-4">
          Matches for: <span className="font-medium">{jobTitle}</span>
        </p>
      )}

      {loading && <p className="text-sm text-slate-500">Loading matches...</p>}

      {message && !loading && (
        <p className="text-sm text-rose-600">{message}</p>
      )}

      {!loading && !message && matches.length === 0 && (
        <p className="text-slate-500 text-sm">
          No matching candidates found yet.
        </p>
      )}

      {!loading && matches.length > 0 && (
        <div className="space-y-4">
          {matches.map((candidate) => (
            <div
              key={candidate.candidateId}
              className="border border-slate-200 rounded-xl p-4 hover:border-blue-200 transition"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-bold text-slate-900">
                    {candidate.candidateName || `Candidate ${candidate.candidateId}`}
                  </h3>

                  {candidate.cvPath && (
                    <a
                      href={`http://localhost:8002${candidate.cvPath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-700 hover:underline"
                    >
                      Open CV
                    </a>
                  )}

                  <p className="text-sm text-slate-500">
                    Candidate ID: {candidate.candidateId}
                  </p>
                </div>

                <span className="text-sm font-semibold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
                  {candidate.matchScore}%
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {candidate.matchedSkills?.map((skill, index) => (
                  <span
                    key={index}
                    className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}