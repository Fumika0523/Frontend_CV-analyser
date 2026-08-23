import React, { useMemo, useState } from "react";
import Image from "next/image";
import ButtonPrimary from "./misc/ButtonPrimary";
import { motion } from "framer-motion";
import getScrollAnimation from "../utils/getScrollAnimation";
import ScrollAnimationWrapper from "./Layout/ScrollAnimationWrapper";
import { FaFileUpload, FaBrain, FaChartBar } from "react-icons/fa";
import CVUpload from "../pages/candidate/Dashboard/CVUpload";
import AuthModal from "./Auth/authModal/authModal";
import OtpModal from "./Auth/otpModal";
import { useRouter } from "next/router";
import { FiZap } from "react-icons/fi";

const listUser = [
  {
    name: "Resume Uploads",
    number: "500",
    icon: <FaFileUpload className="text-blue-600 text-2xl" />,
  },
  {
    name: "Skills Analysed",
    number: "120",
    icon: <FaBrain className="text-blue-500 text-2xl" />,
  },
  {
    name: "AI Reports",
    number: "300",
    icon: <FaChartBar className="text-blue-600 text-2xl" />,
  },
];

const heroContent = {
  candidate: {
    title: "Analyse your CV smarter with SkillfulJobs",
    description:
      "Upload your resume and get AI-powered insights including extracted skills, missing skills, job role recommendations, and improvement tips.",
    primaryButton: "Upload CV",
  },
  company: {
    title: "Hire smarter with SkillfulJobs",
    description:
      "Post jobs, manage applications, and use AI-powered CV insights to shortlist candidates faster.",
    primaryButton: "Post a Job",
  },
};

