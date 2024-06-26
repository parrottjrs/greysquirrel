import VerifyAccountMobile from "../components/VerifyAccountMobile";
import { useBreakpoints } from "../hooks/useBreakpoints";
import VerifyAccountDesktop from "../components/VerifyAccountDesktop";

export default function VerifyAccount() {
  const { isMobile } = useBreakpoints();

  return !isMobile ? <VerifyAccountDesktop /> : <VerifyAccountMobile />;
}
