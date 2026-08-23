import React, { useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import AuthModal from "../Auth//authModal/authModal";
import OtpModal from "../Auth/otpModal";
import {pricingPlans, pricingContent} from './pringData'
import PricingCard from "./PricingCard";
import { url } from "../../utils/constant";



const PricingSection = ({
  guestView = "candidate",
  userData = null,
}) => {
  const router = useRouter();

  const [loadingPlan, setLoadingPlan] =
    useState(null);

  // Stores the plan the guest selected before signing in.
  const [pendingPlanId, setPendingPlanId] =
    useState(null);

  // Controls the Sign In modal.
  const [authOpen, setAuthOpen] =
    useState(false);

  // Controls the OTP modal if the guest switches
  // from Sign In to account registration.
  const [otpModal, setOtpModal] = useState({
    isOpen: false,
    _id: "",
    email: "",
  });

      const expectedRole =
  guestView === "company"
    ? "company"
    : "candidate";

const plans = pricingPlans[expectedRole];
const content = pricingContent[expectedRole];

  /*
   * Starts the selected plan after authentication
   * has already been confirmed.
   */
  const startPlan = async (
    planId,
    signedInRole
  ) => {
    // Prevent a candidate account from purchasing
    // a recruiter plan and vice versa.
    if (
      signedInRole &&
      signedInRole !== expectedRole
    ) {
      toast.error(
        expectedRole === "company"
          ? "Please sign in with a company account to purchase a recruiter plan."
          : "Please sign in with a candidate account to purchase a candidate plan."
      );

      return;
    }

    // The candidate Free plan does not use Stripe.
    if (planId === "candidate-free") {
      router.push(
        "/candidate/Dashboard/LatestJobs"
      );

      return;
    }

    try {
      setLoadingPlan(planId);

      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Your session could not be found. Please sign in again."
        );
      }

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
            customerType: expectedRole,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Unable to start checkout"
        );
      }

      if (!data.url) {
        throw new Error(
          "Checkout URL was not returned"
        );
      }

      window.location.href = data.url;
    } catch (error) {
      console.error(
        "Pricing checkout error:",
        error
      );

      toast.error(
        error.message ||
          "Payment could not be started"
      );
    } finally {
      setLoadingPlan(null);
    }
  };

  /*
   * Runs when any pricing button is clicked.
   */
  const handlePlanSelect = async (planId) => {
    const token =
      localStorage.getItem("token");

    // Instead of redirecting the guest,
    // remember the selected plan and open Sign In.
    if (!token) {
      setPendingPlanId(planId);
      setAuthOpen(true);
      return;
    }

    await startPlan(
      planId,
      userData?.role
    );
  };

  /*
   * Runs after an existing user signs in.
   */
  const handleAuthSuccess = async (
    signedInUser
  ) => {
    const selectedPlan = pendingPlanId;

    setAuthOpen(false);
    setPendingPlanId(null);

    if (!selectedPlan) return;

    await startPlan(
      selectedPlan,
      signedInUser?.role
    );
  };

  /*
   * Runs if the user changes from Sign In to Sign Up
   * and the signup process sends an OTP.
   */
  const handleOtpSent = (data) => {
    const mongoId = data?._id;

    if (!mongoId) {
      toast.error(
        "Unable to open email verification."
      );
      return;
    }

    setAuthOpen(false);

    setOtpModal({
      isOpen: true,
      _id: mongoId,
      email: data.email || "",
    });
  };

  return (
    <>
      <section
        id="pricing"
        className="scroll-mt-16 px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
              {content.title}
            </h1>

            <p className="mt-5 text-base leading-7  sm:text-lg">
              {content.description}
            </p>
          </div>

          <div
            className={`mt-14 grid gap-6 ${
              guestView === "company"
                ? "md:grid-cols-2 xl:grid-cols-4"
                : "md:grid-cols-3"
            }`}
          >
            {plans.map((plan) => (
              <PricingCard
                key={plan.id}
                {...plan}
                buttonLabel={
                  loadingPlan === plan.id
                    ? "Opening checkout..."
                    : plan.buttonLabel
                }
                onSelect={() =>
                  handlePlanSelect(plan.id)
                }
              />
            ))}
          </div>

          <div className="mx-auto mt-12 max-w-4xl rounded-2xl border border-blue-100 bg-blue-50 p-6">
            <h3 className="font-bold text-slate-900">
              {content.noticeTitle}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {content.noticeText}
            </p>
          </div>
        </div>
      </section>

      <AuthModal
        isOpen={authOpen}
        initialMode="signin"
        initialRole={expectedRole}
        onClose={() => {
          setAuthOpen(false);
          setPendingPlanId(null);
        }}
        onAuthSuccess={handleAuthSuccess}
        onOtpSent={handleOtpSent}
      />

      {otpModal.isOpen && (
        <OtpModal
          isOpen={otpModal.isOpen}
          _id={otpModal._id}
          email={otpModal.email}
          onClose={() => {
            setOtpModal({
              isOpen: false,
              _id: "",
              email: "",
            });

            setPendingPlanId(null);
          }}
          onVerified={async (data) => {
            if (data?.token) {
              localStorage.setItem(
                "token",
                data.token
              );
            }

            localStorage.removeItem(
              "guest_session_id"
            );

            const selectedPlan =
              pendingPlanId;

            setOtpModal({
              isOpen: false,
              _id: "",
              email: "",
            });

            setPendingPlanId(null);

            if (!selectedPlan) return;

            await startPlan(
              selectedPlan,
              data?.user?.role
            );
          }}
        />
      )}
    </>
  );
};

export default PricingSection;