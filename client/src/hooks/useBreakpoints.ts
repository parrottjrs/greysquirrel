import { useMediaQuery } from "react-responsive";

export const useBreakpoints = () => {
  let isMobile = useMediaQuery({ query: "(max-width: 767px)" });
  const isTablet = useMediaQuery({
    query: "(min-width: 768px) and (max-width:1023px)",
  });
  const isBigScreen = useMediaQuery({ query: "(min-width: 1024px)" });

  if (isTablet) {
    isMobile = false;
  }

  return { isMobile, isTablet, isBigScreen };
};
