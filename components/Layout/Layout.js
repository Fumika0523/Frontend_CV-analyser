import React from "react";
import Footer from "./Footer";
import Header from "./Header";

const Layout = ({ children , guestView, setGuestView}) => {
  return (
    <>
      <Header   guestView={guestView}
  setGuestView={setGuestView} />
      {children}
      <Footer />
    </>
  );
};

export default Layout;
