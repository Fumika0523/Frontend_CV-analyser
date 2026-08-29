import React, { useEffect, useState } from "react";
import axios from "axios";
import LocationAutocomplete from "../common/LocationAutocomplete";
import { FiBriefcase, FiCheck, FiEdit2, FiSettings, FiX,} from "react-icons/fi";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002";

// ======================================================
// COMPANY OPTIONS
// ======================================================

const COMPANY_SIZE_OPTIONS = [
  {
    value: "1-10",
    label: "1–10 employees",
  },
  {
    value: "11-50",
    label: "11–50 employees",
  },
  {
    value: "51-200",
    label: "51–200 employees",
  },
  {
    value: "201-500",
    label: "201–500 employees",
  },
  {
    value: "500+",
    label: "500+ employees",
  },
];

const COMPANY_TYPE_OPTIONS = [
  {
    value: "direct-employer",
    label: "Direct Employer",
  },
  {
    value: "agency",
    label: "Recruitment Agency",
  },
  {
    value: "non-profit",
    label: "Non-profit / Charity",
  },
];

// ======================================================
// HELPER: COMPANY ROLE LABEL
// ======================================================

/*
 * MongoDB stores machine-friendly values:
 *
 * company_admin
 * recruiter
 * hiring_manager
 *
 * But the frontend should show friendly labels.
 */
const formatCompanyRole = (role) => {
  const labels = {
    company_admin: "Company Administrator",
    recruiter: "Recruiter",
    hiring_manager: "Hiring Manager",
  };

  return labels[role] || role || "Not assigned";
};

// ======================================================
// REUSABLE EDITABLE TEXT FIELD
// ======================================================

const EditableField = ({
  label,
  name,
  value,
  onChange,
  isTextarea = false,
  disabled = false,
}) => {
  /*
   * editing controls whether this specific
   * field is currently being edited.
   */
  const [editing, setEditing] =
    useState(false);

  /*
   * draft is temporary.
   *
   * We do not immediately change the main form,
   * because the user might press Cancel.
   */
  const [draft, setDraft] =
    useState(value);

  /*
   * Keep this field synchronized if the parent
   * receives newer profile data from MongoDB.
   */
  useEffect(() => {
    setDraft(value);
    setEditing(false);
  }, [value]);

  /*
   * Apply the temporary value to the main form.
   *
   * Important:
   * this does NOT save to MongoDB yet.
   *
   * MongoDB is updated only when the main
   * "Save Changes" button is pressed.
   */
  const handleConfirm = () => {
    onChange({
      target: {
        name,
        value: draft,
      },
    });

    setEditing(false);
  };

  /*
   * Discard the temporary edit.
   */
  const handleCancel = () => {
    setDraft(value);
    setEditing(false);
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="font-['Sora',sans-serif] text-xs font-semibold uppercase tracking-wide text-gray-500">
          {label}
        </span>

        {!disabled && !editing && (
          <button
            type="button"
            onClick={() => {
              setDraft(value);
              setEditing(true);
            }}
            className="flex items-center gap-1 text-xs text-blue-500 transition-colors hover:text-blue-600"
            title={`Edit ${label}`}
          >
            <FiEdit2 size={14} />
            <span>Edit</span>
          </button>
        )}

        {editing && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleConfirm}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
            >
              <FiCheck size={14} />
              Done
            </button>

            <span className="text-gray-300">
              |
            </span>

            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-gray-600"
            >
              <FiX size={14} />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* DISPLAY MODE */}
      {!editing && (
        <div
          className={`rounded-xl border px-3 py-2.5 text-sm ${
            disabled
              ? "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400"
              : "border-gray-100 bg-gray-50 text-gray-700"
          }`}
        >
          {value || (
            <span className="italic text-gray-300">
              —
            </span>
          )}
        </div>
      )}

      {/* EDIT MODE */}
      {editing &&
        (isTextarea ? (
          <textarea
            name={name}
            rows={4}
            value={draft}
            autoFocus
            onChange={(event) =>
              setDraft(event.target.value)
            }
            className="w-full resize-none rounded-xl border-[1.5px] border-blue-400 px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:ring-2 focus:ring-blue-200"
          />
        ) : (
          <input
            name={name}
            value={draft}
            autoFocus
            onChange={(event) =>
              setDraft(event.target.value)
            }
            className="w-full rounded-xl border-[1.5px] border-blue-400 px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:ring-2 focus:ring-blue-200"
          />
        ))}
    </div>
  );
};


