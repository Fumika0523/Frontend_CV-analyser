// authFormAtoms.jsx
// Small, reusable building blocks shared by SignInModal and SignUpModal.
// Pulling these out of the modal files keeps each modal focused on its
// own form logic instead of icon markup and layout wrappers.

import React, { useState } from "react";

/* ─── Layout helpers ─── */

export const Field = ({ label, required, hint, hintWarn, children }) => (
  <div style={{ display: "flex", flexDirection: "column" }}>
    {label && (
      <label className="am-label">
        {label}
        {required && <span> *</span>}
      </label>
    )}
    {children}
    {hint && <p className={`am-hint${hintWarn ? " warn" : ""}`}>{hint}</p>}
  </div>
);

export const TwoCol = ({ children }) => <div className="am-two">{children}</div>;

/* ─── Feedback ─── */

export const Spinner = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    style={{ animation: "amSpin .8s linear infinite", flexShrink: 0 }}
  >
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

// Shows a success or error message.
// "Success" is detected by checking for the word "success" in the message
// text (rough, but avoids passing a separate isError flag everywhere).
export const Banner = ({ msg }) => {
  if (!msg) return null;
  const ok = msg.toLowerCase().includes("success");
  return (
    <div
      style={{
        padding: "10px",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 500,
        fontFamily: "'DM Sans', sans-serif",
        background: ok ? "#f0fdf4" : "#fff1f2",
        color: ok ? "#16a34a" : "#e11d48",
        border: `1px solid ${ok ? "#bbf7d0" : "#fecdd3"}`,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {ok ? "✅" : "⚠️"} {msg}
    </div>
  );
};

/* ─── Icons ─── */

const EyeOpen = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeClosed = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export const CloseBtn = ({ onClick }) => (
  <button type="button" className="am-close" onClick={onClick} aria-label="Close">
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M1 1l11 11M12 1L1 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  </button>
);

/* ─── Password input with a show/hide toggle ─── */

export const PasswordField = ({ name, label, value, onChange, placeholder, hint, required }) => {
  const [show, setShow] = useState(false);
  return (
    <Field label={label} required={required} hint={hint}>
      <div className="am-pw-wrap">
        <input
          name={name}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          className="am-input"
          style={{ paddingRight: 40 }}
          required={required}
          onChange={onChange}
        />
        <button type="button" className="am-pw-eye" onClick={() => setShow((s) => !s)} tabIndex={-1}>
          {show ? <EyeOpen /> : <EyeClosed />}
        </button>
      </div>
    </Field>
  );
};