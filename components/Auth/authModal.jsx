import React, { useState, useEffect } from "react";
import axios from "axios";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const FREE_DOMAINS = [
  "gmail.com","yahoo.com","hotmail.com","outlook.com","live.com",
  "icloud.com","aol.com","protonmail.com","mail.com","ymail.com",
  "googlemail.com","msn.com","me.com","mac.com",
];

// const isPersonalEmail = (email) => {
//   const domain = email.split("@")[1]?.toLowerCase();
//   return FREE_DOMAINS.includes(domain);
// };

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
  .am-card { animation: amSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }

  @keyframes amFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes amSlideUp {
    from { opacity: 0; transform: translateY(28px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  @keyframes amSpin {
    to { transform: rotate(360deg); }
  }

  .am-input {
    width: 100%;
    padding: 8px 10px;
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

  .am-input.error {
    border-color: #f43f5e;
    box-shadow: 0 0 0 3px rgba(244,63,94,.10);
  }

  .am-label {
    font-size: 11.5px;
    font-weight: 600;
    color: #374151;
    font-family: 'Sora', sans-serif;
    letter-spacing: .03em;
    margin-bottom: 2px;
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

  .am-role-btn:hover {
    border-color: #f97316;
    color: #f97316;
  }

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

  .am-submit:hover:not(:disabled) {
    opacity: .92;
    transform: translateY(-1px);
  }

  .am-submit:disabled {
    opacity: .65;
    cursor: not-allowed;
  }

  .am-close {
    position: absolute;
    top: 14px;
    right: 14px;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #f3f4f6;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6b7280;
    font-size: 16px;
    transition: background .15s, color .15s;
  }

  .am-close:hover {
    background: #fee2e2;
    color: #ef4444;
  }

  .am-hint {
    font-size: 11.5px;
    color: #9ca3af;
    margin-top: 2px;
    font-family: 'DM Sans', sans-serif;
  }

  .am-hint.warn { color: #f97316; }

  .am-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
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

const Spinner = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    style={{ animation: "amSpin .8s linear infinite", display: "inline-block" }}
  >
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83 M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>
);

const Banner = ({ msg }) => {
  if (!msg) return null;
  const ok = msg.toLowerCase().includes("successful");
  return (
    <div
      style={{
        padding: "9px 13px",
        borderRadius: 8,
        fontSize: 12.5,
        fontWeight: 500,
        background: ok ? "#f0fdf4" : "#fff1f2",
        color: ok ? "#16a34a" : "#e11d48",
        border: `1px solid ${ok ? "#bbf7d0" : "#fecdd3"}`,
      }}
    >
      {ok ? "✅ " : "⚠️ "}{msg}
    </div>
  );
};

const AuthModal = ({
  isOpen, onClose, onAuthSuccess, onOtpSent, initialMode = "signin",
}) => {
  const [mode, setMode] = useState(initialMode);
  const [role, setRole] = useState("candidate");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [emailWarn, setEmailWarn] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    city: "",
    country: "",
    companyName: "",
    companyDescription: "",
    companyCity: "",
    companyCountry: "",
    companySize: "",
    companyType: "",
  });

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setMessage("");
      setEmailWarn("");
      setRole("candidate");
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phoneNumber: "",
        city: "",
        country: "",
        companyName: "",
        companyDescription: "",
        companyCity: "",
        companyCountry: "",
        companySize: "",
        companyType: "",
      });
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // if (name === "email" && role === "company" && mode === "signup") {
    //   if (value.includes("@") && isPersonalEmail(value)) {
    //     setEmailWarn("Personal email domains (Gmail, Yahoo, etc.) are not allowed for company accounts.");
    //   } else {
    //     setEmailWarn("");
    //   }
    // }
  };

  //check the status if the email is sent, 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // if (mode === "signup" && role === "company" && isPersonalEmail(form.email)) {
    //   setMessage("Please use your official company email address.");
    //   return;
    // }

    setLoading(true);
    try {
      if (mode === "signup") {
        const payload =
          role === "candidate"
            ? {
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                password: form.password,
                role: "candidate",
                phoneNumber: form.phoneNumber,
                location: {
                  city: form.city,
                  country: form.country,
                },
              }
            : {
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                password: form.password,
                phoneNumber: form.phoneNumber,
                role: "company",
                companyName: form.companyName,
                companyDescription: form.companyDescription,
                companySize: form.companySize,
                companyType: form.companyType,
                location: {
                  city: form.companyCity,
                  country: form.companyCountry,
                },
              };

        const res = await axios.post("http://localhost:8002/api/users/signup", payload);
        console.log("handleSubmit",res.data)
        console.log("handleSubmit form.email",form.email)
       setMessage(res.data.message);
        onOtpSent?.({
          userId: res.data.userId,
          email: form.email,
        });
      } else {
        const res = await axios.post("http://localhost:8002/api/users/signin", {
          email: form.email,
          password: form.password,
        });
    console.log("handleSubmit2",res)
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
          setMessage("Login successful!");

          onAuthSuccess?.({
            name: res.data.user?.name || "User",
            role: res.data.user?.role,
          });

          setTimeout(onClose, 800);
        } else if (res.data.userId) {
      setMessage(res.data.message || "OTP sent to your email");

      onOtpSent?.({
        userId: res.data.userId,
        email: form.email,
      });
        }
      }
    } catch (err) {
      if (err?.response?.status === 403 && err?.response?.data?.userId) {
    setMessage(err.response.data.message || "Please verify your email");

      onOtpSent?.({
        userId: err.response.data.userId,
        email: form.email,
      });
      } else {
        setMessage(
          err?.response?.data?.message ||
            (mode === "signup"
              ? "Signup failed. Please try again."
              : "Invalid email or password.")
        );
      }
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
            maxWidth: 650,
            width: "100%",
            maxHeight: "98vh",
            fontFamily: "'DM Sans', sans-serif",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#ffffff",
            opacity: 1,
          }}
        >
          <div style={{ padding: "24px 30px", overflowY: "auto", flex: 1 }}>
            <button className="am-close" onClick={onClose}>✕</button>

            <div style={{ marginBottom: 15, paddingRight: 30 }}>
              <h2>
                {!isSignup
                  ? "Welcome back 👋"
                  : role === "company"
                  ? "Register with us and start recruiting top talent. 🚀"
                  : "Create your profile and get matched with jobs. 💼"}
              </h2>
            </div>

            {isSignup && (
              <div style={{ marginBottom: 15 }}>
                <p className="am-label" style={{ marginBottom: 8 }}>
                  I am joining as a… <span style={{ color: "#f97316" }}>*</span>
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    className={`am-role-btn ${role === "candidate" ? "active" : ""}`}
                    onClick={() => {
                      setRole("candidate");
                      setEmailWarn("");
                      setMessage("");
                    }}
                  >
                    <span>👤</span> Candidate
                  </button>
                  <button
                    type="button"
                    className={`am-role-btn ${role === "company" ? "active" : ""}`}
                    onClick={() => {
                      setRole("company");
                      setEmailWarn("");
                      setMessage("");
                    }}
                  >
                    <span>🏢</span> Company
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {!isSignup && (
                <>
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

                  <Field label="Password" required>
                    <input
                      name="password"
                      type="password"
                      placeholder="Your password"
                      value={form.password}
                      className="am-input"
                      required
                      onChange={handleChange}
                    />
                  </Field>

                  <div style={{ textAlign: "right", marginTop: -4 }}>
                    <a href="#" style={{ fontSize: 12, color: "#f97316", fontWeight: 600, textDecoration: "none" }}>
                      Forgot password?
                    </a>
                  </div>
                </>
              )}

              {isSignup && role === "candidate" && (
                <>
                  <Row>
                    <Field label="First Name" required>
                      <input
                        name="firstName"
                        type="text"
                        placeholder="Jane"
                        value={form.firstName}
                        className="am-input"
                        required
                        onChange={handleChange}
                      />
                    </Field>

                    <Field label="Last Name" required>
                      <input
                        name="lastName"
                        type="text"
                        placeholder="Doe"
                        value={form.lastName}
                        className="am-input"
                        required
                        onChange={handleChange}
                      />
                    </Field>
                  </Row>

                  <Row>
                    <Field label="Email Address" required>
                      <input
                        name="email"
                        type="email"
                        placeholder="jane@example.com"
                        value={form.email}
                        className="am-input"
                        required
                        onChange={handleChange}
                      />
                    </Field>

                    <Field label="Phone Number" required>
                      <PhoneInput
                        country={"gb"}
                        value={form.phoneNumber}
                        onChange={(phone) => setForm((f) => ({ ...f, phoneNumber: phone }))}
                        inputClass="am-input"
                        containerStyle={{ width: "100%" }}
                        inputStyle={{
                          width: "100%",
                          height: "42px",
                          borderRadius: "10px",
                          border: "1.5px solid #e5e7eb",
                        }}
                      />
                    </Field>
                  </Row>

                  <Field label="Password" required hint="Minimum 8 characters recommended.">
                    <input
                      name="password"
                      type="password"
                      placeholder="Min. 8 characters"
                      value={form.password}
                      className="am-input"
                      required
                      onChange={handleChange}
                    />
                  </Field>

                  <Row>
                    <Field label="City" required>
                      <input
                        name="city"
                        type="text"
                        placeholder="London"
                        value={form.city}
                        className="am-input"
                        required
                        onChange={handleChange}
                      />
                    </Field>

                    <Field label="Country" required>
                      <select
                        name="country"
                        value={form.country}
                        className="am-input"
                        required
                        onChange={handleChange}
                      >
                        <option value="">Select country</option>
                        {COUNTRIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </Field>
                  </Row>
                </>
              )}

              {isSignup && role === "company" && (
                <div className="am-grid">
                  <Field label="Contact First Name" required hint="Primary contact for hiring discussions">
                    <input
                      name="firstName"
                      value={form.firstName}
                      placeholder="Jane"
                      className="am-input"
                      onChange={handleChange}
                    />
                  </Field>

                  <Field label="Contact Last Name" required>
                    <input
                      name="lastName"
                      value={form.lastName}
                      placeholder="Doe"
                      className="am-input"
                      onChange={handleChange}
                    />
                  </Field>

                  <Field label="Phone Number" required hint="We'll contact you about applicants.">
                    <PhoneInput
                      country={"gb"}
                      value={form.phoneNumber}
                      onChange={(phone) => setForm((f) => ({ ...f, phoneNumber: phone }))}
                      inputClass="am-input"
                      containerStyle={{ width: "100%" }}
                      inputStyle={{
                        width: "100%",
                        height: "42px",
                        borderRadius: "10px",
                        border: "1.5px solid #e5e7eb",
                      }}
                    />
                  </Field>

                  <div className="am-grid-full">
                    <Field label="Company Name" required>
                      <input
                        name="companyName"
                        value={form.companyName}
                        placeholder="Acme Corp"
                        className="am-input"
                        onChange={handleChange}
                      />
                    </Field>
                  </div>

                  <div className="am-grid-full">
                    <Field label="Company Description" required>
                      <textarea
                        name="companyDescription"
                        value={form.companyDescription}
                        placeholder="Tell candidates what your company does, your mission, and culture…"
                        className="am-input"
                        rows={3}
                        onChange={handleChange}
                      />
                    </Field>
                  </div>

                  <Field label="City" required>
                    <input
                      name="companyCity"
                      value={form.companyCity}
                      placeholder="London"
                      className="am-input"
                      onChange={handleChange}
                    />
                  </Field>

                  <Field label="Country" required>
                    <select
                      name="companyCountry"
                      value={form.companyCountry}
                      className="am-input"
                      onChange={handleChange}
                    >
                      <option value="">Select country</option>
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
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

                  <Field
                    label="Official Company Email"
                    required
                    hint={emailWarn || "Use your work email, not Gmail/Yahoo etc."}
                    hintWarn={!!emailWarn}
                  >
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      placeholder="jane@acmecorp.com"
                      className={`am-input${emailWarn ? " error" : ""}`}
                      onChange={handleChange}
                    />
                  </Field>

                  <Field label="Password" required hint="Minimum 8 characters recommended.">
                    <input
                      name="password"
                      type="password"
                      placeholder="Min. 8 characters"
                      value={form.password}
                      className="am-input"
                      onChange={handleChange}
                    />
                  </Field>
                </div>
              )}

              <Banner msg={message} />

              <button
                type="submit"
                className="am-submit"
                disabled={loading || !!emailWarn}
                style={{ marginTop: 6 }}
              >
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <Spinner />
                    {isSignup ? "Creating account…" : "Signing in…"}
                  </span>
                ) : (
                  isSignup ? "Create Account →" : "Sign In →"
                )}
              </button>
            </form>

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