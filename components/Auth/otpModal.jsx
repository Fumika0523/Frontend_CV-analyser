import React, { useState, useRef } from "react";
import axios from "axios";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Sans:wght@400;500&display=swap');

  .otp-root *, .otp-root *::before, .otp-root *::after {
    box-sizing: border-box;
  }

  .otp-overlay { animation: amFadeIn 0.2s ease; }
  .otp-card    { animation: amSlideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }

  @keyframes amFadeIn  { from { opacity: 0; } to { opacity: 1; } }
  @keyframes amSlideUp {
    from { opacity: 0; transform: translateY(32px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0)   scale(1);    }
  }
  @keyframes amPulse {
    0%, 100% { box-shadow: 0 0 0 0   rgba(29,78,216,.35); }
    50%       { box-shadow: 0 0 0 12px rgba(29,78,216,.0);  }
  }
  @keyframes amBounce {
    0%,100% { transform: translateY(0); }
    40%     { transform: translateY(-6px); }
    70%     { transform: translateY(-3px); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .otp-box {
    width: 48px; height: 56px;
    border: 2px solid #e2e8f0; border-radius: 12px;
    font-size: 22px; font-weight: 700; font-family: 'Sora', sans-serif;
    color: #111827; text-align: center; background: #f8fafc; outline: none;
    transition: border-color .2s, box-shadow .2s, background .2s;
    caret-color: #1d4ed8;
  }
  .otp-box:focus  { border-color: #1d4ed8; background: #eff6ff; box-shadow: 0 0 0 3.5px rgba(29,78,216,.18); }
  .otp-box.filled { border-color: #3b82f6; background: #eff6ff; color: #1d4ed8; }
  .otp-box.error  { border-color: #f43f5e; background: #fff1f2; box-shadow: 0 0 0 3px rgba(244,63,94,.12); animation: amBounce .4s ease; }

  .otp-submit {
    width: 100%; padding: 13px; background: linear-gradient(135deg, #1d4ed8, #1e3a8a);
    color: #fff; border: none; border-radius: 12px;
    font-size: 15px; font-weight: 700; font-family: 'Sora', sans-serif;
    cursor: pointer; letter-spacing: .02em;
    transition: opacity .2s, transform .15s, box-shadow .2s;
    box-shadow: 0 4px 14px rgba(29,78,216,.35);
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .otp-submit:hover:not(:disabled)  { opacity: .92; transform: translateY(-1.5px); box-shadow: 0 6px 20px rgba(29,78,216,.42); }
  .otp-submit:active:not(:disabled) { transform: translateY(0); }
  .otp-submit:disabled              { opacity: .6; cursor: not-allowed; }

  .otp-close {
    position: absolute; top: 14px; right: 16px;
    background: transparent; border: none; padding: 4px;
    color: #9ca3af; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    border-radius: 50%;
    transition: background .15s, color .15s, transform .18s;
  }
  .otp-close:hover { background: #dbeafe; color: #1d4ed8; }

  .otp-icon-ring { animation: amPulse 2.4s ease infinite; }

  .otp-resend {
    background: none; border: none; color: #1d4ed8;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
    cursor: pointer; padding: 0;
    text-decoration: underline; text-underline-offset: 2px;
    transition: color .15s;
  }
  .otp-resend:hover    { color: #1e3a8a; }
  .otp-resend:disabled { color: #9ca3af; cursor: default; text-decoration: none; }

  .otp-spinner {
    width: 18px; height: 18px;
    border: 2.5px solid rgba(255,255,255,.35);
    border-top-color: #fff; border-radius: 50%;
    animation: spin .7s linear infinite; flex-shrink: 0;
  }
`;

const EmailShieldIcon = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
    <path d="M26 4L8 11v14c0 10.5 7.7 20.3 18 22.7C36.3 45.3 44 35.5 44 25V11L26 4z" fill="url(#sg)" opacity="0.15"/>
    <path d="M26 6L9.5 12.5v12.8c0 9.8 7.2 19 16.5 21.2C35.3 44.3 42.5 35.1 42.5 25.3V12.5L26 6z"
      stroke="#1d4ed8" strokeWidth="1.6" fill="none" strokeLinejoin="round"/>
    <rect x="15" y="20" width="22" height="15" rx="2.5" fill="white" stroke="#1d4ed8" strokeWidth="1.5"/>
    <path d="M15 22l11 7.5L37 22" stroke="#1d4ed8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <defs>
      <linearGradient id="sg" x1="8" y1="4" x2="44" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1d4ed8"/><stop offset="1" stopColor="#1e3a8a"/>
      </linearGradient>
    </defs>
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="9" fill="#22c55e" opacity=".15"/>
    <path d="M5.5 10l3 3 6-6" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ErrorIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7" fill="#fca5a5" opacity=".4"/>
    <path d="M8 5v3.5M8 10.5v.5" stroke="#e11d48" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const OtpModal = ({ isOpen, onClose, _id, email, onVerified }) => {
  console.log("_id",_id)
  const [digits,  setDigits]  = useState(["", "", "", "", "", ""]);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef([]);
const [resending, setResending] = useState(false);
  if (!isOpen) return null;

  const otp = digits.join("");

  //resend otp
  const handleResendOtp = async () => {
  try {
    setResending(true);
    setMessage("");
    setIsError(false);

    const res = await axios.post("http://localhost:8002/resend-otp", {
      _id,
    });

    setDigits(["", "", "", "", "", ""]);
    setMessage(res.data.message || "A new OTP has been sent.");
    setIsError(false);

    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  } catch (err) {
    setIsError(true);
    setMessage(err?.response?.data?.message || "Failed to resend OTP.");
  } finally {
    setResending(false);
  }
};

  const handleChange = (i, val) => {
    const v = val.replace(/\D/, "").slice(-1);
    const next = [...digits]; next[i] = v;
    setDigits(next); setMessage(""); setIsError(false);
    if (v && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputRefs.current[i - 1]?.focus();
    if (e.key === "ArrowLeft"  && i > 0)             inputRefs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5)             inputRefs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const next = [...digits];
    text.split("").forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    inputRefs.current[Math.min(text.length, 5)]?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length < 6) { setMessage("Please enter all 6 digits"); setIsError(true); return; }
    setLoading(true); setMessage("");
    try {
      console.log("OTP MODAL _id:", _id);
console.log("OTP MODAL otp:", otp);
console.log("VERIFY PAYLOAD:", { _id, otp });
      const res = await axios.post("http://localhost:8002/verify-otp", { _id, otp });
      console.log("res",res.data)
      setSuccess(true); 
      setMessage("Verified successfully!");
      setTimeout(() => onVerified?.(res.data), 900);
    } catch (err) {
      setIsError(true);
      setMessage(err?.response?.data?.message || "Invalid OTP. Please try again.");
      setDigits(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    }
    setLoading(false);
  };

  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + "*".repeat(b.length) + c)
    : "your email";

  return (
    <div className="otp-root">
      <style>{STYLES}</style>

      <div
        className="otp-overlay"
        onClick={(e) => e.target === e.currentTarget && onClose()}
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          width: "100vw", height: "100vh",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          background: "rgba(15,23,42,0.68)",
          backdropFilter: "blur(5px)",
        }}
      >
        {/* Card */}
        <div
          className="otp-card"
          style={{
            position: "relative",
            width: "100%", maxWidth: 420,
            background: "#ffffff",
            borderRadius: 20,
            padding: "32px 28px 28px",
            boxShadow: "0 24px 60px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          {/* Close */}
          <button className="otp-close" onClick={onClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Icon */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <div className="otp-icon-ring" style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "linear-gradient(145deg, #eff6ff, #dbeafe)",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "2px solid #bfdbfe",
            }}>
              <EmailShieldIcon />
            </div>
          </div>

          {/* Heading */}
          <h2 style={{ margin: "0 0 6px", fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 700, color: "#111827", textAlign: "center" }}>
            Check your inbox
          </h2>

          {/* Sub-text */}
          <p style={{ margin: "0 0 24px", fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, color: "#6b7280", textAlign: "center", lineHeight: 1.55 }}>
            We sent a 6-digit code to{" "}
            <span style={{ color: "#1e3a8a", fontWeight: 600 }}>{maskedEmail}</span>
          </p>

          {/* OTP inputs */}
          <form onSubmit={handleVerify}>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20 }}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  className={`otp-box${d ? " filled" : ""}${isError ? " error" : ""}`}
                  type="text" inputMode="numeric" maxLength={1} value={d}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  autoFocus={i === 0}
                  autoComplete="one-time-code"
                />
              ))}
            </div>

            {/* Message */}
            {message && (
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "9px 12px", borderRadius: 10,
                background: isError ? "#fff1f2" : "#f0fdf4",
                border: `1px solid ${isError ? "#fda4af" : "#bbf7d0"}`,
                marginBottom: 16,
                fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                color: isError ? "#e11d48" : "#16a34a",
              }}>
                {isError ? <ErrorIcon /> : <CheckIcon />}
                {message}
              </div>
            )}

            {/* Submit */}
            <button className="otp-submit" type="submit" disabled={loading || success}>
              {loading
                ? <><div className="otp-spinner" /> Verifying…</>
                : success
                  ? <><CheckIcon /> Verified!</>
                  : <>
                      <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                        <path d="M2.5 8.5h12M9.5 3.5l5 5-5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Verify Code
                    </>
              }
            </button>
          </form>

          {/* Resend */}
          <p style={{ marginTop: 18, textAlign: "center", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#9ca3af" }}>
            Didn't receive it?{" "}
            <button
                className="otp-resend"
                type="button"
                onClick={handleResendOtp}
                disabled={resending}
              >
                {resending ? "Sending..." : "Resend code"}
              </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OtpModal;