import React, { useState, useEffect } from "react";
import axios from "axios";

const FREE_DOMAINS = [
  "gmail.com","yahoo.com","hotmail.com","outlook.com","live.com",
  "icloud.com","aol.com","protonmail.com","mail.com","ymail.com",
  "googlemail.com","msn.com","me.com","mac.com",
];

const isPersonalEmail = (email) => {
  const domain = email.split("@")[1]?.toLowerCase();
  return FREE_DOMAINS.includes(domain);
};

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Argentina","Australia","Austria","Bangladesh",
  "Belgium","Brazil","Canada","Chile","China","Colombia","Czech Republic","Denmark",
  "Egypt","Ethiopia","Finland","France","Germany","Ghana","Greece","Hungary","India",
  "Indonesia","Iran","Iraq","Ireland","Israel","Italy","Japan","Jordan","Kenya",
  "Malaysia","Mexico","Morocco","Netherlands","New Zealand","Nigeria","Norway",
  "Pakistan","Peru","Philippines","Poland","Portugal","Romania","Russia","Saudi Arabia",
  "Singapore","South Africa","South Korea","Spain","Sri Lanka","Sweden","Switzerland",
  "Thailand","Turkey","Ukraine","United Arab Emirates","United Kingdom","United States",
  "Vietnam","Zimbabwe",
];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Sans:wght@400;500&display=swap');

  .am-overlay { animation: amFadeIn 0.2s ease; }
  .am-card    { animation: amSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }

  @keyframes amFadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes amSlideUp {
    from { opacity:0; transform:translateY(28px) scale(0.97); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes amSpin { to { transform:rotate(360deg); } }

  .am-input {
    width: 100%;
    padding: 10px 13px;
    border: 1.5px solid #e5e7eb;
    border-radius: 10px;
    font-size: 13.5px;
    font-family: 'DM Sans', sans-serif;
    color: #111827;
    background: #ffffff;
    outline: none;
    transition: border-color .2s, box-shadow .2s;
    box-sizing: border-box;
  }
  .am-input:focus {
    border-color: #f97316;
    box-shadow: 0 0 0 3px rgba(249,115,22,.12);
  }
  .am-input::placeholder { color: #9ca3af; }
  .am-input.error { border-color: #f43f5e; box-shadow: 0 0 0 3px rgba(244,63,94,.10); }

  .am-label {
    font-size: 12px;
    font-weight: 600;
    color: #374151;
    font-family: 'Sora', sans-serif;
    letter-spacing: .03em;
    margin-bottom: 1px;
    display: block;
  }
  .am-label span { color: #f97316; }

  .am-role-btn {
    flex: 1;
    padding: 11px 0;
    border-radius: 10px;
    font-size: 13.5px;
    font-weight: 600;
    font-family: 'Sora', sans-serif;
    cursor: pointer;
    border: 1.5px solid #e5e7eb;
    background: #ffffff;
    color: #6b7280;
    transition: all .18s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  .am-role-btn:hover  { border-color: #f97316; color: #f97316; }
  .am-role-btn.active {
    background: #fff7ed;
    border-color: #f97316;
    color: #ea580c;
    box-shadow: 0 0 0 2.5px rgba(249,115,22,.18);
  }

  .am-submit {
    width: 100%;
    padding: 12px;
    background: linear-gradient(135deg, #f97316, #ea580c);
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 14.5px;
    font-weight: 700;
    font-family: 'Sora', sans-serif;
    cursor: pointer;
    letter-spacing: .01em;
    transition: opacity .2s, transform .15s;
  }
  .am-submit:hover:not(:disabled) { opacity:.92; transform:translateY(-1px); }
  .am-submit:disabled { opacity:.65; cursor:not-allowed; }

  .am-close {
    position: absolute;
    top: 14px; right: 14px;
    width: 30px; height: 30px;
    border-radius: 50%;
    background: #f3f4f6;
    border: none;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: #6b7280;
    font-size: 16px;
    transition: background .15s, color .15s;
  }
  .am-close:hover { background:#fee2e2; color:#ef4444; }

  .am-section-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .08em;
    color: #9ca3af;
    font-family: 'Sora', sans-serif;
    margin: 5px 0 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .am-section-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #f3f4f6;
  }

  .am-hint {
    font-size: 11.5px;
    color: #9ca3af;
    margin-top: 2px;
    font-family: 'DM Sans', sans-serif;
  }
  .am-hint.warn { color:#f97316; }

  /* Responsive 2-col grid for company signup */
  .am-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 11px;
    align-items: start;
  }
  .am-grid-full {
    grid-column: 1 / -1;
  }
  @media (max-width: 540px) {
    .am-grid {
      grid-template-columns: 1fr;
    }
    .am-grid-full {
      grid-column: 1;
    }
  }
`;

const Field = ({ label, required, hint, hintWarn, children }) => (
  <div style={{ display: "flex", flexDirection: "column" }}>
    {label && (
      <label className="am-label">
        {label}{required && <span> *</span>}
      </label>
    )}
    {children}
    {hint && <p className={`am-hint${hintWarn ? " warn" : ""}`}>{hint}</p>}
  </div>
);

const Row = ({ children }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
    {children}
  </div>
);

const SectionLabel = ({ children }) => (
  <p className="am-section-label">{children}</p>
);

const Spinner = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5"
    style={{ animation: "amSpin .8s linear infinite", display: "inline-block" }}>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83
             M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>
);

const Banner = ({ msg }) => {
  if (!msg) return null;
  const ok = msg.includes("successful");
  return (
    <div style={{
      padding: "9px 13px", borderRadius: 8, fontSize: 12.5, fontWeight: 500,
      background: ok ? "#f0fdf4" : "#fff1f2",
      color:      ok ? "#16a34a" : "#e11d48",
      border: `1px solid ${ok ? "#bbf7d0" : "#fecdd3"}`,
    }}>
      {ok ? "✅ " : "⚠️ "}{msg}
    </div>
  );
};

const AuthModal = ({ isOpen, onClose, onAuthSuccess, initialMode = "signin" }) => {
  const [mode,      setMode]      = useState(initialMode);
  const [role,      setRole]      = useState("candidate");
  const [loading,   setLoading]   = useState(false);
  const [message,   setMessage]   = useState("");
  const [emailWarn, setEmailWarn] = useState("");

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "",
    phoneNumber: "", city: "", country: "",
    companyName: "", companyDescription: "", companyCity: "", companyCountry: "",
  });

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setMessage("");
      setEmailWarn("");
      setRole("candidate");
      setForm({
        firstName:"", lastName:"", email:"", password:"",
        phoneNumber:"", city:"", country:"",
        companyName:"", companyDescription:"", companyCity:"", companyCountry:"",
      });
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (name === "email" && role === "company" && mode === "signup") {
      if (value.includes("@") && isPersonalEmail(value)) {
        setEmailWarn("Personal email domains (Gmail, Yahoo, etc.) are not allowed for company accounts.");
      } else {
        setEmailWarn("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (mode === "signup" && role === "company" && isPersonalEmail(form.email)) {
      setMessage("Please use your official company email address.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const payload = role === "candidate"
          ? {
              firstName: form.firstName, lastName: form.lastName,
              email: form.email, password: form.password,
              role: "candidate", phoneNumber: form.phoneNumber,
              location: `${form.city}, ${form.country}`,
            }
          : {
              firstName: form.firstName, lastName: form.lastName,
              email: form.email, password: form.password,
              role: "company", companyName: form.companyName,
              companyDescription: form.companyDescription,
              location: `${form.companyCity}, ${form.companyCountry}`,
            };
        const res = await axios.post("http://localhost:8002/api/users/signup", payload);
        localStorage.setItem("token", res.data.token);
        setMessage("Signup successful!");
        onAuthSuccess?.({ name: form.firstName, role });
        setTimeout(onClose, 900);
      } else {
        const res = await axios.post("http://localhost:8002/api/users/signin", {
          email: form.email, password: form.password,
        });
        localStorage.setItem("token", res.data.token);
        setMessage("Login successful!");
        onAuthSuccess?.({
          name: res.data.firstName || res.data.name || "User",
          role: res.data.role,
        });
        setTimeout(onClose, 900);
      }
    } catch (err) {
      setMessage(
        err?.response?.data?.message ||
        (mode === "signup" ? "Signup failed. Please try again." : "Invalid email or password.")
      );
    }
    setLoading(false);
  };

  const isSignup = mode === "signup";

  return (
    <>
      <style>{STYLES}</style>

      <div
        className="am-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.6)" }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div
          className="am-card relative bg-white rounded-2xl w-full shadow-2xl"
          style={{
            maxWidth: isSignup && role === "company" ? 700 : 490,
            width: "100%",
            maxHeight: "95vh",
            fontFamily: "'DM Sans', sans-serif",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#ffffff",
            opacity: 1,
          }}
        >
          {/* Accent bar */}
          <div style={{
            height: 4, flexShrink: 0,
            borderRadius: "16px 16px 0 0",
            background: "linear-gradient(90deg, #f97316, #fb923c, #fbbf24)",
          }} />

          <div style={{ padding: "26px 30px 30px", overflowY: "auto", flex: 1 }}>
            <button className="am-close" onClick={onClose}>✕</button>

            {/* Heading */}
            <div style={{ marginBottom: 15, paddingRight: 30 }}>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 21, fontWeight: 700, color: "#111827" }}>
                {isSignup ? "Create your account" : "Welcome back 👋"}
              </h2>
              <p style={{ fontSize: 13, color: "#6b7280" }}>
                {isSignup
                  ? "Join our CV Analyser platform — land your next opportunity."
                  : "Sign in to access your dashboard and tools."}
              </p>
            </div>

            {/* Role selector — signup only */}
            {isSignup && (
              <div style={{ marginBottom: 15 }}>
                <p className="am-label" style={{ marginBottom: 8 }}>
                  I am joining as a… <span style={{ color: "#f97316" }}>*</span>
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button type="button"
                    className={`am-role-btn ${role === "candidate" ? "active" : ""}`}
                    onClick={() => { setRole("candidate"); setEmailWarn(""); setMessage(""); }}>
                    <span>👤</span> Candidate
                  </button>
                  <button type="button"
                    className={`am-role-btn ${role === "company" ? "active" : ""}`}
                    onClick={() => { setRole("company"); setEmailWarn(""); setMessage(""); }}>
                    <span>🏢</span> Company
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 11 }}>

              {/* ── SIGN IN ── */}
              {!isSignup && (
                <>
                  <Field label="Email Address" required>
                    <input name="email" type="email" placeholder="you@example.com"
                      value={form.email} className="am-input" required onChange={handleChange} />
                  </Field>
                  <Field label="Password" required>
                    <input name="password" type="password" placeholder="Your password"
                      value={form.password} className="am-input" required onChange={handleChange} />
                  </Field>
                  <div style={{ textAlign: "right", marginTop: -4 }}>
                    <a href="#" style={{ fontSize: 12, color: "#f97316", fontWeight: 600, textDecoration: "none" }}>
                      Forgot password?
                    </a>
                  </div>
                </>
              )}

              {/* ── SIGN UP — CANDIDATE ── */}
              {isSignup && role === "candidate" && (
                <>
                  <SectionLabel>Personal Information</SectionLabel>
                  <Row>
                    <Field label="First Name" required>
                      <input name="firstName" type="text" placeholder="Jane"
                        value={form.firstName} className="am-input" required onChange={handleChange} />
                    </Field>
                    <Field label="Last Name" required>
                      <input name="lastName" type="text" placeholder="Doe"
                        value={form.lastName} className="am-input" required onChange={handleChange} />
                    </Field>
                  </Row>
                  <Row>
                    <Field label="Email Address" required>
                      <input name="email" type="email" placeholder="jane@example.com"
                        value={form.email} className="am-input" required onChange={handleChange} />
                    </Field>
                    <Field label="Phone Number" required hint="We'll use this for interview scheduling & alerts.">
                      <input name="phoneNumber" type="tel" placeholder="+44 7700 900000"
                        value={form.phoneNumber} className="am-input" required onChange={handleChange} />
                    </Field>
                  </Row>
                  <Field label="Password" required hint="Minimum 8 characters recommended.">
                    <input name="password" type="password" placeholder="Min. 8 characters"
                      value={form.password} className="am-input" required onChange={handleChange} />
                  </Field>
                  <SectionLabel>Location</SectionLabel>
                  <Row>
                    <Field label="City" required>
                      <input name="city" type="text" placeholder="London"
                        value={form.city} className="am-input" required onChange={handleChange} />
                    </Field>
                    <Field label="Country" required>
                      <select name="country" value={form.country}
                        className="am-input" required onChange={handleChange}>
                        <option value="">Select country</option>
                        {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </Field>
                  </Row>
                </>
              )}

              {/* ── SIGN UP — COMPANY ── */}
              {isSignup && role === "company" && (
                <div className="am-grid">

                  <div className="am-grid-full"><SectionLabel>Contact Person</SectionLabel></div>

                  <Field label="First Name" required>
                    <input name="firstName" type="text" placeholder="John"
                      value={form.firstName} className="am-input" required onChange={handleChange} />
                  </Field>
                  <Field label="Last Name" required>
                    <input name="lastName" type="text" placeholder="Smith"
                      value={form.lastName} className="am-input" required onChange={handleChange} />
                  </Field>

                  <Field label="Official Company Email" required
                    hint={emailWarn || "Personal email domains (Gmail etc.) are not accepted."}
                    hintWarn={!!emailWarn}>
                    <input name="email" type="email" placeholder="you@yourcompany.com"
                      value={form.email}
                      className={`am-input${emailWarn ? " error" : ""}`}
                      required onChange={handleChange} />
                  </Field>
                  <Field label="Password" required hint="Minimum 8 characters recommended.">
                    <input name="password" type="password" placeholder="Min. 8 characters"
                      value={form.password} className="am-input" required onChange={handleChange} />
                  </Field>

                  <div className="am-grid-full"><SectionLabel>Company Details</SectionLabel></div>

                  <Field label="Company Name" required>
                    <input name="companyName" type="text" placeholder="Acme Corp Ltd."
                      value={form.companyName} className="am-input" required onChange={handleChange} />
                  </Field>
                  <Field label="City" required>
                    <input name="companyCity" type="text" placeholder="Manchester"
                      value={form.companyCity} className="am-input" required onChange={handleChange} />
                  </Field>

                  <div className="am-grid-full">
                    <Field label="Company Description" required
                      hint="Tell candidates what your company does and what makes it great.">
                      <textarea name="companyDescription"
                        placeholder="We are a fast-growing tech company focused on…"
                        value={form.companyDescription}
                        className="am-input" rows={3} required onChange={handleChange}
                        style={{ resize: "vertical", minHeight: 72 }} />
                    </Field>
                  </div>

                  <div className="am-grid-full"><SectionLabel>Company Location</SectionLabel></div>

                  <Field label="Country" required>
                    <select name="companyCountry" value={form.companyCountry}
                      className="am-input" required onChange={handleChange}>
                      <option value="">Select country</option>
                      {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                  {/* grid balance spacer */}
                  <div />

                </div>
              )}

              <Banner msg={message} />

              <button type="submit" className="am-submit"
                disabled={loading || !!emailWarn} style={{ marginTop: 6 }}>
                {loading ? (
                  <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                    <Spinner />
                    {isSignup ? "Creating account…" : "Signing in…"}
                  </span>
                ) : (
                  isSignup ? "Create Account →" : "Sign In →"
                )}
              </button>
            </form>

            {/* Trust badges */}
            {isSignup && (
              <div style={{
                display:"flex", justifyContent:"center", gap:16, marginTop:16,
                padding:"12px 0 0", borderTop:"1px solid #f3f4f6",
              }}>
                {[
                  { icon:"🔒", text:"Secure & Encrypted" },
                  { icon:"🚀", text:"AI-Powered CV Analysis" },
                  { icon:"🎯", text:"Smart Job Matching" },
                ].map(({ icon, text }) => (
                  <div key={text} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"#9ca3af", fontFamily:"'DM Sans', sans-serif" }}>
                    <span style={{ fontSize:13 }}>{icon}</span> {text}
                  </div>
                ))}
              </div>
            )}

            {/* Toggle */}
            <p style={{ marginTop: 12, fontSize: 13, textAlign: "center", color: "#9ca3af" }}>
              {isSignup ? "Already have an account?" : "Don't have an account?"}
              <span
                onClick={() => setMode(isSignup ? "signin" : "signup")}
                style={{ color: "#f97316", cursor: "pointer", marginLeft: 6, fontWeight: 600 }}
              >
                {isSignup ? "Sign In" : "Sign Up"}
              </span>
            </p>

          </div>
        </div>
      </div>
    </>
  );
};

export default AuthModal;