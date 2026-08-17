import React from "react";

const ButtonPrimary = ({
  children,
  addClass = "",
  onClick,
  type = "button",
  disabled = false,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-xl
        border border-blue-500/20

        bg-blue-600

        px-6 py-2.5
        font-semibold tracking-wide text-white
        shadow-md
        transition-all duration-200
        hover:-translate-y-0.5
        hover:from-blue-800
        hover:to-sky-500
        hover:shadow-lg
        focus:outline-none
        focus:ring-2
        focus:ring-blue-300
        focus:ring-offset-2
        active:translate-y-0
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${addClass}
      `}
    >
      {children}
    </button>
  );
};

export default ButtonPrimary;