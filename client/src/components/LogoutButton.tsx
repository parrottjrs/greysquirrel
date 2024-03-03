import { useNavigate } from "react-router-dom";

interface ChildProps {
  docId?: string;
  title?: string;
  text?: string;
}

export default function LogoutButton({ docId, title, text }: ChildProps) {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await fetch("/api/logout");
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };
  const fetchSave = async () => {
    try {
      await fetch("/api/save", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          doc: { docId: docId, title: title, content: text },
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    if (docId) {
      await fetchSave();
    }
    logout();
  };
  return <button onClick={handleLogout}>Sign out</button>;
}
