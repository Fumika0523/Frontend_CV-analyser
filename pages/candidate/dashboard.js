import React from "react";
import Layout from "../../components/Layout/Layout";
import SeoHead from "../../components/SeoHead";
import AppliedJobs from "./Dashboard/AppliedJobs";
import MatchingJobs from "./Dashboard/MatchingJobs";
import ApplyJobs from "./Dashboard/ApplyJobs";
import MyApplication from "./Dashboard/MyApplication/MyApplication";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export default function Dashboard() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

 useEffect(() => {
  const checkUser = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/");
        return;
      }

      const res = await axios.get("http://localhost:8002/user-profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const user = res.data.user;

      if (user.role !== "candidate") {
        router.push("/");
        return;
      }

      setCheckingAuth(false);
    } catch (error) {
      localStorage.removeItem("token");
      router.push("/");
    }
  };

  checkUser();
}, [router]);

  if(checkingAuth){
    return <p>Checking authentication...</p>
  }

  return (
    <>
      <Layout className="border border-orange-500">
        <div className="bg-gray-50 py-8">
          <div  className="max-w-screen-xl mt-24 px-8 xl:px-16 mx-auto">
         
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

              <div className="mt-5">
              <MyApplication />
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}