// ======================================================
// REUSABLE EDITABLE SELECT FIELD
// ======================================================

/*
 * Company Size and Company Type should use
 * select menus because CompanyModel has enums.
 *
 * This prevents values like:
 *
 * companyType: "random-value"
 */
const EditableSelectField = ({
  label,
  name,
  value,
  options,
  onChange,
}) => {
  const [editing, setEditing] =
    useState(false);

  const [draft, setDraft] =
    useState(value);

  useEffect(() => {
    setDraft(value);
    setEditing(false);
  }, [value]);

  const handleConfirm = () => {
    onChange({
      target: {
        name,
        value: draft,
      },
    });

    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(value);
    setEditing(false);
  };

  /*
   * Find the human-friendly label
   * for display mode.
   */
  const selectedOption =
    options.find(
      (option) =>
        option.value === value
    );

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="font-['Sora',sans-serif] text-xs font-semibold uppercase tracking-wide text-gray-500">
          {label}
        </span>

        {!editing && (
          <button
            type="button"
            onClick={() => {
              setDraft(value);
              setEditing(true);
            }}
            className="flex items-center gap-1 text-xs text-blue-500 transition-colors hover:text-blue-600"
          >
            <FiEdit2 size={14} />
            Edit
          </button>
        )}

        {editing && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleConfirm}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              <FiCheck size={14} />
              Done
            </button>

            <span className="text-gray-300">
              |
            </span>

            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
            >
              <FiX size={14} />
              Cancel
            </button>
          </div>
        )}
      </div>

      {!editing ? (
        <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm text-gray-700">
          {selectedOption?.label || (
            <span className="italic text-gray-300">
              —
            </span>
          )}
        </div>
      ) : (
        <select
          name={name}
          value={draft}
          autoFocus
          onChange={(event) =>
            setDraft(event.target.value)
          }
          className="w-full rounded-xl border-[1.5px] border-blue-400 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-200"
        >
          <option value="">
            Select an option
          </option>

          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};


// ======================================================
// EDITABLE LOCATION
// ======================================================

const EditableLocationField = ({
  label,
  city,
  country,
  onLocationChange,
}) => {
  const [editing, setEditing] =
    useState(false);

  const [draft, setDraft] =
    useState("");

  const [
    selectedLocation,
    setSelectedLocation,
  ] = useState(null);

  /*
   * Convert:
   *
   * city = London
   * country = United Kingdom
   *
   * into:
   *
   * London, United Kingdom
   */
  const displayValue =
    city && country
      ? `${city}, ${country}`
      : city || country || "";

  useEffect(() => {
    setDraft(displayValue);
    setSelectedLocation(null);
    setEditing(false);
  }, [city, country]);

  /*
   * Only update location if the user
   * selected a valid autocomplete result.
   */
  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationChange(
        selectedLocation
      );
    }

    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(displayValue);
    setSelectedLocation(null);
    setEditing(false);
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="font-['Sora',sans-serif] text-xs font-semibold uppercase tracking-wide text-gray-500">
          {label}
        </span>

        {!editing && (
          <button
            type="button"
            onClick={() => {
              setDraft(displayValue);
              setEditing(true);
            }}
            className="flex items-center gap-1 text-xs text-blue-500 transition-colors hover:text-blue-600"
          >
            <FiEdit2 size={14} />
            Edit
          </button>
        )}

        {editing && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleConfirm}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              <FiCheck size={14} />
              Done
            </button>

            <span className="text-gray-300">
              |
            </span>

            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
            >
              <FiX size={14} />
              Cancel
            </button>
          </div>
        )}
      </div>

      {!editing && (
        <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm text-gray-700">
          {displayValue || (
            <span className="italic text-gray-300">
              —
            </span>
          )}
        </div>
      )}

      {editing && (
        <LocationAutocomplete
          value={draft}
          onChange={(location) => {
            /*
             * Store the full selected result.
             */
            setSelectedLocation(
              location
            );

            /*
             * Update the text shown inside
             * the autocomplete.
             */
            setDraft(
              location.city &&
                location.country
                ? `${location.city}, ${location.country}`
                : location.displayName
            );
          }}
          placeholder="Search city or country"
        />
      )}
    </div>
  );
};


// ======================================================
// CREATE PROFILE FORM
// ======================================================

