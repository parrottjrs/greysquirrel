import HomeMobile from "../components/HomeMobile";
import HomeDesktop from "../components/HomeDesktop";
import { useBreakpoints } from "../hooks/useBreakpoints";
import { useQuickAuth } from "../hooks/useQuickAuth";

export default function Home() {
  const { isMobile } = useBreakpoints();
  useQuickAuth();

  return !isMobile ? <HomeDesktop /> : <HomeMobile />;
}
