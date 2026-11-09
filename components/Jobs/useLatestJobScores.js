import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { url } from "../../utils/constant";

const cvMetadata = (cv) => cv?._id ? {
  _id: String(cv._id), version: cv.version, originalFileName: cv.originalFileName,
} : null;
const revision = (job) => String(job.updatedAt || "");
const validMatch = (match) => typeof match?.matchScore === "number" &&
  Number.isFinite(match.matchScore) && match.matchScore >= 0 && match.matchScore <= 100 &&
  Array.isArray(match.matchedSkills) && Array.isArray(match.missingSkills) && typeof match.locationMatch === "boolean";

// Instance-local state only: no cross-page or cross-account cache.
export default function useLatestJobScores(visibleJobs, loggedIn) {
  const [cvState, setCvState] = useState({ status: "guest", cv: null });
  const [scoreMap, setScoreMap] = useState({});
  const [cvRetry, setCvRetry] = useState(0);
  const [scoreRetry, setScoreRetry] = useState(0);
  const scores = useRef({});
  const selectedCv = useRef(null);
  const generation = useRef(0);
  const mounted = useRef(true);
  const visibleKey = JSON.stringify([...new Map(visibleJobs.map((job) => [String(job._id), revision(job)])).entries()].sort());
  const items = JSON.parse(visibleKey).map(([id, version]) => ({ id, version }));
  const current = (cycle) => mounted.current && generation.current === cycle;
  const commit = (update) => {
    scores.current = update(scores.current);
    setScoreMap(scores.current);
  };
  const config = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Please sign in to see your match.");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const ensureScores = (requested, cv, cycle) => {
    const missing = requested.filter(({ id, version }) => {
      const entry = scores.current[id];
      return !entry || entry.cvId !== cv._id || entry.version !== version;
    });
    for (let offset = 0; offset < missing.length; offset += 50) {
      const batch = missing.slice(offset, offset + 50);
      const promise = (async () => {
        try {
          // Register the in-flight entries before a request can settle or fail.
          await Promise.resolve();
          if (!current(cycle)) return {};
          const response = await axios.post(`${url}/applications/preview-matches`, {
            jobIds: batch.map(({ id }) => id), cvId: cv._id,
          }, config());
          if (!Array.isArray(response.data?.matches)) throw new Error("Unable to calculate match scores.");
          if (!current(cycle)) return {};
          const results = {};
          for (const match of response.data.matches) {
            if (validMatch(match) && batch.some(({ id }) => id === String(match.jobId))) {
              results[String(match.jobId)] = {
                jobId: String(match.jobId), matchScore: match.matchScore,
                matchedSkills: match.matchedSkills, missingSkills: match.missingSkills, locationMatch: match.locationMatch,
              };
            }
          }
          commit((previous) => {
            const next = { ...previous };
            for (const { id, version } of batch) {
              if (next[id]?.version !== version) continue;
              next[id] = { cvId: cv._id, version, status: results[id] ? "ready" : "error", match: results[id] };
            }
            return next;
          });
          return results;
        } catch (error) {
          if (!current(cycle)) return {};
          if ([401, 403].includes(error.response?.status)) {
            generation.current++;
            selectedCv.current = null;
            commit(() => ({}));
            setCvState({ status: "error", cv: null, message: "Please sign in with a candidate account to see your match." });
          } else {
            commit((previous) => {
              const next = { ...previous };
              for (const { id, version } of batch) {
                if (next[id]?.version === version) next[id] = { cvId: cv._id, version, status: "error" };
              }
              return next;
            });
          }
          return {};
        }
      })();
      commit((previous) => {
        const next = { ...previous };
        for (const { id, version } of batch) next[id] = { cvId: cv._id, version, status: "loading", promise };
        return next;
      });
    }
  };

  const selectCv = (uploaded) => {
    const cv = cvMetadata(uploaded);
    generation.current++;
    selectedCv.current = cv;
    commit(() => ({}));
    setCvState({ status: "ready", cv });
    if (cv) ensureScores(items, cv, generation.current);
  };

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; generation.current++; };
  }, []);

  useEffect(() => {
    const cycle = ++generation.current;
    selectedCv.current = null;
    commit(() => ({}));
    if (!loggedIn) { setCvState({ status: "guest", cv: null }); return; }
    setCvState({ status: "loading", cv: null });
    (async () => {
      try {
        const response = await axios.get(`${url}/cv/my-cvs`, config());
        if (!current(cycle)) return;
        if (!Array.isArray(response.data)) throw new Error("Unable to load your CV.");
        selectCv(response.data[0]);
      } catch {
        if (current(cycle)) setCvState({ status: "error", cv: null, message: "Unable to load your CV. Please check your session and retry." });
      }
    })();
    return () => { if (generation.current === cycle) generation.current++; };
  }, [loggedIn, cvRetry]);

  useEffect(() => {
    if (loggedIn && cvState.status === "ready" && cvState.cv) ensureScores(items, cvState.cv, generation.current);
  }, [visibleKey, cvState, loggedIn, scoreRetry]);

  const getMatch = async (jobId, cvId) => {
    const cv = selectedCv.current;
    if (!cv || cv._id !== cvId) throw new Error("Please reopen Quick Apply to refresh your selected CV.");
    const item = items.find(({ id }) => id === String(jobId)) || { id: String(jobId), version: "" };
    if (scores.current[item.id]?.status === "error") commit((previous) => { const next = { ...previous }; delete next[item.id]; return next; });
    ensureScores([item], cv, generation.current);
    const entry = scores.current[item.id];
    if (entry.status === "ready") return entry.match;
    const results = await entry.promise;
    if (!results[item.id]) throw new Error("Unable to calculate the match score. Please retry.");
    return results[item.id];
  };

  return {
    ...cvState, selectCv, getMatch,
    scoreFor: (job) => {
      const entry = scoreMap[String(job._id)];
      return cvState.status === "ready" && entry?.cvId === cvState.cv?._id && entry?.version === revision(job) ? entry : undefined;
    },
    retry: () => {
      if (cvState.status === "error") setCvRetry((value) => value + 1);
      else {
        commit((previous) => Object.fromEntries(Object.entries(previous).filter(([, entry]) => entry.status !== "error")));
        setScoreRetry((value) => value + 1);
      }
    },
  };
}
