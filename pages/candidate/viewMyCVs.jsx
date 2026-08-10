import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AiOutlineFileSearch } from "react-icons/ai";
import { FiEye, FiFileText } from "react-icons/fi";
import { useRouter } from "next/router";
import { url } from "../../utils/constant";
import Layout from "../../components/Layout/Layout";

export default function ViewMyCVs() {
  const router = useRouter();

  const [myCVs, setMyCVs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const getMyCVs = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/");
        return;
      }

      const res = await axios.get(`${url}/cv/my-cvs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMyCVs(res.data || []);
    } catch (error) {
      console.error("Fetch CVs error:", error);
      toast.error("Failed to fetch CVs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMyCVs();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
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
    if (!file) {
      return toast.error("Please select a CV");
    }

    try {
      setUploading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/");
        return;
      }

      const formData = new FormData();
      formData.append("cv", file);

      await axios.post(`${url}/cv/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("CV uploaded successfully");

      setFile(null);

      await getMyCVs();
    } catch (error) {
      console.error("Upload CV error:", error);
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <div className=" py-10 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="mb-8">
            <h1 className="text-2xl font-bold ">
              My CVs
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Upload a new CV and view all CVs saved to your candidate account.
            </p>
          </div>

          {/* Upload CV Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <AiOutlineFileSearch className="text-2xl" />
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Upload New CV
                </h2>
                <p className="text-sm text-slate-500">
                  Upload your latest CV to update your skills and job matching.
                </p>
              </div>
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

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition disabled:opacity-50"
              style={{
                background:
                  !file || uploading
                    ? "#94a3b8"
                    : "linear-gradient(135deg, #1d4ed8, #1e3a8a)",
              }}
            >
              {uploading ? "Uploading..." : "Upload CV"}
            </button>
          </div>

          {/* CV List Section */}
          {loading ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
              Loading CVs...
            </div>
          ) : myCVs.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-2xl mb-4">
                <FiFileText />
              </div>

              <h2 className="text-lg font-semibold text-slate-900">
                No CV uploaded yet
              </h2>

              <p className="text-sm text-slate-500 mt-2">
                Upload your first CV using the upload box above.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {myCVs.map((cv) => (
                <div
                  key={cv._id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <FiFileText className="text-xl" />
                    </div>

                    <div className="min-w-0">
                      <h2 className="text-sm font-semibold text-slate-900 truncate">
                        Version {cv.version} — {cv.fileName}
                      </h2>

                      <p className="text-xs text-slate-400 mt-1">
                        Uploaded:{" "}
                        {new Date(
                          cv.createdAt || cv.uploadedAt
                        ).toLocaleDateString("en-GB")}
                      </p>
                    </div>
                  </div>

                  <a
                    href={`${url}${cv.filePath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition"
                  >
                    <FiEye />
                    View CV
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}