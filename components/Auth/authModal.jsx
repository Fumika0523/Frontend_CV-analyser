import React, { useState, useEffect } from "react";
import axios from "axios";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

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

  .am-modal-root *, .am-modal-root *::before, .am-modal-root *::after {
    box-sizing: border-box;
  }

  .am-overlay {
    position: fixed !important;
    inset: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    z-index: 9999 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 16px !important;
    background: rgba(0,0,0,0.62) !important;
    backdrop-filter: blur(5px);
    animation: amFadeIn 0.2s ease;
  }

  @keyframes amFadeIn  { from { opacity: 0 } to { opacity: 1 } }
  @keyframes amSlideUp {
    from { opacity: 0; transform: translateY(26px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)   scale(1);    }
  }
  @keyframes amSpin { to { transform: rotate(360deg); } }

  .am-card {
    position: relative;
    background: #fff;
    border-radius: 20px;
    width: 100%;
    max-height: 92vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 28px 64px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.07);
    animation: amSlideUp 0.32s cubic-bezier(0.34,1.56,0.64,1);
    overflow: hidden;
  }
  .am-card-signin { max-width: 440px; }
  .am-card-signup { max-width: 660px; }

  .am-top-bar {
    height: 4px; flex-shrink: 0;
    background: linear-gradient(90deg, #f97316, #fb923c);
    border-radius: 20px 20px 0 0;
  }

  .am-body {
    padding: 20px 30px;
    overflow-y: auto; flex: 1;
    scrollbar-width: thin;
    scrollbar-color: #f97316 #f3f4f6;
  }
  .am-body::-webkit-scrollbar       { width: 5px; }
  .am-body::-webkit-scrollbar-track { background: #f9fafb; }
  .am-body::-webkit-scrollbar-thumb { background: #f97316; border-radius: 99px; }

  .am-close {
    position: absolute; top: 14px; right: 14px;
    width: 32px; height: 32px; border-radius: 50%;
    background: #f3f4f6; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: #6b7280; z-index: 10;
    transition: background .15s, color .15s, transform .18s;
  }
  .am-close:hover { background: #fee2e2; color: #ef4444; }

  .am-input {
    width: 100%; padding: 10px 13px;
    border: 1.5px solid #e5e7eb; border-radius: 10px;
    font-size: 13.5px; font-family: 'DM Sans', sans-serif;
    color: #111827; background: #fff; outline: none;
    transition: border-color .2s, box-shadow .2s;
  }
  .am-input:focus      { border-color: #f97316; box-shadow: 0 0 0 3px rgba(249,115,22,.13); }
  .am-input::placeholder { color: #9ca3af; }
  .am-input.error      { border-color: #f43f5e; box-shadow: 0 0 0 3px rgba(244,63,94,.10); }

  .am-label {
    font-size: 11.5px; font-weight: 600; color: #374151;
    font-family: 'Sora', sans-serif; letter-spacing: .03em;
    margin-bottom: 4px; display: block;
  }
  .am-label span { color: #f97316; }

  .am-hint { font-size: 11.5px; color: #9ca3af; margin-top: 3px; font-family: 'DM Sans', sans-serif; }
  .am-hint.warn { color: #f97316; }

  .am-role-btn {
    flex: 1; padding: 12px 0; border-radius: 11px;
    font-size: 14px; font-weight: 600; font-family: 'Sora', sans-serif;
    cursor: pointer; border: 1.5px solid #e5e7eb;
    background: #fff; color: #6b7280;
    transition: all .18s ease;
    display: flex; align-items: center; justify-content: center; gap: 7px;
  }
  .am-role-btn:hover  { border-color: #f97316; color: #f97316; background: #fff7ed; }
  .am-role-btn.active {
    background: #fff7ed; border-color: #f97316; color: #ea580c;
    box-shadow: 0 0 0 2.5px rgba(249,115,22,.18);
  }

  .am-submit {
    width: 100%; padding: 13px; border: none; border-radius: 12px;
    background: linear-gradient(135deg, #f97316, #ea580c);
    color: #fff; font-size: 14.5px; font-weight: 700;
    font-family: 'Sora', sans-serif; cursor: pointer; letter-spacing: .02em;
    transition: opacity .2s, transform .15s, box-shadow .2s;
    box-shadow: 0 4px 16px rgba(249,115,22,.32);
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .am-submit:hover:not(:disabled) { opacity: .91; transform: translateY(-1.5px); box-shadow: 0 6px 22px rgba(249,115,22,.42); }
  .am-submit:disabled              { opacity: .6; cursor: not-allowed; }

  .am-two  { display: grid; grid-template-columns: 1fr 1fr; gap: 11px; }
  .am-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 11px; align-items: start; }
  .am-grid-full { grid-column: 1 / -1; }

  .am-divider {
    display: flex; align-items: center; gap: 10px;
    color: #9ca3af; font-size: 12px; font-family: 'DM Sans', sans-serif;
    margin: 18px 0 14px;
  }
  .am-divider::before,.am-divider::after { content: ''; flex: 1; height: 1px; background: #e5e7eb; }

  .am-pw-wrap { position: relative; }
  .am-pw-eye {
    position: absolute; right: 11px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer; color: #9ca3af; padding: 0;
    display: flex; align-items: center; transition: color .15s;
  }
  .am-pw-eye:hover { color: #f97316; }

  @media (max-width: 540px) {
    .am-two  { grid-template-columns: 1fr; }
    .am-grid { grid-template-columns: 1fr; }
    .am-grid-full { grid-column: 1; }
    .am-body { padding: 22px 18px 20px; }
  }
`;

/* ─── Reusable atoms ─── */
const Field = ({ label, required, hint, hintWarn, children }) => (
  <div style={{ display: "flex", flexDirection: "column" }}>
    {label && <label className="am-label">{label}{required && <span> *</span>}</label>}
    {children}
    {hint && <p className={`am-hint${hintWarn ? " warn" : ""}`}>{hint}</p>}
  </div>
);

const TwoCol = ({ children }) => <div className="am-two">{children}</div>;

const Spinner = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    style={{ animation: "amSpin .8s linear infinite", flexShrink: 0 }}>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>
);

const Banner = ({ msg }) => {
  if (!msg) return null;
  const ok = msg.toLowerCase().includes("success");
  return (
    <div style={{
      padding: "10px", borderRadius: 10, fontSize: 13, fontWeight: 500,
      fontFamily: "'DM Sans', sans-serif",
      background: ok ? "#f0fdf4" : "#fff1f2",
      color:      ok ? "#16a34a" : "#e11d48",
      border:     `1px solid ${ok ? "#bbf7d0" : "#fecdd3"}`,
      display: "flex", alignItems: "center", gap: 8,
    }}>
      {ok ? "✅" : "⚠️"} {msg}
    </div>
  );
};

const EyeOpen = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeClosed = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const PasswordField = ({ name, label, value, onChange, placeholder, hint, required }) => {
  const [show, setShow] = useState(false);
  return (
    <Field label={label} required={required} hint={hint}>
      <div className="am-pw-wrap">
        <input name={name} type={show ? "text" : "password"} placeholder={placeholder}
          value={value} className="am-input" style={{ paddingRight: 40 }}
          required={required} onChange={onChange} />
        <button type="button" className="am-pw-eye" onClick={() => setShow(s => !s)} tabIndex={-1}>
          {show ? <EyeOpen /> : <EyeClosed />}
        </button>
      </div>
    </Field>
  );
};

const CloseBtn = ({ onClick }) => (
  <button className="am-close" onClick={onClick} aria-label="Close">
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M1 1l11 11M12 1L1 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  </button>
);

/* SIGN IN */
const SignInModal = ({ isOpen, onClose, onAuthSuccess, onOtpSent, onSwitchToSignUp }) => {
  const [form,    setForm]    = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { if (isOpen) { setForm({ email: "", password: "" }); setMessage(""); } }, [isOpen]);
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setMessage(""); setLoading(true);
    try {
      const res = await axios.post("http://localhost:8002/api/users/signin", form);
      console.log("handleSubmit",res.data.user)
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        setMessage("Login successful!");
        onAuthSuccess?.({ name: res.data.user?.name || "User", role: res.data.user?.role });
        setTimeout(onClose, 800);
      } else if (res.data.userId) {
        setMessage(res.data.message || "OTP sent to your email");
        onOtpSent?.({ userId: res.data.userId, email: form.email });
      }
    } catch (err) {
      if (err?.response?.status === 403 && err?.response?.data?.userId) {
        setMessage(err.response.data.message || "Please verify your email");
        onOtpSent?.({ userId: err.response.data.userId, email: form.email });
      } else {
        setMessage(err?.response?.data?.message || "Invalid email or password.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="am-modal-root">
      <style>{STYLES}</style>
      <div className="am-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="am-card am-card-signin">
          {/* <div className="am-top-bar" /> */}
          <div className="am-body">
            <CloseBtn onClick={onClose} />

            {/* Icon + heading */}
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{
                width: 60, height: 60, borderRadius: "50%", margin: "0 auto 14px",
                background: "linear-gradient(145deg,#fff7ed,#ffedd5)",
                border: "2px solid #fed7aa",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {/* Person icon */}
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <circle cx="14" cy="10" r="5" stroke="#f97316" strokeWidth="1.8"/>
                  <path d="M4 25c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round"/>
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
                <input name="email" type="email" placeholder="you@example.com"
                  value={form.email} className="am-input" required onChange={handleChange} />
              </Field>

              <div>
                <PasswordField name="password" label="Password" required
                  placeholder="Your password" value={form.password} onChange={handleChange} />
                <div style={{ textAlign: "right", marginTop: 5 }}>
                  <a href="#" style={{ fontSize: 12.5, color: "#f97316", fontWeight: 600, textDecoration: "none", fontFamily: "'DM Sans',sans-serif" }}>
                    Forgot password?
                  </a>
                </div>
              </div>

              <Banner msg={message} />

              <button type="submit" className="am-submit" disabled={loading}>
                {loading ? <><Spinner /> Signing in…</> : "Sign In →"}
              </button>
            </form>

            <div className="am-divider">or</div>

            <p style={{ textAlign: "center", fontSize: 14, fontFamily: "'DM Sans',sans-serif", color: "#6b7280", margin: 0 }}>
              Don't have an account?{" "}
              <span onClick={onSwitchToSignUp}
                style={{ color: "#f97316", cursor: "pointer", fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 3 }}>
                Create one free →
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* SIGN UP  */
const SignUpModal = ({ isOpen, onClose, onOtpSent, onSwitchToSignIn }) => {
  const [role,      setRole]      = useState("candidate");
  const [loading,   setLoading]   = useState(false);
  const [message,   setMessage]   = useState("");
  const [emailWarn, setEmailWarn] = useState("");
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "",
    phoneNumber: "", city: "", country: "",
    companyName: "", companyDescription: "",
    companyCity: "", companyCountry: "", companySize: "", companyType: "",
  });

  const resetForm = () => {
    setForm({ firstName:"",lastName:"",email:"",password:"",phoneNumber:"",city:"",country:"",
      companyName:"",companyDescription:"",companyCity:"",companyCountry:"",companySize:"",companyType:"" });
    setMessage(""); setEmailWarn(""); setRole("candidate");
  };

  useEffect(() => { if (isOpen) resetForm(); }, [isOpen]);
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setMessage(""); setLoading(true);
    try {
      const payload = role === "candidate"
        ? { firstName:form.firstName, lastName:form.lastName, email:form.email, password:form.password,
            role:"candidate", phoneNumber:form.phoneNumber, location:{city:form.city, country:form.country} }
        : { firstName:form.firstName, lastName:form.lastName, email:form.email, password:form.password,
            phoneNumber:form.phoneNumber, role:"company",
            companyName:form.companyName, companyDescription:form.companyDescription,
            companySize:form.companySize, companyType:form.companyType,
            location:{city:form.companyCity, country:form.companyCountry} };

      const res = await axios.post("http://localhost:8002/api/users/signup", payload);
      setMessage(res.data.message);
      onOtpSent?.({ userId: res.data.userId, email: form.email });
    } catch (err) {
      if (err?.response?.status === 403 && err?.response?.data?.userId) {
        setMessage(err.response.data.message || "Please verify your email");
        onOtpSent?.({ userId: err.response.data.userId, email: form.email });
      } else {
        setMessage(err?.response?.data?.message || "Signup failed. Please try again.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="am-modal-root">
      <style>{STYLES}</style>
      <div className="am-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="am-card am-card-signup">
          <div className="am-body">
            <CloseBtn onClick={onClose} />

            {/* Heading */}
            <div style={{ marginBottom: 18, paddingRight: 36 }}>
              <h2 style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 21, fontWeight: 700, color: "#111827" }}>
                {role === "company" ? "Start recruiting top talent 🚀" : "Find your next opportunity 💼"}
              </h2>
              <p style={{ margin: "5px 0 0", fontSize: 13, color: "#6b7280", fontFamily: "'DM Sans',sans-serif" }}>
                Create your free account — it only takes a minute
              </p>
            </div>

            {/* Role selector */}
            <div style={{ marginBottom: 16 }}>
              <p className="am-label" style={{ marginBottom: 8 }}>
                I'm joining as… <span style={{ color: "#f97316" }}>*</span>
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                {[
                  { value: "candidate", icon: "👤", label: "Job Seeker" },
                  { value: "company",   icon: "🏢", label: "Employer"   },
                ].map(({ value, icon, label }) => (
                  <button key={value} type="button"
                    className={`am-role-btn ${role === value ? "active" : ""}`}
                    onClick={() => { setRole(value); setEmailWarn(""); setMessage(""); }}>
                    <span style={{ fontSize: 16 }}>{icon}</span> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Separator */}
            <div style={{ height: 1, background: "#f3f4f6", marginBottom: 16 }} />

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>

              {/* ── CANDIDATE ── */}
              {role === "candidate" && (
                <>
                  <TwoCol>
                    <Field label="First Name" required>
                      <input name="firstName" type="text" placeholder="Jane"
                        value={form.firstName} className="am-input" required onChange={handleChange} />
                    </Field>
                    <Field label="Last Name" required>
                      <input name="lastName" type="text" placeholder="Doe"
                        value={form.lastName} className="am-input" required onChange={handleChange} />
                    </Field>
                  </TwoCol>

                  <TwoCol>
                    <Field label="Email Address" required>
                      <input name="email" type="email" placeholder="jane@example.com"
                        value={form.email} className="am-input" required onChange={handleChange} />
                    </Field>
                    <Field label="Phone Number" required>
                      <PhoneInput country={"gb"} value={form.phoneNumber}
                        onChange={(phone) => setForm(f => ({ ...f, phoneNumber: phone }))}
                        inputStyle={{ width:"100%",height:"42px",borderRadius:"10px",border:"1.5px solid #e5e7eb",fontFamily:"'DM Sans',sans-serif",fontSize:"13.5px" }}
                        containerStyle={{ width:"100%" }}
                      />
                    </Field>
                  </TwoCol>

                  <PasswordField name="password" label="Password" required
                    placeholder="Min. 8 characters" value={form.password} onChange={handleChange}
                    hint="Minimum 8 characters recommended." />

                  <TwoCol>
                    <Field label="City" required>
                      <input name="city" type="text" placeholder="London"
                        value={form.city} className="am-input" required onChange={handleChange} />
                    </Field>
                    <Field label="Country" required>
                      <select name="country" value={form.country} className="am-input" required onChange={handleChange}>
                        <option value="">Select country</option>
                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </Field>
                  </TwoCol>
                </>
              )}

              {/* ── COMPANY ── */}
              {role === "company" && (
                <div className="am-grid">
                  <Field label="Contact First Name" required hint="Primary contact for hiring">
                    <input name="firstName" value={form.firstName} placeholder="Jane"
                      className="am-input" onChange={handleChange} />
                  </Field>
                  <Field label="Contact Last Name" required>
                    <input name="lastName" value={form.lastName} placeholder="Doe"
                      className="am-input" onChange={handleChange} />
                  </Field>

                  <Field label="Company Name" required>
                      <input name="companyName" value={form.companyName} placeholder="Acme Corp"
                        className="am-input" onChange={handleChange} />
                    </Field>
                          <Field label="Phone Number" required hint="We'll contact you about applicants.">
                      <PhoneInput country={"gb"} value={form.phoneNumber}
                        onChange={(phone) => setForm(f => ({ ...f, phoneNumber: phone }))}
                        inputStyle={{ width:"100%",height:"42px",borderRadius:"10px",border:"1.5px solid #e5e7eb",fontFamily:"'DM Sans',sans-serif",fontSize:"13.5px" }}
                        containerStyle={{ width:"100%" }}
                      />
                    </Field>

                  <div className="am-grid-full">
                    <Field label="Company Description" required>
                      <textarea name="companyDescription" value={form.companyDescription} rows={3}
                        placeholder="Tell candidates about your mission, culture and what you do…"
                        className="am-input" onChange={handleChange}
                        style={{ resize:"vertical", minHeight: 78 }}
                      />
                    </Field>
                  </div>

                  <Field label="City" required>
                    <input name="companyCity" value={form.companyCity} placeholder="London"
                      className="am-input" onChange={handleChange} />
                  </Field>
                  <Field label="Country" required>
                    <select name="companyCountry" value={form.companyCountry} className="am-input" onChange={handleChange}>
                      <option value="">Select country</option>
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>

                  <Field label="Company Size" required>
                    <select name="companySize" value={form.companySize} className="am-input" onChange={handleChange}>
                      <option value="">Select size</option>
                      <option value="1-10">1–10 employees</option>
                      <option value="11-50">11–50 employees</option>
                      <option value="51-200">51–200 employees</option>
                      <option value="201-500">201–500 employees</option>
                      <option value="500+">500+ employees</option>
                    </select>
                  </Field>
                  <Field label="Company Type" required>
                    <select name="companyType" value={form.companyType} className="am-input" onChange={handleChange}>
                      <option value="">Select type</option>
                      <option value="direct-employer">Direct Employer</option>
                      <option value="agency">Recruitment Agency</option>
                      <option value="non-profit">Non-profit / Charity</option>
                    </select>
                  </Field>

                  <Field label="Official Company Email" required
                    hint={emailWarn || "Use your work email — not Gmail/Yahoo etc."} hintWarn={!!emailWarn}>
                    <input name="email" type="email" value={form.email} placeholder="jane@acmecorp.com"
                      className={`am-input${emailWarn ? " error" : ""}`} onChange={handleChange} />
                  </Field>
                  <PasswordField name="password" label="Password" required
                    placeholder="Min. 8 characters" value={form.password} onChange={handleChange}
                    hint="Minimum 8 characters recommended." />
                </div>
              )}

              <Banner msg={message} />

              <button type="submit" className="am-submit" disabled={loading || !!emailWarn} style={{ marginTop: 4 }}>
                {loading ? <><Spinner /> Creating account…</> : "Create Account →"}
              </button>
            </form>

            <div className="am-divider">or</div>

            <p style={{ textAlign:"center", fontSize:14, fontFamily:"'DM Sans',sans-serif", color:"#6b7280", margin:0 }}>
              Already have an account?{" "}
              <span onClick={onSwitchToSignIn}
                style={{ color:"#f97316", cursor:"pointer", fontWeight:700, textDecoration:"underline", textUnderlineOffset:3 }}>
                Sign in →
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════ DROP-IN WRAPPER — same API as the old AuthModal ══════════ */
const AuthModal = ({ isOpen, onClose, onAuthSuccess, onOtpSent, initialMode = "signin" }) => {
  const [mode, setMode] = useState(initialMode);
  useEffect(() => { if (isOpen) setMode(initialMode); }, [isOpen, initialMode]);

  return (
    <>
      <SignInModal
        isOpen={isOpen && mode === "signin"}
        onClose={onClose}
        onAuthSuccess={onAuthSuccess}
        onOtpSent={onOtpSent}
        onSwitchToSignUp={() => setMode("signup")}
      />
      <SignUpModal
        isOpen={isOpen && mode === "signup"}
        onClose={onClose}
        onOtpSent={onOtpSent}
        onSwitchToSignIn={() => setMode("signin")}
      />
    </>
  );
};

export default AuthModal;