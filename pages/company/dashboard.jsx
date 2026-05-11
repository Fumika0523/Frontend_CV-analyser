import React from "react";
import Layout from "../../components/Layout/Layout";
import MatchingCandidates from "./Dashboard/MatchingCandidates";
import PostJob from "./Dashboard/postjob";
import AppliedCandidateList from "./Dashboard/AppliedCandidateList";
import PostedJobsPage from "./Dashboard/PostedJobs/PostedJobsPage";
import PostedJobs from "./Dashboard/PostedJobs/PostedJobs";

export default function CompanyDashboard() {
  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-screen-xl mt-20 px-8 xl:px-16 mx-auto">
          <h1 className="text-2xl font-bold text-slate-900 ">
            Company Dashboard
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PostedJobs />
            </div>

            <div className="lg:col-span-1">
              <MatchingCandidates />
            </div>
          </div>

          {/* <div className="mt-6">
            < />
          </div> */}

          {/* <div className="mt-6">
            <AppliedCandidateList />
          </div> */}
        </div>
      </div>
    </Layout>
  );
}