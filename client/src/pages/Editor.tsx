import React, { useState } from "react";
import ReactQuill from "react-quill";
import useWebSocket from "react-use-websocket";
import "react-quill/dist/quill.snow.css";
import LogoutButton from "../components/LogoutButton";

export default function Editor() {
  const WS_URL = "ws://localhost:8000";
  const client = useWebSocket(WS_URL);
  const [text, setText] = useState("");

  useWebSocket(WS_URL, {
    onMessage: (message) => {
      setText(message.data);
      fetch("/api/createfile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: message.data }),
      })
        .then(() => {
          console.log("ok");
        })
        .catch((err) => console.log(err));
    },
    onOpen: () => {
      const fetchText = async () => {
        const response = await fetch("/api");
        const json = await response.json();
        return json;
      };
      fetchText()
        .then((json) => {
          setText(json.data);
        })
        .catch((err) => console.log(err));
    },
    shouldReconnect: (closeEvent) => true,
    share: true,
    filter: () => false,
  });

  const handleChange = (text: string) => {
    client.sendMessage(text);
  };

  return (
    <div className="App">
      <LogoutButton />
      <header className="App-header">
        <ReactQuill
          className="quill"
          theme="snow"
          value={text}
          onChange={handleChange}
          preserveWhitespace={true}
        />
      </header>
    </div>
  );
}
