import { useNavigate } from "react-router-dom";

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
      className="mx-3 px-20 md:px-44 py-2 text-nero text-sm font-sans font-medium bg-paleRose gap-2.5 rounded-lg border-0"
      onClick={handleLogout}
    >
      Sign out
    </button>
  );
}
