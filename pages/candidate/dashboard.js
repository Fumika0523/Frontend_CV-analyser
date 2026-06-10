import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout/Layout";
import AppliedJobs from "./Dashboard/AppliedJobs";
import MatchingJobs from "./Dashboard/MatchingJobs";
import ApplyJobs from "./Dashboard/ApplyJobs";
import MyApplication from "./Dashboard/MyApplication/MyApplication";
import { useRouter } from "next/router";
import axios from "axios";

export default function Dashboard() {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const guestSessionId = localStorage.getItem("guest_session_id");

        // Guest preview user
        if (!token && guestSessionId) {
          setIsGuest(true);
          setCheckingAuth(false);
          return;
        }

        // No token and no guest session
        if (!token && !guestSessionId) {
          router.push("/");
          return;
        }

        // Logged-in user
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

        setIsGuest(false);
        setCheckingAuth(false);
      } catch (error) {
        localStorage.removeItem("token");
        router.push("/");
      }
    };

    checkUser();
  }, [router]);

  if (checkingAuth) {
    return <p>Checking authentication...</p>;
  }

 return (
  <Layout>
    <div className="bg-gray-50 py-8">
      <div className="max-w-screen-xl mt-24 px-8 xl:px-16 mx-auto">

        {isGuest && (
          <MatchingJobs isGuest={true} />
        )}

        {!isGuest && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AppliedJobs />
              </div>

              <div className="lg:col-span-1">
                <MatchingJobs isGuest={false} />
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