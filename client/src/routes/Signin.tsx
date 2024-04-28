import Navbar from "../components/Navbar";
import { useBreakpoints } from "../hooks/useBreakpoints";
import SigninMobile from "../components/SigninMobile";
import SigninDesktop from "../components/SigninDesktop";

export default function Signin() {
  const { isMobile } = useBreakpoints();

  return !isMobile ? <SigninDesktop /> : <SigninMobile />;
}
