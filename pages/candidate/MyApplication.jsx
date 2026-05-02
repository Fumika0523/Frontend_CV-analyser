import React, { useState } from "react";
import axios from "axios";

const UploadButton = ({ file }) => {
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Please select a CV");

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("cv", file);

      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:8002/api/cv/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(res.data);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleUpload}
      disabled={!file || loading}
      className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white shadow-md flex items-center justify-center gap-2"
      style={{
        background: "linear-gradient(135deg, #7c94d8, #020818)",
        opacity: !file || loading ? 0.6 : 1,
        cursor: !file || loading ? "not-allowed" : "pointer",
      }}
    >
      {loading ? (
        <>
          <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
          Uploading...
        </>
      ) : (
        <>📄 Upload CV</>
      )}
    </button>
  );
};

export default UploadButton;