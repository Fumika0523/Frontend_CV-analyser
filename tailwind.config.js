module.exports = {
  content: [
    "./pages/*.js",
    "./pages/**/*.js",
    "./components/*.js",
    "./components/**/*.js",
  ],
  theme: {
    extend: {
      boxShadow: {
        t: "0 -1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        orange: "0px 20px 20px -15px rgba(245,56,56,0.81)",
        "orange-md": "0px 20px 40px -15px rgba(245,56,56,0.81)",
      },
      colors: {
        black: {
          500: "#4F5665",
          600: "#0B132A",
        },
        orange: {
          100: "#FFECEC",
          500: "#F53855",
        },
        green: {
          500: "#2FAB73",
        },
        white: {
          300: "#F8F8F8",
          500: "#fff",
        },
        gray: {
          100: "#EEEFF2",
          400: "#AFB5C0",
          500: "#DDDDDD",
        },
      },
    },
  },
  variants: {
    extend: {
      boxShadow: ["active", "hover"],
    },
  },
  plugins: [],
};