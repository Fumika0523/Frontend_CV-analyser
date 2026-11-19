import "../styles/tailwind.css";
import "../styles/slick.css";
import "react-toastify/dist/ReactToastify.css";
import "../components/Auth/authModal/AuthModal.css";
import { ToastContainer } from "react-toastify";
import { useRouter } from "next/router";
import CandidateRouteGuard from "../components/Auth/CandidateRouteGuard";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const isCandidateRoute =
    router.pathname === "/candidate" || router.pathname.startsWith("/candidate/");

  return (
    <>
      {isCandidateRoute ? (
        <CandidateRouteGuard
          key={router.asPath}
          allowGuest={router.pathname === "/candidate/dashboard"}
        >
          {(candidateSession, refreshCandidateSession) => (
            <Component
              {...pageProps}
              candidateSession={candidateSession}
              refreshCandidateSession={refreshCandidateSession}
            />
          )}
        </CandidateRouteGuard>
      ) : (
        <Component {...pageProps} />
      )}
      <ToastContainer position="top-right" autoClose={2500} />
    </>
  );
}

export default MyApp;
