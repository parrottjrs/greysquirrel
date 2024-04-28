import { ForgotPasswordRequest } from "../components/ForgotPasswordRequest.tsx";
import { PasswordReset } from "../components/PasswordReset";
import { useEmailTokenManagement } from "../hooks/useEmailTokenManagement";

export default function ForgotPassword() {
  const { resetIsVerified } = useEmailTokenManagement();

  return !resetIsVerified ? <ForgotPasswordRequest /> : <PasswordReset />;
}
