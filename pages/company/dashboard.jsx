import React, { useState } from "react";
import Layout from "../../components/Layout/Layout";
import MatchingCandidates from "./Dashboard/MatchingCandidates";
import PostedJobs from "./Dashboard/PostedJobs/PostedJobs";

export default function CompanyDashboard() {
  const [selectedJob, setSelectedJob] = useState(null);

  return (
    <Layout>
      <div className="min-h-screen  py-8">
        <div className="max-w-screen-xl mt-20 px-8 xl:px-16 mx-auto">
          {/* <h1 className="text-2xl font-bold text-slate-900 mb-6">
            Company Dashboard
          </h1> */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PostedJobs onSelectJob={setSelectedJob} />
            </div>

            <div className="lg:col-span-1">
              <MatchingCandidates jobId={selectedJob?._id} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}