import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";


const getEditLocationLabel = (location) => {
  if (typeof location === "string") return location;
  if (!location) return "";

  return location.displayName ||
    [
      location.city || location.county || location.region,
      location.country,
    ].filter(Boolean).join(", ");
};

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


const [editLocation, setEditLocation] = useState(null);
const [locationWasEdited, setLocationWasEdited] = useState(false);
const [locationScope, setLocationScope] = useState("locality");
const [locationError, setLocationError] = useState("");


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

const handleEditLocationChange = (selection) => {
  setEditLocation(selection);
  setLocationWasEdited(true);
  setLocationError("");

  setEditForm((previous) => ({
    ...previous,
    location: selection.displayLabel,
  }));
};

const handleLocationScopeChange = (event) => {
  setLocationScope(event.target.value);
  setEditLocation(null);
  setLocationWasEdited(true);
};


  // ======================================================
  // OPEN JOB DETAILS
  // ======================================================

  const openModal = (job) => {
    setSelectedJob(job);

    
setEditLocation(null);
setLocationWasEdited(false);
setLocationError("");
setLocationScope(
  job.location?.locationType === "country"
    ? "country"
    : "locality"
);

    /*
     * Convert the database Job object
     * into editable form values.
     */
    setEditForm({
      title:
        job.title || "",

   location: getEditLocationLabel(job.location),

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

  // Reset Geoapify Edit Job state.
  setEditLocation(null);
  setLocationWasEdited(false);
  setLocationScope("locality");
  setLocationError("");
};

  // ======================================================
  // HANDLE FORM INPUT
  // ======================================================

  const handleEditChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    
if (name === "workMode" && value !== "Remote") {
  setLocationScope("locality");
}


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

    
if (locationWasEdited &&
    (!editLocation?.location || !editLocation?.token)) {
  setLocationError(
    "Please select a location from Geoapify suggestions."
  );
  return;
}

const effectiveLocation = locationWasEdited
  ? editLocation.location
  : selectedJob.location;

if (
  editForm.workMode !== "Remote" &&
  effectiveLocation?.locationType &&
  effectiveLocation.locationType !== "city"
) {
  setLocationError(
    "Office and Hybrid jobs require a city."
  );
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

      
// Only send location when the user selected a new one.
if (locationWasEdited) {
  payload.location = editLocation.location;
  payload.locationToken = editLocation.token;
}

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

setLocationWasEdited(false);
setEditLocation(null);
setLocationError("");

setEditForm((previous) => ({
  ...previous,
  location: getEditLocationLabel(updatedJob.location),
}));

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
   * It performs a soft close:
   * Job.status = "Closed"
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
       * We never send companyId.
       * Backend verifies:
       * Job.companyId === logged-in User.companyId
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

  // New Geoapify Edit Job state.
  editLocation,
  locationScope,
  locationError,
  locationWasEdited,

  jobToClose,
  isClosing,
  closeError,

  setIsEditing,
  openModal,
  closeModal,
  handleEditChange,
  handleSave,

  // New Geoapify handlers.
  handleEditLocationChange,
  handleLocationScopeChange,

  onRequestCloseJob: requestCloseJob,
  cancelCloseJob,
  confirmCloseJob,
};

}