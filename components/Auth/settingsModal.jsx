import React, { useEffect, useState } from "react";
import axios from "axios";

const SETTINGS_STYLES = `
  .sm-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    z-index: 70;
  }

  .sm-card {
    width: 100%;
    max-width: 560px;
    background: #fff;
    border-radius: 20px;
    box-shadow: 0 24px 60px rgba(0,0,0,.18);
    padding: 24px;
    position: relative;
    max-height: 90vh;
    overflow-y: auto;
    font-family: 'DM Sans', sans-serif;
  }

  .sm-close {
    position: absolute;
    top: 14px;
    right: 16px;
    background: transparent;
    border: none;
    font-size: 22px;
    color: #9ca3af;
    cursor: pointer;
  }

  .sm-close:hover {
    color: #374151;
  }

  .sm-title {
    font-family: 'Sora', sans-serif;
    font-size: 20px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 6px;
  }

  .sm-subtitle {
    font-size: 13px;
    color: #6b7280;
    margin-bottom: 18px;
  }

  .sm-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .sm-full {
    grid-column: 1 / -1;
  }

  .sm-field {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .sm-label {
    font-size: 12px;
    font-weight: 600;
    color: #374151;
    font-family: 'Sora', sans-serif;
  }

  .sm-input, .sm-textarea {
    width: 100%;
    border: 1.5px solid #e5e7eb;
    border-radius: 10px;
    padding: 10px 12px;
    font-size: 14px;
    color: #111827;
    outline: none;
    box-sizing: border-box;
    background: #fff;
  }

  .sm-input:focus, .sm-textarea:focus {
    border-color: #f97316;
    box-shadow: 0 0 0 3px rgba(249,115,22,.12);
  }

  .sm-input[disabled] {
    background: #f9fafb;
    color: #9ca3af;
    cursor: not-allowed;
  }

  .sm-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 18px;
  }

  .sm-btn-secondary {
    border: 1px solid #e5e7eb;
    background: #fff;
    color: #374151;
    border-radius: 10px;
    padding: 10px 16px;
    cursor: pointer;
    font-weight: 600;
  }

  .sm-btn-primary {
    border: none;
    background: linear-gradient(135deg, #f97316, #ea580c);
    color: white;
    border-radius: 10px;
    padding: 10px 16px;
    cursor: pointer;
    font-weight: 700;
  }

  .sm-message {
    margin-top: 12px;
    padding: 10px 12px;
    border-radius: 10px;
    font-size: 13px;
  }

  .sm-message.success {
    background: #f0fdf4;
    color: #166534;
    border: 1px solid #bbf7d0;
  }

  .sm-message.error {
    background: #fff1f2;
    color: #be123c;
    border: 1px solid #fecdd3;
  }

  @media (max-width: 640px) {
    .sm-grid {
      grid-template-columns: 1fr;
    }
  }
`;

const SettingsModal = ({ isOpen, onClose, user, onUserUpdated }) => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    companyName: "",
    companyDescription: "",
    city: "",
    country: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        companyName: user.companyName || "",
        companyDescription: user.companyDescription || "",
        city: user.location?.city || "",
        country: user.location?.country || "",
      });
      setMessage("");
      setIsError(false);
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const token = localStorage.getItem("token");

      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        phoneNumber: form.phoneNumber,
        companyName: user?.role === "company" ? form.companyName : undefined,
        companyDescription: user?.role === "company" ? form.companyDescription : undefined,
        location: {
          city: form.city,
          country: form.country,
        },
      };

      const res = await axios.put(
        "http://localhost:8002/api/users/user-profile",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedUser = res.data.user;

      onUserUpdated?.({
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        name: `${updatedUser.firstName || ""} ${updatedUser.lastName || ""}`.trim(),
        email: updatedUser.email,
        role: updatedUser.role,
        phoneNumber: updatedUser.phoneNumber || "",
        companyName: updatedUser.companyName || "",
        companyDescription: updatedUser.companyDescription || "",
        location: updatedUser.location || { city: "", country: "" },
      });

      setMessage("Profile updated successfully");
    } catch (error) {
      console.error(error);
      setIsError(true);
      setMessage(error?.response?.data?.message || "Failed to update profile");
    }

    setLoading(false);
  };

  return (
    <>
      <style>{SETTINGS_STYLES}</style>

      <div className="sm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="sm-card">
          <button className="sm-close" onClick={onClose} aria-label="Close">
            ×
          </button>
          <h2 className="sm-title">⚙️Edit Profile</h2>
          <p className="sm-subtitle">You can update your profile details here. Email cannot be changed.</p>

          <form onSubmit={handleSave}>
            <div className="sm-grid">
              <div className="sm-field">
                <label className="sm-label">First Name</label>
                <input
                  className="sm-input"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                />
              </div>

              <div className="sm-field">
                <label className="sm-label">Last Name</label>
                <input
                  className="sm-input"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                />
              </div>

              <div className="sm-field sm-full">
                <label className="sm-label">Email Address</label>
                <input
                  className="sm-input"
                  name="email"
                  value={form.email}
                  disabled
                  readOnly
                />
              </div>

              <div className="sm-field sm-full">
                <label className="sm-label">Phone Number</label>
                <input
                  className="sm-input"
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="sm-field">
                <label className="sm-label">City</label>
                <input
                  className="sm-input"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                />
              </div>

              <div className="sm-field">
                <label className="sm-label">Country</label>
                <input
                  className="sm-input"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                />
              </div>

              {user?.role === "company" && (
                <>
                  <div className="sm-field sm-full">
                    <label className="sm-label">Company Name</label>
                    <input
                      className="sm-input"
                      name="companyName"
                      value={form.companyName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="sm-field sm-full">
                    <label className="sm-label">Company Description</label>
                    <textarea
                      className="sm-textarea"
                      name="companyDescription"
                      rows={4}
                      value={form.companyDescription}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}
            </div>

            {message && (
              <div className={`sm-message ${isError ? "error" : "success"}`}>
                {message}
              </div>
            )}

            <div className="sm-actions">
              <button type="button" className="sm-btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="sm-btn-primary" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default SettingsModal;