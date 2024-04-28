import Navbar from "../components/Navbar";
import { useBreakpoints } from "../hooks/useBreakpoints";
import SignupMobile from "../components/SignupMobile";
import SignupDesktop from "../components/SignupDesktop";

export default function Signup() {
  const { isMobile } = useBreakpoints();

  return !isMobile ? <SignupDesktop /> : <SignupMobile />;
}
