
import { useEffect, useRef, useState } from "react";
import Layout from "../../components/Layout/Layout";

import PostedJobs from "../company/Dashboard/PostedJobs/PostedJobs";
import MatchingCandidates from "../company/Dashboard/MatchingCandidates";

import usePostedJobs from "../company/Dashboard/PostedJobs/usePostedJobs";
import CloseJobDialog from "../company/Dashboard/PostedJobs/CloseJobDialog";

export default function Dashboard() {
  const postedJobs = usePostedJobs();

  // Selected job used by the matching engine.
  const [selectedJobId, setSelectedJobId] = useState(null);

  // Controls only the small-screen Matching Candidates modal.
  const [mobileMatchesOpen, setMobileMatchesOpen] = useState(false);
  const closeButtonRef = useRef(null);

  const handleSelectJob = (jobOrId) => {
    const id =
      typeof jobOrId === "string"
        ? jobOrId
        : jobOrId?._id;

    if (!id) return;

    setSelectedJobId(id);

    // Large screen: existing right-hand panel.
    // Smaller screen: open the modal.
    if (window.innerWidth < 768) {
      setMobileMatchesOpen(true);
    }
  };

  useEffect(() => {
    if (!mobileMatchesOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMobileMatchesOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMatchesOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [mobileMatchesOpen]);

  return (
    <Layout>
      <div className="min-h-screen py-8">
        <div className="mx-auto mt-20 max-w-screen-xl px-4 sm:px-6 xl:px-16">

        
{/* Responsive columns */}
<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

  {/* Posted Jobs */}
  <div className="md:col-span-1 lg:col-span-2">
    <PostedJobs
      {...postedJobs}
      onSelectJob={handleSelectJob}
    />
  </div>

  {/* Matching Candidates: always visible from 768px */}
  <div className="hidden md:block md:col-span-1">
    <MatchingCandidates jobId={selectedJobId} />
  </div>

          </div>
        </div>
      </div>

      {/* SMALL-SCREEN MATCHING CANDIDATES MODAL */}
      {mobileMatchesOpen && selectedJobId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 sm:p-4 lg:hidden"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="matching-candidates-title"

className="flex h-[100dvh] w-full flex-col overflow-hidden bg-white shadow-2xl sm:h-[85dvh] sm:max-w-2xl sm:rounded-2xl"
          >
            {/* Modal header */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 p-4">
              <h2
                id="matching-candidates-title"
                className="text-lg font-bold text-slate-900"
              >
                Matching Candidates
              </h2>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setMobileMatchesOpen(false)}
                className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold hover:bg-slate-200"
                aria-label="Close matching candidates"
              >
                ✕ Close
              </button>
            </div>
        {/* Scrollable Matching Candidates content */}
<div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5">
  <MatchingCandidates jobId={selectedJobId} />
</div>
          </div>
        </div>
      )}

      {/* EXISTING CLOSE JOB DIALOG */}
      <CloseJobDialog
        job={postedJobs.jobToClose}
        isClosing={postedJobs.isClosing}
        error={postedJobs.closeError}
        onCancel={postedJobs.cancelCloseJob}
        onConfirm={postedJobs.confirmCloseJob}
      />
    </Layout>
  );
}
