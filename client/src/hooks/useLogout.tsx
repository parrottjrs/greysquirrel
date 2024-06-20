import { useNavigate } from "react-router-dom";
import { apiUrl } from "../utils/consts";

export const useLogout = () => {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      localStorage.clear();
      await fetch(`${apiUrl}/api/user/logout`, { method: "POST" });
      navigate("/#");
    } catch (err) {
      console.error({ message: "Error during logout. Try again later." });
    }
  };

  const handleLogout = async () => {
    logout();
  };

  return { handleLogout };
};
