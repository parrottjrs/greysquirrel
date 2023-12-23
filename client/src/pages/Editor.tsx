import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import useWebSocket from "react-use-websocket";
import "react-quill/dist/quill.snow.css";
import LogoutButton from "../components/LogoutButton";
import { useParams } from "react-router-dom";

export default function Editor() {
  const params = useParams();
  const docId = params.docId;

  const WS_URL = "ws://localhost:8000";
  const client = useWebSocket(WS_URL);
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const timeoutDelayMs = 10000;

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
    <div className="App">
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
    </div>
  );
}
