import axios from "axios";
import React, { useEffect, useState } from "react";
import { url } from "../../../../utils/constant";
import ApplicantsTable from "./ApplicantsTable";
import RecommendedCandidatesTable from "./RecommendedCandidatesTable";
import Layout from "../../../../components/Layout/Layout";

export default function ApplicantsPage() {
  const [applicantsData, setApplicantsData] = useState([]);
  const [recommendedCandidates, setRecommendedCandidates] = useState([]);

  const getApplicantsData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(`${url}/applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Applicants Data", res.data.applications)
      setApplicantsData(res.data.applications);
    } catch (error) {
      console.error("Failed to get applicants", error);
    }
  };

  const getRecommendedCandidates = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(`${url}/applications/recommended-candidates`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRecommendedCandidates(res.data.candidates || []);
    } catch (error) {
      console.error("Failed to get recommended candidates", error);
    }
  };

  useEffect(() => {
    getApplicantsData();
    getRecommendedCandidates();
  }, []);

  return (
    <Layout>
      <div className="bg-slate-50 py-10 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 space-y-8">
          <ApplicantsTable
            applicantsData={applicantsData}
            setApplicantsData={setApplicantsData}
          />

          <RecommendedCandidatesTable candidates={recommendedCandidates} />
        </div>
      </div>
    </Layout>
  );
}