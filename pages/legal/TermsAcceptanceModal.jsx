import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import TermsContent, {
  TERMS_LAST_UPDATED,
} from "./terms";

const BOTTOM_TOLERANCE = 12;

export default function TermsAcceptanceModal({ isOpen, onClose, onAccept }) {
  const scrollRef = useRef(null);
  const closeButtonRef = useRef(null);
  const [hasReachedBottom, setHasReachedBottom] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;

    setHasReachedBottom(false);

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();

    const frame = window.requestAnimationFrame(() => {
      const element = scrollRef.current;
      if (element && element.scrollHeight <= element.clientHeight + BOTTOM_TOLERANCE) {
        setHasReachedBottom(true);
      }
    });

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.cancelAnimationFrame(frame);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleScroll = (event) => {
    const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;
    const reachedBottom =
      scrollTop + clientHeight >= scrollHeight - BOTTOM_TOLERANCE;

    if (reachedBottom) setHasReachedBottom(true);
  };

  const handleAccept = () => {
    if (!hasReachedBottom) return;
    onAccept();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-modal-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10050,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(15, 23, 42, 0.78)",
        backdropFilter: "blur(6px)",
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "min(820px, 100%)",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          borderRadius: 18,
          background: "#ffffff",
          boxShadow: "0 30px 80px rgba(15, 23, 42, 0.35)",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 20,
            padding: "20px 24px 16px",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <div>
            <h2
              id="terms-modal-title"
              style={{
                margin: 0,
                color: "#0f172a",
                fontFamily: "'Sora', sans-serif",
                fontSize: 21,
                fontWeight: 700,
              }}
            >
              Review the Terms &amp; Conditions
            </h2>
            <p
              style={{
                margin: "5px 0 0",
                color: "#64748b",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
              }}
            >
              Last updated: {TERMS_LAST_UPDATED}
            </p>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close Terms and Conditions"
            style={{
              width: 34,
              height: 34,
              flexShrink: 0,
              border: 0,
              borderRadius: "50%",
              background: "#f1f5f9",
              color: "#475569",
              cursor: "pointer",
              fontSize: 20,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </header>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          tabIndex={0}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "22px 26px",
            outline: "none",
          }}
        >
          <TermsContent />

          <div
            aria-hidden="true"
            style={{ height: 2, marginTop: 22 }}
          />
        </div>

        <footer
          style={{
            padding: "16px 24px 20px",
            borderTop: "1px solid #e2e8f0",
            background: "#f8fafc",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div
              style={{
                color: hasReachedBottom ? "#15803d" : "#64748b",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12.5,
              }}
            >
              {hasReachedBottom
                ? "✓ You have reached the end of the Terms."
                : "Scroll to the bottom to enable acceptance."}
              <div style={{ marginTop: 4 }}>
                <Link href="/terms">
                  <a
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#1d4ed8", fontWeight: 600 }}
                  >
                    Open the full Terms page
                  </a>
                </Link>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "11px 16px",
                  border: "1px solid #cbd5e1",
                  borderRadius: 10,
                  background: "#ffffff",
                  color: "#334155",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!hasReachedBottom}
                onClick={handleAccept}
                style={{
                  padding: "11px 18px",
                  border: 0,
                  borderRadius: 10,
                  background: hasReachedBottom ? "#1d4ed8" : "#94a3b8",
                  color: "#ffffff",
                  cursor: hasReachedBottom ? "pointer" : "not-allowed",
                  fontWeight: 700,
                  opacity: hasReachedBottom ? 1 : 0.72,
                }}
              >
                Agree &amp; Continue
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
