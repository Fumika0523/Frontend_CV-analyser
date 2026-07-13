import React from "react";
import Link from "next/link";
import { FaFacebook, FaTwitter, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  const linkClass =
    "hover:text-blue-700 cursor-pointer transition-all block";

  return (
    <footer className="bg-slate-50 border-t border-blue-100 py-10">
      <div className="max-w-screen-xl w-full mx-auto px-6 sm:px-8 lg:px-16 grid grid-cols-12 lg:pb-0 pb-14 gap-10">
        {/* Brand */}
        <div className="col-span-12 lg:col-span-3 flex flex-col">
          <Link href="/">
            <a className="flex items-center text-blue-800 font-bold text-xl tracking-tight">
              SkillfulJobs.ai
            </a>
          </Link>

          <p className="mt-3 text-slate-600 leading-5 max-w-md">
            AI-powered platform for smarter hiring and career opportunities.
          </p>

          <div className="flex items-center gap-4 mt-3">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-11 h-11 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-blue-700 hover:bg-blue-700 hover:text-white hover:-translate-y-1 transition-all duration-200">
              <FaFacebook fontSize={23} />
            </a>

            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-11 h-11 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-blue-700 hover:bg-blue-700 hover:text-white hover:-translate-y-1 transition-all duration-200">
              <FaTwitter fontSize={22} />
            </a>

            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-11 h-11 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-blue-700 hover:bg-blue-700 hover:text-white hover:-translate-y-1 transition-all duration-200">
              <FaLinkedin fontSize={23} />
            </a>
          </div>

          <p className="text-slate-400 text-sm mt-4">
            © {new Date().getFullYear()} SkillfulJobs.ai — All rights reserved.
          </p>
        </div>

        {/* For Candidates */}
        <div className="col-span-6 sm:col-span-4 lg:col-span-3 flex flex-col">
          <p className="text-slate-900 mb-4 font-semibold text-lg">
            For Candidates
          </p>

          <ul className="text-slate-600 space-y-1">
            <li>
              <Link href="/candidate/Dashboard/LatestJobs">
                <a className={linkClass}>Browse Jobs</a>
              </Link>
            </li>

            <li>
              <Link href="/candidate/dashboard">
                <a className={linkClass}>Upload CV</a>
              </Link>
            </li>

            <li>
              <Link href="/candidate/Dashboard/MyApplication/MyApplicationPage">
                <a className={linkClass}>Application Tracker</a>
              </Link>
            </li>

            {/* <li>
              <Link href="/#about">
                <a className={linkClass}>Career Advice</a>
              </Link>
            </li> */}

            {/* <li>
              <Link href="/candidate/skills">
                <a className={linkClass}>AI CV Analysis</a>
              </Link>
            </li> */}
          </ul>
        </div>

        {/* For Employers */}
        <div className="col-span-6 sm:col-span-4 lg:col-span-3 flex flex-col">
          <p className="text-slate-900 mb-4 font-semibold text-lg">
            For Employers
          </p>

          <ul className="text-slate-600 space-y-1">
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

            {/* <li>
              <Link href="/#feature">
                <a className={linkClass}>Hiring Solutions</a>
              </Link>
            </li> */}
{/* 
            <li>
              <Link href="/company/Dashboard/Applicants/ApplicantsPage">
                <a className={linkClass}>Talent Search</a>
              </Link>
            </li> */}
          </ul>
        </div>

        {/* Support */}
        <div className="col-span-12 sm:col-span-4 lg:col-span-3 flex flex-col">
          <p className="text-slate-900 mb-4 font-semibold text-lg">
            Support
          </p>

          <ul className="text-slate-600 space-y-1">
            {/* <li>
              <Link href="/#about">
                <a className={linkClass}>Help Center</a>
              </Link>
            </li> */}

            <li>
              <Link href="/#testimoni">
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
              <Link href="/#feature">
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