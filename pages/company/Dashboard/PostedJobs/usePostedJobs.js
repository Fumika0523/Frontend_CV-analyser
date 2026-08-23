// This custom hook owns the state, API requests, and event handlers for
// the Posted Jobs feature.
//
// Keeping this logic here allows:
//   - PostedJobsPage.jsx to remain a small route component.
//   - PostedJobs.jsx to focus mainly on rendering.
//   - Other components in this Next.js web application to reuse the logic.
//
// It is not framework-independent because it uses next/router and
// browser localStorage.

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

// NEXT_PUBLIC_ is required because this value is used in browser code.
// The localhost fallback should only be used during development.
const API_BASE = "http://localhost:8002";
// Builds the auth header fresh on every call, so it always reflects
// whatever token is currently in localStorage.
const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export default function usePostedJobs() {
  const router = useRouter();

  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
const [jobToClose, setJobToClose] = useState(null);
const [closeError, setCloseError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationResults, setLocationResults] = useState([]);

  // Only logged-in company accounts may view this page.
useEffect(() => {
  let componentIsMounted = true;

  const initialisePostedJobs = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/");
      return;
    }

    try {
      // First confirm that the user is an authenticated company.
      const profileResponse = await axios.get(
        `${API_BASE}/user-profile`,
        authHeader()
      );

      if (profileResponse.data.user.role !== "company") {
        router.replace("/");
        return;
      }

      // Only request the jobs after authentication succeeds.
      const jobsResponse = await axios.get(
        `${API_BASE}/my-jobs`,
        authHeader()
      );

      if (componentIsMounted) {
        setJobs(jobsResponse.data);
      }
    } catch (error) {
      console.error(
        "Failed to initialise Posted Jobs:",
        error.response?.data?.message || error.message
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

  // Debounced city search while the location field is being edited.
  useEffect(() => {
    if (!isEditing || !editForm?.location) {
      setLocationResults([]);
      return;
    }

    const city = editForm.location.trim();
    if (city.length < 2) {
      setLocationResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLocationLoading(true);
        const res = await axios.get(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            city
          )}&count=6&language=en&format=json`
        );
        setLocationResults(res.data.results || []);
      } catch (error) {
        console.error("Location search failed:", error);
      } finally {
        setLocationLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [editForm?.location, isEditing]);

  const selectEditLocation = (place) => {
    setEditForm((prev) => ({
      ...prev,
      location: `${place.name}, ${place.country}`,
    }));
    setLocationResults([]);
  };

  const openModal = (job) => {
    setSelectedJob(job);
    setEditForm({
      title: job.title || "",
      location: job.location?.city
        ? `${job.location.city}, ${job.location.country}`
        : job.location || "",
      salary: job.salary || "",
      jobType: job.jobType || "Full-time",
      workMode: job.workMode || "Office",
      education: job.education || "",
      experience: job.experience || "",
      keySkills: job.keySkills?.join(", ") || "",
      requirements: job.requirements?.join(", ") || "",
      responsibilities: job.responsibilities?.join(", ") || "",
      roleSummary: job.roleSummary || "",
      compensationBenefits: job.compensationBenefits || "",
      applicationEndDate: job.applicationEndDate
        ? job.applicationEndDate.slice(0, 10)
        : "",
      vacancies: job.vacancies || 1,
      filledPositions: job.filledPositions || 0,
      status: job.status || "Open",
    });
    setIsEditing(false);
  };

  const closeModal = () => {
    setSelectedJob(null);
    setEditForm(null);
    setIsEditing(false);
  };

  const handleEditChange = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const payload = {
        ...editForm,
        vacancies: Number(editForm.vacancies) || 1,
        keySkills: editForm.keySkills.split(",").map((s) => s.trim()).filter(Boolean),
        requirements: editForm.requirements.split(",").map((s) => s.trim()).filter(Boolean),
        responsibilities: editForm.responsibilities.split(",").map((s) => s.trim()).filter(Boolean),
      };

      const res = await axios.put(`${API_BASE}/jobs/${selectedJob._id}`, payload, authHeader());
      const updatedJob = res.data.jobPost || res.data.job || res.data;

      setJobs((prev) => prev.map((job) => (job._id === selectedJob._id ? updatedJob : job)));
      setSelectedJob(updatedJob);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save job:", error);
      alert(error.response?.data?.message || "Failed to update job");
    } finally {
      setSaving(false);
    }
  };
// The backend DELETE endpoint performs a soft close:
// it changes the status to "Closed" instead of removing the document.
// This preserves existing applications and job history.
const requestCloseJob = (job) => {
  if (!job || job.status === "Closed") return;

  setCloseError("");
  setJobToClose(job);
};

// Close the confirmation dialog without making an API request.
const cancelCloseJob = () => {
  if (isClosing) return;

  setJobToClose(null);
  setCloseError("");
};

// Close the job only after the user confirms inside the dialog.
const confirmCloseJob = async () => {
  if (!jobToClose || isClosing) return;

  try {
    setIsClosing(true);
    setCloseError("");

    const response = await axios.delete(
      `${API_BASE}/jobs/${jobToClose._id}`,
      authHeader()
    );

    const closedJob = response.data.job || response.data;

    // Update the job inside the displayed list.
    setJobs((previousJobs) =>
      previousJobs.map((job) =>
        job._id === closedJob._id ? closedJob : job
      )
    );

    // Update the job details modal if the same job is currently displayed.
    setSelectedJob((previousJob) =>
      previousJob?._id === closedJob._id
        ? closedJob
        : previousJob
    );

    // Close the confirmation dialog after success.
    setJobToClose(null);
  } catch (error) {
    console.error(
      "Failed to close job:",
      error.response?.data?.message || error.message
    );

    // Keep the dialog open and display the error inside it.
    setCloseError(
      error.response?.data?.message ||
        "Failed to close the job. Please try again."
    );
  } finally {
    setIsClosing(false);
  }
};

return {
  jobs,
  selectedJob,
  isEditing,
  editForm,
  saving,
  checkingAuth,
  locationLoading,
  locationResults,

  // Confirmation-dialog state
  jobToClose,
  isClosing,
  closeError,

  // PostedJobs handlers
  setIsEditing,
  openModal,
  closeModal,
  handleEditChange,
  handleSave,
  selectEditLocation,

  // PostedJobs receives this exact prop name.
  onRequestCloseJob: requestCloseJob,

  // CloseJobDialog handlers
  cancelCloseJob,
  confirmCloseJob,
};
}