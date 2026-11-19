import React from "react";
import Layout from "../../components/Layout/Layout";
import MatchingJobs from "./Dashboard/MatchingJobs";
import ApplyJobs from "./Dashboard/ApplyJobs";
import MyApplication from "./Dashboard/MyApplication/MyApplication";

export default function Dashboard({ candidateSession, refreshCandidateSession }) {
  const isGuest = candidateSession.role === "guest";

  return (
    <Layout onSessionChange={refreshCandidateSession}>
      <div className="py-8">
        <div className="max-w-screen-xl mt-24 px-8 xl:px-16 mx-auto">
          {isGuest ? (
            <MatchingJobs
              isGuest
              guestMatches={candidateSession.matchedJobs}
              onSessionChange={refreshCandidateSession}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <MatchingJobs />
                </div>
              </div>
              <div className="mt-6">
                <ApplyJobs />
              </div>
              <div className="mt-5">
                <MyApplication />
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
