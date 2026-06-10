import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Link as LinkScroll } from "react-scroll";
import AuthModal from "../Auth/authModal";
import OtpModal from "../Auth/otpModal";
import axios from "axios";
import SettingsModal from "../Auth/settingsModal";
import ButtonPrimary from "../misc/ButtonPrimary";
import {
  FiInfo,
  FiStar,
  FiCreditCard,
  FiMessageCircle,
  FiGrid,
  FiBriefcase,
  FiFileText,
  FiSearch,
  FiUsers,
  FiPlusCircle,
} from "react-icons/fi";

import {
  FaSignInAlt,  FaUserPlus, FaBuilding, FaUser 
} from "react-icons/fa";

const NAV_GUEST = [
  { id: "about", label: "About", icon: FiInfo },
  { id: "feature", label: "Feature", icon: FiStar },
  { id: "pricing", label: "Pricing", icon: FiCreditCard },
  { id: "testimoni", label: "Testimonial", icon: FiMessageCircle },
];

const NAV_CANDIDATE = [
  { label: "Dashboard", href: "/candidate/dashboard", icon: FiGrid },
  { label: "Latest Jobs", href: "/candidate/Dashboard/LatestJobs", icon: FiBriefcase },
  { label: "My Application", href: "/candidate/Dashboard/MyApplication/MyApplicationPage", icon: FiFileText },
  { label: "Your skills", href: "/candidate/skills", icon: FiSearch },
];

const NAV_COMPANY = [
  { label: "Dashboard", href: "/company/dashboard", icon: FiGrid },
  { label: "Post a new job", href: "/company/Dashboard/postjob", icon: FiPlusCircle },
  { label: "Posted Jobs", href: "/company/Dashboard/PostedJobs/PostedJobsPage", icon: FiBriefcase },
  { label: "Applicants", href: "/company/Dashboard/Applicants/ApplicantsPage", icon: FiUsers },
];

