import HomeMobile from "../components/HomeMobile";
import HomeDesktop from "../components/HomeDesktop";
import { useBreakpoints } from "../hooks/useBreakpoints";
import { useAuthentication } from "../hooks/useAuthentication";

export default function Home() {
  const { isMobile } = useBreakpoints();
  useAuthentication();

  return !isMobile ? <HomeDesktop /> : <HomeMobile />;
}
