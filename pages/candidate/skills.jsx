import axios from "axios";
import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout/Layout";

const Skills = () => {
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:8002/skills/my-skills",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("skills response", res.data);

        setSkills(res.data.skills || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchSkills();
  }, []);

  return (
<Layout>
     <div className="bg-slate-50 py-10">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4">My Skills (Need to update design)</h2>

      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <span
            key={index}
            className=" text-sm"
          >
            {skill},
          </span>
        ))}
      </div>
    </div>
            </div>
          </div>   
</Layout>
  );
};

export default Skills;