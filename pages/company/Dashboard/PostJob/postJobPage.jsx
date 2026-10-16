import React, {
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/router";
import axios from "axios";
import { toast } from "react-toastify";
import { FiFileText } from "react-icons/fi";

import Layout from "../../../../components/Layout/Layout";
import PostJobForm from "./postJobForm";
import JobDescriptionUpload from "./JobDescriptionUpload";
import { url } from "../../../../utils/constant";


const MAX_FILE_SIZE = 5 * 1024 * 1024;

const initialFormData = {
  title: "",
  companyUrl: "",
  category: "",
  industry: "",
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

const convertCommaTextToArray = (
  value = ""
) => {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};


const buildJobPayload = (
  formData
) => {
  return {
    ...formData,

    companyUrl:
      formData.companyUrl.trim(),

    vacancies:
      Number(
        formData.vacancies
      ) || 1,

    keySkills:
      convertCommaTextToArray(
        formData.keySkills
      ),

    responsibilities:
      convertCommaTextToArray(
        formData.responsibilities
      ),

    requirements:
      convertCommaTextToArray(
        formData.requirements
      ),
  };
};


export default function PostJobPage() {
  const router = useRouter();
  // Controls the posting confirmation modal.
  const [showPostModal, setShowPostModal] = useState(false);

  // Records the person responsible for publishing the JD.
  const [postingDetails, setPostingDetails] = useState({
    postedByName: "",
    email: "",
  });
  const [
    checkingAuth,
    setCheckingAuth,
  ] = useState(true);

  const [
    formData,
    setFormData,
  ] = useState(
    initialFormData
  );


  const [
    companyUrlLocked,
    setCompanyUrlLocked,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    pdfAnalysed,
    setPdfAnalysed,
  ] = useState(false);

  const [
    aiReviewNotes,
    setAiReviewNotes,
  ] = useState([]);

  const [
    file,
    setFile,
  ] = useState(null);

  const [
    analysing,
    setAnalysing,
  ] = useState(false);

  const [
    locationLoading,
    setLocationLoading,
  ] = useState(false);

  const [
    locationResults,
    setLocationResults,
  ] = useState([]);

  const [
    locationSelected,
    setLocationSelected,
  ] = useState(false);

  // CHECK COMPANY ACCOUNT

  /*
   * This does two jobs:
   *
   * 1. Makes sure the logged-in user is a company user.
   *
   * 2. Reads Company.companyUrl.
   *
   * If the Company already has a website:
   *   - copy it into formData
   *   - lock the website input
   *
   * If the Company does not have one:
   *   - leave the field empty
   *   - allow the user / AI to provide it
   */
  useEffect(() => {
    let componentActive =
      true;

    const checkAuth =
      async () => {
        try {
          const token =
            localStorage.getItem(
              "token"
            );

          if (!token) {
            router.replace("/");
            return;
          }

          const response =
            await axios.get(
              `${url}/user-profile`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          const user = response.data.user;

          // Pre-fill the posting person's name from their profile.
          if (componentActive) {
  setPostingDetails((prev) => ({
    ...prev,

    // Get the poster's name from their account.
    postedByName: [
      user.firstName,
      user.lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim(),

    // Get the registered company account email.
    email: user.email || "",
  }));
}

          if (
            user.role !== "company"
          ) {
            router.replace("/");
            return;
          }

          /*
           * Because /user-profile populates companyId,
           * we can read the real Company document here.
           */
          const existingCompanyUrl =
            user.companyId
              ?.companyUrl
              ?.trim() || "";

          if (
            componentActive
          ) {
            /*
             * If URL exists in CompanyModel,
             * show it in the form.
             */
            setFormData(
              (
                previousForm
              ) => ({
                ...previousForm,

                companyUrl:
                  existingCompanyUrl,
              })
            );

            /*
             * Existing Company URL cannot
             * be edited while posting a job.
             */
            setCompanyUrlLocked(
              Boolean(
                existingCompanyUrl
              )
            );

            setCheckingAuth(
              false
            );
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
      componentActive =
        false;
    };
  }, [router]);



  // LOCATION SEARCH


  useEffect(() => {
    const city =
      formData.location.trim();

    if (
      locationSelected ||
      city.length < 2
    ) {
      setLocationResults([]);
      return;
    }

    const timer =
      setTimeout(
        async () => {
          try {
            setLocationLoading(
              true
            );

            const response =
              await axios.get(
                "https://geocoding-api.open-meteo.com/v1/search",
                {
                  params: {
                    name: city,
                    count: 6,
                    language:
                      "en",
                    format:
                      "json",
                  },
                }
              );

            setLocationResults(
              response.data
                .results || []
            );
          } catch (error) {
            console.error(
              "Location search error:",
              error
            );

            setLocationResults(
              []
            );
          } finally {
            setLocationLoading(
              false
            );
          }
        },
        500
      );

    return () =>
      clearTimeout(timer);
  }, [
    formData.location,
    locationSelected,
  ]);


  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setMessage("");

    if (
      name === "location"
    ) {
      setLocationSelected(
        false
      );
    }

    setFormData(
      (
        previousFormData
      ) => ({
        ...previousFormData,

        [name]:
          value,
      })
    );
  };


  const selectLocation = (
    place
  ) => {
    const selectedLocation =
      `${place.name}, ${place.country}`;

    setFormData(
      (
        previousFormData
      ) => ({
        ...previousFormData,

        location:
          selectedLocation,
      })
    );

    setLocationSelected(true);
    setLocationResults([]);
  };



  // PDF FILE VALIDATION


  const handleFileChange = (
    event
  ) => {
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

      event.target.value =
        "";

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

      event.target.value =
        "";

      setFile(null);

      return;
    }

    setFile(
      selectedFile
    );

    setPdfAnalysed(false);
    setAiReviewNotes([]);
    setMessage("");
  };



  // APPLY AI DATA


  /*
   * Adds Gemini's extracted JD information
   * into the form.
   *
   * Important companyUrl rule:
   *
   * If Company already has a URL:
   *   → keep Company.companyUrl
   *   → ignore URL extracted from PDF
   *
   * If Company has no URL:
   *   → allow Gemini's extracted URL
   *   → user can review/edit it before posting
   */
  const applyExtractedJobData = (
    responseData
  ) => {
    const jobData =
      responseData?.jobData;

    if (!jobData) {
      setMessage(
        "The PDF was analysed, but no job data was returned."
      );

      return;
    }

    const extractedLocation =
      typeof jobData.location ===
        "string"
        ? jobData.location
        : [
          jobData.location
            ?.city,

          jobData.location
            ?.country,
        ]
          .filter(Boolean)
          .join(", ");

    setFormData(
      (
        previousForm
      ) => ({
        /*
         * Preserve any fields not produced
         * by the AI response.
         */
        ...previousForm,

        title:
          jobData.title || "",

        /*
         * Existing Company website wins.
         *
         * Only use the website extracted
         * from the JD when Company has no
         * website yet.
         */
        companyUrl:
          companyUrlLocked
            ? previousForm
              .companyUrl
            : jobData
              .companyUrl ||
            previousForm
              .companyUrl ||
            "",

        jobType:
          jobData.jobType ||
          "Full-time",

        workMode:
          jobData.workMode ||
          "Office",

        education:
          jobData.education ||
          "",

        keySkills:
          Array.isArray(
            jobData.keySkills
          )
            ? jobData.keySkills.join(
              ", "
            )
            : jobData
              .keySkills ||
            "",

        requirements:
          Array.isArray(
            jobData.requirements
          )
            ? jobData.requirements.join(
              ", "
            )
            : jobData
              .requirements ||
            "",

        experience:
          jobData.experience ||
          "",

        location:
          extractedLocation,

        responsibilities:
          Array.isArray(
            jobData.responsibilities
          )
            ? jobData.responsibilities.join(
              ", "
            )
            : jobData
              .responsibilities ||
            "",

        roleSummary:
          jobData.roleSummary ||
          "",

        compensationBenefits:
          jobData
            .compensationBenefits ||
          "",

        applicationEndDate:
          jobData
            .applicationEndDate ||
          "",

        salary:
          jobData.salary || "",

        vacancies:
          Number(
            jobData.vacancies
          ) || 1,
      })
    );

    const missingFields =
      responseData
        .missingFields ||
      jobData.missingFields ||
      [];

    const warnings =
      responseData.warnings ||
      jobData.warnings ||
      [];

    /*
     * Company URL should only appear as missing
     * if the Company itself has no URL.
     */
    const filteredMissingFields =
      companyUrlLocked
        ? missingFields.filter(
          (field) =>
            field !==
            "companyUrl" &&
            field !==
            "companyWebsite"
        )
        : missingFields;

    setAiReviewNotes([
      ...filteredMissingFields.map(
        (field) =>
          `Missing from PDF: ${field}`
      ),

      ...warnings,
    ]);

    setPdfAnalysed(true);

    setLocationSelected(
      Boolean(
        extractedLocation
      )
    );

    setMessage("");

    setTimeout(() => {
      document
        .getElementById(
          "job-review-form"
        )
        ?.scrollIntoView({
          behavior:
            "smooth",

          block:
            "start",
        });
    }, 100);
  };



  // ANALYSE JD PDF


  const handleAnalyse =
    async () => {
      if (!file) {
        toast.error(
          "Please select a job-description PDF."
        );

        return;
      }

      const token =
        localStorage.getItem(
          "token"
        );

      if (!token) {
        toast.error(
          "Please sign in with a company account."
        );

        return;
      }

      try {
        setAnalysing(true);
        setMessage("");

        const uploadData =
          new FormData();

        uploadData.append(
          "jobDescription",
          file
        );

        const response =
          await axios.post(
            `${url}/jobs/analyse-pdf`,
            uploadData,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        applyExtractedJobData(
          response.data
        );

        toast.success(
          "PDF analysed. The form below has been populated."
        );
} catch (error) {
  // Log the error for debugging.
  console.error(
    "Job-description analysis error:",
    error
  );

  // Read the friendly message from our backend.
  const errorMessage =
    error.response?.data?.message ||
    "The PDF could not be analysed. Please try again.";

  // Show the message to the user.
  toast.error(errorMessage);
} finally {
        setAnalysing(
          false
        );
      }
    };


  // STEP 1: VALIDATE JD AND OPEN CONFIRMATION MODAL
  const handleSubmit = (event) => {
    event.preventDefault();

    setMessage("");

    if (!formData.companyUrl.trim()) {
      setMessage(
        "Please enter your company website before posting."
      );
      return;
    }

    // HTML required fields are validated by the form
    // before its onSubmit event is triggered.
    setShowPostModal(true);
  };

  // STEP 2: CONFIRM AND CREATE JOB

const confirmPostJob = async (event) => {
  event.preventDefault();

  // Prevent duplicate submissions.
  if (loading) return;

  try {
      setLoading(true);
      setMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error(
          "Your session has expired. Please sign in again."
        );
        return;
      }

   // Send only the job information.
// The backend identifies the poster
// using their authenticated account.
const payload = buildJobPayload(formData);

      await axios.post(
        `${url}/create`,
        payload,
      
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
        console.log("payload from postJobPage",payload)

      // Only close and redirect AFTER successful creation.
      setShowPostModal(false);

      toast.success("Job posted successfully!");

      await router.push(
        "/company/Dashboard/PostedJobs/PostedJobsPage"
      );

    } catch (error) {
      console.error("Create job error:", error);

      toast.error(
        error.response?.data?.message ||
        "Failed to post job. Please try again."
      );

      // Keep the modal open so the user doesn't lose
      // their entered posting details.

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
              <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
                <FiFileText className="text-blue-700" />

                Post a New Job
              </h2>

              <p className="text-sm mt-1 text-slate-500">
                Create a job manually or populate
                the form from a job-description PDF.
              </p>
            </div>


            <JobDescriptionUpload
              file={file}
              analysing={
                analysing
              }
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
                  Job description analysed successfully
                </p>

                <p className="mt-1 text-xs text-green-700">
                  The extracted details have been
                  added to the form below. Review
                  and edit every field before posting.
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
                    (
                      note,
                      index
                    ) => (
                      <li
                        key={`${note}-${index}`}
                        className="text-xs text-amber-800"
                      >
                        {note}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}


            {message && (
              <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {message}
              </div>
            )}


            <PostJobForm
              formData={
                formData
              }

              /*
               * Tells PostJobForm whether the
               * website can be edited.
               */
              companyUrlLocked={
                companyUrlLocked
              }

              loading={
                loading
              }

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


            {showPostModal && (
              <div
                className="fixed inset-0 z-[100] flex items-center
    justify-center bg-slate-950/60 backdrop-blur-sm p-4"
                role="presentation"
              >
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="post-job-modal-title"
                  className="w-full max-w-md rounded-2xl bg-white
      p-6 shadow-2xl border border-slate-200"
                >
                  {/* Modal header */}
                  <div className="mb-5">
                    <h3
                      id="post-job-modal-title"
                      className="text-lg font-bold text-slate-900"
                    >
                      Confirm Job Posting
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Before publishing this job, please confirm
                      who is posting it on behalf of your company.
                    </p>
                  </div>

                  <form onSubmit={confirmPostJob} className="space-y-4">

              {/* Job posting confirmation summary */}
<div className="rounded-xl border border-blue-100 bg-blue-50 p-4 space-y-3">

  {/* Job being advertised */}
  <div>
    <p className="text-xs text-slate-500">
      Job Title
    </p>

    <p className="text-sm font-semibold text-slate-900">
      {formData.title}
    </p>
  </div>

  {/* Automatically retrieved from User profile */}
  <div>
    <p className="text-xs text-slate-500">
      Posted By
    </p>

    <p className="text-sm font-semibold text-slate-900">
      {postingDetails.postedByName}
    </p>
  </div>

  {/* Notification information */}
 {/* Company account email */}
<div>
  <p className="text-xs text-slate-500">
    Application Notification Email
  </p>

  <p className="text-sm font-semibold text-slate-900">
    {postingDetails.email || "Email unavailable"}
  </p>

  <p className="mt-1 text-xs text-slate-500">
    This is your registered account email
    and will not be publicly displayed.
  </p>
</div>

</div>

                    {/* Action buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => setShowPostModal(false)}
                        className="rounded-lg border border-slate-200
            px-5 py-2.5 text-sm font-semibold text-slate-600
            hover:bg-slate-50 disabled:opacity-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={loading}
                        className="rounded-lg bg-blue-800
            px-5 py-2.5 text-sm font-semibold text-white
            hover:bg-blue-900 disabled:opacity-50"
                      >
                        {loading ? "Processing..." : "Continue to Post Job"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}


          </div>
        </div>
      </div>
    </Layout>
  );
}

// Company signed up WITH website
//         ↓
// Post Job
//         ↓
// No website field shown


// Company signed up WITHOUT website
//         ↓
// Post Job
//         ↓
// Company Website appears
//         ↓
// Enter once
//         ↓
// Save to Company.companyUrl