import JobDetailsModal from "../../../components/Jobs/JobDetailsModal";
import QuickApplyModal from "../../../components/Jobs/QuickApplyModal";
import JobCard from "../../../components/Jobs/JobCard";
import MatchScoreRing from "../../../components/Jobs/MatchScoreRing";
import JobMatchIndicator from "../../../components/Jobs/JobMatchIndicator";
import { jobDetailsMatchState } from "../../../components/Jobs/jobDetailsMatchState";
import useLatestJobScores from "../../../components/Jobs/useLatestJobScores";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FiAlertCircle, FiBriefcase, FiCheckCircle, FiFileText, FiInbox, FiLoader, FiLock, FiLogIn, FiTarget,
} from "react-icons/fi";
import { url } from "../../../utils/constant";
import AuthModal from "../../../components/Auth/authModal/authModal";
import OtpModal from "../../../components/Auth/otpModal";
import MatchScoreModal from "../../company/Dashboard/Applicants/MatchScoreModal";

const MAX_VISIBLE_SKILLS = 6;

function JobCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="h-5 w-3/4 rounded bg-slate-200" />
          <div className="h-3 w-1/2 rounded bg-slate-100" />
        </div>
        <div className="h-14 w-14 rounded-full bg-slate-100" />
      </div>
      <div className="mt-5 space-y-2">
        <div className="h-3 w-2/3 rounded bg-slate-100" />
        <div className="h-3 w-1/2 rounded bg-slate-100" />
      </div>
      <div className="mt-5 flex gap-2">
        <div className="h-6 w-16 rounded-full bg-slate-100" />
        <div className="h-6 w-20 rounded-full bg-slate-100" />
        <div className="h-6 w-14 rounded-full bg-slate-100" />
      </div>
      <div className="mt-5 h-10 rounded-lg bg-slate-200" />
    </div>
  );
}

