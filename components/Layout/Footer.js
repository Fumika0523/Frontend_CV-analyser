import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { FaFacebook, FaTwitter, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  const [userRole, setUserRole] = useState(null);

  const linkClass =
    "block text-sm text-slate-200/80 transition-colors duration-200 hover:text-white";

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
  const showCandidateLinks = !userRole || userRole === "candidate";

  // Guests see employer links.
  // Logged-in companies also see employer links.
  const showEmployerLinks = !userRole || userRole === "company";

  const socialLinks = [
    { href: "https://facebook.com", label: "Visit our Facebook page", Icon: FaFacebook },
    { href: "https://twitter.com", label: "Visit our Twitter page", Icon: FaTwitter },
    { href: "https://linkedin.com", label: "Visit our LinkedIn page", Icon: FaLinkedin },
  ];

  return (
    <footer className="relative border border-red-600">
     
      <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />

      <div className="mx-auto border-4 border-red-300  max-w-screen-xl  sm:px-8 lg:px-16 py-4">
        <div
          className={`grid border-4 border-yellow-300  grid-cols-1 sm:grid-cols-2 ${
            userRole ? "lg:grid-cols-[1.3fr_1fr_1fr_1fr]" : "lg:grid-cols-[1.3fr_1fr_1fr_1fr_1fr]"
          }`}
        >
          {/* Brand */}
          <div className="border-4 border-sky-100 flex flex-col sm:col-span-2 lg:col-span-1">
            <Link href="/">
              <a className="text-xl font-bold tracking-tight text-white transition-colors hover:text-blue-400">
                SkillfulJobs<span className="text-blue-500">.ai</span>
              </a>
            </Link>

            <p className="mt-3 max-w-xs text-sm leading-6 text-slate-200/80">
              AI-powered platform for smarter hiring and career opportunities.
            </p>

            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-600 text-slate-300 transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-800 hover:text-sky-400"
                >
                  <Icon fontSize={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Candidate links */}
          {showCandidateLinks && (
            <div className="flex flex-col">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-100">
                For Candidates
              </p>

              <ul className="space-y-3">
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
                    <a className={linkClass}>Application Tracker</a>
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
              <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-300">
                For Employers
              </p>

              <ul className="space-y-3">
                <li>
                  <Link href="/company/Dashboard/postjob">
                    <a className={linkClass}>Post a Job</a>
                  </Link>
                </li>
                <li>
                  <Link href="/company/Dashboard/Applicants/ApplicantsPage">
                    <a className={linkClass}>Manage Candidates</a>
                  </Link>
                </li>
                <li>
                  <Link href="/company/dashboard">
                    <a className={linkClass}>Recruitment Dashboard</a>
                  </Link>
                </li>
                <li>
                  <Link href="/company/Payment">
                    <a className={linkClass}>Recruiter Pricing</a>
                  </Link>
                </li>
              </ul>
            </div>
          )}

          {/* Support */}
          <div className="border-4 border-yellow-300 flex flex-col">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-100">
              Support
            </p>

            <ul className="space-y-3">
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
                  <a className={linkClass}>Terms & Conditions</a>
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

        {/* Bottom bar */}
        <div className="mt-4 flex flex-col items-center justify-between gap-4 border-t border-slate-200/40 pt-6 sm:flex-row">
          <p className="text-xs text-slate-300">
            © {new Date().getFullYear()} SkillfulJobs.ai. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <Link href="/privacy">
              <a className="text-xs text-slate-300 transition-colors hover:text-slate-100">
                Privacy
              </a>
            </Link>
            <Link href="/terms">
              <a className="text-xs text-slate-300 transition-colors hover:text-slate-100">
                Terms
              </a>
            </Link>
            <Link href="/faq">
              <a className="text-xs text-slate-300 transition-colors hover:text-slate-100">
                FAQ
              </a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;