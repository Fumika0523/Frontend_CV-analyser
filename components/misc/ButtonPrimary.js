import React from "react";

const ButtonPrimary = ({ children, addClass = "", onClick, type = "button" }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={
        "font-medium tracking-wide py-2 px-6 sm:px-8 rounded-full transition-all duration-200 shadow-sm hover:shadow-md outline-none bg-green-500 text-white-500 " +
        addClass
      }
      style={{
        backgroundColor: "#1d4ed8",
        color: "#ffffff",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#1e3a8a";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "#1d4ed8";
      }}
    >
      {children}
    </button>
  );
};
export default ButtonPrimary;