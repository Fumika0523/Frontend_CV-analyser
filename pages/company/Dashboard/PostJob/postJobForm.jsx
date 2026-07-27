import React from "react";

const salaryOptions = [
  "£15,000 - £20,000",
  "£20,000 - £25,000",
  "£25,000 - £30,000",
  "£30,000 - £35,000",
  "£35,000 - £40,000",
  "£40,000 - £50,000",
  "£50,000 - £60,000",
  "£60,000 - £70,000",
  "£70,000+",
  "Competitive",
];

const jobTypes = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
];

const workModes = [
  "Office",
  "Hybrid",
  "Remote",
];

const labelClass =
  "text-xs font-semibold text-slate-700 mb-1 block";

const fieldClass =
  "w-full border border-blue-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600";

const textareaClass =
  `${fieldClass} min-h-[110px] resize-y`;

const helperClass =
  "text-xs mt-1 text-slate-500";

export default function PostJobForm({
  formData,
  loading,
  locationLoading,
  locationResults,
  handleChange,
  selectLocation,
  handleSubmit,
}) {
  console.log("POST JOB FORM RECEIVED:", formData);
 
  return (
    <form
      id="job-review-form"
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">
          Review job information
        </h3>

        <p className="text-xs text-slate-500 mt-1">
          Check the extracted information and
          correct anything that is missing or
          inaccurate.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Job title */}
        <div className="md:col-span-3">
          <label className={labelClass}>
            Job Title{" "}
            <span className="text-red-500">
              *
            </span>
          </label>

          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Junior MERN Stack Developer"
            className={fieldClass}
            required
          />
        </div>

        {/* Application URL */}
        <div className="md:col-span-3">
          <label className={labelClass}>
            Application URL{" "}
            <span className="text-red-500">
              *
            </span>
          </label>

          <input
            type="url"
            name="companyUrl"
            value={formData.companyUrl}
            onChange={handleChange}
            placeholder="https://example.com/careers/job-post"
            className={fieldClass}
            required
          />

          <p className={helperClass}>
            Candidates will be redirected to
            this URL to apply for the role.
          </p>
        </div>

        {/* Location */}
        <div className="relative md:col-span-2">
          <label className={labelClass}>
            Location{" "}
            <span className="text-red-500">
              *
            </span>
          </label>

          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Type a city, e.g. London"
            className={fieldClass}
            autoComplete="off"
            required
          />

          {locationLoading && (
            <p className={helperClass}>
              Searching for locations...
            </p>
          )}

          {locationResults.length > 0 && (
            <div className="absolute z-20 mt-1 w-full bg-white rounded-lg shadow-lg border border-blue-100 overflow-hidden">
              {locationResults.map(
                (place) => (
                  <button
                    type="button"
                    key={`${place.id}-${place.name}`}
                    onClick={() =>
                      selectLocation(place)
                    }
                    className="w-full text-left px-4 py-2 text-sm text-slate-900 hover:bg-blue-50"
                  >
                    {place.name}
                    {place.admin1
                      ? `, ${place.admin1}`
                      : ""}
                    , {place.country}
                  </button>
                )
              )}
            </div>
          )}
        </div>

        {/* Vacancies */}
        <div>
          <label className={labelClass}>
            Number of Vacancies{" "}
            <span className="text-red-500">
              *
            </span>
          </label>

          <input
            type="number"
            name="vacancies"
            min="1"
            value={formData.vacancies}
            onChange={handleChange}
            className={fieldClass}
            required
          />

          <p className={helperClass}>
            The job closes when all positions
            are filled.
          </p>
        </div>

        {/* Work mode */}
        <div>
          <label className={labelClass}>
            Work Mode
          </label>

          <select
            name="workMode"
            value={formData.workMode}
            onChange={handleChange}
            className={`${fieldClass} bg-white`}
          >
            {workModes.map((mode) => (
              <option
                key={mode}
                value={mode}
              >
                {mode}
              </option>
            ))}
          </select>
        </div>

        {/* Job type */}
        <div>
          <label className={labelClass}>
            Job Type
          </label>

          <select
            name="jobType"
            value={formData.jobType}
            onChange={handleChange}
            className={`${fieldClass} bg-white`}
          >
            {jobTypes.map((type) => (
              <option
                key={type}
                value={type}
              >
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Salary */}
        <div>
          <label className={labelClass}>
            Salary Range{" "}
            <span className="text-red-500">
              *
            </span>
          </label>

          <select
            name="salary"
            value={formData.salary}
            onChange={handleChange}
            className={`${fieldClass} bg-white`}
            required
          >
            <option value="">
              Select salary range
            </option>

            {salaryOptions.map(
              (salary) => (
                <option
                  key={salary}
                  value={salary}
                >
                  {salary}
                </option>
              )
            )}
          </select>
        </div>

        {/* Experience */}
        <div>
          <label className={labelClass}>
            Experience{" "}
            <span className="text-red-500">
              *
            </span>
          </label>

          <input
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            placeholder="1-2 years"
            className={fieldClass}
            required
          />
        </div>

        {/* Education */}
        <div className="md:col-span-2">
          <label className={labelClass}>
            Education{" "}
            <span className="text-red-500">
              *
            </span>
          </label>

          <input
            name="education"
            value={formData.education}
            onChange={handleChange}
            placeholder="Bachelor's degree or equivalent"
            className={fieldClass}
            required
          />
        </div>

        {/* Application end date */}
        <div>
          <label className={labelClass}>
            Application End Date{" "}
            <span className="text-red-500">
              *
            </span>
          </label>

          <input
            type="date"
            name="applicationEndDate"
            value={
              formData.applicationEndDate
            }
            onChange={handleChange}
            className={fieldClass}
            required
          />
        </div>

        {/* Key skills */}
        <div className="md:col-span-3">
          <label className={labelClass}>
            Key Skills{" "}
            <span className="text-red-500">
              *
            </span>
          </label>

          <input
            name="keySkills"
            value={formData.keySkills}
            onChange={handleChange}
            placeholder="React, Node.js, MongoDB"
            className={fieldClass}
            required
          />

          <p className={helperClass}>
            Separate skills with commas.
          </p>
        </div>

        {/* Role summary */}
        <div className="md:col-span-3">
          <label className={labelClass}>
            Role Summary{" "}
            <span className="text-red-500">
              *
            </span>
          </label>

          <textarea
            name="roleSummary"
            value={formData.roleSummary}
            onChange={handleChange}
            placeholder="Briefly explain what this role is about..."
            className={textareaClass}
            required
          />
        </div>

        {/* Responsibilities */}
        <div className="md:col-span-3">
          <label className={labelClass}>
            Responsibilities{" "}
            <span className="text-red-500">
              *
            </span>
          </label>

          <textarea
            name="responsibilities"
            value={
              formData.responsibilities
            }
            onChange={handleChange}
            placeholder="Develop features, fix bugs, collaborate with the team..."
            className={textareaClass}
            required
          />

          <p className={helperClass}>
            Separate responsibilities with
            commas.
          </p>
        </div>

        {/* Requirements */}
        <div className="md:col-span-3">
          <label className={labelClass}>
            Requirements{" "}
            <span className="text-red-500">
              *
            </span>
          </label>

          <textarea
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            placeholder="1 year of experience, good communication, eligible to work in the UK..."
            className={textareaClass}
            required
          />

          <p className={helperClass}>
            Separate requirements with commas.
          </p>
        </div>

        {/* Compensation and benefits */}
        <div className="md:col-span-3">
          <label className={labelClass}>
            Compensation & Benefits{" "}
            <span className="text-red-500">
              *
            </span>
          </label>

          <textarea
            name="compensationBenefits"
            value={
              formData.compensationBenefits
            }
            onChange={handleChange}
            placeholder="Pension, holidays, training, flexible working..."
            className={textareaClass}
            required
          />
        </div>
      </div>

      <div className="flex justify-end pt-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-lg text-sm font-semibold text-white transition disabled:opacity-50"
          style={{
            background:
              "linear-gradient(135deg, #1d4ed8, #1e3a8a)",
            boxShadow:
              "0 8px 18px rgba(29, 78, 216, 0.22)",
          }}
        >
          {loading
            ? "Posting..."
            : "Post Job"}
        </button>
      </div>
    </form>
  );
}