const MatchingJobs = ({ isGuest = false, guestMatches = [], onSessionChange }) => {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [candidateMatches, setMatchedJobs] = useState([]);
  const matchedJobs = isGuest ? guestMatches : candidateMatches;
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [detailsLoadingId, setDetailsLoadingId] = useState(null);
  const [quickApplyJob, setQuickApplyJob] = useState(null);
  // Apply button state
  const [applyingJobId, setApplyingJobId] = useState(null);
  const applicationInFlight = useRef(false);
  const [appliedJobIds, setAppliedJobIds] = useState({});

  const [authModal, setAuthModal] = useState({
    isOpen: false,
    mode: "signup",
  });

  const [otpModal, setOtpModal] = useState({
    isOpen: false,
    _id: "",
    email: "",
  });

  const openSignup = () => {
    setSelectedMatch(null);
    setSelectedJob(null);
    setAuthModal({ isOpen: true, mode: "signup" });
  };

  const handleAuthSuccess = () => {
    setAuthModal({ isOpen: false, mode: "signup" });
    onSessionChange?.();
  };

  const handleOtpSent = ({ _id, email }) => {
    setAuthModal({ isOpen: false, mode: "signup" });
    setOtpModal({ isOpen: true, _id, email });
  };

  const getMatchedJob = async () => {
    try {
      setLoading(true);
      setMessage("");

      const token = localStorage.getItem("token");
      const res = await axios.get(`${url}/candidate/matched-jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMatchedJobs(res.data.matchedJobs || []);
    } catch (error) {
      console.error(error);
      setMessage(
        error.response?.data?.message || "Failed to fetch matched jobs"
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!isGuest) getMatchedJob();
  }, [isGuest]);

const openQuickApply = (job) => {
  if (isGuest || !localStorage.getItem("token")) {
    openSignup();
    return;
  }
  if (applicationInFlight.current) return;
  setSelectedJob(null);
  setQuickApplyJob(job);
};

const handleApply = async (job, cvId) => {
  if (isGuest || !localStorage.getItem("token")) {
    openSignup();
    return false;
  }
  if (!cvId) return false;
  // A ref closes the gap before React renders the disabled buttons.
  if (applicationInFlight.current) return;
  applicationInFlight.current = true;
  setApplyingJobId(String(job.jobId));

  try {
    const token = localStorage.getItem("token");

    const res = await axios.post(
      `${url}/applications/apply`,
      {
        jobId: job.jobId,
        cvId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Remove this job from recommendations
    // only after the application succeeds.
    setMatchedJobs((previousJobs) =>
      previousJobs.filter(
        (matchedJob) =>
          String(matchedJob.jobId) !== String(job.jobId)
      )
    );

    toast.success(
      res.data.message || "Application submitted successfully"
    );
    setAppliedJobIds((previous) => ({
  ...previous,
  [String(job.jobId)]: true,
}));

setSelectedJob(null);
    setQuickApplyJob(null);
    return true;
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Failed to apply"
    );
    return false;
  } finally {
    applicationInFlight.current = false;
    setApplyingJobId(null);
  }
};


const openJobDetails = async (job) => {
  if (detailsLoadingId !== null) return;
  setSelectedMatch(null);

  if (isGuest) {
    setSelectedJob(job);
    return;
  }

  setDetailsLoadingId(String(job.jobId));

  try {
    // The current backend mounts its single-job route at /:id.
    const response = await axios.get(
      `${url}/${encodeURIComponent(job.jobId)}`
    );

    // The full JD contains fields missing from the
    // recommended-jobs summary response.
    setSelectedJob({
      ...response.data,
      jobId: job.jobId,
      companyUrl:
        response.data.companyUrl ||
        response.data.companyId?.companyUrl ||
        job.companyUrl,
    });
  } catch (error) {
    toast.error(
      error.response?.data?.message ||
        "Unable to load job details."
    );
  } finally {
    setDetailsLoadingId(null);
  }
};

  const renderApplyButton = (job) => {
    const jobKey = String(job.jobId);
    const isApplying = applyingJobId === jobKey;
    const hasApplied = Boolean(appliedJobIds[jobKey]);

    const baseClass =
      "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2";

    if (isGuest) {
      return (
        <button
          type="button"
          onClick={openSignup}
          className={`${baseClass} bg-blue-700 text-white hover:bg-blue-800`}
        >
          <FiLogIn size={16} />
          Sign up to Apply
        </button>
      );
    }

    const disabled = applyingJobId !== null || hasApplied;

    return (
      <button
        type="button"
        onClick={() => openQuickApply(job)}
        disabled={disabled}
        className={`${baseClass} ${
          disabled
            ? "cursor-not-allowed bg-slate-200 text-slate-600"
            : "bg-blue-700 text-white hover:bg-blue-800"
        }`}
      >
        {isApplying ? (
          <>
            <FiLoader className="animate-spin" size={16} />
            Applying...
          </>
        ) : hasApplied ? (
          <>
            <FiCheckCircle size={16} />
            Application Submitted
          </>
        ) : (
          <>
            <FiFileText size={16} />
            Quick Apply
          </>
        )}
      </button>
    );
  };

  const candidateCv = useLatestJobScores([], !isGuest);
  const detailsMatch = !isGuest && selectedJob && matchedJobs.find((job) => String(job.jobId) === String(selectedJob.jobId || selectedJob._id));
  const scoreLabel = isGuest ? "Skill match" : "Match score";
  const showCount = !loading && !message;

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-950/10">
        {/* Page heading */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-600/20">
                <FiTarget aria-hidden="true" size={24} />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Matching Jobs
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  {isGuest
                    ? "A preview of jobs that match the skills in your CV."
                    : "Jobs that match the skills and details in your profile."}
                </p>
              </div>
            </div>

            {showCount && (
              <div className="flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
                <FiBriefcase className="text-blue-700" size={16} />

                <span>
                  Showing {matchedJobs.length}{" "}
                  {matchedJobs.length === 1 ? "job" : "jobs"}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* Guest notice */}
          {isGuest && (
            <div className="mb-5 flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                  <FiLock aria-hidden="true" size={17} />
                </span>

                <p className="text-sm leading-6 text-slate-700">
                  Preview jobs are matched by your CV skills only. Sign up to
                  unlock location-based matches and apply.
                </p>
              </div>

              <button
                type="button"
                onClick={openSignup}
                className="shrink-0 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                Sign up
              </button>
            </div>
          )}


          {/* Error / info message */}
          {message && !loading && (
            <div
              role="alert"
              className="flex flex-col items-center justify-center rounded-xl border border-dashed border-red-200 bg-red-50/60 py-14 text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
                <FiAlertCircle aria-hidden="true" size={30} />
              </div>

              <p className="mt-4 max-w-md text-sm font-medium text-slate-700">
                {!isGuest && candidateCv.status === "ready" && !candidateCv.cv ? "Upload CV to see your match" : message}
              </p>
            </div>
          )}

          {/* Empty state */}
          {!loading && !message && matchedJobs.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 py-14 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <FiInbox aria-hidden="true" size={30} />
              </div>

              <h3 className="mt-4 font-semibold text-slate-800">
                {!isGuest && candidateCv.status === "ready" && !candidateCv.cv ? "Upload CV to see your match" : "No matching jobs found"}
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                We could not find jobs that match your profile right now. Check
                back soon as new jobs are added.
              </p>
            </div>
          )}

          {/* Matched jobs */}
          {!loading && matchedJobs.length > 0 && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {matchedJobs.map((job, index) => (
                <JobCard
                  key={isGuest ? index : job.jobId}
                  job={{ ...job, _id: job.jobId, status: job.status || "Open", keySkills: isGuest ? job.keySkills : job.matchedSkills }}
                  guestPreview={isGuest}
                  maxSkills={MAX_VISIBLE_SKILLS}
                  detailsLoading={detailsLoadingId === String(job.jobId)}
                  onViewDetails={() => openJobDetails(job)}
                  matchIndicator={isGuest
                    ? <MatchScoreRing score={job.matchScore} label={scoreLabel} onClick={() => setSelectedMatch({ ...job, candidateName: "Your Profile" })} />
                    : <JobMatchIndicator job={job} scoring={candidateCv} match={job}
                        onView={() => setSelectedMatch({ ...job, candidateName: "Your Profile" })}
                        onUpload={() => openQuickApply(job)} />}
                  applyButton={renderApplyButton(job)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

{selectedJob && (
  <JobDetailsModal
    job={selectedJob}
    matchState={jobDetailsMatchState(candidateCv, selectedJob, detailsMatch, isGuest)}
    guestPreview={isGuest}
    onGuestSignup={openSignup}
    onRetryMatch={candidateCv.retry}
    onUploadCv={() => openQuickApply(selectedJob)}
    onClose={() => setSelectedJob(null)}
    applyButton={renderApplyButton(selectedJob)}
  />
)}

      {quickApplyJob && (
        <QuickApplyModal
          job={quickApplyJob}
          initialCv={candidateCv.status === "ready" ? candidateCv.cv : undefined}
          onCvUploaded={candidateCv.selectCv}
          submitting={applyingJobId !== null}
          onClose={() => {
            if (!applicationInFlight.current) setQuickApplyJob(null);
          }}
          onConfirm={(cvId) => handleApply(quickApplyJob, cvId)}
        />
      )}

      <AuthModal
        isOpen={authModal.isOpen}
        initialMode={authModal.mode}
        onClose={() => setAuthModal({ isOpen: false, mode: "signup" })}
        onAuthSuccess={handleAuthSuccess}
        onOtpSent={handleOtpSent}
      />

      {otpModal.isOpen && (
        <OtpModal
          isOpen={otpModal.isOpen}
          _id={otpModal._id}
          email={otpModal.email}
          onClose={() => setOtpModal({ isOpen: false, _id: "", email: "" })}
          onVerified={(data) => {
            if (data?.token) {
              localStorage.setItem("token", data.token);
              localStorage.removeItem("guest_session_id");
            }

            setOtpModal({ isOpen: false, _id: "", email: "" });
            onSessionChange?.();
          }}
        />
      )}

      {selectedMatch && (
        <MatchScoreModal
          data={selectedMatch}
          isGuest={isGuest}
          onSignUp={openSignup}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </>
  );
};

export default MatchingJobs;
