import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  FiDownload, FiExternalLink, FiEye, FiFileText, FiLoader, FiMapPin,
  FiMoreVertical, FiSend, FiTarget, FiUploadCloud, FiX, FiZap,
} from "react-icons/fi";
import { url } from "../../utils/constant";
import CVUploadModal from "./CVUploadModal";
import { cvDisplayName } from "../../utils/cvDisplayName";
export { cvDisplayName } from "../../utils/cvDisplayName";

export const safeCompanyUrl = (value) => {
  try {
    const parsed = new URL(value);
    return ["https:", "http:"].includes(parsed.protocol) && !parsed.username && !parsed.password
      ? parsed.href : null;
  } catch { return null; }
};

const authConfig = () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Please sign in to continue.");
  return { headers: { Authorization: `Bearer ${token}` } };
};
const errorMessage = (error, fallback) =>
  [401, 403].includes(error.response?.status)
    ? "Your session is unavailable or you do not have access. Please sign in again."
    : error.response?.data?.message || error.message || fallback;

export default function QuickApplyModal({ job, submitting, onClose, onConfirm, initialCv, loadMatch, onCvUploaded }) {
  const [cv, setCv] = useState(null);
  const [cvLoading, setCvLoading] = useState(true);
  const [error, setError] = useState("");
  const [score, setScore] = useState(null);
  const [scoreLoading, setScoreLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [fileBusy, setFileBusy] = useState(false);
  const fileRequestInFlight = useRef(false);
  const confirming = useRef(false);
  const mounted = useRef(true);
  const cvMenu = useRef(null);
  const cvMenuTrigger = useRef(null);
  const jobId = job.jobId || job._id;

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    let active = true;
    setCvLoading(true);
    setError("");
    // Latest Jobs can share its already authenticated CV metadata.
    if (initialCv !== undefined) {
      setCv(initialCv);
      setCvLoading(false);
      if (!initialCv) setError("Upload a CV before applying.");
      return;
    }
    (async () => {
      try {
        // This endpoint returns the candidate's CVs in descending version order.
        const response = await axios.get(`${url}/cv/my-cvs`, authConfig());
        if (!Array.isArray(response.data)) throw new Error("Unable to load your CVs.");
        if (active) {
          setCv(response.data[0] || null);
          if (!response.data[0]) setError("Upload a CV before applying.");
        }
      } catch (requestError) {
        if (active) setError(errorMessage(requestError, "Unable to load your CVs."));
      } finally { if (active) setCvLoading(false); }
    })();
    return () => { active = false; };
  }, [jobId]);

  useEffect(() => {
    let active = true;
    setScore(null);
    if (!cv?._id) return;
    setScoreLoading(true);
    setError("");
    (async () => {
      try {
        const response = loadMatch
          ? { data: await loadMatch(jobId, cv._id) }
          : await axios.post(`${url}/applications/preview-match`, { jobId, cvId: cv._id }, authConfig());
        const value = response.data.matchScore;
        if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 100) {
          throw new Error("Unable to calculate the match score.");
        }
        if (active) setScore({ cvId: cv._id, jobId, value });
      } catch (requestError) {
        if (active) setError(errorMessage(requestError, "Unable to calculate the match score."));
      } finally { if (active) setScoreLoading(false); }
    })();
    return () => { active = false; };
  }, [jobId, cv?._id]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const escape = (event) => {
      if (event.key !== "Escape" || submitting || confirming.current || uploadOpen) return;
      if (menuOpen) {
        setMenuOpen(false);
        cvMenuTrigger.current?.focus();
      }
      else onClose();
    };
    document.addEventListener("keydown", escape);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", escape);
    };
  }, [submitting, uploadOpen, menuOpen, onClose]);

  useEffect(() => {
    if (menuOpen) cvMenu.current?.querySelector("button:not(:disabled)")?.focus();
  }, [menuOpen]);

  const accessCv = async (preview) => {
    if (!cv?._id || fileRequestInFlight.current) return;
    fileRequestInFlight.current = true;
    setMenuOpen(false);
    setFileBusy(true);
    setError("");
    let previewTab = null;
    let blobUrl = null;
    try {
      if (preview) {
        // Reserve the tab during the click, before the authenticated request.
        previewTab = window.open("", "_blank");
        if (!previewTab) throw new Error("Preview was blocked. Please allow popups and try again.");
        previewTab.opener = null;
        previewTab.document.title = cvDisplayName(cv);
        previewTab.document.body.textContent = "Loading your CV...";
      }
      const response = await axios.get(`${url}/cv/${encodeURIComponent(cv._id)}/download`, {
        ...authConfig(), responseType: "blob",
      });
      if (!mounted.current) {
        if (previewTab && !previewTab.closed) previewTab.close();
        return;
      }
      if (previewTab?.closed) return;
      blobUrl = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      if (preview) {
        previewTab.location.replace(blobUrl);
        // PDF viewers may read lazily. Retain the URL for the tab's lifetime,
        // including after Quick Apply closes or a different CV is uploaded.
        const previewObjectUrl = blobUrl;
        const closeWatcher = setInterval(() => {
          if (previewTab.closed) {
            clearInterval(closeWatcher);
            URL.revokeObjectURL(previewObjectUrl);
          }
        }, 1000);
      }
      else {
        const anchor = document.createElement("a");
        anchor.href = blobUrl;
        anchor.download = cvDisplayName(cv);
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        const downloadObjectUrl = blobUrl;
        setTimeout(() => URL.revokeObjectURL(downloadObjectUrl), 1000);
      }
    } catch (requestError) {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      if (previewTab && !previewTab.closed) previewTab.close();
      if (mounted.current) setError(errorMessage(requestError, "Unable to access this CV."));
    } finally {
      fileRequestInFlight.current = false;
      if (mounted.current) setFileBusy(false);
    }
  };

  const ready = cv?._id && score?.cvId === cv._id && score?.jobId === jobId && !cvLoading && !scoreLoading;
  const confirm = async () => {
    if (!ready || submitting || confirming.current || uploadOpen) return;
    confirming.current = true;
    setError("");
    try {
      const success = await onConfirm(cv._id);
      if (!success && mounted.current) setError("Application was not submitted. Please check your session and try again.");
    } catch (requestError) {
      if (mounted.current) setError(errorMessage(requestError, "Unable to submit application."));
    } finally { confirming.current = false; }
  };

  const companyName = job.companyName || job.companyId?.companyName || "Company not specified";
  const companyUrl = safeCompanyUrl(job.companyUrl || job.companyId?.companyUrl);
  const locationLabel = typeof job.location === "string" ? job.location
    : job.location?.displayName || [
      job.location?.city || job.location?.county || job.location?.region,
      job.location?.country,
    ].filter(Boolean).join(", ");
  // Match the score colours already used by the Recommended Jobs score ring.
  const scoreTone = score?.value >= 75
    ? { bar: "bg-emerald-500", text: "text-emerald-700", badge: "bg-emerald-50" }
    : score?.value >= 50
      ? { bar: "bg-amber-500", text: "text-amber-700", badge: "bg-amber-50" }
      : { bar: "bg-slate-400", text: "text-slate-600", badge: "bg-slate-100" };
  const menuItemClass = "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-800 focus:bg-blue-50 focus:text-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600 active:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-3 py-3 backdrop-blur-sm sm:px-6 sm:py-6"
      role="dialog" aria-modal="true" aria-labelledby="quick-apply-title" aria-describedby="quick-apply-subtitle">
      <div className="flex max-h-[94vh] w-full max-w-[560px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5">
        <header className="relative flex shrink-0 items-start gap-3 bg-[#001342] px-5 py-5 text-white sm:px-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-200 ring-1 ring-white/15"><FiZap size={21} aria-hidden="true" /></span>
          <div className="min-w-0 flex-1">
            <h2 id="quick-apply-title" className="text-xl font-bold tracking-tight">Quick Apply</h2>
            <p id="quick-apply-subtitle" className="mt-1 text-xs leading-5 text-blue-200">Review your CV and match before applying.</p>
          </div>
          <button type="button" onClick={onClose} disabled={submitting} aria-label="Close Quick Apply"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white active:bg-white/25 disabled:cursor-not-allowed disabled:opacity-50"><FiX size={20} /></button>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-300/40 to-transparent" />
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-slate-50/60 px-5 py-5 sm:px-6">
          <section className="min-w-0">
            <h3 className="break-words text-xl font-bold leading-snug tracking-tight text-slate-900">{job.title}</h3>
            {companyUrl ? (
              <a href={companyUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex max-w-full items-start gap-1.5 rounded text-sm font-medium text-blue-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                <FiExternalLink size={15} className="mt-0.5 shrink-0" aria-hidden="true" /><span className="min-w-0 break-words">{companyName}</span>
              </a>
            ) : <p className="mt-2 break-words text-sm text-slate-600">{companyName}</p>}
            {locationLabel && (
              <p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-slate-500"><FiMapPin size={14} className="mt-0.5 shrink-0" aria-hidden="true" /><span className="min-w-0 break-words">{locationLabel}</span></p>
            )}
          </section>

          <section aria-labelledby="quick-apply-cv-label">
            <h3 id="quick-apply-cv-label" className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Your selected CV</h3>
            <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><FiFileText size={20} aria-hidden="true" /></span>
              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-semibold leading-5 text-slate-800 [overflow-wrap:anywhere]">
                  {cvLoading ? "Loading your latest CV..." : cv ? cvDisplayName(cv) : "No CV uploaded"}
                </p>
                {cv && <p className="mt-1 text-xs text-slate-500">Version {cv.version || 1}<span className="px-1.5" aria-hidden="true">·</span>PDF</p>}
              </div>
              <div className="relative shrink-0">
                <button ref={cvMenuTrigger} id="quick-apply-cv-actions" type="button" aria-label="CV actions" aria-haspopup="menu" aria-expanded={menuOpen} aria-controls={menuOpen ? "quick-apply-cv-menu" : undefined}
                  disabled={cvLoading || submitting || fileBusy} onClick={() => setMenuOpen(!menuOpen)}
                  onKeyDown={(event) => {
                    if (["ArrowDown", "ArrowUp"].includes(event.key)) { event.preventDefault(); setMenuOpen(true); }
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"><FiMoreVertical size={18} /></button>
                {menuOpen && (
                  <div ref={cvMenu} id="quick-apply-cv-menu" role="menu" aria-labelledby="quick-apply-cv-actions"
                    className="absolute right-0 top-full z-20 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-xl ring-1 ring-black/5"
                    onKeyDown={(event) => {
                      if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
                      event.preventDefault();
                      const items = Array.from(event.currentTarget.querySelectorAll("button:not(:disabled)"));
                      const index = items.indexOf(document.activeElement);
                      const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1
                        : (index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
                      items[next]?.focus();
                    }}>
                    <button role="menuitem" type="button" disabled={!cv} onClick={() => accessCv(true)} className={menuItemClass}><FiEye size={16} aria-hidden="true" />Preview CV</button>
                    <button role="menuitem" type="button" disabled={!cv} onClick={() => accessCv(false)} className={menuItemClass}><FiDownload size={16} aria-hidden="true" />Download CV</button>
                    <button role="menuitem" type="button" onClick={() => { setMenuOpen(false); setUploadOpen(true); }} className={menuItemClass}><FiUploadCloud size={16} aria-hidden="true" />Upload new CV</button>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4" aria-labelledby="quick-apply-score-label">
            <div className="flex items-center justify-between gap-3">
              <h3 id="quick-apply-score-label" className="flex items-center gap-2 text-sm font-semibold text-slate-800"><FiTarget size={17} className="shrink-0 text-blue-700" aria-hidden="true" />Match score</h3>
              {ready && <span className={`rounded-full px-2.5 py-1 text-sm font-bold ${scoreTone.badge} ${scoreTone.text}`}>{`${score.value}%`}</span>}
            </div>
            <div role="progressbar" aria-label="Match score for selected CV" aria-valuemin={0} aria-valuemax={100} aria-valuenow={ready ? score.value : undefined}
              className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full transition-all ${scoreTone.bar}`} style={{ width: ready ? `${score.value}%` : "0%" }} />
            </div>
            <p role="status" aria-live="polite" className="mt-2 text-xs leading-5 text-slate-500">
              {fileBusy ? "Loading CV..." : scoreLoading ? "Calculating match score..." : ready ? "Based on your selected CV." : "Match score unavailable"}
            </p>
          </section>
          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm leading-5 text-red-700 [overflow-wrap:anywhere]">{error}</p>}
        </div>

        <footer className="flex shrink-0 flex-col-reverse gap-2.5 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button type="button" onClick={onClose} disabled={submitting}
            className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">Cancel</button>
          <button type="button" onClick={confirm} disabled={!ready || submitting || uploadOpen}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 active:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">
            {submitting ? <FiLoader size={16} className="animate-spin" aria-hidden="true" /> : <FiSend size={16} aria-hidden="true" />}
            {submitting ? "Applying..." : "Confirm & Apply"}
          </button>
        </footer>
      </div>

      <CVUploadModal isOpen={uploadOpen} uploadOnly
        onClose={() => setUploadOpen(false)}
        onUploadSuccess={(uploaded) => {
          setUploadOpen(false);
          if (!uploaded?._id) { setError("The uploaded CV could not be selected. Please reopen Quick Apply."); return; }
          onCvUploaded?.(uploaded);
          setScore(null);
          setCv(uploaded);
        }} />

    </div>
  );
}
