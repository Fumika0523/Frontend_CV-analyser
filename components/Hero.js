import React, { useMemo } from "react";
import Image from "next/image";
import ButtonPrimary from "./misc/ButtonPrimary";
import { motion } from "framer-motion";
import getScrollAnimation from "../utils/getScrollAnimation";
import ScrollAnimationWrapper from "./Layout/ScrollAnimationWrapper";
import { FaFileUpload, FaBrain, FaChartBar } from "react-icons/fa";

const listUser = [
  {
    name: "Resume Uploads",
    number: "500",
    icon: <FaFileUpload className="text-blue-600 text-2xl" />,
  },
  {
    name: "Skills Analysed",
    number: "120",
    icon: <FaBrain className="text-blue-500 text-2xl" />,
  },
  {
    name: "AI Reports",
    number: "300",
    icon: <FaChartBar className="text-blue-600 text-2xl" />,
  },
],

 Hero = ({

}) => {
  const scrollAnimation = useMemo(() => getScrollAnimation(), []);

  return (
    <div className="max-w-screen-xl mt-24 px-8 xl:px-16 mx-auto" id="about">
      <ScrollAnimationWrapper>
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-6 lg:py-16 items-center"
          variants={scrollAnimation}
        >
          <div className="flex flex-col justify-center items-center text-center lg:items-start lg:text-left order-2 lg:order-1">
            <h1 className="text-2xl lg:text-3xl xl:text-4xl font-medium text-black-600 leading-normal">
              Analyse your CV smarter with <strong>SkillfulJobs</strong>.
            </h1>

            <p className="text-black-500 mt-4 mb-6 max-w-[560px]">
              Upload your resume and get AI-powered insights including extracted
              skills, missing skills, job role recommendations, and improvement
              tips to help you pass ATS screening and improve your job
              applications.
            </p>

            <ButtonPrimary className="group">
            <span className="flex items-center gap-2 font-medium">
              <FaFileUpload className="text-lg transition-transform duration-300 group-hover:-translate-y-1" />
              Upload CV
            </span>
          </ButtonPrimary>
          </div>

          <div className="flex w-full justify-center order-1 lg:order-2">
            <motion.div
              className="w-full max-w-[612px]"
              variants={scrollAnimation}
            >
              <Image
                src="/assets/Illustration1.png"
                alt="CV Analyser Illustration"
                quality={100}
                width={612}
                height={383}
                layout="responsive"
              />
            </motion.div>
          </div>
        </motion.div>
      </ScrollAnimationWrapper>

      <div className="relative w-full flex">
      <ScrollAnimationWrapper className="rounded-xl w-full grid grid-cols-1 sm:grid-cols-3 py-9 divide-y-2 sm:divide-y-0 sm:divide-x-2 divide-gray-100 bg-white z-10 shadow-[0_30px_80px_rgba(13,16,37,0.08)]">
          {listUser.map((listUsers, index) => (
            <motion.div
              className="flex items-center justify-center py-4 sm:py-6 px-4"
              key={index}
              custom={{ duration: 2 + index }}
              variants={scrollAnimation}
            >
              <div className="flex items-center justify-center w-full sm:w-auto">
                <div className="flex items-center justify-center bg-sky-100 w-12 h-12 mr-6 rounded-full">
                 {listUsers.icon}
                </div>

                <div className="flex flex-col">
                  <p className="text-xl text-black-600 font-bold">
                    {listUsers.number}+
                  </p>
                  <p className="text-lg text-black-500">{listUsers.name}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </ScrollAnimationWrapper>

        <div
          className="absolute bg-black-600 opacity-5 w-11/12 rounded-lg h-64 sm:h-48 top-0 mt-8 mx-auto left-0 right-0"
          style={{ filter: "blur(114px)" }}
        ></div>
      </div>
    </div>
  );
};

export default Hero;