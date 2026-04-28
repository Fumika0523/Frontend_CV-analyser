import React from "react";
import Layout from "../../components/Layout/Layout";
import SeoHead from "../../components/SeoHead";
import AppliedJobs from "../../components/Dashboard/AppliedJobs";
import MatchingJobs from "../../components/Dashboard/MatchingJobs";
import ApplyJobs from "../../components/Dashboard/ApplyJobs";

export default function Dashboard() {
  return (
    <>
      {/* <SeoHead title='Candidate Dashboard' /> */}
      <Layout className="border border-orange-500">
        <div className="bg-gray-50 py-8">
          <div  className="max-w-screen-xl mt-24 px-8 xl:px-16 mx-auto"
>
            {/* <h1 className="text-3xl font-bold text-gray-800 mb-8">Candidate Dashboard</h1> */}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Section 1: Applied Jobs Status */}
              <div className="lg:col-span-2">
                <AppliedJobs />
              </div>
              
              {/* Section 2: Matching Jobs */}
              <div className="lg:col-span-1">
                <MatchingJobs />
              </div>
            </div>
            
            {/* Section 3: Apply for New Jobs */}
            <div className="mt-6">
              <ApplyJobs />
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}