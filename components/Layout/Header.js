import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Link as LinkScroll } from "react-scroll";
import ButtonOutline from "../misc/ButtonOutline.";
import LogoVPN from "../../public/assets/Logo.svg";
import AuthModal from "../Auth/authModal";
import OtpModal from "../Auth/otpModal";
import axios from "axios";
import SettingsModal from "../Auth/settingsModal";
import ButtonPrimary from "../misc/ButtonPrimary";
import {
  FiInfo, FiStar, FiCreditCard,
  FiMessageCircle, FiGrid, FiBriefcase,
  FiFileText, FiSearch, FiUsers, FiPlusCircle,
} from "react-icons/fi";

const NAV_GUEST = [
  { id: "about", label: "About", icon: FiInfo },
  { id: "feature", label: "Feature", icon: FiStar },
  { id: "pricing", label: "Pricing", icon: FiCreditCard },
  { id: "testimoni", label: "Testimonial", icon: FiMessageCircle },
];

const NAV_CANDIDATE = [
  { label: "Dashboard", href: "/candidate/dashboard", icon: FiGrid },
  { label: "Latest Jobs", href: "/candidate/jobs", icon: FiBriefcase },
  { label: "My Application", href: "/candidate/applications", icon: FiFileText },
  { label: "Search for job", href: "/candidate/search-job", icon: FiSearch },
];


const NAV_COMPANY = [
  { label: "Dashboard", href: "/company/dashboard", icon: FiGrid },
  { label: "Posted Jobs", href: "/company/posted-job", icon: FiBriefcase },
  { label: "Selected Candidates", href: "/company/selected-candidates", icon: FiUsers },
  { label: "Post a new job", href: "/company/post-job", icon: FiPlusCircle },
];

