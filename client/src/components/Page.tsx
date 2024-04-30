import React from "react";

interface PageProps {
  isMobile?: boolean;
}
export default function Page({ isMobile }: PageProps) {
  const pageWidth = isMobile ? "40" : "96";
  const pageHeight = isMobile ? "40" : "96";
  console.log(pageWidth, pageHeight);
  return (
    <svg
      width={pageWidth}
      height={pageHeight}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      className="mr-2"
    >
      <rect width="24" height="24" fill="url(#pattern0)" />
      <defs>
        <pattern
          id="pattern0"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use xlinkHref="#image0_200_797" transform="scale(0.0104167)" />
        </pattern>
        <image
          id="image0_200_797"
          width="96"
          height="96"
          xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAB9ElEQVR4nO2dO05DURBD3YS18FkgLSUSf2U1wDIIC4HQBcko0isQBRBC4vH1HMn92CcvSfeApmmapmmapmma7TkBcANgAeANAMU5S5F6AGAO4L3A6EyTsB7/scDQTJUwLzAwUyWcFP3aYYqE2wKjcsOcYyCeC37CmfQkLAuMzk9Zc5r0JLCggCgJVQXESKgsIEJCdQHDS3AQMLQEFwHDSnASMKQENwHDSXAUMJQEVwHDSHAWMIQEdwH2EkYQYC1hFAG2EkYSYClhNAF2EkYUsIkEOerBucNBfiNBjnpw7niQnyTIUQ/OPQzynQQ5DI8chkcOwyOH4ZHD8MhheOQwPHIYHjkMjxyGRw7DI4fhkeNegOb32xeg+f32BWh+v30Bmt9vX4Dm99sXoPn99gVofr99AZrfv3UBmkcOwyOH4ZHD8MhheOQwPHIYHjkMjxz3AjS/374Aze+3L0Dz++0L0Px++wI0v9++AM3vty9A8/vtC9D8/q0L0DxyGB45DI8chkcOwyOH4ZHD8MhheOS8FhiBorygAIsCQ1CUJxTgusAQFOUCBTg2e40V/ykrAIcowl2BQbjnrJ/8MswAPBQYhXvK/dS5FLPppW6rAgNxR1lNn/xy43/9Tbia/iFUe8cY/5Dl1OUSwJF63KZpmqZpmqZpYM8HtZy0qxHJDRIAAAAASUVORK5CYII="
        />
      </defs>
    </svg>
  );
}
