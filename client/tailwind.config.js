/** @type {import('tailwindcss').Config} */
export const content = ["./src/**/*.{js,jsx,ts,tsx}"];
export const corePlugins = {
  preflight: false,
};
export const theme = {
  colors: {
    aeroBlue: "#C2E9D2",
    alto: "#D9D9D9",
    boulder: "#797878",
    dustyGray: "#999999",
    gallery: "#ECECEC",
    nero: "#1D1D1D",
    paleRose: "#FFC1C1",
    roman: "#DF5E5E",
    silver: "#C4C4C4",
    transparent: "#0000",
    vividViolet: "#A4319E",
    white: "#FFF",
  },

  extend: {
    fontFamily: { IBM: ["IBM Plex Sans", "sans-serif"] },
  },
};
export const plugins = [];
