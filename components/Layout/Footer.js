import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faTwitter,
  faInstagram,
  faLinkedinIn,
} from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
  return (
    <footer className="bg-slate-50 border-t border-blue-100 py-10">
      <div className="max-w-screen-xl w-full mx-auto px-6 sm:px-8 lg:px-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10">

        {/* Brand Section */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="flex items-center text-blue-800 font-bold text-2xl tracking-tight">
            SkillfulJobs.ai
          </div>

          <p className="mt-5 text-slate-600 leading-7 max-w-md">
            SkillfulJobs.ai helps candidates discover meaningful career
            opportunities while enabling companies to connect with talented
            professionals faster through AI-powered recruitment tools.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-4 mt-6">

  <a
    href="#"
    className="w-11 h-11 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-blue-700 hover:bg-blue-700 hover:text-white hover:-translate-y-1 transition-all duration-200"
  >
    <FontAwesomeIcon icon={faFacebookF} />
  </a>

  <a
    href="#"
    className="w-11 h-11 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-blue-700 hover:bg-blue-700 hover:text-white hover:-translate-y-1 transition-all duration-200"
  >
    <FontAwesomeIcon icon={faTwitter} />
  </a>

  <a
    href="#"
    className="w-11 h-11 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-blue-700 hover:bg-blue-700 hover:text-white hover:-translate-y-1 transition-all duration-200"
  >
    <FontAwesomeIcon icon={faInstagram} />
  </a>

  <a
    href="#"
    className="w-11 h-11 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-blue-700 hover:bg-blue-700 hover:text-white hover:-translate-y-1 transition-all duration-200"
  >
    <FontAwesomeIcon icon={faLinkedinIn} />
  </a>

</div>

          <p className="text-slate-400 text-sm mt-8">
            © {new Date().getFullYear()} SkillfulJobs.ai — All rights reserved.
          </p>
        </div>

        {/* For Candidates */}
        <div className="lg:col-span-2 lg:col-start-7 flex flex-col">
          <p className="text-slate-900 mb-4 font-semibold text-lg">
            For Candidates
          </p>

          <ul className="text-slate-600 space-y-3">
            <li className="hover:text-blue-700 cursor-pointer transition-all">
              Browse Jobs
            </li>

            <li className="hover:text-blue-700 cursor-pointer transition-all">
              Upload CV
            </li>

            <li className="hover:text-blue-700 cursor-pointer transition-all">
              Application Tracker
            </li>

            <li className="hover:text-blue-700 cursor-pointer transition-all">
              Career Advice
            </li>

            <li className="hover:text-blue-700 cursor-pointer transition-all">
              AI CV Analysis
            </li>
          </ul>
        </div>

        {/* For Employers */}
        <div className="lg:col-span-2 flex flex-col">
          <p className="text-slate-900 mb-4 font-semibold text-lg">
            For Employers
          </p>

          <ul className="text-slate-600 space-y-3">
            <li className="hover:text-blue-700 cursor-pointer transition-all">
              Post a Job
            </li>

            <li className="hover:text-blue-700 cursor-pointer transition-all">
              Manage Candidates
            </li>

            <li className="hover:text-blue-700 cursor-pointer transition-all">
              Recruitment Dashboard
            </li>

            <li className="hover:text-blue-700 cursor-pointer transition-all">
              Hiring Solutions
            </li>

            <li className="hover:text-blue-700 cursor-pointer transition-all">
              Talent Search
            </li>
          </ul>
        </div>

        {/* Support */}
        <div className="lg:col-span-2 flex flex-col">
          <p className="text-slate-900 mb-4 font-semibold text-lg">
            Support
          </p>

          <ul className="text-slate-600 space-y-3">
            <li className="hover:text-blue-700 cursor-pointer transition-all">
              Help Center
            </li>

            <li className="hover:text-blue-700 cursor-pointer transition-all">
              Contact Us
            </li>

            <li className="hover:text-blue-700 cursor-pointer transition-all">
              Privacy Policy
            </li>

            <li className="hover:text-blue-700 cursor-pointer transition-all">
              Terms & Conditions
            </li>

            <li className="hover:text-blue-700 cursor-pointer transition-all">
              FAQ
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;