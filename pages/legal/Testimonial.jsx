import React from "react";
import {
  FiMessageCircle,
  FiStar,
} from "react-icons/fi";

const testimonials = [
  {
    id: 1,
    name: "Sarah Thompson",
    role: "Software Developer",
    message:
      "SkillfulJobs.ai helped me understand which skills were missing from my CV and find roles that matched my experience.",
  },
  {
    id: 2,
    name: "James Wilson",
    role: "Hiring Manager",
    message:
      "The candidate matching tools made it easier to review suitable applicants and manage the recruitment process.",
  },
  {
    id: 3,
    name: "Emily Carter",
    role: "Marketing Candidate",
    message:
      "I liked being able to see matched and missing skills before applying for a role.",
  },
];

const Testimonial = () => {
  return (
    <section
      id="testimonial"
      className="scroll-mt-28 bg-blue-50 px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          {/* <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700">
            <FiMessageCircle />
            Testimonials
          </span> */}

          <h2 className=" text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            What our users say
          </h2>

          <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">
            See how candidates and employers use SkillfulJobs.ai
            to improve their job search and recruitment process.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm"
            >
              <div className="flex gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar
                    key={star}
                    className="fill-current"
                  />
                ))}
              </div>

              <p className="mt-5 text-sm leading-7 text-slate-600">
                “{testimonial.message}”
              </p>

              <div className="mt-6 border-t border-slate-200 pt-5">
                <h3 className="font-bold text-slate-900">
                  {testimonial.name}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {testimonial.role}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonial;