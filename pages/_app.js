import "../styles/tailwind.css";
import "../styles/slick.css";
import "react-toastify/dist/ReactToastify.css";
import "../components/Auth/authModal/AuthModal.css";
import { ToastContainer } from "react-toastify";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <ToastContainer position="top-right" autoClose={2500} />
    </>
  );
}

export default MyApp;