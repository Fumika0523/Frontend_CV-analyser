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
    // Check whether the selected plan is the free candidate plan.
    if (planId === "candidate-free") {
      // Redirect the user to the Latest Jobs page.
      router.push("/candidate/Dashboard/LatestJobs");

      // Stop the function here because the free plan does not need Stripe.
      return;
    }

    try {
      // Save the selected plan ID in state.
      // This allows the button text to change to "Opening checkout...".
      setLoadingPlan(planId);

      // Get the logged-in user's JWT token from localStorage.
      const token = localStorage.getItem("token");

      // Check whether the user is not logged in.
      if (!token) {
        // Show an informational message to the user.
        toast.info("Please sign in before selecting a plan");

        // Redirect the user to the homepage.
        router.push("/");

        // Stop the function because checkout requires authentication.
        return;
      }

      console.log("Selected checkout plan:", {
      planId,
      customerType: "candidate",
    });

      // Send a request to the backend to create a Stripe Checkout session.
      // const response = await fetch(
      //   // Build the complete backend endpoint URL.
      //   `${url}/api/create-checkout-session`,

      //   // Configuration for the HTTP request.
      //   {
      //     // Use POST because we are creating a new checkout session.
      //     method: "POST",

      //     // Send information about the request in the headers.
      //     headers: {
      //       // Tell the backend that the request body contains JSON.
      //       "Content-Type": "application/json",

      //       // Send the JWT token so the backend can identify the user.
      //       Authorization: `Bearer ${token}`,
      //     },

      //     // Convert the JavaScript object into a JSON string.
      //     body: JSON.stringify({
      //       // Send the selected pricing plan ID.
      //       planId,

      //       // Tell the backend that this checkout is for a candidate.
      //       customerType: "candidate",
      //     }),
      //   }
      // );

      // Convert the backend JSON response into a JavaScript object.
      const data = await response.json();

      // Print the returned payment data in the browser console for testing.
      console.log("data from payment", data);

      // Check whether the backend returned an unsuccessful HTTP response.
      if (!response.ok) {
        // Stop the current process and send the error to the catch block.
        throw new Error(
          // Use the backend error message when available.
          data.message || "Unable to start checkout"
        );
      }

      // Check whether the backend forgot to return the Stripe checkout URL.
      if (!data.url) {
        // Stop the process because the browser cannot redirect without a URL.
        throw new Error("Checkout URL was not returned");
      }

      // Redirect the browser to the Stripe-hosted checkout page.
      window.location.href = data.url;
    } catch (error) {
      // Print the complete checkout error in the browser console.
      console.error("Candidate checkout error:", error);

      // Show the error message to the user.
      toast.error(
        // Use the actual error message when available.
        error.message || "Payment could not be started"
      );
    } finally {
      // Clear the loading state whether checkout succeeds or fails.
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