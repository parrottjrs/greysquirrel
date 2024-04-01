import React, { useEffect, useRef, useState } from "react";

import "react-quill/dist/quill.snow.css";
import { useNavigate, useParams } from "react-router-dom";
import { STYLES } from "../utils/styles";
import { authenticate, refresh } from "../utils/functions";
import Navbar from "../components/Navbar";
import CustomQuill from "../components/CustomQuill";
import { Socket, io } from "socket.io-client";
import * as Y from "yjs";
import ReactQuill from "react-quill";

export default function Editor() {
  const params = useParams();
  const [docId] = useState(params.docId);
  const WS_URL = "ws://192.168.2.102:3000";
  const autoSaveDelay = 5000;
  const refreshTokenDelay = 540000; //nine minutes;
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [authorization, setAuthorization] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [yDoc] = useState(new Y.Doc());
  const yText = yDoc.getText(text);
  const currentUserIdRef = useRef(currentUserId);
  let quillRef = useRef<ReactQuill>(null);

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  const authenticateUser = async () => {
    try {
      const { success, userId } = await authenticate();

      if (!success) {
        navigate("/signin");
      }
      setCurrentUserId(userId);
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

  const handleGetEditorContent = () => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();

      if (quill) {
        const htmlContent = quill.root.innerHTML;
        const delta = quill.getContents();

        console.log("HTML content:", htmlContent);
        console.log("Delta:", delta);
      } else {
        console.error("Quill editor instance not found");
      }
    } else {
      console.error("Quill ref is not assigned");
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
  }, [authorization, currentUserId]);

  useEffect(() => {
    let timer: any = setTimeout(() => fetchSave(), autoSaveDelay);
    return () => clearTimeout(timer);
  }, [text, title]);

  const handleTextChange = async (text: string, delta: any, source: any) => {
    setText(text);
    handleGetEditorContent();
    if (socket && source === "user") {
      const deltaString = JSON.stringify(delta);

      const jsonData = {
        docId: docId,
        content: deltaString,
        userId: currentUserId,
      };
      socket.send(jsonData);
    }
    return;
  };

  const updateYdoc = () => {};

  useEffect(() => {
    if (socket) {
      socket.on("message", (data) => {
        if (data.userId === currentUserIdRef.current) {
          return;
        }

        const deltaString = data.content;
        const delta = JSON.parse(deltaString);

        const yText: any = yDoc.getText(text);
        yText.applyDelta(delta.ops);
        console.log(yText.doc);
      });
    }
  }, [socket, yDoc, currentUserId, text]);

  const handleTitleChange = (title: string) => {
    setTitle(title);
  };

  return (
    authorization && (
      <div className={STYLES.MOUSEOUT_DIV} onMouseLeave={fetchSave}>
        <Navbar isLoggedIn={true} />
        <div className="mt-24 w-[51.75rem]">
          <div onBlur={() => fetchSave()}>
            <CustomQuill
              quillRef={quillRef}
              text={text}
              title={title}
              docId={docId}
              onTextChange={handleTextChange}
              onTitleChange={handleTitleChange}
              shared={params.shared ? true : false}
            />
          </div>
          <button onClick={() => handleGetEditorContent()}>
            Get Editor Content
          </button>
        </div>
      </div>
    )
  );
}
