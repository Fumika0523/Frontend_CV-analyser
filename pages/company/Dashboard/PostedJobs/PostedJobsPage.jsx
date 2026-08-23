import React from "react";
import Layout from "../../../../components/Layout/Layout";
import PostedJobs from "./PostedJobs";
import usePostedJobs from "../PostedJobs/usePostedJobs";
import CloseJobDialog from "../PostedJobs/CloseJobDialog";

export default function PostedJobsPage() {
  const postedJobs = usePostedJobs();

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 py-10">
        <div className="mx-auto mt-24 max-w-5xl px-4 sm:px-6 lg:px-8">
          <PostedJobs {...postedJobs} />
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