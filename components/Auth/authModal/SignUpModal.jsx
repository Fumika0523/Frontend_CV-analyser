import React, { useState, useEffect } from "react";
import axios from "axios";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { FaUser, FaBuilding, FaRocket, FaBriefcase, FaCheckCircle } from "react-icons/fa";
import TermsAcceptanceModal from "../../../pages/legal/TermsAcceptanceModal";
import { TERMS_VERSION } from "../../../pages/legal/terms";
import LocationAutocomplete from "../../common/LocationAutocomplete";
import { Field, TwoCol, Banner, Spinner, PasswordField, CloseBtn } from "./authFormAtoms";
import { isValidEmail } from "./emailHelpers";
import { url } from "../../../utils/constant";



const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  confirmEmail: "",
  password: "",
  phoneNumber: "",

  // Candidate location
  city: "",
  country: "",
  locationDisplay: "",

  // Company fields
  companyName: "",
  companyDescription: "",
  companyUrl: "",

  companyCity: "",
  companyCountry: "",
  companyLocationDisplay: "",
  companySize: "",
  companyType: "",
};

// Builds the payload the backend expects. Candidate and company accounts
// send a different shape, so this keeps that branching out of handleSubmit.
// Note: confirmEmail is intentionally left out — it's a frontend-only
// check and the backend never needs to see it.
const buildSignupPayload = (role, form, guestSessionId) => {
  const base = {
    firstName: form.firstName,
    lastName: form.lastName,
    email: form.email,
    password: form.password,
    phoneNumber: form.phoneNumber,
    role,
    termsAccepted: true,
    termsVersion: TERMS_VERSION,
  };

  if (role === "candidate") {
    return {
      ...base,
      location: { city: form.city, country: form.country },
      guestSessionId,
    };
  }
  return {
    ...base,

    companyName:
      form.companyName,
    companyDescription:
      form.companyDescription,
    companyUrl:
      form.companyUrl.trim(),
    companySize:
      form.companySize,
    companyType:
      form.companyType,
    location: {
      city:
        form.companyCity,
      country:
        form.companyCountry,
    },
  };
};

const SignUpModal = ({ isOpen, onClose, onOtpSent, onSwitchToSignIn, initialRole = "candidate" }) => {
  const [role, setRole] = useState(initialRole);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);


  const resetForm = () => {
    setForm(EMPTY_FORM);
    setMessage("");
    setTermsAccepted(false);
    setTermsModalOpen(false);
    setRole(initialRole);
  };

  // Reset the form every time the modal opens, so a previous attempt
  // never leaks into a new session.
  useEffect(() => {
    if (isOpen) resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialRole]);

  // Lock page scroll while the modal is open, restore it on close/unmount.
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!termsAccepted) {
      setMessage("Please review and accept the Terms & Conditions before registering.");
      setTermsModalOpen(true);
      return;
    }

    const email = form.email.trim().toLowerCase();
const confirmEmail =
  form.confirmEmail.trim().toLowerCase();

  // Basic email format check
