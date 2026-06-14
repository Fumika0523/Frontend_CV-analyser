import axios from "axios";
import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout/Layout";

const Skills = () => {
  const [skills, setSkills] = useState([]);
  const [education, setEducation] = useState([]);
  const [qualifications, setQualifications] = useState([]);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get("http://localhost:8002/skills/my-skills", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setSkills(res.data.skills || []);
        setEducation(res.data.education || []);
        setQualifications(res.data.qualifications || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchSkills();
  }, []);

  return (
    <Layout>
      <div className="bg-slate-50 py-10 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">
              My CV Profile
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Skills, education, and qualifications extracted from your latest CV.
            </p>
          </div>

          <div className="grid gap-6">
            <Section title="Skills" items={skills} emptyText="No skills found yet." />

            <Section
              title="Education"
              items={education}
              emptyText="No education details found yet."
            />

            <Section
              title="Qualifications / Certificates"
              items={qualifications}
              emptyText="No qualifications found yet."
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

const Section = ({ title, items, emptyText }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <h2 className="text-lg font-bold text-slate-900 mb-4">{title}</h2>

      {items.length === 0 ? (
        <p className="text-sm text-slate-400">{emptyText}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span
              key={index}
              className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100"
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default Skills;