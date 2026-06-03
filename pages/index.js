import Feature from "../components/Feature";
import Pricing from "../components/Pricing";
import Hero from "../components/Hero";
import Layout from "../components/Layout/Layout";
import SeoHead from "../components/SeoHead";
import { useState, useEffect } from "react";
import axios from "axios";


export default function Home() {

  const [guestView, setGuestView] = useState("candidate");
  console.log("guestView from index",guestView)
  const [userData, setUserData] = useState(null);

    useEffect(() => {
    const getUserData = async () => {
      try {
        const token = localStorage.getItem("token");  
        //console.log("token",token)
        if (!token) return;

        const res = await axios.get("http://localhost:8002/user-profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("getUserData response:",res.data.user)
        const fetchedUser = res.data.user;
        if (fetchedUser.role === "company") {
  setGuestView("company");
} else {
  setGuestView("candidate");
}
        setUserData({
          id: fetchedUser._id,
          userId: fetchedUser.userId,
          firstName: fetchedUser.firstName,
          lastName: fetchedUser.lastName,
          name: `${fetchedUser.firstName || ""} ${fetchedUser.lastName || ""}`.trim(),
          email: fetchedUser.email,
          role: fetchedUser.role,
          phoneNumber: fetchedUser.phoneNumber || "",
          companyName: fetchedUser.companyName || "",
          companyDescription: fetchedUser.companyDescription || "",
          location: fetchedUser.location || { city: "", country: "" },
        });
      } catch (error) {
        
        // localStorage.removeItem("token");
         console.error("Failed to fetch user:", error.response?.data || error.message);

  const status = error.response?.status;
  const message = error.response?.data?.message;

  if (
    status === 401 &&
    (message === "jwt expired" ||
      message === "invalid token" ||
      message === "Invalid token")
  ) {
    localStorage.removeItem("token");
    setUserData(null);
  }
      }
    };

    getUserData();
  }, []);

  return (
    <>
      <SeoHead title='SkillfulJobs.ai' />
      <Layout guestView={guestView} setGuestView={setGuestView}>
        <Hero guestView={guestView} setGuestView={setGuestView} userData={userData}/>
        <Feature guestView={guestView} />
      </Layout>
    </>
  );
}
