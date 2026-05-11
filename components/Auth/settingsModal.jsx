import React, { useEffect, useState } from "react";
import axios from "axios";

// Pencil icon (inline SVG, no dependency)
const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
  </svg>
);

// Check icon for confirming an edit
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
  </svg>
);

// X icon for cancelling an edit
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

// A single editable field row
const EditableField = ({ label, name, value, onChange, isTextarea = false, disabled = false }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  // Keep draft in sync if parent resets form
  useEffect(() => {
    setDraft(value);
    setEditing(false);
  }, [value]);

  const handleConfirm = () => {
    onChange({ target: { name, value: draft } });
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(value);
    setEditing(false);
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide font-['Sora',sans-serif]">
          {label}
        </span>
        {!disabled && !editing && (
          <button
            type="button"
            onClick={() => { setDraft(value); setEditing(true); }}
            className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 transition-colors"
            title={`Edit ${label}`}
          >
            <PencilIcon />
            <span>Edit</span>
          </button>
        )}
        {editing && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleConfirm}
              className="flex items-center gap-0.5 text-xs text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
              title="Confirm"
            >
              <CheckIcon /> Done
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-0.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              title="Cancel"
            >
              <XIcon /> Cancel
            </button>
          </div>
        )}
      </div>

      {/* Display mode */}
      {!editing && (
        <div
          className={`px-3 py-2.5 rounded-xl text-sm border ${
            disabled
              ? "bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed"
              : "bg-gray-50 text-gray-700 border-gray-100"
          }`}
        >
          {value || <span className="text-gray-300 italic">—</span>}
        </div>
      )}

      {/* Edit mode */}
      {editing && (
        isTextarea ? (
          <textarea
            name={name}
            rows={4}
            value={draft}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            className="w-full border-[1.5px] border-orange-400 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-orange-200 resize-none transition"
          />
        ) : (
          <input
            name={name}
            value={draft}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            className="w-full border-[1.5px] border-orange-400 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-orange-200 transition"
          />
        )
      )}
    </div>
  );
};

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

      const res = await axios.put("http://localhost:8002/user-profile", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

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
      <div
    className="fixed bg-white-500 inset-0 flex items-center justify-center bg-black/60 p-4"
    style={{ zIndex: 99999 }}
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    <div
      className="relative z-[100000] w-full max-w-[560px] max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl font-['DM_Sans',sans-serif]"
    >
        {/* Close */}
<button
  onClick={onClose}
  aria-label="Close"
  className="absolute top-3.5 right-4 text-gray-300 hover:text-gray-500 text-2xl leading-none transition-colors"
>
  ×
</button>

        {/* Header */}
        <h2 className="font-['Sora',sans-serif] text-xl font-bold text-gray-900 mb-1">
          ⚙️ Profile Settings
        </h2>
        <p className="text-xs text-gray-400 mb-5">
          Click the <span className="text-orange-500 font-semibold">Edit</span> button next to any field to update it. Email cannot be changed.
        </p>

        <form onSubmit={handleSave}>
          <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
            <EditableField label="First Name"    name="firstName"    value={form.firstName}    onChange={handleChange} />
            <EditableField label="Last Name"     name="lastName"     value={form.lastName}     onChange={handleChange} />

            <div className="col-span-2 max-sm:col-span-1">
              <EditableField label="Email Address" name="email" value={form.email} onChange={handleChange} disabled />
            </div>

            <div className="col-span-2 max-sm:col-span-1">
              <EditableField label="Phone Number" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
            </div>

            <EditableField label="City"    name="city"    value={form.city}    onChange={handleChange} />
            <EditableField label="Country" name="country" value={form.country} onChange={handleChange} />

            {user?.role === "company" && (
              <>
                <div className="col-span-2 max-sm:col-span-1">
                  <EditableField label="Company Name" name="companyName" value={form.companyName} onChange={handleChange} />
                </div>
                <div className="col-span-2 max-sm:col-span-1">
                  <EditableField label="Company Description" name="companyDescription" value={form.companyDescription} onChange={handleChange} isTextarea />
                </div>
              </>
            )}
          </div>

          {message && (
            <div
              className={`mt-4 px-3 py-2.5 rounded-xl text-sm border ${
                isError
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}
            >
              {message}
            </div>
          )}

          <div className="flex justify-end gap-2.5 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="border border-gray-200 bg-white text-gray-600 rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-xl px-4 py-2.5 text-sm font-bold hover:from-orange-500 hover:to-orange-700 disabled:opacity-60 transition-all shadow-sm"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;