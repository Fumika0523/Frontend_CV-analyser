// AuthModal.jsx
// Entry point for authentication. Keeps the same public API as the old,
// single-file AuthModal — so nothing that renders <AuthModal ... /> needs
// to change. It just switches between the sign-in, sign-up, and
// forgot-password modals.

import React, { useState, useEffect } from "react";
import SignInModal from "./SignInModal";
import SignUpModal from "./SignUpModal";
import ForgotPWModal from "../forgotPWModal";

const AuthModal = ({ isOpen, onClose, onAuthSuccess, onOtpSent, initialMode = "signin", initialRole = "candidate" }) => {
  const [mode, setMode] = useState(initialMode);
  const [forgotOpen, setForgotOpen] = useState(false);

  // Whenever the modal is (re)opened, start from whatever mode the
  // caller asked for (e.g. a "Sign up as employer" button can open
  // straight into sign-up).
  useEffect(() => {
    if (isOpen) setMode(initialMode);
  }, [isOpen, initialMode]);

  return (
    <>
      <SignInModal
        isOpen={isOpen && mode === "signin"}
        onClose={onClose}
        onAuthSuccess={onAuthSuccess}
        onOtpSent={onOtpSent}
        onSwitchToSignUp={() => setMode("signup")}
        onForgotPassword={() => setForgotOpen(true)}
      />

      <SignUpModal
        isOpen={isOpen && mode === "signup"}
        onClose={onClose}
        onOtpSent={onOtpSent}
        onSwitchToSignIn={() => setMode("signin")}
        initialRole={initialRole}
      />

      <ForgotPWModal
        isOpen={forgotOpen}
        onClose={() => setForgotOpen(false)}
        onSuccess={() => {
          setForgotOpen(false);
          setMode("signin");
        }}
      />
    </>
  );
};

export default AuthModal;