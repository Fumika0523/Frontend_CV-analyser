import React, { useState, useEffect  } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AiOutlineFileSearch } from "react-icons/ai";
import { FiEye } from "react-icons/fi";
import { url } from "../../../utils/constant";
import { useRouter } from "next/router";

export default function CVUpload({ isGuest = false, onSignUpClick, guestView }) {
 // console.log("isGuest:", isGuest);
  //console.log("guestView", guestView)
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadedCV, setUploadedCV] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [analysisData, setAnalysysData] = useState(null)
  const [myCVs, setMyCVs] = useState([]);
  // 
  const router = useRouter()

   // Get CV
  const getMyCVs =  async () => {
  try {
    if (isGuest) return;

    const token = localStorage.getItem("token");

    const res = await axios.get(`${url}/cv/my-cvs`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setMyCVs(res.data || []);
  } catch (error) {
    console.error("Fetch CVs error:", error);
  }
    };
    useEffect(() => {
      getMyCVs();
    }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    const allowedTypes = [
      "application/pdf",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Please upload a PDF");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) 
    return toast.error("Please select a CV");

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("cv", file);
      console.log("formData",formData)

      const endpoint = isGuest
        ? `${url}/cv/guest-upload`
        : `${url}/cv/upload`;

      const headers = {
        "Content-Type": "multipart/form-data",
      };

      if (isGuest) {
        let guestSessionId = localStorage.getItem("guest_session_id");

        if (!guestSessionId) {
          guestSessionId = `guest_${Date.now()}_${Math.random()
            .toString(36)
            .substring(2, 10)}`;

          localStorage.setItem("guest_session_id", guestSessionId);
        }

        formData.append("guestSessionId", guestSessionId);
        
      } else {
        const token = localStorage.getItem("token");
        headers.Authorization = `Bearer ${token}`;
      }
    console.log("endpoint:", endpoint);
    console.log("file:", file);
    console.log("guest_session_id:", localStorage.getItem("guest_session_id"));
    
      const res = await axios.post(endpoint, formData, { headers });
      console.log("CV upload response:", res.data.cv);
      setUploadedCV(res.data.cv || null);
      setUploadSuccess(true);
      setAnalysysData(res.data);

      await getMyCVs();

      // toast.success(
      //     isGuest
      //     ? "CV analysed temporarily! "
      //     : "CV uploaded successfully!"
      // );
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  if (uploadSuccess) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-green-50 flex items-center justify-center text-green-600 text-2xl mb-4">
          ✅
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-2">
          CV uploaded successfully!
        </h2>

        {isGuest ? (
          <>
            <p className="text-sm text-slate-500 mb-5">
              We've analysed your CV and generated a preview report.
              Continue as a guest to view limited insights, or create a free account
              to unlock the full analysis and save your progress.
            </p>

            <button
              onClick={
                ()=>router.push("/candidate/dashboard")
              }
              type="button"
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white mb-3"
              style={{
                background: "linear-gradient(135deg, #1d4ed8, #1e3a8a)",
              }}
            >
              View Preview Report
            </button>

            <button
              type="button"
              onClick={onSignUpClick}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition"
            >
              Unlock Full Analysis
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-5">
              Your CV has been uploaded and analysed successfully.
            </p>

            <button
               onClick={
                ()=>router.push("/candidate/dashboard")
              }
              type="button"
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{
                background: "linear-gradient(135deg, #1d4ed8, #1e3a8a)",
              }}
            >
              View Full Analysis
            </button>
          </>
        )}
      </div>
    );
  }

 return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <AiOutlineFileSearch className="text-2xl" />
          </div>

          <div>
            {/* <h2 className="text-base font-semibold text-slate-900">
             {!isGuest ? "Upload CV as Guest" : "Your CV"}
            </h2> */}

            <p className="text-md text-slate-700 font-bold">
            {isGuest ? (
              <>
                Temporary upload only.{" "}
                <button
                  type="button"
                  onClick={onSignUpClick}
                  className="text-blue-600 font-semibold underline underline-offset-2 hover:text-blue-800"
                >
                  Sign up
                </button>{" "}
                to save your CV.
              </>
            ) : (
              "Upload your CV to apply for jobs instantly"
            )} 
          </p>
          </div>
        </div>

       {isGuest && uploadedCV && (
          <a
            href={`${url}${uploadedCV.filePath}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition"
          >
            <FiEye className="text-sm" />
            View CV
          </a>
        )}
      </div>

      <label
        className={`flex items-center gap-3 w-full border-2 border-dashed rounded-xl px-4 py-4 cursor-pointer transition mb-3 ${
          file
            ? "border-blue-300 bg-blue-50/50"
            : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/30"
        }`}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="sr-only"
        />

        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
          📎
        </div>

        <div className="min-w-0">
          <p className="text-sm text-slate-600 truncate">
            {file ? file.name : "Click to upload or drag & drop"}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            PDF — max 5MB
          </p>
        </div>
      </label>
    
    {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition disabled:opacity-50"
        style={{
          background: !file || loading
            ? "#94a3b8"
            : "linear-gradient(135deg, #1d4ed8, #1e3a8a)",
        }}
      >
        {loading ? "Uploading..." : isGuest ? "Analyse CV" : "Upload CV"}
      </button>


      {!isGuest && myCVs.length > 0 && (
  <div className="mt-6 border-t border-slate-200 pt-5">
    <h3 className="text-sm font-semibold text-slate-900 mb-3">
      My Uploaded CVs
    </h3>

    <div className="space-y-3">
      {myCVs.map((cv) => (
        <div
          key={cv._id}
          className="flex items-center justify-between border border-slate-200 rounded-xl px-4 py-3"
        >
          <div>
            <p className="text-sm font-medium text-slate-800">
              Version {cv.version} — {cv.fileName}
            </p>
            <p className="text-xs text-slate-400">
              {new Date(cv.createdAt || cv.uploadedAt).toLocaleDateString("en-GB")}
            </p>
          </div>

          <a
            href={`${url}${cv.filePath}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-blue-700 hover:underline"
          >
            View CV
          </a>
        </div>
      ))}
    </div>
  </div>
)}
    </div>
  );
}