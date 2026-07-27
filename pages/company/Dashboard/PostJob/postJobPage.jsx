import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { toast } from "react-toastify";

import Layout from "../../../../components/Layout/Layout";
import PostJobForm from "./postJobForm";
import JobDescriptionUpload from "./JobDescriptionUpload";
import { url } from "../../../../utils/constant";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const initialFormData = {
  title: "",
  companyUrl: "",
  jobType: "Full-time",
  workMode: "Office",
  education: "",
  keySkills: "",
  requirements: "",
  experience: "",
  location: "",
  responsibilities: "",
  roleSummary: "",
  compensationBenefits: "",
  applicationEndDate: "",
  salary: "",
  vacancies: 1,
};

/*
 * Gemini returns these fields as normal strings.
 */
const simpleJobFields = [
  "title",
  "companyUrl",
  "jobType",
  "workMode",
  "education",
  "experience",
  "roleSummary",
  "compensationBenefits",
  "applicationEndDate",
  "salary",
];

/*
 * Gemini returns these fields as arrays.
 *
 * The current form displays them as comma-separated text,
 * so they must be converted before being added to formData.
 */
const arrayJobFields = [
  "keySkills",
  "responsibilities",
  "requirements",
];

/*
 * Convert comma-separated form text into an array
 * before sending the job to the backend.
 */
