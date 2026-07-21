import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  FaFacebook,
  FaTwitter,
  FaLinkedin,
} from "react-icons/fa";

const Footer = () => {
  const [userRole, setUserRole] = useState(null);

  const linkClass =
    "block cursor-pointer transition-colors duration-200 hover:text-blue-700";

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const token = localStorage.getItem("token");

        // No token means the visitor is a guest.
        if (!token) {
          setUserRole(null);
          return;
        }

        const response = await axios.get(
          "http://localhost:8002/user-profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUserRole(response.data.user?.role || null);
      } catch (error) {
        console.error(
          "Failed to load footer user role:",
          error.response?.data || error.message
        );

        // Treat the visitor as a guest if the profile request fails.
        setUserRole(null);
      }
    };

    fetchUserRole();
  }, []);

  // Guests see candidate links.
  // Logged-in candidates also see candidate links.
  const showCandidateLinks =
    !userRole || userRole === "candidate";

  // Guests see employer links.
  // Logged-in companies also see employer links.
  const showEmployerLinks =
    !userRole || userRole === "company";

  return (
    <footer className="border-t border-blue-100 bg-slate-50 py-9">
      <div
        className={`mx-auto grid w-full max-w-screen-xl gap-10 px-6 pb-14 sm:px-8 lg:px-16 lg:pb-0 ${
          userRole
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        }`}
      >
        {/* Brand */}
        <div className="flex flex-col">
          <Link href="/">
            <a className="text-xl font-bold tracking-tight text-blue-800 transition-colors hover:text-blue-600">
              SkillfulJobs.ai
            </a>
          </Link>

          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">
            AI-powered platform for smarter hiring and career
            opportunities.
          </p>

          <div className="mt-5 flex items-center gap-3">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Visit our Facebook page"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-blue-700 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-700 hover:bg-blue-700 hover:text-white"
            >
              <FaFacebook fontSize={19} />
            </a>

            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Visit our Twitter page"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-blue-700 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-700 hover:bg-blue-700 hover:text-white"
            >
              <FaTwitter fontSize={18} />
            </a>

            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Visit our LinkedIn page"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-blue-700 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-700 hover:bg-blue-700 hover:text-white"
            >
              <FaLinkedin fontSize={19} />
            </a>
          </div>

          <p className="mt-5 text-sm leading-5 text-slate-400">
            © {new Date().getFullYear()} SkillfulJobs.ai.
            <br />
            All rights reserved.
          </p>
        </div>

        {/* Candidate links */}
        {showCandidateLinks && (
          <div className="flex flex-col">
            <p className="mb-4 text-lg font-semibold text-slate-900">
              For Candidates
            </p>

            <ul className="space-y-2.5 text-sm text-slate-600">
              <li>
                <Link href="/candidate/Dashboard/LatestJobs">
                  <a className={linkClass}>Browse Jobs</a>
                </Link>
              </li>

              <li>
                <Link href="/candidate/viewMyCVs">
                  <a className={linkClass}>Upload CV</a>
                </Link>
              </li>

              <li>
                <Link href="/candidate/Dashboard/MyApplication/MyApplicationPage">
                  <a className={linkClass}>
                    Application Tracker
                  </a>
                </Link>
              </li>

              <li>
                <Link href="/candidate/Payment">
                  <a className={linkClass}>Candidate Pricing</a>
                </Link>
              </li>
            </ul>
          </div>
        )}

        {/* Employer links */}
        {showEmployerLinks && (
          <div className="flex flex-col">
            <p className="mb-4 text-lg font-semibold text-slate-900">
              For Employers
            </p>

            <ul className="space-y-2.5 text-sm text-slate-600">
              <li>
                <Link href="/company/Dashboard/postjob">
                  <a className={linkClass}>Post a Job</a>
                </Link>
              </li>

              <li>
                <Link href="/company/Dashboard/Applicants/ApplicantsPage">
                  <a className={linkClass}>
                    Manage Candidates
                  </a>
                </Link>
              </li>

              <li>
                <Link href="/company/dashboard">
                  <a className={linkClass}>
                    Recruitment Dashboard
                  </a>
                </Link>
              </li>

              <li>
                <Link href="/company/Payment">
                  <a className={linkClass}>
                    Recruiter Pricing
                  </a>
                </Link>
              </li>
            </ul>
          </div>
        )}

        {/* Support */}
        <div className="flex flex-col">
          <p className="mb-4 text-lg font-semibold text-slate-900">
            Support
          </p>

          <ul className="space-y-2.5 text-sm text-slate-600">
            <li>
              <Link href="/contact">
                <a className={linkClass}>Contact Us</a>
              </Link>
            </li>

            <li>
              <Link href="/privacy">
                <a className={linkClass}>Privacy Policy</a>
              </Link>
            </li>

            <li>
              <Link href="/terms">
                <a className={linkClass}>
                  Terms & Conditions
                </a>
              </Link>
            </li>

            <li>
              <Link href="/faq">
                <a className={linkClass}>FAQ</a>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;