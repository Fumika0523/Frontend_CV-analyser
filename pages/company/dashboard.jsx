import React from "react";
import Layout from "../../components/Layout/Layout";
import PostedJobs from "./Dashboard/PostedJobs";
import MatchingCandidates from "./Dashboard/MatchingCandidates";
import PostJob from "./Dashboard/PostJob";
import AppliedCandidateList from "./Dashboard/AppliedCandidateList";

export default function CompanyDashboard() {
  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-screen-xl mt-24 px-8 xl:px-16 mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Company Dashboard
          </h1>

          <p className="text-slate-500 mb-8">
            Manage your job posts, candidates, and applications.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PostedJobs />
            </div>

            <div className="lg:col-span-1">
              <MatchingCandidates />
            </div>
          </div>

          <div className="mt-6">
            <PostJob />
          </div>

          <div className="mt-6">
            <AppliedCandidateList />
          </div>
        </div>
      </div>
    </Layout>
  );
}