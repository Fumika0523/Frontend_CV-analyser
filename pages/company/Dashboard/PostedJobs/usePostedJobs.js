import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

/*
 * Backend URL.
 *
 * Later during deployment we should move this
 * to your shared environment/config value.
 */
const API_BASE = "http://localhost:8002";

/*
 * Build Authorization header whenever
 * an authenticated API request is made.
 */
const authHeader = () => ({
  headers: {
    Authorization:
      `Bearer ${localStorage.getItem("token")}`,
  },
});

export default function usePostedJobs() {
  const router = useRouter();

  // ======================================================
  // STATE
  // ======================================================

  const [jobs, setJobs] = useState([]);

  /*
   * selectedJob is the job shown inside
   * the full Job Details modal.
   */
  const [selectedJob, setSelectedJob] =
    useState(null);

  const [isEditing, setIsEditing] =
    useState(false);

  const [editForm, setEditForm] =
    useState(null);

  const [saving, setSaving] =
    useState(false);

  // Close job confirmation
  const [isClosing, setIsClosing] =
    useState(false);

  const [jobToClose, setJobToClose] =
    useState(null);

  const [closeError, setCloseError] =
    useState("");

  // Authentication
  const [checkingAuth, setCheckingAuth] =
    useState(true);

  // Location autocomplete
  const [locationLoading, setLocationLoading] =
    useState(false);

  const [locationResults, setLocationResults] =
    useState([]);

  // ======================================================
  // LOAD COMPANY JOBS
  // ======================================================

  useEffect(() => {
    let componentIsMounted = true;

    const initialisePostedJobs = async () => {
      const token =
        localStorage.getItem("token");

      if (!token) {
        router.replace("/");
        return;
      }

      try {
        /*
         * First check the logged-in profile.
         *
         * IMPORTANT:
         * We do NOT send companyId from the frontend.
         *
         * Backend flow:
         *
         * JWT
         * ↓
         * User._id
         * ↓
         * User.companyId
         * ↓
         * Company._id
         */
        const profileResponse =
          await axios.get(
            `${API_BASE}/user-profile`,
            authHeader()
          );

        const user =
          profileResponse.data.user;

        if (user.role !== "company") {
          router.replace("/");
          return;
        }

        /*
         * Backend now uses:
         *
         * user.companyId
         *
         * to determine which jobs this
         * company can access.
         */
        const jobsResponse =
          await axios.get(
            `${API_BASE}/my-jobs`,
            authHeader()
          );

        if (componentIsMounted) {
          /*
           * Your current backend returns
           * the jobs array directly.
           */
          setJobs(
            Array.isArray(jobsResponse.data)
              ? jobsResponse.data
              : []
          );
        }
      } catch (error) {
        console.error(
          "Failed to initialise Posted Jobs:",
          error.response?.data?.message ||
            error.message
        );

        router.replace("/");
      } finally {
        if (componentIsMounted) {
          setCheckingAuth(false);
        }
      }
    };

    initialisePostedJobs();

    return () => {
      componentIsMounted = false;
    };
  }, [router]);

  // ======================================================
  // LOCATION SEARCH
  // ======================================================

  useEffect(() => {
    /*
     * Only search while editing.
     */
    if (
      !isEditing ||
      !editForm?.location
    ) {
      setLocationResults([]);
      return;
    }

    const city =
      editForm.location.trim();

    if (city.length < 2) {
      setLocationResults([]);
      return;
    }

    /*
     * Debounce:
     * wait 500ms after typing before
     * calling the location API.
     */
    const timer = setTimeout(
      async () => {
        try {
          setLocationLoading(true);

          const response =
            await axios.get(
              `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
                city
              )}&count=6&language=en&format=json`
            );

          setLocationResults(
            response.data.results || []
          );
        } catch (error) {
          console.error(
            "Location search failed:",
            error
          );

          setLocationResults([]);
        } finally {
          setLocationLoading(false);
        }
      },
      500
    );

    return () =>
      clearTimeout(timer);
  }, [
    editForm?.location,
    isEditing,
  ]);

  // ======================================================
  // SELECT LOCATION
  // ======================================================

  const selectEditLocation = (place) => {
    setEditForm((previousForm) => ({
      ...previousForm,

      /*
       * Backend accepts this string and
       * converts it back into:
       *
       * {
       *   city,
       *   country
       * }
       */
      location:
        `${place.name}, ${place.country}`,
    }));

    setLocationResults([]);
  };

  // ======================================================
  // OPEN JOB DETAILS
  // ======================================================

  const openModal = (job) => {
    setSelectedJob(job);

    /*
     * Convert the database Job object
     * into editable form values.
     */
    setEditForm({
      title:
        job.title || "",

      location:
        job.location?.city
          ? `${job.location.city}, ${job.location.country}`
          : job.location || "",

      salary:
        job.salary || "",

      jobType:
        job.jobType || "Full-time",

      workMode:
        job.workMode || "Office",

      education:
        job.education || "",

      experience:
        job.experience || "",

      /*
       * NEW:
       * These fields exist in JobModel
       * and should also be editable.
       */
      category:
        job.category || "",

      industry:
        job.industry || "",

      keySkills:
        job.keySkills?.join(", ") ||
        "",

      requirements:
        job.requirements?.join(", ") ||
        "",

      responsibilities:
        job.responsibilities?.join(
          ", "
        ) || "",

      roleSummary:
        job.roleSummary || "",

      compensationBenefits:
        job.compensationBenefits || "",

      applicationEndDate:
        job.applicationEndDate
          ? job.applicationEndDate.slice(
              0,
              10
            )
          : "",

      vacancies:
        job.vacancies || 1,

      /*
       * This is DISPLAY information.
       *
       * We will NOT send it when updating
       * the job.
       */
      filledPositions:
        job.filledPositions || 0,

      status:
        job.status || "Open",
    });

    setIsEditing(false);
  };

  // ======================================================
  // CLOSE DETAILS MODAL
  // ======================================================

  const closeModal = () => {
    setSelectedJob(null);
    setEditForm(null);
    setIsEditing(false);
    setLocationResults([]);
  };

  // ======================================================
  // HANDLE FORM INPUT
  // ======================================================

  const handleEditChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setEditForm(
      (previousForm) => ({
        ...previousForm,
        [name]: value,
      })
    );
  };

  // ======================================================
  // SAVE UPDATED JOB
  // ======================================================

  const handleSave = async () => {
    if (!selectedJob || !editForm) {
      return;
    }

    try {
      setSaving(true);

      /*
       * IMPORTANT SECURITY / ARCHITECTURE CHANGE:
       *
       * Build the payload explicitly.
       *
       * Do NOT send:
       *
       * companyId
       * createdBy
       * filledPositions
       *
       * The backend controls those fields.
       */
      const payload = {
        title:
          editForm.title,

        location:
          editForm.location,

        salary:
          editForm.salary,

        jobType:
          editForm.jobType,

        workMode:
          editForm.workMode,

        education:
          editForm.education,

        experience:
          editForm.experience,

        category:
          editForm.category,

        industry:
          editForm.industry,

        roleSummary:
          editForm.roleSummary,

        compensationBenefits:
          editForm.compensationBenefits,

        applicationEndDate:
          editForm.applicationEndDate,

        vacancies:
          Number(
            editForm.vacancies
          ) || 1,

        status:
          editForm.status,

        /*
         * Convert comma-separated strings
         * back into arrays.
         *
         * Example:
         *
         * "React, Node.js"
         *
         * becomes:
         *
         * ["React", "Node.js"]
         */
        keySkills:
          editForm.keySkills
            .split(",")
            .map((skill) =>
              skill.trim()
            )
            .filter(Boolean),

        requirements:
          editForm.requirements
            .split(",")
            .map((item) =>
              item.trim()
            )
            .filter(Boolean),

        responsibilities:
          editForm.responsibilities
            .split(",")
            .map((item) =>
              item.trim()
            )
            .filter(Boolean),
      };

      const response =
        await axios.put(
          `${API_BASE}/jobs/${selectedJob._id}`,
          payload,
          authHeader()
        );

      /*
       * Backend currently returns:
       *
       * {
       *   message,
       *   job
       * }
       */
      const updatedJob =
        response.data.job ||
        response.data.jobPost ||
        response.data;

      /*
       * Replace only the changed job
       * inside the existing jobs array.
       */
      setJobs((previousJobs) =>
        previousJobs.map((job) =>
          job._id ===
          selectedJob._id
            ? updatedJob
            : job
        )
      );

      /*
       * Also update the currently-open
       * Job Details modal.
       */
      setSelectedJob(updatedJob);

      setIsEditing(false);
    } catch (error) {
      console.error(
        "Failed to save job:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to update job"
      );
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // REQUEST JOB CLOSURE
  // ======================================================

  /*
   * Backend DELETE does NOT delete the job.
   *
   * It performs a soft close:
   *
   * Job.status = "Closed"
   *
   * This preserves applications and history.
   */
  const requestCloseJob = (job) => {
    if (
      !job ||
      job.status === "Closed"
    ) {
      return;
    }

    setCloseError("");
    setJobToClose(job);
  };

  // ======================================================
  // CANCEL CLOSE
  // ======================================================

  const cancelCloseJob = () => {
    if (isClosing) {
      return;
    }

    setJobToClose(null);
    setCloseError("");
  };

  // ======================================================
  // CONFIRM CLOSE
  // ======================================================

  const confirmCloseJob = async () => {
    if (
      !jobToClose ||
      isClosing
    ) {
      return;
    }

    try {
      setIsClosing(true);
      setCloseError("");

      /*
       * Again:
       * We send ONLY job._id.
       *
       * We never send companyId.
       *
       * Backend verifies:
       *
       * Job.companyId
       * ===
       * logged-in User.companyId
       */
      const response =
        await axios.delete(
          `${API_BASE}/jobs/${jobToClose._id}`,
          authHeader()
        );

      const closedJob =
        response.data.job ||
        response.data;

      /*
       * Update card in job list.
       */
      setJobs((previousJobs) =>
        previousJobs.map((job) =>
          job._id === closedJob._id
            ? closedJob
            : job
        )
      );

      /*
       * Update details modal if the
       * same job is currently open.
       */
      setSelectedJob(
        (previousJob) =>
          previousJob?._id ===
          closedJob._id
            ? closedJob
            : previousJob
      );

      setJobToClose(null);
    } catch (error) {
      console.error(
        "Failed to close job:",
        error.response?.data?.message ||
          error.message
      );

      setCloseError(
        error.response?.data?.message ||
          "Failed to close the job. Please try again."
      );
    } finally {
      setIsClosing(false);
    }
  };

  // ======================================================
  // RETURN EVERYTHING POSTEDJOBS NEEDS
  // ======================================================

  return {
    jobs,
    selectedJob,
    isEditing,
    editForm,
    saving,
    checkingAuth,
    locationLoading,
    locationResults,
    jobToClose,
    isClosing,
    closeError,
    setIsEditing,
    openModal,
    closeModal,
    handleEditChange,
    handleSave,
    selectEditLocation,
    onRequestCloseJob:
      requestCloseJob,
    cancelCloseJob,
    confirmCloseJob,
  };
}