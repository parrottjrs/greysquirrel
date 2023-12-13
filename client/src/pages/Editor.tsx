import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import useWebSocket from "react-use-websocket";
import "react-quill/dist/quill.snow.css";
import LogoutButton from "../components/LogoutButton";
import { useParams } from "react-router-dom";

export default function Editor() {
  const params = useParams();
  const docId = params.docId;
  console.log(docId);
  const WS_URL = "ws://localhost:8000";
  const client = useWebSocket(WS_URL);
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const timeoutDelayMs = 10000;

  const fetchContent = async () => {
    try {
      const response = await fetch("/api/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ docId: docId }),
      });
      const json = await response.json();
      const doc = json.document;
      const { title, content } = doc;
      title ? setTitle(title) : setTitle("");
      content ? setText(content) : setText("");
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSave = async () => {
    try {
      const response = await fetch("/api/save", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ docId: docId, title: title, content: text }),
      });
      const json = response.json();
      console.log(json);
    } catch (err) {
      console.error(err);
    }
  };

  let timer: any = undefined;

  useEffect(() => {
    fetchContent();
  }, []);

  // useEffect(() => {
  //   clearTimeout(timer);
  //   timer = setTimeout(fetchSave, timeoutDelayMs);
  // }, [text]);

  const handleChange = () => {
    setText(text);
  };
  const handleTitle = () => {
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
      <LogoutButton />
      <div>
        <ReactQuill
          className="quill"
          theme="snow"
          value={text}
          onChange={handleChange}
          preserveWhitespace={true}
        />
      </div>
    </div>
  );
}