const Hero = ({ guestView, setGuestView }) => {
  const scrollAnimation = useMemo(() => getScrollAnimation(), []);
  const router = useRouter();
  const [uploadIsGuest, setUploadIsGuest] = useState(true);
  const [otpModal, setOtpModal] = useState({
    isOpen: false,
    _id: "",
    email: "",
  });
  const [authRole, setAuthRole] = useState("candidate");
  const content = heroContent[guestView];
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("signup");
  const [guestUploadOpen, setGuestUploadOpen] = useState(false);
  const [guestPostJobOpen, setGuestPostJobOpen] = useState(false);
  // console.log("guestView",guestView)

const handlePrimaryClick = () => {
  const token = localStorage.getItem("token");

  if (guestView === "candidate") {
    setUploadIsGuest(!token); // no token = guest, token = candidate user
    setGuestUploadOpen(true);
    return;
  }

  if (token) {
    router.push("/company/Dashboard/PostJob/postJobPage");
  } else {
    setGuestPostJobOpen(true);
  }
};

  const handleOtpSent = (data) => {
    console.log("OTP SENT FROM HERO:", data);
    const mongoId = data?._id;
    if (!mongoId) {
      console.error("Missing _id for OTP modal:", data);
      return;
    }
    setAuthOpen(false);

    setOtpModal({
      isOpen: true,
      _id: mongoId,
      email: data.email || "",
    });
  };

  return (
    <>
      <div className="max-w-screen-xl mt-24 px-8 xl:px-16 mx-auto " id="about">
        <ScrollAnimationWrapper>
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-6 lg:py-16 items-center"
            variants={scrollAnimation}
          >
            <div className="flex flex-col justify-center items-center text-center lg:items-start lg:text-left order-2 lg:order-1">
              <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold leading-normal">
                {content.title}
              </h1>

              <p className="mt-4 mb-6 max-w-[560px]">
                {content.description}
              </p>

              <ButtonPrimary addClass="group" onClick={handlePrimaryClick}>
                {content.primaryButton}
              </ButtonPrimary>
            </div>

            <div className="relative order-1 flex w-full justify-center lg:order-2">
  {/* Large soft blue glow */}
  <div
    aria-hidden="true"
    className="pointer-events-none absolute left-1/2 top-1/2 h-[95%] w-[95%] -translate-x-1/2 -translate-y-1/2 rounded-full"
    style={{
      background:
        "radial-gradient(ellipse at center, rgba(96, 165, 250, 0.35) 0%, rgba(191, 219, 254, 0.25) 46%, rgba(239, 246, 255, 0) 73%)",
      filter: "blur(20px)",
    }}
  />

  {/* Smaller cyan highlight */}
  <div
    aria-hidden="true"
    className="pointer-events-none absolute bottom-[8%] right-[12%] h-32 w-48 rounded-full bg-sky-300/20 blur-3xl"
  />

  {/* Illustration */}
  <motion.div
    className="relative z-10 w-full max-w-[612px] drop-shadow-[0_24px_35px_rgba(37,99,235,0.12)]"
    variants={scrollAnimation}
  >
    <Image
      src="/assets/Illustration1.png"
      alt="CV Analyser Illustration"
      quality={100}
      width={612}
      height={383}
      layout="responsive"
    />
  </motion.div>
</div>
          </motion.div>
        </ScrollAnimationWrapper>

        <div className="relative w-full flex">
          <ScrollAnimationWrapper className="rounded-xl w-full grid grid-cols-1 sm:grid-cols-3 py-9 divide-y-2 sm:divide-y-0 sm:divide-x-2 divide-gray-100 bg-blue-800 z-10 shadow-[0_30px_80px_rgba(13,16,37,0.08)]">
            {listUser.map((listUsers, index) => (
              <motion.div
                className="flex items-center justify-center py-4 sm:py-6 px-4"
                key={index}
                custom={{ duration: 2 + index }}
                variants={scrollAnimation}
              >
                <div className="flex items-center justify-center w-full sm:w-auto">
                  <div className="flex items-center justify-center bg-sky-100 w-12 h-12 mr-6 rounded-full">
                    {listUsers.icon}
                  </div>

                  <div className="flex flex-col">
                    <p className="text-xl text-slate-200 font-bold">
                      {listUsers.number}+
                    </p>
                    <p className="text-lg text-slate-200 ">{listUsers.name}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </ScrollAnimationWrapper>

          <div
            className="absolute bg-black-600 opacity-5 w-11/12 rounded-lg h-64 sm:h-48 top-0 mt-8 mx-auto left-0 right-0"
            style={{ filter: "blur(114px)" }}
          ></div>
        </div>
      </div>

      {/* CV upload modal */}
      {guestUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-5 relative">
            <button
              onClick={() => setGuestUploadOpen(false)}
              className="absolute top-3 right-4 text-slate-400 hover:text-slate-700 text-xl"
            >
              ×
            </button>

            <CVUpload
              isGuest={uploadIsGuest}
              guestView={guestView}
              setGuestView={setGuestView}
              onSignUpClick={() => {
                setGuestUploadOpen(false);
                setAuthMode("signup");
                setAuthRole("candidate");
                setAuthOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {/* jobpost modal */}
      {guestPostJobOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
            <button
              onClick={() => setGuestPostJobOpen(false)}
              className="absolute top-3 right-4 text-slate-400 hover:text-slate-700 text-xl"
            >
              ×
            </button>

            <h2 className="text-xl font-semibold text-slate-200 mb-2">
              {/* <FiZap/>  */}
              Post a Job 
            </h2>

            <p className="text-sm text-slate-200 mb-5">
              To post and manage jobs, please create a company account or sign in.
            </p>

            <button
              onClick={() => {
                setGuestPostJobOpen(false);
                setAuthMode("signup");
                setAuthRole("company");
                setAuthOpen(true);
              }}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{
                background: "linear-gradient(135deg, #1d4ed8, #1e3a8a)",
              }}
            >
              Create Company Account
            </button>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={authOpen}
        initialMode={authMode}
        initialRole={authRole}
        onClose={() => setAuthOpen(false)}
        onOtpSent={handleOtpSent}
      />
      {otpModal.isOpen && (
        <OtpModal
          isOpen={otpModal.isOpen}
          _id={otpModal._id}
          email={otpModal.email}
          onClose={() => setOtpModal({ isOpen: false, _id: "", email: "" })}
          onVerified={(data) => {
         //   console.log("data from Hero",data)
            if (data?.token) {
              localStorage.setItem("token", data.token);
            }

            localStorage.removeItem("guest_session_id");

            setOtpModal({ isOpen: false, _id: "", email: "" });

            if (data?.user?.role === "company") {
              router.push("/company/dashboard");
            } else {
              router.push("/candidate/dashboard");
            }
          }}
        />
      )}
    </>
  );
};

export default Hero;