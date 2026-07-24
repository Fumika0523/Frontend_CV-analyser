import React, { useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import PricingCard from "../../components/Pricing/PricingCard";
import Layout from "../../components/Layout/Layout";
import { url } from "../../utils/constant";

const candidatePlans = [
  {
    id: "candidate-free",
    title: "Free",
    description: "Explore SkillfulJobs.ai and submit your first applications.",
    price: "£0",
    period: "",
    buttonLabel: "Current Free Plan",
    features: [
      "3 job applications",
      "Upload and store your CV",
      "Automatic skills extraction",
      "Job recommendations",
      "Private candidate profile",
    ],
  },
  {
    id: "candidate-monthly",
    title: "Premium Monthly",
    description: "For candidates actively searching for their next role.",
    price: "£7.99",
    period: "month",
    buttonLabel: "Choose Monthly",
    featured: true,
    features: [
      "Unlimited job applications",
      "Advanced job matching",
      "Detailed match scores",
      "Matched and missing skills",
      "Application status tracking",
      "Private platform messaging",
      "Priority access to new jobs",
    ],
  },
  {
    id: "candidate-yearly",
    title: "Premium Yearly",
    description: "The best value for a longer-term job search.",
    price: "£69.99",
    period: "year",
    buttonLabel: "Choose Yearly",
    features: [
      "Everything in Premium Monthly",
      "Unlimited job applications",
      "Save approximately £26 per year",
      "Future premium features included",
      "Priority customer support",
    ],
  },
];

const CandidatePayment = () => {
  // Gives access to Next.js navigation methods such as router.push().
  const router = useRouter();

  // Stores the ID of the plan currently being processed.
  // null means that no checkout request is currently running.
  const [loadingPlan, setLoadingPlan] = useState(null);

  // Runs when the user clicks one of the pricing plan buttons.
  // planId tells us which plan the user selected.
const handleCheckout = async (planId) => {
  // The free plan does not need Stripe checkout.
  if (planId === "candidate-free") {
    router.push("/candidate/Dashboard/LatestJobs");
    return;
  }

  try {
    // Show the loading label on the selected plan.
    setLoadingPlan(planId);

    // Read the user's JWT token.
    const token = localStorage.getItem("token");

    // Checkout is only available to logged-in users.
    if (!token) {
      toast.info("Please sign in before selecting a plan");
      router.push("/");
      return;
    }

    console.log("Selected checkout plan:", {
      planId,
      customerType: "candidate",
    });

    // Send the selected plan to the backend.
    const response = await fetch(
      `${url}/api/create-checkout-session`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          planId,
          customerType: "candidate",
        }),
      }
    );

    // Safely convert the backend response into JSON.
    const data = await response.json();

    console.log("Data from payment:", data);

    // Handle unsuccessful backend responses.
    if (!response.ok) {
      throw new Error(
        data.message ||
          data.error ||
          "Unable to start checkout"
      );
    }

    // Stripe must return a Checkout URL.
    if (!data.url) {
      throw new Error("Checkout URL was not returned");
    }

    // Send the user to the Stripe Checkout page.
    window.location.href = data.url;
  } catch (error) {
    console.error("Candidate checkout error:", error);

    toast.error(
      error.message || "Payment could not be started"
    );
  } finally {
    // Restore the normal button label after failure.
    setLoadingPlan(null);
  }
};

  return (
    <Layout>
      <main className="min-h-screen bg-slate-50 px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Find the right job while keeping your details private
            </h1>

            <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">
              Start with three free applications. Upgrade when you need
              unlimited applications and advanced matching tools.
            </p>
          </div>

          <div className="mt-14 grid gap-16 md:grid-cols-3">
            {/* Loop through every candidate pricing plan. */}
            {candidatePlans.map((plan) => (
              <PricingCard
                // Gives React a unique key for each pricing card.
                key={plan.id}

                // Passes all properties from the plan object to PricingCard.
                // This includes title, price, features, featured, and others.
                {...plan}

                // Change the selected button text while checkout is loading.
                buttonLabel={
                  // Check whether this card is the plan currently loading.
                  loadingPlan === plan.id
                    ? "Opening checkout..."
                    : plan.buttonLabel
                }

                // Run handleCheckout with this plan's ID when selected.
                onSelect={() => handleCheckout(plan.id)}
              />
            ))}
          </div>

          <div className="mx-auto mt-12 max-w-4xl rounded-2xl border border-blue-100 bg-blue-50 p-6">
            <h2 className="font-bold text-slate-900">
              Your privacy matters
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Personal contact details can be hidden from the CV shown to
              recruiters. Recruiters communicate with you through
              SkillfulJobs.ai, helping reduce unwanted contact and keeping
              your information private.
            </p>
          </div>

          <p className="mt-8 text-center text-xs text-slate-500">
            Prices are introductory and may change before the official launch.
            Subscriptions can be cancelled before renewal.
          </p>
        </section>
      </main>
    </Layout>
  );
};

export default CandidatePayment;