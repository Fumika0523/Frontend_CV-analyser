import React, { useEffect, useRef } from "react";
import { MdWorkOff } from "react-icons/md";

export default function CloseJobDialog({
  job,
  isClosing,
  error,
  onCancel,
  onConfirm,
}) {
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    if (!job) return;

    // Prevent the page behind the dialog from scrolling.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Put keyboard focus inside the dialog.
    cancelButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      // Do not close the dialog while the request is running.
      if (event.key === "Escape" && !isClosing) {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [job, isClosing, onCancel]);

  if (!job) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="close-job-title"
        aria-describedby="close-job-description"
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <MdWorkOff className="h-6 w-6" />
          </div>

          <div>
            <h2
              id="close-job-title"
              className="text-lg font-bold text-slate-900"
            >
              Close this job posting?
            </h2>

            <p
              id="close-job-description"
              className="mt-2 text-sm leading-6 text-slate-600"
            >
              This job will no longer be visible to new applicants. Existing
              applications and job history will remain available, and you can
              reopen the job later.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Job Title
            </p>

          <p className="mt-1 font-semibold text-slate-900">
            {job.title}
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            disabled={isClosing}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Keep job open
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isClosing}
            className="flex min-w-[150px] items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isClosing ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Closing...
              </>
            ) : (
              <>
                <MdWorkOff className="h-4 w-4" />
                Close posting
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}