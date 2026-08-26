/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.{html,ejs}"],
  theme: {
    extend: {
      colors: {
        ink: "#0a0b10",
        panel: "#12141d",
        accent: "#5b6ef6",
        accent2: "#9333ea",
      },
      fontFamily: {
        display: ["'Sora'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #5b6ef6 0%, #9333ea 100%)',
      },
    },
  },
  plugins: [],
};
