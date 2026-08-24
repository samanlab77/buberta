import type { Config } from "tailwindcss";

/**
 * Material Design 3 — Buberta Finance
 * Palet warna diambil dari logo B3: biru #16789E + kuning #F8CA08.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Roboto", "Segoe UI", "system-ui", "sans-serif"],
      },
      colors: {
        primary: "#16789E",
        "on-primary": "#FFFFFF",
        "primary-container": "#C2E8FB",
        "on-primary-container": "#001F2A",
        "primary-hover": "#125F7E",
        secondary: "#4C6270",
        "on-secondary": "#FFFFFF",
        "secondary-container": "#CFE6F3",
        "secondary-on-container": "#071E28",
        "on-secondary-container": "#071E28",
        tertiary: "#F8CA08",
        "on-tertiary": "#3D2F00",
        "tertiary-container": "#FFE082",
        "on-tertiary-container": "#251A00",
        error: "#BA1A1A",
        "on-error": "#FFFFFF",
        "error-container": "#FFDAD6",
        "on-error-container": "#410002",
        success: "#006B3F",
        "on-success": "#FFFFFF",
        "success-container": "#D0F5DF",
        "on-success-container": "#00210F",
        surface: "#F6FAFD",
        "surface-on": "#171C1F",
        "surface-on-variant": "#3F484D",
        "surface-variant": "#DBE4E9",
        "surface-container-lowest": "#FFFFFF",
        "surface-container-low": "#F0F4F8",
        "surface-container": "#EAEEF2",
        "surface-container-high": "#E4E9ED",
        "surface-container-highest": "#DEE3E7",
        outline: "#6F797F",
        "outline-variant": "#BFC8CE",
        background: "#F6FAFD",
        "on-background": "#171C1F",
      },
      borderRadius: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "28px",
        "2xl": "32px",
      },
      boxShadow: {
        md1: "0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.06)",
        md2: "0 4px 6px rgba(0,0,0,.06), 0 2px 4px rgba(0,0,0,.04)",
        md3: "0 10px 25px rgba(0,0,0,.08), 0 4px 10px rgba(0,0,0,.04)",
        md4: "0 20px 50px rgba(0,0,0,.12), 0 8px 20px rgba(0,0,0,.06)",
      },
      transitionTimingFunction: {
        md: "cubic-bezier(.2,0,0,1)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s cubic-bezier(.2,0,0,1) forwards",
        "fade-in-up": "fadeInUp 0.6s cubic-bezier(.2,0,0,1) forwards",
        "fade-in-scale": "fadeInScale 0.4s cubic-bezier(.2,0,0,1) forwards",
        float: "float 3s ease-in-out infinite",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeInScale: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
