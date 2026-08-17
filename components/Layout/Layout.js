import React from "react";
import Footer from "./Footer";
import ViewHeader from "./Header/viewHeader";

const Layout = ({ children , guestView, setGuestView}) => {
  return (
    <>
      <ViewHeader  
      guestView={guestView}
  setGuestView={setGuestView} />
      {children}
      <Footer />
    </>
  );
};

export default Layout;
