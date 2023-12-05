import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const navigate = useNavigate();
  const logout = async () => {
    try {
      await fetch("/api/logout");
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  return <button onClick={() => logout()}>Sign out</button>;
}
