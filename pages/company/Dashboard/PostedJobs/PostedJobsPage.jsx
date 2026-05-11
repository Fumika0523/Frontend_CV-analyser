import React from "react";
import Layout from "../../../../components/Layout/Layout";
import PostedJobs from "./PostedJobs";

export default function PostedJobsPage() {
  return (
    <Layout>
      <div className="bg-slate-50 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
          <PostedJobs />
        </div>
      </div>
    </Layout>
  );
}