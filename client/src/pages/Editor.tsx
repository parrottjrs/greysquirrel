import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import useWebSocket from "react-use-websocket";
import "react-quill/dist/quill.snow.css";
import LogoutButton from "../components/LogoutButton";
import { useNavigate, useParams } from "react-router-dom";
import { STYLES } from "../utils/consts";
import { authenticate, refresh } from "../utils/functions";

export default function Editor() {
  const params = useParams();
  const docId = params.docId;
  const WS_URL = "ws://localhost:8000";
  const client = useWebSocket(WS_URL);
  const autoSaveDelay = 5000;
  const refreshTokenDelay = 540000; //nine minutes;
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [authorization, setAuthorization] = useState(false);
  const [recipient, setRecipient] = useState("");

  const authenticateUser = async () => {
    try {
      const authorized = await authenticate();
      if (!authorized) {
        navigate("/");
      }
      setAuthorization(true);
    } catch (err) {
      console.error(err);
    }
  };

  const refreshToken = async () => {
    try {
      const { success } = await refresh();
      if (!success) {
        navigate("/");
      }
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
      console.log("saved!");
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
      if (!response.ok) {
        navigate("/");
      }
      const { title, content } = json.document;
      setTitle(title ? title : "");
      setText(content ? content : "");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    authenticateUser();
  }, []);

  useEffect(() => {
    fetchContent(docId);
    let interval = setInterval(() => refreshToken(), refreshTokenDelay);
    return () => clearInterval(interval);
  }, [authorization]);

  useEffect(() => {
    let timer: any = setTimeout(() => fetchSave(), autoSaveDelay);
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
      await fetch("/api/invite", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ docId: docId, recipient: recipient }),
      });
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
