import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { url } from "../../../utils/constant";
import AuthModal from "../../../components/Auth/authModal/authModal";
import OtpModal from "../../../components/Auth/otpModal";
import { toast } from "react-toastify";
import MatchScoreModal from "../../company/Dashboard/Applicants/MatchScoreModal"

const MatchingJobs = ({ isGuest = false }) => {
  const router = useRouter();
const [selectedMatch, setSelectedMatch] =
  useState(null);
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [authModal, setAuthModal] = useState({
    isOpen: false,
    mode: "signup",
  });

  const [otpModal, setOtpModal] = useState({
    isOpen: false,
    _id: "",
    email: "",
  });

  const formatLocation = (location) => {
    if (!location) return "";
    if (typeof location === "string") return location;
    return `${location.city || ""}, ${location.country || ""}`;
  };

  const handleAuthSuccess = () => {
    setAuthModal({ isOpen: false, mode: "signup" });
    router.push("/candidate/dashboard");
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
      const guestSessionId = localStorage.getItem("guest_session_id");

      if (isGuest && !guestSessionId) {
        setMessage("Please upload your CV first to see preview jobs.");
        return;
      }

      const endpoint = isGuest
        ? `${url}/guest/matched-jobs?guestSessionId=${guestSessionId}`
        : `${url}/candidate/matched-jobs`;

      const config = isGuest
        ? {}
        : {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };

      const res = await axios.get(endpoint, config);
      console.log("Matched Job Data", res.data)
      const jobsData = res.data.matchedJobs || [];
      setMatchedJobs(isGuest ? jobsData.slice(0, 5) : jobsData);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "Failed to fetch matched jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMatchedJob();
  }, [isGuest]);

  const handleApply = async (job) => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.post(
      `${url}/applications/apply`,
       {
    jobId: job.jobId,
    cvId: null,
  },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success(res.data.message || "Application submitted successfully");
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to apply");
  }
};

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          🎯 Jobs Matching Your Profile
        </h2>

        {isGuest && (
          <p className="text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
            Preview jobs are matched by your CV skills only. Sign up to unlock
            location-based matches and apply.
          </p>
        )}

        {loading && <p className="text-gray-500">Loading matched jobs...</p>}

        {message && !loading && (
          <p className="text-red-500 text-sm">{message}</p>
        )}

        {!loading && !message && matchedJobs.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No matching jobs found.
          </p>
        )}

        <div className="space-y-4">
          {matchedJobs.map((job) => (
            <div key={job.jobId} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900">{job.title}</h3>

              <p className="text-xs text-gray-500 mt-1">
                {formatLocation(job.location)}
              </p>

              <p className="text-sm text-gray-600 mt-1">
                {job.salary} · {job.jobType} · {job.workMode}
              </p>

              <button
  type="button"
  onClick={() =>
    setSelectedMatch({
      ...job,
      candidateName: "Your Profile",
    })
  }
  className="text-sm font-semibold text-green-600 mt-2 hover:text-green-700 hover:underline"
>
  Match Score: {job.matchScore}%
</button>

              <div className="flex flex-wrap gap-2 mt-3">
                {job.matchedSkills?.map((skill, index) => (
                  <span
                    key={index}
                    className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex justify-end items-center gap-3 mt-4">
                {!isGuest && job.companyUrl && (
                  <a
                    href={job.companyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-800 hover:text-blue-500"
                  >
                    🔗 URL
                  </a>
                )}

                {!isGuest ? (
                  <button
                  onClick={() => handleApply(job)}
                   className="px-4 py-2 rounded-lg bg-blue-700 text-white text-sm font-semibold">
                    Apply Now
                  </button>
                ) : (
                  <button
                    onClick={() => setAuthModal({ isOpen: true, mode: "signup" })}
                    type="button"
                    className="px-4 py-2 rounded-lg bg-blue-200 text-blue-800 text-sm font-semibold"
                  >
                    Sign up to Apply
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

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
            }

            localStorage.removeItem("guest_session_id");
            setOtpModal({ isOpen: false, _id: "", email: "" });
            router.push("/candidate/dashboard");
          }}
        />
      )}
      {selectedMatch && (
  <MatchScoreModal
    data={selectedMatch}
    onClose={() =>
      setSelectedMatch(null)
    }
  />
)}
    </>
  );
};

export default MatchingJobs;