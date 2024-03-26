import React, { useEffect, useState } from "react";

import "react-quill/dist/quill.snow.css";
import { useNavigate, useParams } from "react-router-dom";
import { STYLES } from "../utils/styles";
import { authenticate, refresh } from "../utils/functions";
import Navbar from "../components/Navbar";
import CustomQuill from "../components/CustomQuill";
import { Socket, io } from "socket.io-client";

export default function Editor() {
  const params = useParams();
  const docId = params.docId;
  const WS_URL = "ws://192.168.2.102:3000";
  const autoSaveDelay = 5000;
  const refreshTokenDelay = 540000; //nine minutes;
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [authorization, setAuthorization] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [lastMessage, setLastMessage] = useState("");

  const authenticateUser = async () => {
    try {
      const { success, userId } = await authenticate();
      if (!success) {
        navigate("/signin");
      }
      setAuthorization(true);
      setCurrentUserId(userId);
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
    const newSocket = io(WS_URL, { query: { docId: docId } });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
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

  const preventDuplicate = async (
    currentText: string,
    textToBeSent: string
  ) => {
    return currentText === textToBeSent;
  };

  const handleTextChange = async (text: string) => {
    setText(text);
    if (socket) {
      const jsonData = { docId: docId, content: text, userId: currentUserId };
      const isDuplicateText = await preventDuplicate(
        jsonData.content,
        lastMessage
      );
      if (isDuplicateText) {
        return null;
      }
      setLastMessage(jsonData.content);
      socket.send(jsonData);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("message", (data) => {
        console.log(data);
        if (data.content !== text) {
          setText(data.content);
        }
      });
    }
  }, [socket]);

  const handleTitleChange = (title: string) => {
    setTitle(title);
  };

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
              onTextChange={handleTextChange}
              onTitleChange={handleTitleChange}
              shared={params.shared ? true : false}
            />
          </div>
        </div>
      </div>
    )
  );
}
