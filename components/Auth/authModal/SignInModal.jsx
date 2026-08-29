// SignInModal.jsx


import React, { useState, useEffect } from "react";
import axios from "axios";
// import "./AuthModal.css";
import { Field, Banner, Spinner, PasswordField, CloseBtn } from "./authFormAtoms";
import { isValidEmail } from "./emailHelpers";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8002";

const SignInModal = ({ isOpen, onClose, onAuthSuccess, onOtpSent, onSwitchToSignUp, onForgotPassword }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");


  
  // Reset the form every time the modal opens, so a previous attempt
  // (or a previous user's leftover input) never leaks into a new session.
  useEffect(() => {
    if (isOpen) {
      setForm({ email: "", password: "" });
      setMessage("");
    }
  }, [isOpen]);

  // Lock page scroll while the modal is open, restore it on close/unmount.
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // Catch obviously malformed emails before making a network call.
    if (!isValidEmail(form.email)) {
      setMessage("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/signin`, form);
      localStorage.setItem("token", res.data.token);

      onAuthSuccess?.({
        id: res.data.user._id,
        userId: res.data.user.userId,
        name: res.data.user.name,
        email: res.data.user.email,
        role: res.data.user.role,
      });

      onClose();
    } catch (err) {
      // 403 + an _id in the response means the account exists but isn't
      // verified yet — send the user to OTP verification instead of
      // showing a generic error.
      if (err?.response?.status === 403 && err?.response?.data?._id) {
        setMessage(err.response.data.message || "Please verify your email");
        onOtpSent?.({ _id: err.response.data._id, email: form.email });
        onClose();
      } else {
        setMessage(err?.response?.data?.message || "Invalid email or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="am-modal-root">
      <div className="am-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="am-card am-card-signin">
          <div className="am-body">
            <CloseBtn onClick={onClose} />

            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  margin: "0 auto 14px",
                  background: "linear-gradient(145deg,#eff6ff,#dbeafe)",
                  border: "2px solid #bfdbfe",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <circle cx="14" cy="10" r="5" stroke="#1d4ed8" strokeWidth="1.8" />
                  <path d="M4 25c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="#1d4ed8" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <h2 style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 700, color: "#111827" }}>
                Welcome back 👋
              </h2>
              <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "#6b7280", fontFamily: "'DM Sans',sans-serif" }}>
                Sign in to your account to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Field label="Email Address" required>
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  className="am-input"
                  required
                  onChange={handleChange}
                />
              </Field>

              <div>
                <PasswordField
                  name="password"
                  label="Password"
                  required
                  placeholder="Your password"
                  value={form.password}
                  onChange={handleChange}
                />
                <div style={{ textAlign: "right", marginTop: 5 }}>
                  <button
                    type="button"
                    onClick={onForgotPassword}
                    style={{
                      fontSize: 12.5,
                      color: "grey",
                      fontWeight: 600,
                      textDecoration: "none",
                      fontFamily: "'DM Sans',sans-serif",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <Banner msg={message} />

              <button type="submit" className="am-submit" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner /> Signing in…
                  </>
                ) : (
                  "Sign In →"
                )}
              </button>
            </form>

            <div className="am-divider">or</div>

            <p style={{ textAlign: "center", fontSize: 14, fontFamily: "'DM Sans',sans-serif", color: "#6b7280", margin: 0 }}>
              Don't have an account?{" "}
              <span
                onClick={onSwitchToSignUp}
                style={{ color: "#1d4ed8", cursor: "pointer", fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 3 }}
              >
                Create one free →
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInModal;