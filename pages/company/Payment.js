// import React, { useState } from "react";
// import { useRouter } from "next/router";
// import { toast } from "react-toastify";
// import PricingCard from "../../components/Pricing/PricingCard";
// import Layout from "../../components/Layout/Layout";
// import { url } from "../../utils/constant";

// const recruiterPlans = [
//   {
//     id: "company-single",
//     title: "Single Job",
//     description: "Suitable for employers making an occasional hire.",
//     price: "£39",
//     period: "job",
//     buttonLabel: "Post One Job",
//     features: [
//       "1 job post",
//       "Advert live for 30 days",
//       "AI candidate matching",
//       "Applicant management",
//       "Platform messaging",
//     ],
//   },
//   {
//     id: "company-starter",
//     title: "Starter",
//     description: "For small companies with regular hiring needs.",
//     price: "£79",
//     period: "month",
//     buttonLabel: "Choose Starter",
//     features: [
//       "Up to 10 job posts per month",
//       "AI candidate recommendations",
//       "Applicant status management",
//       "Candidate match scores",
//       "Platform messaging",
//       "Company dashboard",
//     ],
//   },
//   {
//     id: "company-growth",
//     title: "Growth",
//     description: "For recruiters and growing hiring teams.",
//     price: "£149",
//     period: "month",
//     buttonLabel: "Choose Growth",
//     featured: true,
//     features: [
//       "Up to 30 job posts per month",
//       "Everything in Starter",
//       "Priority job visibility",
//       "Advanced candidate matching",
//       "Team applicant management",
//       "Priority support",
//     ],
//   },
//   {
//     id: "company-unlimited-yearly",
//     title: "Unlimited",
//     description: "Annual hiring access for high-volume recruitment.",
//     price: "£999",
//     period: "year",
//     buttonLabel: "Choose Annual",
//     features: [
//       "Unlimited job posts",
//       "12 months of access",
//       "Everything in Growth",
//       "Employer branding tools",
//       "Priority candidate matching",
//       "Fair-use policy applies",
//     ],
//   },
// ];

// const CompanyPayment = () => {
//   const router = useRouter();
//   const [loadingPlan, setLoadingPlan] = useState(null);

//   const handleCheckout = async (planId) => {
//     try {
//       setLoadingPlan(planId);

//       const token = localStorage.getItem("token");

//       if (!token) {
//         toast.info("Please sign in before purchasing a plan");
//         router.push("/");
//         return;
//       }

//       const response = await fetch(
//         `${url}/api/create-checkout-session`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({
//             planId,
//             customerType: "company",
//           }),
//         }
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(
//           data.message || "Unable to start checkout"
//         );
//       }

//       if (!data.url) {
//         throw new Error("Checkout URL was not returned");
//       }

//       window.location.href = data.url;
//     } catch (error) {
//       console.error("Company checkout error:", error);
//       toast.error(error.message || "Payment could not be started");
//     } finally {
//       setLoadingPlan(null);
//     }
//   };

//   return (
//     <Layout>
//       <main className="min-h-screen bg-slate-50 px-4 pb-20 pt-28 sm:px-6 lg:px-8">
//         <section className="mx-auto max-w-7xl">
//           <div className="mx-auto max-w-3xl text-center">
//             <span className="rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700">
//               Recruiter Pricing
//             </span>

//             <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
//               Hire suitable candidates without expensive agency fees
//             </h1>

//             <p className="mt-5 text-base leading-7 sm:text-lg">
//               Publish jobs, receive matched candidates and manage
//               every application from one secure hiring dashboard.
//             </p>
//           </div>

//           <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
//             {recruiterPlans.map((plan) => (
//               <PricingCard
//                 key={plan.id}
//                 {...plan}
//                 buttonLabel={
//                   loadingPlan === plan.id
//                     ? "Opening checkout..."
//                     : plan.buttonLabel
//                 }
//                 onSelect={() => handleCheckout(plan.id)}
//               />
//             ))}
//           </div>

//           <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2">
//             <div className="rounded-2xl border border-slate-200 bg-white p-6">
//               <h2 className="font-bold text-slate-900">
//                 Candidate privacy
//               </h2>

//               <p className="mt-2 text-sm leading-6 text-slate-600">
//                 Candidate email addresses, telephone numbers and other
//                 personal contact information are hidden. Communication
//                 takes place through the SkillfulJobs.ai messaging
//                 system.
//               </p>
//             </div>

//             <div className="rounded-2xl border border-slate-200 bg-white p-6">
//               <h2 className="font-bold text-slate-900">
//                 Better candidate matching
//               </h2>

//               <p className="mt-2 text-sm leading-6 text-slate-600">
//                 Candidate recommendations are based on job skills and
//                 location, with transparent matched skills, missing
//                 skills and an overall match score.
//               </p>
//             </div>
//           </div>

//           <p className="mt-8 text-center text-xs text-slate-500">
//             Prices exclude VAT where applicable. Introductory pricing
//             may change before the official launch.
//           </p>
//         </section>
//       </main>
//     </Layout>
//   );
// };

// export default CompanyPayment;