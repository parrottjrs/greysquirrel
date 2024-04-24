import { useMediaQuery } from "react-responsive";

export const useBreakpoints = () => {
  const isMobile = useMediaQuery({ query: "(max-width: 767px)" });
  const isTablet = useMediaQuery({
    query: "(min-width: 768px) and (max-width:1079px)",
  });
  const isBigScreen = useMediaQuery({ query: "(min-width: 1080px)" });

  return { isMobile, isTablet, isBigScreen };
};
