import React from "react";
import { AiOutlineFileSearch } from "react-icons/ai";

export default function JobDescriptionUpload({
  file,
  analysing,
  handleFileChange,
  handleAnalyse,
}) {
  return (
    <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50/40 p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
          <AiOutlineFileSearch className="text-2xl" />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Fill this form using AI
          </h3>

          <p className="text-xs text-slate-600 mt-1">
            Upload an existing job-description
            PDF. AI will extract the details and
            populate the form.
          </p>
        </div>
      </div>

      <label
        className={`flex items-center gap-3 w-full border-2 border-dashed rounded-xl px-4 py-4 cursor-pointer transition mb-3 ${
          file
            ? "border-blue-400 bg-white"
            : "border-blue-200 bg-white/70 hover:border-blue-400"
        }`}
      >
        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="sr-only"
        />

        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
          📎
        </div>

        <div className="min-w-0">
          <p className="text-sm text-slate-700 truncate">
            {file
              ? file.name
              : "Select a job-description PDF"}
          </p>

          <p className="text-xs text-slate-400 mt-0.5">
            PDF — maximum 5 MB
          </p>
        </div>
      </label>

      <button
        type="button"
        onClick={handleAnalyse}
        disabled={!file || analysing}
        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition disabled:opacity-50"
        style={{
          background:
            !file || analysing
              ? "#94a3b8"
              : "linear-gradient(135deg, #1d4ed8, #1e3a8a)",
        }}
      >
        {analysing
          ? "Analysing job description..."
          : "Analyse PDF and Fill Form"}
      </button>

      <p className="text-xs text-amber-700 mt-3">
        AI-generated information may be
        incomplete. Review every field before
        posting the job.
      </p>
    </div>
  );
}