const HEADER_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=DM+Sans:wght@400;500&display=swap');

  @keyframes hdFadeIn {
    from { opacity:0; transform:translateY(-6px); }
    to { opacity:1; transform:translateY(0); }
  }

  .hd-nav-link {
    color:navy;
  }
  .hd-nav-link svg {
    color:#1e3a8a;
  }
  .hd-nav-link:hover {
    color:#1d4ed8;
  }
  .hd-nav-link:hover svg {
    color:#1d4ed8;
  }

  .hd-avatar {
    width:34px;height:34px;border-radius:50%;
    background:linear-gradient(135deg,#0f172a,#1d4ed8);
    color:#fff;font-weight:700;font-size:13px;font-family:'Sora',sans-serif;
    display:flex;align-items:center;justify-content:center;
    cursor:pointer;border:2px solid #fff;
    box-shadow:0 0 0 2px #0f172a;
    transition:box-shadow .2s;
  }
  .hd-avatar:hover {
    box-shadow:0 0 0 3px #1d4ed8;
  }

  .hd-dropdown {
    position:absolute;top:calc(100% + 8px);right:0;min-width:170px;
    background:#ffffff;
    border:1px solid #e2e8f0;
    border-radius:12px;
    box-shadow:0 8px 24px rgba(15,23,42,.08);
    padding:6px;
    z-index:100;
    animation:hdFadeIn .15s ease;
  }

  .hd-ditem {
    display:block;width:100%;
    padding:9px 14px;
    border-radius:8px;
    font-size:13px;
    font-family:'DM Sans',sans-serif;
    color:#1e293b;
    background:none;
    border:none;
    cursor:pointer;
    text-align:left;
    transition:background .15s;
  }
  .hd-ditem:hover {
    background:#f1f5f9;
    color:#1d4ed8;
  }
  .hd-ditem.danger:hover {
    background:#fff1f2;
    color:#e11d48;
  }

  .hd-pill {
    font-size:11px;
    font-weight:700;
    font-family:'Sora',sans-serif;
    padding:3px 10px;
    border-radius:20px;
    text-transform:uppercase;
    letter-spacing:.05em;
  }
`;

const Header = () => {
 // console.log("HEADER IS RENDERING");
  const [activeLink, setActiveLink] = useState(null);
  const [scrollActive, setScrollActive] = useState(false);

  const [otpModal, setOtpModal] = useState({
  isOpen: false,
  userId: "",
  email: "",
});

useEffect(() => {
  console.log("OTP MODAL STATE CHANGED:", otpModal);
}, [otpModal]);

  const [authModal, setAuthModal] = useState({
    isOpen: false,
    mode: "",
  });


const handleOtpSent = ({ userId, email }) => {
  console.log("HANDLE OTP SENT CALLED:", userId, email);

  setAuthModal({ isOpen: false, mode: "signin" });
  setOtpModal({ isOpen: true, userId, email });
};

  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrollActive(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const close = () => setDropdownOpen(false);
    if (dropdownOpen) document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [dropdownOpen]);

  const handleAuthSuccess = (userData) => setUser(userData);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setDropdownOpen(false);
  };

  const navLinks = user ? (user.role === "company" ? NAV_COMPANY : NAV_CANDIDATE) : null;
  const initials = user ? user.name.slice(0, 2).toUpperCase() : "";

  const pillStyle = user?.role === "company"
    ? { background: "#eff6ff", color: "#1d4ed8", border: "1px solid #dbeafe" }
    : { background: "#f1f5f9", color: "#0f172a", border: "1px solid #e2e8f0" };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get("http://localhost:8002/api/users/user-profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const fetchedUser = res.data.user;
        setUser({
          id: fetchedUser._id,
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
        console.error("Failed to fetch user:", error);
        localStorage.removeItem("token");
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  return (
    <>
      <style>{HEADER_STYLES}</style>

      <header
        className={
          "fixed top-0 w-full z-30 bg-white/95 backdrop-blur-md transition-all " +
          (scrollActive ? "shadow-sm pt-0" : "pt-4")
        }
      >
        <nav className="max-w-screen-xl px-6 sm:px-8 lg:px-16 mx-auto grid grid-flow-col py-3 sm:py-4">

          <div className="col-start-1 col-end-2 flex items-center text-blue-700 font-bold tracking-tight">
            CV-Analyser
          </div>

          <ul className="hidden lg:flex col-start-4 col-end-8 text-blue-600 items-center">
            {user ? (
              navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <a className="hd-nav-link px-4 py-2 mx-2 text-sm font-medium transition-colors items-center gap-2 animation-hover inline-flex relative">
                      <Icon className="text-base" />
                      {item.label}
                    </a>
                  </Link>
                );
              })
            ) : (
              NAV_GUEST.map(({ id, label, icon: Icon }) => (
                <LinkScroll
                  key={id}
                  activeClass="active"
                  to={id}
                  spy
                  smooth
                  duration={1000}
                  onSetActive={() => setActiveLink(id)}
                  className={
                    "hd-nav-link px-4 py-2 mx-2 cursor-pointer animation-hover inline-flex items-center gap-2 relative " +
                    (activeLink === id ? "text-blue-600 animation-active" : "")
                  }
                >
                  <Icon className="text-base" />
                  {label}
                </LinkScroll>
              ))
            )}
          </ul>

          <div className="col-start-10 col-end-12 font-medium flex justify-end items-center gap-3">
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
                <span className="hd-pill" style={pillStyle}>
                  {user.role === "company" ? "🏢 Company" : "👤 Candidate"}
                </span>
                <div style={{ position: "relative" }}>
                  <div
                    className="hd-avatar"
                    onClick={(e) => { e.stopPropagation(); setDropdownOpen(v => !v); }}
                  >
                    {initials}
                  </div>
                  {dropdownOpen && (
                    <div className="hd-dropdown">
                      {user.role === "candidate" && (
                        <Link href="/candidate/cv">
                          <a className="hd-ditem">📄 CV Analyser</a>
                        </Link>
                      )}
                      <button
                        className="hd-ditem"
                        onClick={() => { setSettingsModalOpen(true); setDropdownOpen(false); }}
                      >
                        ⚙️ Settings
                      </button>
                      <div style={{ borderTop: "1px solid #dbeafe", margin: "4px 0" }} />
                      <button className="hd-ditem danger" onClick={handleLogout}>
                        🚪 Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
              <a
                  onClick={() => setAuthModal({ isOpen: true, mode: "signin" })}
                  className="cursor-pointer mx-2 sm:mx-4 transition-colors"
                  style={{ color: "#475569" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#1d4ed8")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#475569")}
                >
                  Sign In
                </a>
                <ButtonPrimary onClick={() => setAuthModal({ isOpen: true, mode: "signup" })}>
                  Sign Up
                </ButtonPrimary>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Mobile Nav */}
      <nav className="fixed lg:hidden bottom-0 left-0 right-0 z-20 px-4 sm:px-8 shadow-t">
        <div className="bg-white sm:px-3">
          <ul className="flex w-full justify-between items-center text-slate-600">
            {user ? (
              navLinks.slice(0, 4).map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <a className="mx-1 sm:mx-2 px-3 sm:px-4 py-2 flex flex-col items-center text-xs border-t-2 border-transparent hover:border-blue-700 hover:text-blue-700 transition-all">
                      <Icon className="w-6 h-6 mb-0.5 text-blue-900" />
                      {item.label}
                    </a>
                  </Link>
                );
              })
            ) : (
              NAV_GUEST.map(({ id, label, icon: Icon }) => (
                <LinkScroll
                  key={id}
                  activeClass="active"
                  to={id}
                  spy
                  smooth
                  duration={1000}
                  onSetActive={() => setActiveLink(id)}
                  className={
                    "mx-1 sm:mx-2 px-3 sm:px-4 py-2 flex flex-col items-center text-xs border-t-2 transition-all " +
                    (activeLink === id
                      ? "border-blue-700 text-blue-700"
                      : "border-transparent text-slate-600 hover:border-blue-700 hover:text-blue-700")
                  }
                >
                  <Icon className="w-6 h-6 mb-0.5 text-blue-900" />
                  {label}
                </LinkScroll>
              ))
            )}
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
          userId={otpModal.userId}
          email={otpModal.email}
          onClose={() => setOtpModal({ isOpen: false, userId: "", email: "" })}
          onVerified={(data) => {
            if (data?.token) localStorage.setItem("token", data.token);
            handleAuthSuccess({
              id: data?.user?.id,
              firstName: data?.user?.firstName || "",
              lastName: data?.user?.lastName || "",
              name: data?.user?.name || "User",
              email: data?.user?.email || "",
              role: data?.user?.role,
              phoneNumber: data?.user?.phoneNumber || "",
              companyName: data?.user?.companyName || "",
              companyDescription: data?.user?.companyDescription || "",
              location: data?.user?.location || { city: "", country: "" },
            });
            setOtpModal({ isOpen: false, userId: "", email: "" });
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