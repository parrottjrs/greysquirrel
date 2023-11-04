import "./index.css";
import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import useWebSocket from "react-use-websocket";
import "react-quill/dist/quill.snow.css";

export default function App() {
  const WS_URL = "ws://localhost:8000";
  const client = useWebSocket(WS_URL);

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

  const [text, setText] = useState("");

  const handleChange = (text: string) => {
    client.sendMessage(text);
  };

  return (
    <div className="App">
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
