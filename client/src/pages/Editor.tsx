import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import useWebSocket from "react-use-websocket";
import "react-quill/dist/quill.snow.css";
import LogoutButton from "../components/LogoutButton";
import { useNavigate, useParams } from "react-router-dom";
import { STYLES } from "../utils/consts";

export default function Editor() {
  const params = useParams();
  const docId = params.docId;

  const WS_URL = "ws://localhost:8000";
  const client = useWebSocket(WS_URL);
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const timeoutDelayMs = 10000;
  const [authorization, setAuthorization] = useState(false);
  const [recipient, setRecipient] = useState("");
  const navigate = useNavigate();

  const refresh = async () => {
    try {
      const response = await fetch("/api/refresh", {
        method: "POST",
      });
      const json = await response.json();
      return json;
    } catch (err) {
      console.error(err);
    }
  };

  const handleAuthenticate = async (message: any) => {
    switch (message) {
      case "Authorized":
        setAuthorization(true);
        break;
      case "Unauthorized":
        const auth = await refresh();
        if (auth.message === "Unauthorized") {
          setAuthorization(false);
          navigate("/expired");
        }
        setAuthorization(true);
        break;
      default:
        console.error("An unexpected error has occurred");
        break;
    }
  };

  const authenticate = async () => {
    try {
      const response = await fetch("/api/authenticate");
      const json = await response.json();
      handleAuthenticate(json.message);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSave = async () => {
    try {
      const response = await fetch("/api/save", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          doc: { docId: docId, title: title, content: text },
        }),
      });
      const json = response.json();
      return json;
    } catch (err) {
      console.error(err);
    }
  };

  const fetchContent = async (docId: any) => {
    try {
      const response = await fetch("/api/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ docId: docId }),
      });
      const json = await response.json();
      const { title, content } = json.document;
      setTitle(title ? title : "");
      setText(content ? content : "");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    authenticate();

    fetchContent(docId);
  }, []);

  useEffect(() => {
    let timer: any = setTimeout(() => fetchSave(), timeoutDelayMs);
    return () => clearTimeout(timer);
  }, [text, title]);

  const handleChange = (text: string) => {
    setText(text);
  };

  const handleTitle = (title: string) => {
    setTitle(title);
  };

  const fetchInvite = async () => {
    try {
      const response = await fetch("/api/invite", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ docId: docId, recipient: recipient }),
      });
      const json = await response.json();
    } catch (err) {
      console.error(err);
    }
  };

  const handleInvite = () => {
    fetchInvite();
  };

  const handleRecipient = (recipient: string) => {
    setRecipient(recipient);
  };

  // useWebSocket(WS_URL, {
  //   onMessage: (message) => {
  //     setText(message.data);
  //     fetch("/api/createfile", {
  //       method: "POST",
  //       headers: { "content-type": "application/json" },
  //       body: JSON.stringify({ text: message.data }),
  //     })
  //       .then(() => {
  //         console.log("ok");
  //       })
  //       .catch((err) => console.log(err));
  //   },
  //   onOpen: () => {
  //     fetchText()
  //       .then((json) => {
  //         setText(json.data);
  //       })
  //       .catch((err) => console.log(err));
  //   },
  //   shouldReconnect: (closeEvent) => true,
  //   share: true,
  //   filter: () => false,
  // });

  // const handleChange = (text: string) => {
  //   client.sendMessage(text);
  // };

  return (
    authorization && (
      <div className={STYLES.MOUSEOUT_DIV} onMouseLeave={fetchSave}>
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitle(e.target.value)}
        />
        <div>
          <ReactQuill
            className="quill"
            theme="snow"
            value={text}
            onChange={handleChange}
            preserveWhitespace={true}
          />
        </div>
        <LogoutButton />
        <div>
          <input
            type="text"
            value={recipient}
            onChange={(e) => handleRecipient(e.target.value)}
            autoComplete="false"
          />
          <button onClick={handleInvite}>Invite</button>
        </div>
      </div>
    )
  );
}
