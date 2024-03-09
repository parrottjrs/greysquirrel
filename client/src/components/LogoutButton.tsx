import { useNavigate } from "react-router-dom";
import { STYLES } from "../utils/styles/styles";

export default function LogoutButton() {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      localStorage.clear();
      await fetch("/api/logout");
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    logout();
  };

  return (
    <button
      className="p-0 border-0 bg-transparent text-nero font-sans text-base"
      onClick={handleLogout}
    >
      Sign out
    </button>
  );
}
