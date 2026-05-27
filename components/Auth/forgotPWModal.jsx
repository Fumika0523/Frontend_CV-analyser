import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const ForgotPWModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState("email"); // email | otp | reset
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef([]);
  const otp = digits.join("");

  useEffect(() => {
    if (isOpen) {
      setStep("email");
      setEmail("");
      setDigits(["", "", "", "", "", ""]);
      setPassword("");
      setConfirmPassword("");
      setMessage("");
      setError("");
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8002/forgot-password", {
        email,
      });

      setMessage(res.data.message || "OTP sent to your email.");
      setStep("otp");

      setTimeout(() => inputRefs.current[0]?.focus(), 80);
    } catch (err) {
      setError(err.response?.data?.message || "Email not found.");
    } finally {
      setLoading(false);
    }
  };

  const handleDigitChange = (index, value) => {
    const digit = value.replace(/\D/, "").slice(-1);

    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError("");
    setMessage("");

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (otp.length < 6) {
      setError("Please enter all 6 digits.");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8002/verify-reset-otp", {
        email,
        otp,
      });

      setMessage(res.data.message || "OTP verified.");
      setStep("reset");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP.");
      setDigits(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 80);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password should be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8002/reset-password", {
        email,
        otp,
        password,
      });

      setMessage(res.data.message || "Password reset successful.");

      setTimeout(() => {
        onClose();
        onSuccess?.();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Password reset failed.");
    } finally {
      setLoading(false);
    }
  };

  const titleText =
    step === "email"
      ? "Reset your password"
      : step === "otp"
      ? "Check your inbox"
      : "Create new password";

  const subtitleText =
    step === "email"
      ? "Enter your registered candidate email address."
      : step === "otp"
      ? `We sent a 6-digit code to ${email}.`
      : "Create a new password for your account.";

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/70 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-[420px] rounded-[20px] bg-white px-7 py-8 shadow-2xl animate-[fadeIn_0.2s_ease]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 transition hover:bg-blue-100 hover:text-blue-700"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <span className="text-4xl">🔐</span>
        </div>

        <h2 className="mb-1 text-center text-xl font-bold text-gray-900">
          {titleText}
        </h2>

        <p className="mb-6 text-center text-sm leading-6 text-gray-500">
          {subtitleText}
        </p>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-600">
            ⚠️ {error}
          </div>
        )}

        {message && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-600">
            ✅ {message}
          </div>
        )}

        {step === "email" && (
          <form onSubmit={handleSendOtp}>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">
              Email Address <span className="text-rose-500">*</span>
            </label>

            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-5 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:bg-blue-50 focus:ring-4 focus:ring-blue-100"
            />

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-900 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Checking..." : "Send OTP →"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp}>
            <div className="mb-5 flex justify-center gap-2">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`h-14 w-12 rounded-xl border-2 bg-slate-50 text-center text-xl font-bold text-gray-900 outline-none transition focus:border-blue-700 focus:bg-blue-50 focus:ring-4 focus:ring-blue-100 ${
                    digit ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200"
                  }`}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-900 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify Code →"}
            </button>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={handleResetPassword}>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">
              New Password <span className="text-rose-500">*</span>
            </label>

            <input
              type="password"
              required
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-4 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:bg-blue-50 focus:ring-4 focus:ring-blue-100"
            />

            <label className="mb-1.5 block text-xs font-bold text-slate-700">
              Confirm Password <span className="text-rose-500">*</span>
            </label>

            <input
              type="password"
              required
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mb-5 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:bg-blue-50 focus:ring-4 focus:ring-blue-100"
            />

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-900 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Resetting..." : "Reset Password →"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPWModal;