import { useState } from "react";
import Layout from "../../components/Layout/Layout";
import PostedJobs from "../company/Dashboard/PostedJobs/PostedJobs";
import MatchingCandidates from '../company/Dashboard/MatchingCandidates'


export default function dashboard() {
  const [selectedJobId, setSelectedJobId] = useState(null);

  const handleSelectJob = (jobOrId) => {
    const id =
      typeof jobOrId === "string"
        ? jobOrId
        : jobOrId?._id;

    console.log("SELECTED JOB ID:", id);
    setSelectedJobId(id || null);
  };

  return (
    <Layout>
      <div className="min-h-screen py-8">
        <div className="max-w-screen-xl mt-20 px-8 xl:px-16 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PostedJobs onSelectJob={handleSelectJob} />
            </div>

            <div className="lg:col-span-1">
              <MatchingCandidates jobId={selectedJobId} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}