const createInitialForm = (user) => {
  /*
   * NEW COMPANY ARCHITECTURE
   *
   * GET /user-profile now populates companyId.
   *
   * Company user example:
   *
   * companyId: {
   *   _id: "...",
   *   companyName: "...",
   *   companyDescription: "...",
   *   ...
   * }
   *
   * Candidate:
   *
   * companyId: null
   */
  const company =
    user?.companyId &&
    typeof user.companyId === "object"
      ? user.companyId
      : null;

  return {
    // ==================================================
    // USER FIELDS
    // ==================================================

    firstName:
      user?.firstName || "",

    lastName:
      user?.lastName || "",

    email:
      user?.email || "",

    phoneNumber:
      user?.phoneNumber || "",

    /*
     * Candidate location belongs to User.
     */
    city:
      user?.role === "candidate"
        ? user?.location?.city || ""
        : "",

    country:
      user?.role === "candidate"
        ? user?.location?.country || ""
        : "",

    // ==================================================
    // COMPANY FIELDS
    // ==================================================

    /*
     * Prefer CompanyModel.
     *
     * user.companyName is temporarily kept
     * as a legacy fallback.
     */
    companyName:
      company?.companyName ||
      user?.companyName ||
      "",

    companyDescription:
      company?.companyDescription ||
      user?.companyDescription ||
      "",

    companyUrl:
      company?.companyUrl || "",

    companySize:
      company?.companySize || "",

    companyType:
      company?.companyType || "",

    /*
     * Company location comes from CompanyModel,
     * NOT User.location.
     */
    companyCity:
      company?.location?.city || "",

    companyCountry:
      company?.location?.country || "",

    /*
     * This belongs to the USER because it describes
     * their permissions inside the Company.
     */
    companyRole:
      user?.companyRole || "",

    // ==================================================
    // CANDIDATE ONLY
    // ==================================================

    availableForWork:
      user?.role === "candidate"
        ? user?.availableForWork ?? true
        : false,
  };
};


// ======================================================
// SETTINGS MODAL
// ======================================================

