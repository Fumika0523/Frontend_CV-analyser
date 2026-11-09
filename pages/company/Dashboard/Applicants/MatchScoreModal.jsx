import React, { useEffect, useRef } from "react";
import { FiX } from "react-icons/fi";
import { restoreModalFocus, trapModalFocus } from "../../../../components/Jobs/modalFocus";

const MatchScoreModal = ({
  data,
  onClose,
  isGuest = false,
  nested = false,
  returnFocus,
}) => {
  const isOpen = Boolean(data);
  const panel = useRef(null);
  const closeButton = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (!isOpen) return undefined;
    const previousFocus = returnFocus || document.activeElement;
    const previousOverflow = document.body.style.overflow;
    // A nested breakdown borrows JD's scroll lock instead of restoring it early.
    if (!nested) document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const handleKey = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        close.current?.();
      } else trapModalFocus(event, panel.current);
    };
    document.addEventListener("keydown", handleKey, true);
    return () => {
      document.removeEventListener("keydown", handleKey, true);
      if (!nested) document.body.style.overflow = previousOverflow;
      restoreModalFocus(previousFocus);
    };
  }, [isOpen, nested, returnFocus]);
  if (!data) return null;

  const hasScore = typeof data.matchScore === "number" && Number.isFinite(data.matchScore);

  return (
    <div className={`fixed inset-0 bg-black/40 flex items-center justify-center px-4 py-4 ${nested ? "z-[70]" : "z-50"}`}
      role="dialog" aria-modal="true" aria-label="Match details" aria-labelledby="match-details-title"
      onMouseDown={(event) => {
        event.stopPropagation();
        if (event.target === event.currentTarget) close.current?.();
      }}>
      <div ref={panel} tabIndex={-1} className="max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl max-w-lg w-full min-w-0 p-5 sm:p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 id="match-details-title" className="text-xl font-bold text-slate-900">
              Match Details
            </h3>

            <p className="break-words text-sm text-slate-500 [overflow-wrap:anywhere]">
              {data.candidateName} -{" "}
              {data.title || data.jobTitle}
            </p>
          </div>

          <button
            ref={closeButton}
            type="button"
            onClick={onClose}
            aria-label="Close match details"
            className="shrink-0 rounded-lg p-1 text-slate-400 hover:text-slate-700 focus-visible:outline-blue-600"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* SCORE */}
        <div className="mb-5">
          <p className="text-sm text-slate-500">
            {isGuest
              ? "Skill Match Score"
              : "Match Score"}
          </p>

          <p className="text-3xl font-bold text-indigo-600">
            {hasScore ? `${data.matchScore}%` : "Match score unavailable"}
          </p>

          {isGuest && (
            <p className="text-xs text-slate-400 mt-1">
              Guest preview score is based on CV skills only.
            </p>
          )}
        </div>

        <div className="space-y-5">
          {/* MATCHING SKILLS */}
          <div>
            <h4 className="font-semibold text-slate-800 mb-2">
              Matching Skills
            </h4>

            <div className="flex flex-wrap gap-2">
              {data.matchedSkills?.length > 0 ? (
                data.matchedSkills.map(
                  (skill, index) => (
                    <span
                      key={index}
                      className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs"
                    >
                      {skill}
                    </span>
                  )
                )
              ) : (
                <p className="text-sm text-slate-400">
                  No matching skills
                </p>
              )}
            </div>
          </div>

          {/* LOCATION - REGISTERED USERS ONLY */}
          {!isGuest && (
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
          )}

          {/* MISSING SKILLS */}
          <div>
            <h4 className="font-semibold text-slate-800 mb-2">
              Missing Skills
            </h4>

            <div className="flex flex-wrap gap-2">
              {data.missingSkills?.length > 0 ? (
                data.missingSkills.map(
                  (skill, index) => (
                    <span
                      key={index}
                      className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs"
                    >
                      {skill}
                    </span>
                  )
                )
              ) : (
                <p className="text-sm text-slate-400">
                  No missing skills
                </p>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full bg-slate-900 text-white py-2 rounded-xl hover:bg-slate-800 focus-visible:outline-blue-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default MatchScoreModal;
