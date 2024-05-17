import { useNavigate } from "react-router-dom";

export const useLogout = () => {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      localStorage.clear();
      await fetch("/api/logout", { method: "POST" });
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
