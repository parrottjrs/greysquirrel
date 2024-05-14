import { useState } from "react";
import AccountManagement from "../components/AccountManagement";
import PasswordForm from "../components/PasswordForm";

export default function Account() {
  const [isVerified, setIsVerified] = useState(false);
  return !isVerified ? (
    <PasswordForm handleVerified={setIsVerified} />
  ) : (
    <AccountManagement />
  );
}