const Header = ({   
  guestView = "candidate",
  setGuestView = () => {},
 }) => {
  const router = useRouter();
  const [activeLink, setActiveLink] = useState(null);
  const [scrollActive, setScrollActive] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);

  const [authModal, setAuthModal] = useState({
    isOpen: false,
    mode: "signin",
  });

  const [otpModal, setOtpModal] = useState({
    isOpen: false,
    _id: "",
    email: "",
  });

  const handleOtpSent = (data) => {
    console.log("HANDLE OTP SENT DATA:", data);

    const mongoId = data?._id;

    if (!mongoId) {
      console.error("OTP modal cannot open because _id is missing:", data);
      return;
    }

    setAuthModal({ isOpen: false, mode: "signin" });

    setOtpModal({
      isOpen: true,
      _id: mongoId,
      email: data.email || "",
    });
  };

 const handleAuthSuccess = (userData) => {
  setUser(userData);

  if (userData.role === "company") {
    setGuestView("company");
  } else {
    setGuestView("candidate");
  }
};

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setDropdownOpen(false);
    router.push("/");
  };

  const navLinks = user
    ? user.role === "company"
      ? NAV_COMPANY
      : NAV_CANDIDATE
    : [];

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() ||
      user.name?.slice(0, 2).toUpperCase()
    : "";

  useEffect(() => {
    const onScroll = () => setScrollActive(window.scrollY > 20);

    window.addEventListener("scroll", onScroll);
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const closeDropdown = () => setDropdownOpen(false);

    if (dropdownOpen) {
      document.addEventListener("click", closeDropdown);
    }

    return () => document.removeEventListener("click", closeDropdown);
  }, [dropdownOpen]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) return;

        const res = await axios.get("http://localhost:8002/user-profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const fetchedUser = res.data.user;
        if (fetchedUser.role === "company") {
  setGuestView("company");
} else {
  setGuestView("candidate");
}
        setUser({
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
    setUser(null);
  }
      }
    };

    fetchUser();
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 w-full z-30 bg-white/95 backdrop-blur-md transition-all duration-300 ${
          scrollActive ? "pt-0 shadow-sm" : "pt-4"
        }`}
      >
        <nav className="max-w-screen-xl mx-auto grid grid-flow-col items-center px-6 sm:px-8 lg:px-16 py-3 sm:py-4">
          <div className="col-start-1 col-end-2 flex items-center text-lg font-bold tracking-tight text-blue-700">
            SkillfulJobs.ai
          </div>

          <ul className="hidden lg:flex col-start-4 col-end-8 items-center text-blue-600">
            {user
              ? navLinks.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link key={item.href} href={item.href}>
                      <a className="group relative inline-flex items-center gap-2 px-4 py-2 mx-2 text-sm font-medium text-blue-900 transition-colors hover:text-blue-600">
                        <Icon className="text-base text-blue-900 transition-colors group-hover:text-blue-600" />
                        {item.label}
                      </a>
                    </Link>
                  );
                })
              : NAV_GUEST.map(({ id, label, icon: Icon }) => (
                  <LinkScroll
                    key={id}
                    activeClass="active"
                    to={id}
                    spy
                    smooth
                    duration={1000}
                    onSetActive={() => setActiveLink(id)}
                    className={`group relative inline-flex cursor-pointer items-center gap-2 px-4 py-2 mx-2 transition-colors hover:text-blue-600 ${
                      activeLink === id ? "text-blue-600" : "text-blue-900"
                    }`}
                  >
                    <Icon className="text-base text-blue-900 transition-colors group-hover:text-blue-600" />
                    {label}
                  </LinkScroll>
                ))}
          </ul>

          <div className="col-start-10 col-end-12 flex justify-end items-center gap-3 font-medium">
            {user ? (
              <div className="relative flex items-center gap-3">
                <span
                  className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
                    user.role === "company"
                      ? "border-blue-100 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-slate-100 text-slate-900"
                  }`}
                >
                  {user.role === "company" ? "🏢 Company" : "👤 Candidate"}
                </span>

                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDropdownOpen((prev) => !prev);
                    }}
                    className="flex h-[34px] w-[34px] items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-slate-900 to-blue-700 text-xs font-bold text-white shadow-[0_0_0_2px_#0f172a] transition hover:shadow-[0_0_0_3px_#1d4ed8]"
                  >
                    {initials}
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[170px] rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                      {user.role === "candidate" && (
                        // All the stored CV
                      <Link href="/candidate/cv">
                      <a className="block w-full rounded-lg px-3.5 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 hover:text-blue-600">
                            📄 Uploaded CV
                          </a>
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setSettingsModalOpen(true);
                          setDropdownOpen(false);
                        }}
                        className="block w-full rounded-lg px-3.5 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 hover:text-blue-600"
                      >
                        ⚙️ Settings
                      </button>

                      <div className="my-1 border-t border-blue-100" />

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="block w-full rounded-lg px-3.5 py-2 text-left text-sm text-slate-700 transition hover:bg-red-50 hover:text-rose-600"
                      >
                        🚪 Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
              {/* Candidate/compamy */}
                <button
  type="button"
  onClick={() =>
    setGuestView(
      guestView === "candidate" ? "company" : "candidate"
    )
  }
  className="inline-flex items-center rounded-lg border border-green-200 bg-green-100 px-3 py-2 text-sm font-medium text-green-800"
>
  <span className="md:hidden text-lg">
    {guestView === "candidate" ? <FaBuilding  /> : <FaUser  />}
  </span>

  <span className="hidden md:flex items-center gap-2">
    {guestView === "candidate" ? (
      <>
        <FaBuilding className="text-lg" />
        Recruiting? Post a job
      </>
    ) : (
      <>
        <FaUser className="text-lg"/>
        Apply for new job
      </>
    )}
  </span>
