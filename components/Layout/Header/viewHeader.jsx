import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import axios from "axios";

import AuthModal from "../../Auth/authModal/authModal";
import OtpModal from "../../Auth/otpModal";
import SettingsModal from "../../Auth/settingsModal";
import ButtonPrimary from "../../misc/ButtonPrimary";
import {
  FaHome,
  FaBriefcase,
  FaFileAlt,
  FaSearch,
  FaUsers,
  FaBuilding,
  FaSignInAlt ,
  FaUserPlus ,
  FaUser,
  FaCog,
  FaSignOutAlt ,
  FaClipboardList,
  FaTachometerAlt,
  FaUserTie,
} from "react-icons/fa";

import { NAV_GUEST, NAV_CANDIDATE, NAV_COMPANY } from "./headerData";

const EMPTY_SET_GUEST_VIEW = () => {};

/* ---------------------------------------------------------------- */
/* Small nav-item subcomponents                                     */
/*                                                                    */
/* These exist purely to avoid writing the same map() JSX four       */
/* times (desktop user / desktop guest / mobile user / mobile        */
/* guest). Markup and classNames are unchanged from before.          */
/* ---------------------------------------------------------------- */

const DesktopUserLink = ({ item, activeLink }) => {
  const router = useRouter();
  const Icon = item.icon;
  const isActive = router.asPath === item.href;

  return (
    <li>
      <Link href={item.href}>
        <a
          className={`group mx-1 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
            activeLink === item.id
              ? "bg-blue-50 text-blue-900"
              : "text-slate-600 hover:bg-sky-100/40 hover:text-slate-900"
          }`}
        >
          <Icon
            aria-hidden="true"
            className={`h-5 w-5 transition-colors ${
              isActive ? "text-sky-500" : "text-blue-700 group-hover:text-sky-500"
            }`}
          />
          {item.label}
        </a>
      </Link>
    </li>
  );
};

const DesktopGuestButton = ({ item, activeLink, onSelect }) => {
  const Icon = item.icon;
  const isActive = activeLink === item.id;

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(item.id)}
        className={`group mx-1 inline-flex items-center gap-1 rounded-lg bg-transparent px-3 py-2 text-sm font-medium transition-all duration-200 ${
          isActive
            ? "bg-blue-50 text-blue-900"
            : "text-slate-600 hover:bg-sky-100/80 hover:text-slate-900"
        }`}
      >
        <Icon
          aria-hidden="true"
          className={`h-5 w-5 transition-colors ${
            isActive ? "text-sky-600" : "text-blue-700 group-hover:text-blue-400"
          }`}
        />
        {item.label}
      </button>
    </li>
  );
};

const MobileUserLink = ({ item }) => {
  const router = useRouter();
  const Icon = item.icon;
  const isActive = router.asPath === item.href;

  return (
    <li>
      <Link href={item.href}>
        <a
          className={`flex min-w-[78px] shrink-0 flex-col items-center border-t-2 px-2 py-2 text-xs transition ${
            isActive
              ? "border-blue-700 text-blue-700"
              : "border-transparent text-sky-600 hover:border-blue-700 hover:text-sky-600"
          }`}
        >
          <Icon className="mb-0.5 h-5 w-5 text-blue-900" />
          <span className="whitespace-nowrap">{item.label}</span>
        </a>
      </Link>
    </li>
  );
};

const MobileGuestButton = ({ item, activeLink, onSelect }) => {
  const Icon = item.icon;
  const isActive = activeLink === item.id;

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(item.id)}
        className={`mx-1 flex min-w-[70px] flex-col items-center border-t-2 bg-transparent px-2 py-2 text-xs transition ${
          isActive
            ? "border-blue-700 text-blue-700"
            : "border-transparent text-slate-600 hover:border-blue-700 hover:text-blue-700"
        }`}
      >
        <Icon className="mb-0.5 h-5 w-5" />
        <span>{item.label}</span>
      </button>
    </li>
  );
};

/* ---------------------------------------------------------------- */
/* Header                                                            */
/* ---------------------------------------------------------------- */

