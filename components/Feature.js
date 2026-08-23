import Image from "next/image";
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import getScrollAnimation from "../utils/getScrollAnimation";
import ScrollAnimationWrapper from "./Layout/ScrollAnimationWrapper";
import { FiCheckCircle } from "react-icons/fi";

const featureContent = {
  candidate: {
    title: "Powerful Features for Smarter CV Analysis",
    description:
      "Improve your CV, understand your strengths, and discover suitable jobs with AI-powered insights.",
    imageAlt: "AI-powered CV analysis",
    features: [
      "Upload your CV securely.",
      "Extract skills, education, and experience.",
      "Identify missing skills and receive improvement tips.",
      "Discover jobs that match your profile.",
    ],
  },

  company: {
    title: "Powerful Features for Smarter Recruitment",
    description:
      "Post jobs, review applications, and identify suitable candidates faster with AI-powered CV insights.",
    imageAlt: "AI-powered candidate recruitment",
    features: [
      "Post and manage job vacancies.",
      "Review candidate CVs and applications.",
      "Compare matched and missing skills using AI insights.",
      "Shortlist suitable candidates using match scores.",
    ],
  },
};

const Feature = ({ guestView = "candidate" }) => {
  const scrollAnimation = useMemo(() => getScrollAnimation(), []);

  const content =
    featureContent[guestView] || featureContent.candidate;
  return (
    <div
      className="max-w-screen-xl mt-1 mb-6 sm:mt-1 sm:mb-4 px-6 sm:px-8 lg:px-16 mx-auto"
      // style={{border:"1px solid red"}}
      id="feature"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-8 my-5 items-center"
      //style={{border:"1px solid red"}}
      >

        <ScrollAnimationWrapper className="flex w-full justify-center lg:justify-end">
          <div className="relative w-full max-w-[560px]">
            {/* Large soft blue glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 h-[95%] w-[95%] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(96, 165, 250, 0.32) 0%, rgba(191, 219, 254, 0.24) 46%, rgba(239, 246, 255, 0) 73%)",
                filter: "blur(20px)",
              }}
            />

            {/* Smaller cyan highlight */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-[8%] left-[10%] h-32 w-48 rounded-full bg-sky-300/20 blur-3xl"
            />

            {/* Feature illustration */}
            <motion.div
              className="relative z-10 mx-auto w-full max-w-[508px] p-4 drop-shadow-[0_24px_35px_rgba(37,99,235,0.12)]"
              variants={scrollAnimation}
            >
              <Image
                src="/assets/Illustration2.png"
                alt={content.imageAlt}
                layout="responsive"
                quality={100}
                height={414}
                width={508}
              />
            </motion.div>
          </div>
        </ScrollAnimationWrapper>

        <ScrollAnimationWrapper className="flex w-full justify-center lg:justify-end">
          <motion.div
            className="flex flex-col items-center text-center lg:items-start lg:text-left justify-center w-full max-w-[520px]"
            variants={scrollAnimation}
          >
            <h1 className="text-3xl lg:text-4xl font-bold leading-relaxed">
              {content.title}
            </h1>

            <p className="my-2 max-w-[620px] text-slate-600">
              {content.description}
            </p>



            <ul className="mt-5 space-y-3 text-left mx-auto lg:mx-0">
              {content.features.map((feature, index) => (<motion.li
                className="flex items-start gap-3"
                custom={{ duration: 2 + index }}
                variants={scrollAnimation}
                key={feature}
                whileHover={{
                  scale: 1.05,
                  transition: {
                    duration: 0.2,
                  },
                }}
              >
                <FiCheckCircle className="text-green-500 text-xl mt-1 flex-shrink-0" />
                <span >{feature}</span>
              </motion.li>
              ))}
            </ul>
          </motion.div>
        </ScrollAnimationWrapper>
      </div>
    </div>
  );
};

export default Feature;