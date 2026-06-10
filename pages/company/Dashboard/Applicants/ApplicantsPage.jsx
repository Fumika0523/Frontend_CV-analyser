import axios from "axios";
import React, { useEffect, useState } from "react";
import { url } from "../../../../utils/constant";
import ApplicantsTable from "./ApplicantsTable";
import Layout from "../../../../components/Layout/Layout";


export default function AppliedCandidateList() {
  
const [applicantsData, setApplicantsData] = useState([]);

const getApplicantsData = async () => {
  try {
    const token = localStorage.getItem("token");
    if(!token)  return;

    const res = await axios.get(`${url}/applications`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("getApplicantsData", res.data.applications);
    setApplicantsData(res.data.applications);
  } catch (error) {
    console.error("Failed to get applicants", error);
  }
};

useEffect(() => {
  getApplicantsData();
}, []);
  

  return (
       <Layout>
      <div className="bg-slate-50 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
          <ApplicantsTable applicantsData={applicantsData} setApplicantsData={setApplicantsData}  />
        </div>
      </div>
    </Layout>
 
  );
}