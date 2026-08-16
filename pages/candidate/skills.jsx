import axios from "axios";
import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout/Layout";
import { url } from "../../utils/constant";

import {
  FiAlertCircle,
  FiAward,
  FiBookOpen,
  FiCheckCircle,
  FiCode,
  FiInbox,
  FiLayers,
  FiLoader,
  FiRefreshCw,
  FiUser,
} from "react-icons/fi";

const Skills = () => {
  const [skills, setSkills] = useState([]);
  const [education, setEducation] = useState([]);
  const [qualifications, setQualifications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  const fetchProfileDetails = async () => {
    try {
      setLoading(true);
      setProfileError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setProfileError(
          "Please sign in to view your CV profile."
        );
        return;
      }

      const response = await axios.get(
        `${url}/skills/my-skills`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSkills(
        Array.isArray(response.data?.skills)
          ? response.data.skills
          : []
      );

      setEducation(
        Array.isArray(response.data?.education)
          ? response.data.education
          : []
      );

      setQualifications(
        Array.isArray(response.data?.qualifications)
          ? response.data.qualifications
          : []
      );
    } catch (error) {
      console.error("Failed to load CV profile:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      setSkills([]);
      setEducation([]);
      setQualifications([]);

      setProfileError(
        error.response?.data?.message ||
          "We could not load your CV profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileDetails();
  }, []);

  const totalProfileItems =
    skills.length +
    education.length +
    qualifications.length;

  return (
    <Layout>
      <main className="min-h-screen pb-12 pt-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-950/10">
            {/* Page heading */}
            <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 p-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-600/20">
                    <FiUser
                      aria-hidden="true"
                      size={24}
                    />
                  </div>

                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                      My CV Profile
                    </h1>

                    <p className="mt-1 text-sm text-slate-600">
                      Skills, education and qualifications
                      extracted from your latest CV.
                    </p>
                  </div>
                </div>

                <div className="flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
                  <FiLayers
                    aria-hidden="true"
                    className="text-blue-700"
                    size={16}
                  />

                  <span>
                    {totalProfileItems}{" "}
                    {totalProfileItems === 1
                      ? "profile item"
                      : "profile items"}
                  </span>
                </div>
              </div>
            </div>

            {/* Page content */}
            <div className="p-6">
              {loading ? (
                /* Loading state */
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                    <FiLoader
                      aria-hidden="true"
                      className="animate-spin"
                      size={27}
                    />
                  </div>

                  <p className="mt-4 text-sm font-medium text-slate-600">
                    Loading your CV profile...
                  </p>
                </div>
              ) : profileError ? (
                /* Error state */
                <div className="flex flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50 py-12 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
                    <FiAlertCircle
                      aria-hidden="true"
                      size={27}
                    />
                  </div>

                  <h2 className="mt-4 font-semibold text-red-800">
                    Unable to load your profile
                  </h2>

                  <p className="mt-1 text-sm text-red-600">
                    {profileError}
                  </p>

                  <button
                    type="button"
                    onClick={fetchProfileDetails}
                    className="mt-5 flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                  >
                    <FiRefreshCw
                      aria-hidden="true"
                      size={15}
                    />

                    Try Again
                  </button>
                </div>
              ) : (
                <div className="grid gap-5 lg:grid-cols-2">
                  {/* Skills */}
                  <Section
                    title="Skills"
                    description="Technical and professional abilities detected in your CV."
                    items={skills}
                    emptyText="No skills have been detected yet."
                    icon={
                      <FiCode
                        aria-hidden="true"
                        size={21}
                      />
                    }
                    iconClass="bg-blue-100 text-blue-700"
                    borderClass="border-l-blue-500"
                    tagClass="border-blue-100 bg-blue-50 text-blue-700"
                    className="lg:col-span-2"
                    layout="chips"
                  />

                  {/* Education */}
                  <Section
                    title="Education"
                    description="Your academic background and completed studies."
                    items={education}
                    emptyText="No education details have been detected yet."
                    icon={
                      <FiBookOpen
                        aria-hidden="true"
                        size={21}
                      />
                    }
                    iconClass="bg-emerald-100 text-emerald-700"
                    borderClass="border-l-emerald-500"
                    className=""
                    layout="list"
                  />

                  {/* Qualifications */}
                  <Section
                    title="Qualifications and Certificates"
                    description="Professional certificates and additional qualifications."
                    items={qualifications}
                    emptyText="No qualifications have been detected yet."
                    icon={
                      <FiAward
                        aria-hidden="true"
                        size={21}
                      />
                    }
                    iconClass="bg-purple-100 text-purple-700"
                    borderClass="border-l-purple-500"
                    className=""
                    layout="list"
                  />
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
};

const Section = ({
  title,
  description,
  items,
  emptyText,
  icon,
  iconClass,
  borderClass,
  tagClass = "",
  className = "",
  layout = "chips",
}) => {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <article
      className={`group rounded-xl border border-l-4 border-slate-200 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg ${borderClass} ${className}`}
    >
      {/* Section heading */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105 ${iconClass}`}
          >
            {icon}
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              {title}
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              {description}
            </p>
          </div>
        </div>

        <span className="flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 px-2 text-xs font-bold text-slate-600">
          {safeItems.length}
        </span>
      </div>

      {safeItems.length === 0 ? (
        /* Empty section */
        <div className="mt-5 flex items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
          <FiInbox
            aria-hidden="true"
            className="shrink-0 text-slate-400"
            size={20}
          />

          <p className="text-sm text-slate-500">
            {emptyText}
          </p>
        </div>
      ) : layout === "chips" ? (
        /* Skill tags */
        <div className="mt-5 flex flex-wrap gap-2">
          {safeItems.map((item, index) => (
            <span
              key={`${String(item)}-${index}`}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${tagClass}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />

              {String(item)}
            </span>
          ))}
        </div>
      ) : (
        /* Education and qualification lists */
        <div className="mt-5 space-y-2">
          {safeItems.map((item, index) => (
            <div
              key={`${String(item)}-${index}`}
              className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3"
            >
              <FiCheckCircle
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-emerald-600"
                size={16}
              />

              <span className="text-sm leading-5 text-slate-700">
                {String(item)}
              </span>
            </div>
          ))}
        </div>
      )}
    </article>
  );
};

export default Skills;