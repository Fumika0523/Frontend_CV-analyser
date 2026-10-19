
import React from "react";
import CVUpload from "../../pages/candidate/Dashboard/CVUpload";

export default function CVUploadModal({
  isOpen,
  onClose,
  onUploadSuccess,
}) {
  // Do not render the modal when it is closed.
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Upload your CV"
    >
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">

        <button
          type="button"
          onClick={onClose}
          aria-label="Close CV upload"
          className="absolute right-4 top-3 z-10 text-xl text-slate-500 hover:text-slate-800"
        >
          ×
        </button>

        <CVUpload
          isGuest={false}
          onUploadSuccess={onUploadSuccess}
        />
      </div>
    </div>
  );
}
