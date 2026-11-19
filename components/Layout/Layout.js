import React from "react";
import Footer from "./Footer";
import ViewHeader from "./Header/viewHeader";

const Layout = ({ children, guestView, setGuestView, onSessionChange }) => {
  return (
    <>
      <ViewHeader  
      guestView={guestView}
  setGuestView={setGuestView} onSessionChange={onSessionChange} />
      {children}
      <Footer />
    </>
  );
};

export default Layout;
