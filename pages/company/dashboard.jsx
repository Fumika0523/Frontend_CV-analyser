import { useState } from "react";
import Layout from "../../components/Layout/Layout";

import PostedJobs from "../company/Dashboard/PostedJobs/PostedJobs";
import MatchingCandidates from "../company/Dashboard/MatchingCandidates";

import usePostedJobs from "../company/Dashboard/PostedJobs/usePostedJobs";
import CloseJobDialog from "../company/Dashboard/PostedJobs/CloseJobDialog";

export default function Dashboard() {
  /*
   * NEW:
   * The dashboard must use the same Posted Jobs logic
   * as the standalone Posted Jobs page.
   *
   * This gives PostedJobs:
   * jobs
   * edit state
   * API functions
   * close-job functions
   * etc.
   */
  const postedJobs = usePostedJobs();

  /*
   * This is separate from postedJobs.selectedJob.
   *
   * selectedJobId is specifically used by
   * MatchingCandidates to know which job the
   * recruiter selected.
   */
  const [selectedJobId, setSelectedJobId] =
    useState(null);

  /*
   * When the recruiter clicks a job card,
   * send that job's MongoDB _id to
   * MatchingCandidates.
   */
  const handleSelectJob = (jobOrId) => {
    const id =
      typeof jobOrId === "string"
        ? jobOrId
        : jobOrId?._id;

    setSelectedJobId(id || null);
  };

  return (
    <Layout>
      <div className="min-h-screen py-8">
        <div className="mx-auto mt-20 max-w-screen-xl px-8 xl:px-16">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* ======================================
                LEFT SIDE - COMPANY'S POSTED JOBS
            ====================================== */}
            <div className="lg:col-span-2">
              <PostedJobs
                /*
                 * Pass everything returned by
                 * usePostedJobs into the component.
                 */
                {...postedJobs}

                /*
                 * Additional dashboard-only function.
                 *
                 * This tells MatchingCandidates
                 * which job was selected.
                 */
                onSelectJob={handleSelectJob}
              />
            </div>

            {/* ======================================
                RIGHT SIDE - MATCHING CANDIDATES
            ====================================== */}
            <div className="lg:col-span-1">
              <MatchingCandidates
                jobId={selectedJobId}
              />
            </div>
          </div>
        </div>
      </div>

    
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