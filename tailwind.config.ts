import type { Config } from "tailwindcss";

/**
 * Material Design 3 — Buberta Finance
 * Palet warna diambil dari logo B3: biru #16789E + kuning #F8CA08.
 * Token ditulis FLAT (mis. 'on-primary', 'surface-on') agar cocok persis
 * dengan kelas yang dipakai komponen: text-on-primary, text-surface-on, dst.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary = biru logo
        primary: "#16789E",
        "on-primary": "#FFFFFF",
        "primary-container": "#C2E8FB",
        "on-primary-container": "#001F2A",
        // Secondary = biru-abu
        secondary: "#4C6270",
        "on-secondary": "#FFFFFF",
        "secondary-container": "#CFE6F3",
        "secondary-on-container": "#071E28",
        "on-secondary-container": "#071E28",
        // Tertiary = kuning logo (aksen)
        tertiary: "#F8CA08",
        "on-tertiary": "#3D2F00",
        "tertiary-container": "#FFE082",
        "on-tertiary-container": "#251A00",
        // Error
        error: "#BA1A1A",
        "on-error": "#FFFFFF",
        "error-container": "#FFDAD6",
        "on-error-container": "#410002",
        // Surface & netral (nuansa dingin agar serasi dengan biru)
        surface: "#F6FAFD",
        "surface-on": "#171C1F",
        "surface-on-variant": "#3F484D",
        "surface-variant": "#DBE4E9",
        "surface-container-lowest": "#FFFFFF",
        "surface-container-low": "#F0F4F8",
        "surface-container": "#EAEEF2",
        "surface-container-high": "#E4E9ED",
        "surface-container-highest": "#DEE3E7",
        // Outline
        outline: "#6F797F",
        "outline-variant": "#BFC8CE",
        // Background
        background: "#F6FAFD",
        "on-background": "#171C1F",
      },
      borderRadius: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "28px",
      },
      boxShadow: {
        md1: "0 1px 3px rgba(0,0,0,.12), 0 1px 2px rgba(0,0,0,.08)",
        md2: "0 2px 6px rgba(0,0,0,.12), 0 1px 4px rgba(0,0,0,.08)",
        md3: "0 4px 12px rgba(0,0,0,.12), 0 2px 6px rgba(0,0,0,.08)",
      },
      transitionTimingFunction: {
        md: "cubic-bezier(.2,0,0,1)",
      },
    },
  },
  plugins: [],
};

export default config;