const SettingsModal = ({
  isOpen,
  onClose,
  user,
  onUserUpdated,
}) => {
  /*
   * Keep the full profile returned by the backend.
   *
   * This is useful because the original `user`
   * prop may only contain a simplified Header user.
   */
  const [profileUser, setProfileUser] =
    useState(user);

  const [form, setForm] =
    useState(() =>
      createInitialForm(user)
    );

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [isError, setIsError] =
    useState(false);


  // ====================================================
  // LOAD COMPLETE PROFILE
  // ====================================================

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const fetchProfile = async () => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          setIsError(true);

          setMessage(
            "Your session has expired. Please sign in again."
          );

          return;
        }

        /*
         * GET /user-profile now returns:
         *
         * User
         * +
         * populated Company inside companyId.
         */
        const response =
          await axios.get(
            `${API_BASE}/user-profile`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const fullUser =
          response.data.user;

        /*
         * Save the full backend profile.
         */
        setProfileUser(fullUser);

        /*
         * Convert it into editable form data.
         */
        setForm(
          createInitialForm(
            fullUser
          )
        );
      } catch (error) {
        console.error(
          "Failed to load profile:",
          error
        );

        setIsError(true);

        setMessage(
          error?.response?.data
            ?.message ||
            "Failed to load profile"
        );
      }
    };

    setMessage("");
    setIsError(false);

    fetchProfile();
  }, [isOpen]);


  if (!isOpen) {
    return null;
  }


  // ====================================================
  // CURRENT ACCOUNT ROLE
  // ====================================================

  /*
   * Prefer profileUser because it came directly
   * from GET /user-profile.
   */
  const accountRole =
    profileUser?.role ||
    user?.role;


  // ====================================================
  // GENERIC FORM CHANGE
  // ====================================================

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (previousForm) => ({
        ...previousForm,

        [name]:
          value,
      })
    );
  };


  // ====================================================
  // SAVE PROFILE
  // ====================================================

  const handleSave = async (
    event
  ) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const token =
        localStorage.getItem(
          "token"
        );

      if (!token) {
        setIsError(true);

        setMessage(
          "Your session has expired. Please sign in again."
        );

        return;
      }

      /*
       * Common User fields.
       *
       * These remain inside UserModel for
       * both candidates and company users.
       */
      const payload = {
        firstName:
          form.firstName,

        lastName:
          form.lastName,

        phoneNumber:
          form.phoneNumber,
      };


      // =================================================
      // CANDIDATE PAYLOAD
      // =================================================

      if (
        accountRole ===
        "candidate"
      ) {
        /*
         * Candidate location belongs
         * directly to UserModel.
         */
        payload.location = {
          city:
            form.city,

          country:
            form.country,
        };

        /*
         * Controls whether companies can
         * discover this candidate.
         */
        payload.availableForWork =
          form.availableForWork;
      }


      // =================================================
      // COMPANY PAYLOAD
      // =================================================

      if (
        accountRole ===
        "company"
      ) {
        /*
         * These values are now saved in CompanyModel
         * by updateUserProfile.
         */
        payload.companyName =
          form.companyName;

        payload.companyDescription =
          form.companyDescription;

        payload.companyUrl =
          form.companyUrl;

        payload.companySize =
          form.companySize;

        payload.companyType =
          form.companyType;

        /*
         * For a company account, `location`
         * represents Company.location.
         *
         * The backend knows this based on:
         *
         * user.role === "company"
         */
        payload.location = {
          city:
            form.companyCity,

          country:
            form.companyCountry,
        };

        /*
         * IMPORTANT:
         *
         * Do NOT send:
         *
         * companyId
         * companyRole
         * createdBy
         *
         * Those are controlled by the backend.
         */
      }


      const response =
        await axios.put(
          `${API_BASE}/user-profile`,
          payload,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      /*
       * Backend now returns the refreshed user
       * with populated companyId.
       */
      const updatedUser =
        response.data.user;

      setProfileUser(
        updatedUser
      );

      setForm(
        createInitialForm(
          updatedUser
        )
      );

      /*
       * IMPORTANT IMPROVEMENT:
       *
       * Do not manually rebuild another user object here.
       *
       * The backend already returned the correct,
       * complete user object.
       *
       * Header can normalize it itself.
       */
      onUserUpdated?.(
        updatedUser
      );

      setMessage(
        "Profile updated successfully"
      );
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      setIsError(true);

      setMessage(
        error?.response?.data
          ?.message ||
          "Failed to update profile"
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60 p-4"
      style={{
        zIndex: 99999,
      }}
      onClick={(event) => {
        /*
         * Close only when clicking the
         * dark backdrop.
         */
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="relative z-[100000] max-h-[90vh] w-full max-w-[620px] overflow-y-auto rounded-2xl bg-white p-6 font-['DM_Sans',sans-serif] shadow-2xl">

        {/* ==========================================
            CLOSE
        ========================================== */}

        <button
          type="button"
          onClick={onClose}
          aria-label="Close profile settings"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
        >
          <FiX size={20} />
        </button>


        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="mb-1 flex items-center gap-2">
          <FiSettings
            className="text-blue-600"
            size={22}
          />

          <h2 className="font-['Sora',sans-serif] text-xl font-bold text-gray-900">
            Profile Settings
          </h2>
        </div>

        <p className="mb-5 text-xs text-gray-400">
          Click{" "}
          <span className="font-semibold text-blue-500">
            Edit
          </span>{" "}
          next to a field to update it.
          Email and account role cannot
          be changed here.
        </p>


        <form onSubmit={handleSave}>
          <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">

            {/* ======================================
                PERSONAL DETAILS
            ====================================== */}

            <div className="col-span-2 max-sm:col-span-1">
              <p className="mb-1 font-['Sora',sans-serif] text-xs font-bold uppercase tracking-wider text-blue-600">
                Account Details
              </p>
            </div>

            <EditableField
              label="First Name"
              name="firstName"
              value={
                form.firstName
              }
              onChange={
                handleChange
              }
            />

            <EditableField
              label="Last Name"
              name="lastName"
              value={
                form.lastName
              }
              onChange={
                handleChange
              }
            />

            <div className="col-span-2 max-sm:col-span-1">
              <EditableField
                label="Email Address"
                name="email"
                value={
                  form.email
                }
                onChange={
                  handleChange
                }
                disabled
              />
            </div>

            <div className="col-span-2 max-sm:col-span-1">
              <EditableField
                label="Phone Number"
                name="phoneNumber"
                value={
                  form.phoneNumber
                }
                onChange={
                  handleChange
                }
              />
            </div>


            {/* ======================================
                CANDIDATE ONLY
            ====================================== */}

            {accountRole ===
              "candidate" && (
              <>
                <div className="col-span-2 max-sm:col-span-1">
                  <EditableLocationField
                    label="Location"
                    city={
                      form.city
                    }
                    country={
                      form.country
                    }
                    onLocationChange={(
                      location
                    ) => {
                      setForm(
                        (
                          previousForm
                        ) => ({
                          ...previousForm,

                          city:
                            location.city,

                          country:
                            location.country,
                        })
                      );
                    }}
                  />
                </div>

                {/* Available for Work */}
                <div className="col-span-2 max-sm:col-span-1">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                          <FiBriefcase
                            size={18}
                          />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            Available for Work
                          </p>

                          <p className="mt-1 text-xs leading-5 text-gray-500">
                            Allow companies to find
                            your profile in candidate
                            recommendations.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        role="switch"
                        aria-label="Available for work"
                        aria-checked={
                          form.availableForWork
                        }
                        onClick={() =>
                          setForm(
                            (
                              previousForm
                            ) => ({
                              ...previousForm,

                              availableForWork:
                                !previousForm.availableForWork,
                            })
                          )
                        }
                        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                          form.availableForWork
                            ? "bg-blue-600"
                            : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                            form.availableForWork
                              ? "translate-x-5"
                              : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    <p
                      className={`mt-3 text-xs font-medium ${
                        form.availableForWork
                          ? "text-emerald-600"
                          : "text-gray-500"
                      }`}
                    >
                      {form.availableForWork
                        ? "Your profile can appear in recruiter recommendations."
                        : "Your profile is hidden from recruiter recommendations."}
                    </p>
                  </div>
                </div>
              </>
            )}


            {/* ======================================
                COMPANY ONLY
            ====================================== */}

            {accountRole ===
              "company" && (
              <>
                <div className="col-span-2 mt-2 max-sm:col-span-1">
                  <p className="mb-1 font-['Sora',sans-serif] text-xs font-bold uppercase tracking-wider text-blue-600">
                    Company Details
                  </p>
                </div>

                {/* COMPANY ROLE - READ ONLY */}
                <div className="col-span-2 max-sm:col-span-1">
                  <EditableField
                    label="Company Account Role"
                    name="companyRole"
                    value={formatCompanyRole(
                      form.companyRole
                    )}
                    onChange={
                      handleChange
                    }
                    disabled
                  />
                </div>

                {/* COMPANY NAME */}
                <div className="col-span-2 max-sm:col-span-1">
                  <EditableField
                    label="Company Name"
                    name="companyName"
                    value={
                      form.companyName
                    }
                    onChange={
                      handleChange
                    }
                  />
                </div>

                {/* COMPANY DESCRIPTION */}
                <div className="col-span-2 max-sm:col-span-1">
                  <EditableField
                    label="Company Description"
                    name="companyDescription"
                    value={
                      form.companyDescription
                    }
                    onChange={
                      handleChange
                    }
                    isTextarea
                  />
                </div>

                {/* COMPANY WEBSITE */}
                <div className="col-span-2 max-sm:col-span-1">
                  <EditableField
                    label="Company Website"
                    name="companyUrl"
                    value={
                      form.companyUrl
                    }
                    onChange={
                      handleChange
                    }
                  />
                </div>

                {/* COMPANY SIZE */}
                <EditableSelectField
                  label="Company Size"
                  name="companySize"
                  value={
                    form.companySize
                  }
                  options={
                    COMPANY_SIZE_OPTIONS
                  }
                  onChange={
                    handleChange
                  }
                />

                {/* COMPANY TYPE */}
                <EditableSelectField
                  label="Company Type"
                  name="companyType"
                  value={
                    form.companyType
                  }
                  options={
                    COMPANY_TYPE_OPTIONS
                  }
                  onChange={
                    handleChange
                  }
                />

                {/* COMPANY LOCATION */}
                <div className="col-span-2 max-sm:col-span-1">
                  <EditableLocationField
                    label="Company Location"
                    city={
                      form.companyCity
                    }
                    country={
                      form.companyCountry
                    }
                    onLocationChange={(
                      location
                    ) => {
                      setForm(
                        (
                          previousForm
                        ) => ({
                          ...previousForm,

                          companyCity:
                            location.city,

                          companyCountry:
                            location.country,
                        })
                      );
                    }}
                  />
                </div>
              </>
            )}
          </div>


          {/* ==========================================
              SUCCESS / ERROR
          ========================================== */}

          {message && (
            <div
              className={`mt-4 rounded-xl border px-3 py-2.5 text-sm ${
                isError
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {message}
            </div>
          )}


          {/* ==========================================
              ACTIONS
          ========================================== */}

          <div className="mt-5 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
            >
              <FiX size={16} />
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:from-blue-500 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                "Saving..."
              ) : (
                <>
                  <FiCheck size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;