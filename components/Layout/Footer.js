import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

import {
  FaFacebook,
  FaTwitter,
  FaLinkedin,
} from "react-icons/fa";

import { FiBriefcase } from "react-icons/fi";
import { url } from "../../utils/constant";

const FooterLink = ({ href, children }) => {
  return (
    <li>
      <Link href={href}>
        <a className="group inline-flex items-center gap-2 text-sm text-slate-600 transition-colors duration-200 hover:text-blue-700">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400 transition-colors group-hover:bg-emerald-500" />

          {children}
        </a>
      </Link>
    </li>
  );
};

const Footer = () => {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setUserRole(null);
          return;
        }

        const response = await axios.get(
          `${url}/user-profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUserRole(
          response.data.user?.role || null
        );
      } catch (error) {
        console.error(
          "Failed to load footer user role:",
          error.response?.data || error.message
        );

        setUserRole(null);
      }
    };

    fetchUserRole();
  }, []);

  const showCandidateLinks =
    !userRole || userRole === "candidate";

  const showEmployerLinks =
    !userRole || userRole === "company";

  const socialLinks = [
    {
      href: "https://facebook.com",
      label: "Visit our Facebook page",
      Icon: FaFacebook,
    },
    {
      href: "https://twitter.com",
      label: "Visit our Twitter page",
      Icon: FaTwitter,
    },
    {
      href: "https://linkedin.com",
      label: "Visit our LinkedIn page",
      Icon: FaLinkedin,
    },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-slate-200 bg-gradient-to-b from-white/70 to-blue-50/90">
      {/* Top accent line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

      {/* Subtle background glows */}
      <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl" />

      <div className="pointer-events-none absolute -right-24 top-16 h-64 w-64 rounded-full bg-sky-200/30 blur-3xl" />

      <div className="relative mx-auto w-full max-w-screen-xl px-6 sm:px-8 lg:px-16">
        {/* Main footer content */}
        <div
          className={`grid grid-cols-1 gap-8 py-10 text-left sm:grid-cols-2 sm:justify-items-center sm:gap-10 sm:py-12 ${
            userRole
              ? "lg:grid-cols-3"
              : "lg:grid-cols-4"
          }`}
        >
          {/* Brand */}
          <div className="flex w-full flex-col text-left sm:col-span-2 sm:max-w-xs lg:col-span-1">
            <Link href="/">
              <a className="flex w-fit items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-700 to-sky-400 text-white shadow-sm">
                  <FiBriefcase
                    aria-hidden="true"
                    size={19}
                  />
                </span>

                <span className="text-xl font-bold tracking-tight text-[#0f2f68]">
                  SkillfulJobs
                  <span className="text-blue-600">
                    .ai
                  </span>
                </span>
              </a>
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-600">
              An AI-powered platform for smarter hiring,
              stronger CVs and better career opportunities.
            </p>

            {/* Social media */}
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map(
                ({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-blue-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500 hover:bg-blue-600 hover:text-white hover:shadow-md"
                  >
                    <Icon
                      aria-hidden="true"
                      size={18}
                    />
                  </a>
                )
              )}
            </div>
          </div>

          {/* Candidate links */}
          {showCandidateLinks && (
            <div className="flex w-full flex-col text-left sm:max-w-[220px]">
              <div className="mb-3">
                <span className="mb-2 block h-1 w-8 rounded-full bg-gradient-to-r from-blue-700 to-sky-400" />

                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  For Candidates
                </h2>
              </div>

              <ul className="space-y-2">
                <FooterLink href="/candidate/Dashboard/LatestJobs">
                  Browse Jobs
                </FooterLink>

                <FooterLink href="/candidate/viewMyCVs">
                  Upload CV
                </FooterLink>

                <FooterLink href="/candidate/Dashboard/MyApplication/MyApplicationPage">
                  Application Tracker
                </FooterLink>

                <FooterLink href="/candidate/Payment">
                  Candidate Pricing
                </FooterLink>
              </ul>
            </div>
          )}

          {/* Employer links */}
          {showEmployerLinks && (
            <div className="flex w-full flex-col text-left  sm:max-w-[220px]">
              <div className="mb-3">
                <span className="mb-2 block h-1 w-8 rounded-full bg-gradient-to-r from-blue-700 to-sky-400" />

                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  For Employers
                </h2>
              </div>

              <ul className="space-y-2">
                <FooterLink href="/company/Dashboard/PostJob/postJobPage">
                  Post a Job
                </FooterLink>

                <FooterLink href="/company/Dashboard/Applicants/ApplicantsPage">
                  Manage Candidates
                </FooterLink>

                <FooterLink href="/company/dashboard">
                  Recruitment Dashboard
                </FooterLink>

                <FooterLink href="/company/Payment">
                  Recruiter Pricing
                </FooterLink>
              </ul>
            </div>
          )}

          {/* Support */}
          <div
            className={`flex w-full flex-col text-left sm:max-w-[220px] ${
              !userRole
                ? "sm:col-span-2 lg:col-span-1"
                : ""
            }`}
          >
            <div className="mb-3">
              <span className="mb-2 block h-1 w-8 rounded-full bg-gradient-to-r from-blue-700 to-sky-400" />

              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Support
              </h2>
            </div>

            <ul className="space-y-3">
              <FooterLink href="/contact">
                Contact Us
              </FooterLink>

              <FooterLink href="/privacy">
                Privacy Policy
              </FooterLink>

              <FooterLink href="/terms">
                Terms & Conditions
              </FooterLink>

              <FooterLink href="/faq">
                Frequently Asked Questions
              </FooterLink>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 py-6 pb-24 sm:flex-row lg:pb-6">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} SkillfulJobs.ai.
            All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <Link href="/privacy">
              <a className="text-xs text-slate-500 transition-colors hover:text-blue-700">
                Privacy
              </a>
            </Link>

            <Link href="/terms">
              <a className="text-xs text-slate-500 transition-colors hover:text-blue-700">
                Terms
              </a>
            </Link>

            <Link href="/faq">
              <a className="text-xs text-slate-500 transition-colors hover:text-blue-700">
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