</button>

                {/* Sign in button */}
                <button
                  type="button"
                  onClick={() => setAuthModal({ isOpen: true, mode: "signin" })}
                  className="mx-2 cursor-pointer text-slate-600 transition hover:text-blue-600 sm:mx-4"
                >
                  <span className="inline md:hidden text-lg">  <FaSignInAlt /></span>
                  <span className="hidden md:inline">Sign In</span>
                </button>
              
              {/* Sign up button */}
                <ButtonPrimary
                  onClick={() => setAuthModal({ isOpen: true, mode: "signup" })}
                >
                   <span className="inline md:hidden text-lg">  <FaUserPlus /></span>
                  <span className="hidden md:inline">Sign Up</span>
                </ButtonPrimary>
              </>
            )}
          </div>
        </nav>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-20 px-4 shadow-t lg:hidden sm:px-8">
        <div className="bg-white sm:px-3">
          <ul className="flex w-full items-center justify-between text-slate-600">
            {user
              ? navLinks.slice(0, 4).map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link key={item.href} href={item.href}>
                      <a className="mx-1 flex flex-col items-center border-t-2 border-transparent px-3 py-2 text-xs transition hover:border-blue-700 hover:text-blue-700 sm:mx-2 sm:px-4">
                        <Icon className="mb-0.5 h-6 w-6 text-blue-900" />
                        {item.label}
                      </a>
                    </Link>
                  );
                })
              : NAV_GUEST.map(({ id, label, icon: Icon }) => (
                  <LinkScroll
                    key={id}
                    activeClass="active"
                    to={id}
                    spy
                    smooth
                    duration={1000}
                    onSetActive={() => setActiveLink(id)}
                    className={`mx-1 flex cursor-pointer flex-col items-center border-t-2 px-3 py-2 text-xs transition sm:mx-2 sm:px-4 ${
                      activeLink === id
                        ? "border-blue-700 text-blue-700"
                        : "border-transparent text-slate-600 hover:border-blue-700 hover:text-blue-700"
                    }`}
                  >
                    <Icon className="mb-0.5 h-6 w-6 text-blue-900" />
                    {label}
                  </LinkScroll>
                ))}
          </ul>
        </div>
      </nav>

      <AuthModal
        isOpen={authModal.isOpen}
        initialMode={authModal.mode}
        onClose={() => setAuthModal({ isOpen: false, mode: "signin" })}
        onAuthSuccess={handleAuthSuccess}
        onOtpSent={handleOtpSent}
      />

      {otpModal.isOpen && (
        <OtpModal
          isOpen={otpModal.isOpen}
          _id={otpModal._id}
          email={otpModal.email}
          onClose={() => setOtpModal({ isOpen: false, _id: "", email: "" })}
          onVerified={(data) => {
            if (data?.token) {
              localStorage.setItem("token", data.token);
            }

            localStorage.removeItem("guest_session_id");

            handleAuthSuccess({
              id: data?.user?._id,
              userId: data?.user?.userId,
              firstName: data?.user?.firstName || "",
              lastName: data?.user?.lastName || "",
              name:
                `${data?.user?.firstName || ""} ${data?.user?.lastName || ""}`.trim() ||
                "User",
              email: data?.user?.email || "",
              role: data?.user?.role,
              phoneNumber: data?.user?.phoneNumber || "",
              companyName: data?.user?.companyName || "",
              companyDescription: data?.user?.companyDescription || "",
              location: data?.user?.location || { city: "", country: "" },
            });

            setOtpModal({ isOpen: false, _id: "", email: "" });

            if (data?.user?.role === "company") {
              router.push("/company/dashboard");
            } else {
              router.push("/candidate/dashboard");
            }
          }}
        />
      )}

      {settingsModalOpen && (
        <SettingsModal
          isOpen={settingsModalOpen}
          user={user}
          onClose={() => setSettingsModalOpen(false)}
          onUserUpdated={(updatedUser) => {
            setUser(updatedUser);
            setSettingsModalOpen(false);
          }}
        />
      )}
    </>
  );
};

export default Header;