const viewHeader = ({ guestView = "candidate", setGuestView = EMPTY_SET_GUEST_VIEW }) => {
  const router = useRouter();

  const [activeLink, setActiveLink] = useState(null);
  const [scrollActive, setScrollActive] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);

  /* Controls the Sign In / Sign Up modal. */
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: "signin" });

  /* Controls the OTP verification modal. */
  const [otpModal, setOtpModal] = useState({ isOpen: false, _id: "", email: "" });

  /* Nav links for the current logged-in account type. */
  const navLinks = user ? (user.role === "company" ? NAV_COMPANY : NAV_CANDIDATE) : [];

  /* Initials shown inside the user avatar. */
  const initials = user
    ? (
        `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}` ||
        user.name?.slice(0, 2) ||
        "U"
      ).toUpperCase()
    : "";

  /* Converts the backend user shape into what this Header uses. */
  const normaliseUser = (userData) => {
    if (!userData) return null;

    return {
      id: userData._id || userData.id,
      userId: userData.userId,
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      name:
        `${userData.firstName || ""} ${userData.lastName || ""}`.trim() ||
        userData.name ||
        "User",
      email: userData.email || "",
      role: userData.role,
      phoneNumber: userData.phoneNumber || "",
      companyName: userData.companyName || "",
      companyDescription: userData.companyDescription || "",
      location: userData.location || { city: "", country: "" },
    };
  };

  /* Runs when AuthModal successfully signs in an existing user. */
  const handleAuthSuccess = (userData) => {
    const authenticatedUser = normaliseUser(userData);
    if (!authenticatedUser) return;

    setUser(authenticatedUser);
    setGuestView(authenticatedUser.role === "company" ? "company" : "candidate");
  };

  /* Runs when signup or sign-in requires OTP verification. */
  const handleOtpSent = (data) => {
    const mongoId = data?._id;

    if (!mongoId) {
      console.error("OTP modal cannot open because _id is missing:", data);
      return;
    }

    setAuthModal({ isOpen: false, mode: "signin" });
    setOtpModal({ isOpen: true, _id: mongoId, email: data.email || "" });
  };

  /* Clears the auth token and returns the user to the homepage. */
  const handleLogout = async () => {
    localStorage.removeItem("token");

    setUser(null);
    setDropdownOpen(false);
    setGuestView("candidate");

    await router.push("/");
  };

  /*
   * Scrolls to a homepage section. If the user is already on the
   * homepage it scrolls directly; otherwise it navigates to the
   * homepage using the section hash first.
   */
  const handleHomepageSectionClick = async (sectionId) => {
    setActiveLink(sectionId);

    if (router.pathname === "/") {
      const section = document.getElementById(sectionId);

      if (!section) {
        console.warn(`Homepage section with id "${sectionId}" was not found.`);
        return;
      }

      section.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    await router.push(`/#${sectionId}`);
  };

  /* Adds a small Header shadow after the page is scrolled. */
  useEffect(() => {
    const handleScroll = () => setScrollActive(window.scrollY > 20);

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Closes the account dropdown when the user clicks elsewhere. */
  useEffect(() => {
    const closeDropdown = () => setDropdownOpen(false);

    if (dropdownOpen) {
      document.addEventListener("click", closeDropdown);
    }

    return () => document.removeEventListener("click", closeDropdown);
  }, [dropdownOpen]);

  /*
   * When navigating to /#pricing, /#feature, etc., scroll to the
   * correct section once the page has finished loading.
   */
  useEffect(() => {
    const scrollToHashSection = () => {
      if (router.pathname !== "/") return;

      const hash = window.location.hash.replace("#", "");
      if (!hash) return;

      /* Small delay lets the homepage components finish rendering. */
      window.setTimeout(() => {
        const section = document.getElementById(hash);

        if (section) {
          section.scrollIntoView({ behavior: "smooth", block: "start" });
          setActiveLink(hash);
        }
      }, 100);
    };

    scrollToHashSection();
    router.events.on("routeChangeComplete", scrollToHashSection);

    return () => router.events.off("routeChangeComplete", scrollToHashSection);
  }, [router.pathname, router.events]);

  /* Loads the logged-in user when the Header first mounts. */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setUser(null);
          return;
        }

        const response = await axios.get("http://localhost:8002/user-profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const fetchedUser = normaliseUser(response.data.user);

        if (!fetchedUser) {
          setUser(null);
          return;
        }

        setUser(fetchedUser);
        setGuestView(fetchedUser.role === "company" ? "company" : "candidate");
      } catch (error) {
        console.error("Failed to fetch user:", error.response?.data || error.message);

        const status = error.response?.status;
        const message = error.response?.data?.message;
        const tokenErrors = ["jwt expired", "invalid token", "Invalid token"];

        if (status === 401 && tokenErrors.includes(message)) {
          localStorage.removeItem("token");
          setUser(null);
        }
      }
    };

    fetchUser();
  }, [setGuestView]);

  return (
    <>
      {/* Desktop header */}
      <header
        className={`fixed top-0 z-30 w-full border-b transition-all duration-300 ${
          scrollActive
            ? "border-slate-200/80 bg-white/95 shadow-[0_8px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl"
            : "border-transparent bg-transparent shadow-none"
        }`}
      >
        <nav className="mx-auto grid max-w-screen-xl grid-flow-col items-center px-6 py-3 sm:px-8 sm:py-4 lg:px-16">
          {/* Logo */}
          <Link href="/">
            <a className="col-start-1 col-end-2 flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-700 to-sky-400 text-white shadow-sm">
                <FaBriefcase aria-hidden="true" size={17} />
              </span>
              <span className="text-xl font-bold tracking-tight text-[#0f2f68]">
                SkillfulJobs<span className="text-blue-600">.ai</span>
              </span>
            </a>
          </Link>

          {/* Desktop navigation */}
          <ul className="col-start-4 col-end-8 hidden items-center text-slate-200 lg:flex">
            {user
              ? navLinks.map((item) => (
                  <DesktopUserLink key={item.href} item={item} activeLink={activeLink} />
                ))
              : NAV_GUEST.map((item) => (
                  <DesktopGuestButton
                    key={item.id}
                    item={item}
                    activeLink={activeLink}
                    onSelect={handleHomepageSectionClick}
                  />
                ))}
          </ul>

          {/* Authentication and account area */}
          <div className="col-start-10 col-end-12 flex items-center justify-end gap-3 font-medium">
            {user ? (
              <div className="relative flex items-center gap-3">
                {/* Current account role */}
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
                    user.role === "company"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-blue-200 bg-blue-50 text-blue-700"
                  }`}
                >
                  {user.role === "company" ? (
                    <>
                      <FaBuilding aria-hidden="true" />
                      Company
                    </>
                  ) : (
                    <>
                      <FaUser aria-hidden="true" />
                      Candidate
                    </>
                  )}
                </span>

                {/* Account avatar and dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    aria-label="Open account menu"
                    onClick={(event) => {
                      event.stopPropagation();
                      setDropdownOpen((previous) => !previous);
                    }}
                    className="flex h-[34px] w-[34px] items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-blue-900 to-sky-500 text-xs font-bold text-white shadow-[0_0_0_2px_#0f172a] transition hover:shadow-[0_0_0_3px_#1d4ed8]"
                  >
                    {initials}
                  </button>

              {dropdownOpen && (
  <div
    onClick={(event) => event.stopPropagation()}
    className="
      absolute right-0 top-[calc(100%+10px)] z-50
      min-w-[190px]
      rounded-xl
      border border-blue-100
      bg-white
      p-2
      shadow-[0_12px_30px_rgba(15,47,104,0.12)]
    "
  >
    {user.role === "candidate" && (
      <Link href="/candidate/viewMyCVs">
        <a
          className="
            flex w-full items-center gap-3
            rounded-lg px-3.5 py-2.5
            text-left text-sm font-medium text-slate-700
            transition-all duration-200
            hover:bg-blue-50 hover:text-blue-700
          "
        >
          <FaFileAlt className="text-blue-600" />
          My CV
        </a>
      </Link>
    )}

    <button
      type="button"
      onClick={() => {
        setSettingsModalOpen(true);
        setDropdownOpen(false);
      }}
      className="
        flex w-full items-center gap-3
        rounded-lg px-3.5 py-2.5
        text-left text-sm font-medium text-slate-700
        transition-all duration-200
        hover:bg-blue-50 hover:text-blue-700
      "
    >
      <FaCog className="text-blue-600" />
      Settings
    </button>

    <div className="my-1.5 border-t border-blue-100" />

    <button
      type="button"
      onClick={handleLogout}
      className="
        flex w-full items-center gap-3
        rounded-lg px-3.5 py-2.5
        text-left text-sm font-medium text-slate-700
        transition-all duration-200
        hover:bg-red-50 hover:text-red-600
      "
    >
      <FaSignOutAlt className="text-red-500" />
      Sign Out
    </button>
  </div>
)}
                </div>
              </div>
            ) : (
              <>
                {/* Candidate/company guest view toggle */}
                <button
                  type="button"
                  onClick={() =>
                    setGuestView(guestView === "candidate" ? "company" : "candidate")
                  }
                  className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100"
                >
                  <span className="text-lg md:hidden">
                    {guestView === "candidate" ? <FaBuilding /> : <FaUser />}
                  </span>

                  <span className="hidden items-center gap-2 md:flex">
                    {guestView === "candidate" ? (
                      <>
                        <FaBuilding className="text-lg" />
                        Recruiting? Post a job
                      </>
                    ) : (
                      <>
                        <FaUser className="text-lg" />
                        Apply for new job
                      </>
                    )}
                  </span>
                </button>

                {/* Sign In */}
                <button
                  type="button"
                  onClick={() => setAuthModal({ isOpen: true, mode: "signin" })}
                  className="mx-2 cursor-pointer text-slate-600 transition hover:text-blue-800 sm:mx-4"
                >
                  <span className="inline text-lg md:hidden">
                    <FaSignInAlt />
                  </span>
                  <span className="hidden md:inline">Sign In</span>
                </button>

                {/* Sign Up */}
                <ButtonPrimary onClick={() => setAuthModal({ isOpen: true, mode: "signup" })}>
                  <span className="inline text-lg md:hidden">
                    <FaUserPlus />
                  </span>
                  <span className="hidden md:inline">Sign Up</span>
                </ButtonPrimary>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white shadow-lg lg:hidden">
        <div className="px-2 sm:px-6">
          <ul className="flex w-full items-center justify-around overflow-x-auto text-slate-600">
            {user
              ? navLinks.map((item) => <MobileUserLink key={item.href} item={item} />)
              : NAV_GUEST.map((item) => (
                  <MobileGuestButton
                    key={item.id}
                    item={item}
                    activeLink={activeLink}
                    onSelect={handleHomepageSectionClick}
                  />
                ))}
          </ul>
        </div>
      </nav>

      {/* Authentication modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        initialMode={authModal.mode}
        initialRole={guestView}
        onClose={() => setAuthModal({ isOpen: false, mode: "signin" })}
        onAuthSuccess={handleAuthSuccess}
        onOtpSent={handleOtpSent}
      />

      {/* OTP verification modal */}
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

            const verifiedUser = normaliseUser(data?.user);
            if (verifiedUser) handleAuthSuccess(verifiedUser);

            setOtpModal({ isOpen: false, _id: "", email: "" });

            router.push(
              verifiedUser?.role === "company" ? "/company/dashboard" : "/candidate/dashboard"
            );
          }}
        />
      )}

      {/* Account settings modal */}
      {settingsModalOpen && (
        <SettingsModal
          isOpen={settingsModalOpen}
          user={user}
          onClose={() => setSettingsModalOpen(false)}
          onUserUpdated={(updatedUser) => {
            setUser(normaliseUser(updatedUser));
            setSettingsModalOpen(false);
          }}
        />
      )}
    </>
  );
};

export default viewHeader;