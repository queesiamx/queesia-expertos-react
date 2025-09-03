// tailwind.config.js
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  safelist: [
    "bg-primary-soft",
    "text-primary",
    "text-default",
    "bg-default-soft",
    "hover:text-primary-soft",
    "animate-pulse",
    // ↓ por si usas dinámicos
    "bg-ui-bg","bg-ui-card","bg-ui-surface","bg-ui-overlay",
    "text-ui-text","text-ui-subtext","ring-ui-ring","border-ui-ring"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Raleway", "ui-sans-serif", "system-ui"],
        montserrat: ["Montserrat", "ui-sans-serif", "system-ui"],
      },

      // 🎨 Paleta alineada al mock oscuro
      colors: {
        // lo que ya tenías
        default: {
          DEFAULT: "#2D2D2D",
          soft: "#696969",
          strong: "#000000",
        },
        // ⬅️ usa el amarillo del mock como principal
        primary: {
          DEFAULT: "#FFD166", // amarillo mock
          soft: "#FFE65D",    // tu soft amarilla
          accent: "#CDDDCC",
          medium: "#34495E",
          strong: "#0D0D0D",
        },
        // azul que ya usabas como primario -> lo dejamos como secundario
        secondary: {
          DEFAULT: "#327FFA",
        },

        // Tema UI del mock oscuro (para fondos/contornos)
        ui: {
          bg: "#0B0D12",
          card: "#0F131B",
          surface: "#121725",
          overlay: "#0B0F1A",
          text: "#F3F5F7",
          subtext: "#9AA3AF",
          ring: "#1F2937",
          // útil para textos sobre amarillo
          primaryText: "#111827",
        },
      },

      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(5px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out forwards",
      },
    },
  },
  plugins: [],
};