if (!isValidEmail(email)) {
  setMessage("Please enter a valid email address.");
  return;
}
    // Prevent email typos
    if(email !== confirmEmail){
      setMessage("Email address do not match. Please check and try again")
      return;
    }

    setLoading(true)
   
    try {
      const guestSessionId = localStorage.getItem("guest_session_id");
      console.log("guestSessionId",guestSessionId)
      const payload = buildSignupPayload(
        role,
        {
          ...form,
          email,
        },
        guestSessionId
      )
      const res = await axios.post(`${url}/signup`, payload);
      console.log("payload:",payload)
      console.log("response for handleSubmit Sign up Modal:",res)
      setMessage(res.data.message);
      onOtpSent?.({ _id: res.data.mongoId, email: form.email });
    } catch (err) {
      // 403 + an _id in the response means the account exists but isn't
      // verified yet — send the user to OTP verification instead of
      // showing a generic error.
      const data = err?.response?.data;

      //Existing account but OTP not completed
      if(
        err?.response?.status === 403 && data?._id
      ){
        setMessage(data.message || "Please verify your email.")

        onOtpSent?.({
          _id: data._id,
          email,
        });
        return
      }
      setMessage(data?.message || "Signup failed. please try again")
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="am-modal-root">
      <div className="am-overlay">
        <div className="am-card am-card-signup">
          <div className="am-body">
            <CloseBtn onClick={onClose} />

            <div style={{ marginBottom: 18, paddingRight: 36 }}>
              <h2
                style={{
                  margin: 0,
                  fontFamily: "'Sora',sans-serif",
                  fontSize: 21,
                  fontWeight: 700,
                  color: "#111827",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {role === "company" ? (
                  <>
                    <FaRocket size={22} color="#1d4ed8" /> Start recruiting top talent
                  </>
                ) : (
                  <>
                    <FaBriefcase size={22} color="#1d4ed8" /> Find your next opportunity
                  </>
                )}
              </h2>

            </div>

            {/* Role selector */}
            <div style={{ marginBottom: 16 }}>
              <p className="am-label" style={{ marginBottom: 8 }}>
                I'm joining as… <span style={{ color: "red" }}>*</span>
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                {[
                  { value: "candidate", Icon: FaUser, label: "Job Seeker" },
                  { value: "company", Icon: FaBuilding, label: "Employer" },
                ].map(({ value, Icon, label }) => (
                  <button
                    key={value}
                    type="button"
                    className={`am-role-btn ${role === value ? "active" : ""}`}
                    onClick={() => {
                      setRole(value);
                      setMessage("");
                    }}
                  >
                    <Icon size={15} /> {label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ height: 1, background: "#f3f4f6", marginBottom: 16 }} />

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {role === "candidate" && (
                <>
                  <TwoCol>
                    {/* First Name */}
                    <Field label="First Name" required>
                      <input name="firstName" type="text" placeholder="Jane" value={form.firstName} className="am-input" required onChange={handleChange} />
                    </Field>

                    {/* Last Name */}
                    <Field label="Last Name" required>
                      <input name="lastName" type="text" placeholder="Doe" value={form.lastName} className="am-input" required onChange={handleChange} />
                    </Field>
                  </TwoCol>

                  <TwoCol>
                    {/* Email */}
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

                    {/* Confirm Email Address */}
                    <Field label="Confirm Email Address" required>
                      <input
                        name="confirmEmail"
                        type="email"
                        placeholder="jane@example.com"
                        value={form.confirmEmail}
                        className="am-input"
                        required
                        onChange={handleChange}
                        onPaste={(e) => e.preventDefault()}
                      />
                    </Field>
                  </TwoCol>

                  <TwoCol>
                    <Field label="Phone Number" required>
                      <PhoneInput
                        country={"gb"}
                        value={form.phoneNumber}
                        onChange={(phone) => setForm((f) => ({ ...f, phoneNumber: phone }))}
                        inputStyle={{ width: "100%", height: "42px", borderRadius: "10px", border: "1.5px solid #e5e7eb", fontFamily: "'DM Sans',sans-serif", fontSize: "13.5px" }}
                        containerStyle={{ width: "100%" }}
                      />
                    </Field>
                    <PasswordField
                      name="password"
                      label="Password"
                      required
                      placeholder="Min. 8 characters"
                      value={form.password}
                      onChange={handleChange}
                      hint="Minimum 8 characters recommended."
                    />
                  </TwoCol>

                  <Field label="Location" required>
                    <LocationAutocomplete
                      value={form.locationDisplay}
                      onChange={(location) =>
                        setForm((prev) => ({
                          ...prev,
                          city: location.city,
                          country: location.country,
                          locationDisplay: location.displayName,
                        }))
                      }
                      placeholder="Search your city or country"
                    />
                  </Field>
                </>
              )}

              {role === "company" && (
                <div className="am-grid">
                  <Field label="Contact First Name" required hint="Primary contact for hiring">
                    <input name="firstName" value={form.firstName} placeholder="Jane" className="am-input" onChange={handleChange} />
                  </Field>
                  <Field label="Contact Last Name" required>
                    <input name="lastName" value={form.lastName} placeholder="Doe" className="am-input" onChange={handleChange} />
                  </Field>
                  {/* Company Name */}
                  <Field label="Company Name" required>
                    <input name="companyName" value={form.companyName} placeholder="Acme Corp" className="am-input" onChange={handleChange} />
                  </Field>

                  {/* Company URL */}
                  {/* Company Website */}
                  <Field
                    label="Company Website"
                    hint="Optional — you can add or change this later"
                  >
                    <input
                      name="companyUrl"
                      type="url"
                      value={form.companyUrl}
                      placeholder="https://www.acmecorp.com"
                      className="am-input"
                      onChange={handleChange}
                    />
                  </Field>
                  {/* Phone Number */}
                  <Field label="Phone Number" required>
                    <PhoneInput
                      country={"gb"}
                      value={form.phoneNumber}
                      onChange={(phone) => setForm((f) => ({ ...f, phoneNumber: phone }))}
                      inputStyle={{ width: "100%", height: "42px", borderRadius: "10px", border: "1.5px solid #e5e7eb", fontFamily: "'DM Sans',sans-serif", fontSize: "13.5px" }}
                      containerStyle={{ width: "100%" }}
                    />
                  </Field>

                  <div className="am-grid-full">
                    {/* Company Description */}
                    <Field label="Company Description" required>
                      <textarea
                        name="companyDescription"
                        value={form.companyDescription}
                        rows={3}
                        placeholder="Tell candidates about your mission, culture and what you do…"
                        className="am-input"
                        onChange={handleChange}
                        style={{ resize: "vertical", minHeight: 78 }}
                      />
                    </Field>
                  </div>

                  <div className="am-grid-full">
                    {/* Company Location */}
                    <Field label="Company Location" required>
                      <LocationAutocomplete
                        value={form.companyLocationDisplay}
                        onChange={(location) =>
                          setForm((prev) => ({
                            ...prev,
                            companyCity: location.city,
                            companyCountry: location.country,
                            companyLocationDisplay: location.displayName,
                          }))
                        }
                        placeholder="Search company city or country"
                      />
                    </Field>
                  </div>

                  {/* Company Size */}
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

                  {/* Company Type */}
                  <Field label="Company Type" required>
                    <select name="companyType" value={form.companyType} className="am-input" onChange={handleChange}>
                      <option value="">Select type</option>
                      <option value="direct-employer">Direct Employer</option>
                      <option value="agency">Recruitment Agency</option>
                      <option value="non-profit">Non-profit / Charity</option>
                    </select>
                  </Field>

                  {/* Email */}
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

                  {/* Confirm Email  */}
                  <Field label="Confirm Email Address" required>
                    <input
                      name="confirmEmail"
                      type="email"
                      value={form.confirmEmail}
                      placeholder="jane@acmecorp.com"
                      className="am-input"
                      onChange={handleChange}
                      onPaste={(e) => e.preventDefault()}
                    />
                  </Field>

                  {/* Password */}
                  <PasswordField
                    name="password"
                    label="Password"
                    required
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={handleChange}
                    hint="Minimum 8 characters recommended."
                  />
                </div>
              )}

              {/* Terms & Conditions acceptance */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: 12,
                  border: `1px solid ${termsAccepted ? "#bbf7d0" : "#cbd5e1"}`,
                  borderRadius: 11,
                  background: termsAccepted ? "#f0fdf4" : "#f8fafc",
                }}
              >
                <input
                  id="termsAccepted"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={() => (termsAccepted ? setTermsAccepted(false) : setTermsModalOpen(true))}
                  style={{ marginTop: 3, width: 16, height: 16, cursor: "pointer" }}
                />

                <div style={{ color: "#334155", fontFamily: "'DM Sans', sans-serif", fontSize: 12.5, lineHeight: 1.55 }}>
                  <label htmlFor="termsAccepted" style={{ cursor: "pointer" }}>
                    I agree to the{" "}
                  </label>
                  <button
                    type="button"
                    onClick={() => setTermsModalOpen(true)}
                    style={{ padding: 0, border: 0, background: "transparent", color: "#1d4ed8", cursor: "pointer", font: "inherit", fontWeight: 700, textDecoration: "underline" }}
                  >
                    Terms & Conditions
                  </button>{" "}
                  and acknowledge the Privacy Policy.
                  {termsAccepted && (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        marginTop: 3,
                        color: "#15803d",
                        fontWeight: 700,
                      }}
                    >
                      <FaCheckCircle size={13} /> Accepted
                    </span>
                  )}
                </div>
              </div>

              <Banner msg={message} />

              <button type="submit" className="am-submit"
                disabled={
                  loading ||
                  !termsAccepted
                }
                style={{ marginTop: 4 }}>
                {loading ? (
                  <>
                    <Spinner /> Creating account…
                  </>
                ) : (
                  "Create Account →"
                )}
              </button>
            </form>

            <div className="am-divider">or</div>

            <p style={{ textAlign: "center", fontSize: 14, fontFamily: "'DM Sans',sans-serif", color: "#6b7280", margin: 0 }}>
              Already have an account?{" "}
              <span
                onClick={onSwitchToSignIn}
                style={{ color: "#1d4ed8", cursor: "pointer", fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 3 }}
              >
                Sign in →
              </span>
            </p>
          </div>
        </div>
      </div>

      <TermsAcceptanceModal
        isOpen={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        onAccept={() => {
          setTermsAccepted(true);
          setMessage("");
        }}
      />
    </div>
  );
};

export default SignUpModal;