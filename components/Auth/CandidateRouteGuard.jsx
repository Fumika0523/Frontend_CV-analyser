import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { url } from "../../utils/constant";

async function verifyCandidateSession(storage, get, signal, allowGuest) {
  const token = storage.getItem("token");

  if (token) {
    try {
      const { data } = await get(`${url}/auth/session`, {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });
      if (data?.user?.role === "candidate") {
        return { role: "candidate", expiresAt: data.expiresAt };
      }
      if (data?.user?.role === "company") {
        return { redirect: "/company/dashboard" };
      }
    } catch (error) {
      if (
        !signal.aborted &&
        [401, 404].includes(error.response?.status) &&
        storage.getItem("token") === token
      ) {
        storage.removeItem("token");
      }
    }
    return { redirect: "/?auth=signin" };
  }

  const guestSessionId = allowGuest && storage.getItem("guest_session_id");
  if (guestSessionId && !signal.aborted) {
    try {
      const { data } = await get(`${url}/guest/matched-jobs`, {
        params: { guestSessionId },
        signal,
      });
      if (Array.isArray(data?.matchedJobs)) {
        return { role: "guest", matchedJobs: data.matchedJobs.slice(0, 3) };
      }
    } catch (error) {
      if (
        !signal.aborted &&
        [400, 404].includes(error.response?.status) &&
        storage.getItem("guest_session_id") === guestSessionId
      ) {
        storage.removeItem("guest_session_id");
      }
    }
  }
  return { redirect: "/?auth=signin" };
}

export default function CandidateRouteGuard({ allowGuest, children }) {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [verification, setVerification] = useState(0);
  const request = useRef(null);

  const refreshSession = useCallback(() => {
    request.current?.abort();
    setSession(null);
    setVerification((value) => value + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    request.current = controller;
    let expiryTimer;

    async function verify() {
      const result = await verifyCandidateSession(
        localStorage, axios.get, controller.signal, allowGuest
      );
      if (controller.signal.aborted) return;

      if (result.redirect) {
        router.replace(result.redirect);
        return;
      }
      if (Number.isFinite(result.expiresAt)) {
        const remaining = result.expiresAt - Date.now();
        if (remaining <= 0) {
          router.replace("/?auth=signin");
          return;
        }
        expiryTimer = setTimeout(refreshSession, Math.min(remaining, 2147483647));
      }
      setSession(result);
    }

    function handleStorage(event) {
      if (event.key === "token" || event.key === "guest_session_id" || event.key === null) {
        refreshSession();
      }
    }

    verify();
    window.addEventListener("storage", handleStorage);
    return () => {
      controller.abort();
      clearTimeout(expiryTimer);
      window.removeEventListener("storage", handleStorage);
    };
  }, [allowGuest, router, verification, refreshSession]);

  return session ? children(session, refreshSession) : <p>Checking authentication...</p>;
}