const convertCommaTextToArray = (value = "") => {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

/*
 * Build the final payload used by POST /create.
 */
const buildJobPayload = (formData) => {
  return {
    ...formData,

    vacancies: Number(formData.vacancies) || 1,

    keySkills: convertCommaTextToArray(
      formData.keySkills
    ),

    responsibilities: convertCommaTextToArray(
      formData.responsibilities
    ),

    requirements: convertCommaTextToArray(
      formData.requirements
    ),
  };
};

/*
 * Supports either:
 *
 * "Norwich, United Kingdom"
 *
 * or:
 *
 * {
 *   city: "Norwich",
 *   country: "United Kingdom"
 * }
 */
const normaliseLocationForForm = (location) => {
  if (typeof location === "string") {
    return location.trim();
  }

  if (
    location &&
    typeof location === "object"
  ) {
    return [
      location.city,
      location.country,
    ]
      .filter(Boolean)
      .join(", ");
  }

  return "";
};


export default function PostJobPage() {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] =
    useState(true);

  const [formData, setFormData] =
    useState(initialFormData);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  /*
   * Becomes true after Gemini successfully analyses
   * a job-description PDF.
   */
  const [pdfAnalysed, setPdfAnalysed] =
    useState(false);

  /*
   * Contains missing fields and AI warnings.
   */
  const [aiReviewNotes, setAiReviewNotes] =
    useState([]);

    useEffect(() => {
  console.log(
    "PARENT FORM DATA UPDATED:",
    formData
  );
}, [formData]);

  /*
   * PDF upload state.
   */
  const [file, setFile] =
    useState(null);

  const [analysing, setAnalysing] =
    useState(false);

  /*
   * Location autocomplete state.
   */
  const [locationLoading, setLocationLoading] =
    useState(false);

  const [locationResults, setLocationResults] =
    useState([]);

  /*
   * Prevent location autocomplete from searching again
   * after a location was selected or provided by Gemini.
   */
  const [locationSelected, setLocationSelected] =
    useState(false);

  /*
   * Check that the current user is logged in
   * and has a company account.
   */
  useEffect(() => {
    let componentActive = true;

    const checkAuth = async () => {
      try {
        const token =
          localStorage.getItem("token");

        if (!token) {
          router.replace("/");
          return;
        }

        const response = await axios.get(
          `${url}/user-profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (
          response.data.user.role !== "company"
        ) {
          router.replace("/");
          return;
        }

        if (componentActive) {
          setCheckingAuth(false);
        }
      } catch (error) {
        console.error(
          "Company authentication error:",
          error
        );

        router.replace("/");
      }
    };

    checkAuth();

    return () => {
      componentActive = false;
    };
  }, [router]);

  /*
   * Search for locations after the user stops typing
   * for 500 milliseconds.
   */
  useEffect(() => {
    const city = formData.location.trim();

    /*
     * Do not search when the location has already
     * been selected from the results or supplied by AI.
     */
    if (
      locationSelected ||
      city.length < 2
    ) {
      setLocationResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLocationLoading(true);

        const response = await axios.get(
          "https://geocoding-api.open-meteo.com/v1/search",
          {
            params: {
              name: city,
              count: 6,
              language: "en",
              format: "json",
            },
          }
        );

        setLocationResults(
          response.data.results || []
        );
      } catch (error) {
        console.error(
          "Location search error:",
          error
        );

        setLocationResults([]);
      } finally {
        setLocationLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [
    formData.location,
    locationSelected,
  ]);

  /*
   * Handles all normal inputs, textareas and selects.
   */
  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setMessage("");

    /*
     * If the user changes the location manually,
     * allow the autocomplete search to run again.
     */
    if (name === "location") {
      setLocationSelected(false);
    }

    setFormData(
      (previousFormData) => ({
        ...previousFormData,
        [name]: value,
      })
    );
  };

  /*
   * Add a selected autocomplete location to the form.
   */
  const selectLocation = (place) => {
    const selectedLocation =
      `${place.name}, ${place.country}`;

    setFormData(
      (previousFormData) => ({
        ...previousFormData,
        location: selectedLocation,
      })
    );

    setLocationSelected(true);
    setLocationResults([]);
  };

  /*
   * Validate the PDF selected by the company.
   */
  const handleFileChange = (event) => {
    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (
      selectedFile.type !==
      "application/pdf"
    ) {
      toast.error(
        "Please upload a PDF job description."
      );

      event.target.value = "";
      setFile(null);

      return;
    }

    if (
      selectedFile.size >
      MAX_FILE_SIZE
    ) {
      toast.error(
        "The PDF must be smaller than 5 MB."
      );

      event.target.value = "";
      setFile(null);

      return;
    }

    setFile(selectedFile);

    /*
     * Clear the previous analysis when a new
     * PDF is selected.
     */
    setPdfAnalysed(false);
    setAiReviewNotes([]);
    setMessage("");
  };

  /*
   * Add Gemini's extracted information to formData.
   */
const applyExtractedJobData = (
  responseData
) => {
  console.log(
    "DATA RECEIVED BY AUTOFILL:",
    responseData
  );

  const jobData =
    responseData?.jobData;

  if (!jobData) {
    setMessage(
      "The PDF was analysed, but no job data was returned."
    );

    return;
  }

  const extractedLocation =
    typeof jobData.location === "string"
      ? jobData.location
      : [
          jobData.location?.city,
          jobData.location?.country,
        ]
          .filter(Boolean)
          .join(", ");

  setFormData({
    title: jobData.title || "",
    companyUrl: jobData.companyUrl || "",
    jobType:
      jobData.jobType || "Full-time",
    workMode:
      jobData.workMode || "Office",
    education: jobData.education || "",

    keySkills: Array.isArray(
      jobData.keySkills
    )
      ? jobData.keySkills.join(", ")
      : jobData.keySkills || "",

    requirements: Array.isArray(
      jobData.requirements
    )
      ? jobData.requirements.join(", ")
      : jobData.requirements || "",

    experience: jobData.experience || "",
    location: extractedLocation,

    responsibilities: Array.isArray(
      jobData.responsibilities
    )
      ? jobData.responsibilities.join(
          ", "
        )
      : jobData.responsibilities || "",

    roleSummary:
      jobData.roleSummary || "",

    compensationBenefits:
      jobData.compensationBenefits || "",

    applicationEndDate:
      jobData.applicationEndDate || "",

    salary: jobData.salary || "",

    vacancies:
      Number(jobData.vacancies) || 1,
  });

  const missingFields =
    responseData.missingFields ||
    jobData.missingFields ||
    [];

  const warnings =
    responseData.warnings ||
    jobData.warnings ||
    [];

  setAiReviewNotes([
    ...missingFields.map(
      (field) =>
        `Missing from PDF: ${field}`
    ),
    ...warnings,
  ]);

  setPdfAnalysed(true);
  setLocationSelected(
    Boolean(extractedLocation)
  );
  setMessage("");

  /*
   * Move the user to the populated form.
   */
  setTimeout(() => {
    document
      .getElementById("job-review-form")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }, 100);
};

  /*
   * Upload the PDF to the AI analysis endpoint.
   */
  const handleAnalyse = async () => {
  if (!file) {
    toast.error(
      "Please select a job-description PDF."
    );
    return;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    toast.error(
      "Please sign in with a company account."
    );
    return;
  }

  try {
    setAnalysing(true);
    setMessage("");

    const uploadData = new FormData();

    uploadData.append(
      "jobDescription",
      file
    );

    const response = await axios.post(
      `${url}/jobs/analyse-pdf`,
      uploadData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(
      "COMPLETE AI RESPONSE:",
      response.data
    );

    applyExtractedJobData(
      response.data
    );

    toast.success(
      "PDF analysed. The form below has been populated."
    );
  } catch (error) {
    console.error(
      "Job-description analysis error:",
      error
    );

    toast.error(
      error.response?.data?.details ||
        error.response?.data?.message ||
        error.message ||
        "The PDF could not be analysed."
    );
  } finally {
    setAnalysing(false);
  }
};

  /*
   * Submit the reviewed job to the existing
   * job creation endpoint.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        setMessage(
          "Your session has expired. Please sign in again."
        );

        return;
      }

      const payload =
        buildJobPayload(formData);

      console.log(
        "Creating job with payload:",
        payload
      );

      await axios.post(
        `${url}/create`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      router.push(
        "/company/Dashboard/PostedJobs/PostedJobsPage"
      );
    } catch (error) {
      console.error(
        "Create job error:",
        error
      );

      setMessage(
        error.response?.data?.message ||
          "Failed to post job"
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-slate-500">
          Checking authentication...
        </p>
      </div>
    );
  }


  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-screen-xl mt-24 px-8 xl:px-16 mx-auto">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-900">
                📝 Post a New Job
              </h2>

              <p className="text-sm mt-1 text-slate-500">
                Create a job manually or
                populate the form from a
                job-description PDF.
              </p>
            </div>

            <JobDescriptionUpload
              file={file}
              analysing={analysing}
              handleFileChange={
                handleFileChange
              }
              handleAnalyse={
                handleAnalyse
              }
            />

            {pdfAnalysed && (
              <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                <p className="text-sm font-semibold text-green-800">
                  Job description analysed
                  successfully
                </p>

                <p className="mt-1 text-xs text-green-700">
                  The extracted details have
                  been added to the form below.
                  Review and edit every field
                  before posting the job.
                </p>
              </div>
            )}

            {aiReviewNotes.length > 0 && (
              <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-sm font-semibold text-amber-900">
                  Information requiring review
                </p>

                <ul className="mt-2 space-y-1">
                  {aiReviewNotes.map(
                    (note, index) => (
                      <li
                        key={`${note}-${index}`}
                        className="text-xs text-amber-800"
                      >
                        • {note}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

            {message && (
              <div className="mb-4 px-4 py-3 rounded-lg text-sm font-medium border border-rose-200 bg-rose-50 text-rose-700">
                ⚠️ {message}
              </div>
            )}

            <PostJobForm
              formData={formData}
              loading={loading}
              locationLoading={
                locationLoading
              }
              locationResults={
                locationResults
              }
              handleChange={
                handleChange
              }
              selectLocation={
                selectLocation
              }
              handleSubmit={
                handleSubmit
              }
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}