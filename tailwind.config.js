// tailwind.config.js
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    'bg-primary-soft',
    'text-primary',
    'text-default',
    'bg-default-soft',
    'hover:text-primary-soft',
    'animate-pulse',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Raleway', 'ui-sans-serif', 'system-ui'],
        montserrat: ['Montserrat', 'ui-sans-serif'],
      },
      
      colors: {
        default: {
          DEFAULT: "#2D2D2D",
          soft: "#696969",
          strong: "#000000",
        },
        primary: {
          DEFAULT: "#327ffa",
          soft: "#ffe65d",
          accent: "#CDDDCC",
          medium: "#34495E",
          strong: "#0D0D0D",
        },
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(5px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out forwards',
      },
    },
  },
  plugins: [],
};
