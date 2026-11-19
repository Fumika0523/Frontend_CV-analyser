
import React, { useState } from "react";
import Layout from "../../../../components/Layout/Layout";

import PostedJobs from "./PostedJobs";
import usePostedJobs from "./usePostedJobs";
import CloseJobDialog from "./CloseJobDialog";

import MatchingCandidates from "../MatchingCandidates";

export default function PostedJobsPage() {
  const postedJobs = usePostedJobs();

  // Store the ID of the job clicked by the recruiter.
  const [selectedJobId, setSelectedJobId] = useState(null);

  // Tell MatchingCandidates which job to display.
  const handleSelectJob = (job) => {
    setSelectedJobId(job._id);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 py-10">
        <div className="mx-auto mt-24 max-w-screen-xl px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <PostedJobs
                {...postedJobs}
                onSelectJob={handleSelectJob}
              />
            </div>

            <div className="lg:col-span-1">
              <MatchingCandidates jobId={selectedJobId} />
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
