import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import useWebSocket from "react-use-websocket";
import "react-quill/dist/quill.snow.css";
import LogoutButton from "../components/LogoutButton";
import { useParams } from "react-router-dom";

export default function Editor() {
  const params = useParams();
  const docId = params.id;

  const WS_URL = "ws://localhost:8000";
  const client = useWebSocket(WS_URL);
  const [text, setText] = useState("");
  const timeoutDelayMs = 10000;

  const fetchContent = async () => {
    const response = await fetch("/api/content", {
      method: "GET",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ uuid: docId }),
    });
    const json = await response.json();
    return json;
  };

  // const fetchSave = async () => {
  //   try {
  //     const response = await fetch("/api/save", {
  //       method: "POST",
  //       headers: { "content-type": "application/json" },
  //       body: JSON.stringify({ text: text }),
  //     });
  //     const json = response.json();
  //     console.log(json.message);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  // let timer: any = undefined;

  // const handleChange = () => {
  //   setText(text);
  //   clearTimeout(timer);
  //   timer = setTimeout(fetchSave, timeoutDelayMs);
  // };

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

  const handleChange = () => {
    setText(text);
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
