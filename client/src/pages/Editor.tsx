import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import useWebSocket from "react-use-websocket";
import "react-quill/dist/quill.snow.css";
import LogoutButton from "../components/LogoutButton";
import { useNavigate, useParams } from "react-router-dom";
import { STYLES } from "../utils/styles";
import { authenticate, refresh } from "../utils/functions";
import ShareModal from "../components/ShareModal";
import Navbar from "../components/Navbar";
import CustomQuill from "../components/CustomQuill";

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

  const authenticateUser = async () => {
    try {
      const authorized = await authenticate();
      if (!authorized) {
        navigate("/signin");
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
        navigate("/signin");
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
    } catch (err) {
      console.error(err);
    }
  };

  const fetchContent = async () => {
    try {
      const response = await fetch("/api/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ docId: docId }),
      });
      const json = await response.json();
      if (!response.ok) {
        navigate("/signin");
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
    fetchContent();
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
        <Navbar isLoggedIn={true} />
        <div className="mt-24 w-[51.75rem]">
          <div>
            <CustomQuill
              text={text}
              title={title}
              docId={docId}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
    )
  );
}
