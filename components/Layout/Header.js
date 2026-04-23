import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Link as LinkScroll } from "react-scroll";
import ButtonOutline from "../misc/ButtonOutline.";
import LogoVPN from "../../public/assets/Logo.svg";
import AuthModal from "../Auth/authModal";
import OtpModal from "../Auth/otpModal";

const NAV_GUEST = [
  { id:"about",     label:"About" },
  { id:"feature",   label:"Feature" },
  { id:"pricing",   label:"Pricing" },
  { id:"testimoni", label:"Testimonial" },
];
const NAV_CANDIDATE = [
  // { label:"Dashboard",       href:"/candidate/dashboard" },
  { label:"Latest Jobs",     href:"/candidate/jobs" },
  { label:"My Applications", href:"/candidate/applications" },
  { label:"Search for job",     href:"/candidate/search-job" },
];
const NAV_COMPANY = [
  // { label:"Dashboard",  href:"/company/dashboard" },
  { label:"Posted Jobs", href:"/company/posted-job" },
  { label:"Selected Candidates", href:"/company/selected-candidates" },
  { label:"Post a new job",  href:"/company/post-job" },
];

const HEADER_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=DM+Sans:wght@400;500&display=swap');
  @keyframes hdFadeIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
  .hd-avatar {
    width:34px;height:34px;border-radius:50%;
    background:linear-gradient(135deg,#f97316,#ea580c);
    color:#fff;font-weight:700;font-size:13px;font-family:'Sora',sans-serif;
    display:flex;align-items:center;justify-content:center;
    cursor:pointer;border:2px solid #fff;box-shadow:0 0 0 2px #f97316;
    transition:box-shadow .2s;user-select:none;
  }
  .hd-avatar:hover{box-shadow:0 0 0 3px #f97316;}
  .hd-dropdown {
    position:absolute;top:calc(100% + 8px);right:0;min-width:170px;
    background:#fff;border:1px solid #e5e7eb;border-radius:12px;
    box-shadow:0 8px 24px rgba(0,0,0,.10);padding:6px;z-index:100;
    animation:hdFadeIn .15s ease;
  }
  .hd-ditem {
    display:block;width:100%;padding:9px 14px;border-radius:8px;font-size:13px;
    font-family:'DM Sans',sans-serif;color:#374151;background:none;border:none;
    cursor:pointer;text-align:left;text-decoration:none;transition:background .15s;white-space:nowrap;
  }
  .hd-ditem:hover{background:#fff7ed;color:#f97316;}
  .hd-ditem.danger:hover{background:#fff1f2;color:#e11d48;}
  .hd-pill{font-size:11px;font-weight:700;font-family:'Sora',sans-serif;padding:3px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:.05em;}
`;

const Header = () => {
  const [activeLink,   setActiveLink]   = useState(null);
  const [scrollActive, setScrollActive] = useState(false);
  const [otpModal, setOtpModal] = useState({
  isOpen: false,
  userId: "",
  email: "",
});
  const [authModal, setAuthModal] = useState({
  isOpen: false,
  mode: "", 
});

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user,         setUser]         = useState(null);

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

  const handleAuthSuccess = ({ name, role }) => setUser({ name, role });
  const handleLogout = () => { localStorage.removeItem("token"); setUser(null); setDropdownOpen(false); };

  const navLinks  = user ? (user.role === "company" ? NAV_COMPANY : NAV_CANDIDATE) : null;
  const initials  = user ? user.name.slice(0,2).toUpperCase() : "";
  const pillStyle = user?.role === "company"
    ? { background:"#eff6ff", color:"#2563eb", border:"1px solid #bfdbfe" }
    : { background:"#fff7ed", color:"#ea580c", border:"1px solid #fed7aa" };



    return (
    <>
      <style>{HEADER_STYLES}</style>

      <header className={"fixed top-0 w-full z-30 bg-white transition-all " + (scrollActive ? "shadow-md pt-0" : "pt-4")}>
        <nav className="max-w-screen-xl px-6 sm:px-8 lg:px-16 mx-auto grid grid-flow-col py-3 sm:py-4">
          <div className="col-start-1 col-end-2 flex items-center">
            <LogoVPN className="h-8 w-auto" />
          </div>

          <ul className="hidden lg:flex col-start-4 col-end-8 text-black-500 items-center">
            {user ? (
              navLinks.map((item) => (
                <Link key={item.href} href={item.href}>
                  <a className="px-4 py-2 mx-2 text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors">{item.label}</a>
                </Link>
              ))
            ) : (
              NAV_GUEST.map(({ id, label }) => (
                <LinkScroll key={id} activeClass="active" to={id} spy smooth duration={1000}
                  onSetActive={() => setActiveLink(id)}
                  className={"px-4 py-2 mx-2 cursor-pointer animation-hover inline-block relative " +
                    (activeLink === id ? "text-orange-500 animation-active" : "text-black-500 hover:text-orange-500")}>
                  {label}
                </LinkScroll>
              ))
            )}
          </ul>

          <div className="col-start-10 col-end-12 font-medium flex justify-end items-center gap-3">
            {user ? (
              <div style={{ display:"flex", alignItems:"center", gap:10, position:"relative" }}>
                <span className="hd-pill" style={pillStyle}>
                  {user.role === "company" ? "🏢 Company" : "👤 Candidate"}
                </span>
                <div style={{ position:"relative" }}>
                  <div className="hd-avatar" onClick={(e) => { e.stopPropagation(); setDropdownOpen(v => !v); }}>
                    {initials}
                  </div>
                  {dropdownOpen && (
                    <div className="hd-dropdown">
                      <div style={{ padding:"8px 14px 10px", borderBottom:"1px solid #f3f4f6", marginBottom:4 }}>
                        <p style={{ fontSize:13, fontWeight:700, color:"#111827", fontFamily:"'Sora',sans-serif" }}>{user.name}</p>
                        <p style={{ fontSize:11.5, color:"#9ca3af", marginTop:1 }}>{user.role === "company" ? "Company account" : "Candidate account"}</p>
                      </div>
                      {/* <Link href={user.role === "company" ? "/company/dashboard" : "/candidate/dashboard"}><a className="hd-ditem">📊 Dashboard</a></Link> */}
                      {user.role === "candidate" && <Link href="/candidate/cv"><a className="hd-ditem">📄 CV Analyser</a></Link>}
                      <Link href={user.role === "company" ? "/company/settings" : "/candidate/settings"}><a className="hd-ditem">⚙️ Settings</a></Link>
                      <div style={{ borderTop:"1px solid #f3f4f6", margin:"4px 0" }} />
                      <button className="hd-ditem danger" onClick={handleLogout}>🚪 Sign Out</button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
               <a
                onClick={() => setAuthModal({ isOpen: true, mode: "signin" })}
                className="cursor-pointer text-black-600 mx-2 sm:mx-4 hover:text-orange-500"
              >
                Sign In
              </a>
            <button
              onClick={() => setAuthModal({ isOpen: true, mode: "signup" })}
              className="font-medium tracking-wide py-2 px-5 sm:px-8 border border-orange-500 text-orange-500 bg-white-500 outline-none rounded-l-full rounded-r-full capitalize hover:bg-orange-500 hover:text-white-500 transition-all hover:shadow-orange ">
              Sign Up
            </button>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Mobile Nav */}
      <nav className="fixed lg:hidden bottom-0 left-0 right-0 z-20 px-4 sm:px-8 shadow-t">
        <div className="bg-white-500 sm:px-3">
          <ul className="flex w-full justify-between items-center text-black-500">
            {user ? (
              navLinks.slice(0,4).map((item) => (
                <Link key={item.href} href={item.href}>
                  <a className="mx-1 sm:mx-2 px-3 sm:px-4 py-2 flex flex-col items-center text-xs border-t-2 border-transparent hover:border-orange-500 hover:text-orange-500 transition-all">
                    <svg className="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                    </svg>
                    {item.label}
                  </a>
                </Link>
              ))
            ) : (
              NAV_GUEST.map(({ id, label }) => (
                <LinkScroll key={id} activeClass="active" to={id} spy smooth duration={1000}
                  onSetActive={() => setActiveLink(id)}
                  className={"mx-1 sm:mx-2 px-3 sm:px-4 py-2 flex flex-col items-center text-xs border-t-2 transition-all " +
                    (activeLink === id ? "border-orange-500 text-orange-500" : "border-transparent")}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {id==="about"     && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>}
                    {id==="feature"   && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>}
                    {id==="pricing"   && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>}
                    {id==="testimoni" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>}
                  </svg>
                  {label}
                </LinkScroll>
              ))
            )}
          </ul>
        </div>
      </nav>
{authModal.isOpen && (
  <AuthModal
    isOpen={authModal.isOpen}
    initialMode={authModal.mode}
    onClose={() => setAuthModal({ isOpen: false, mode: "signin" })}
    onAuthSuccess={handleAuthSuccess}
    onOtpSent={({ userId, email }) => {
      setAuthModal({ isOpen: false, mode: "signin" });
      setOtpModal({
        isOpen: true,
        userId,
        email,
      });
    }}
  />
)}

{otpModal.isOpen && (
  <OtpModal
    isOpen={otpModal.isOpen}
    userId={otpModal.userId}
    email={otpModal.email}
    onClose={() =>
      setOtpModal({
        isOpen: false,
        userId: "",
        email: "",
      })
    }
    onVerified={(data) => {
      if (data?.token) {
        localStorage.setItem("token", data.token);
      }

      handleAuthSuccess({
        name: data?.user?.name || "User",
        role: data?.user?.role,
      });

      setOtpModal({
        isOpen: false,
        userId: "",
        email: "",
      });
    }}
  />
)}
    </>
  );
};

export default Header;