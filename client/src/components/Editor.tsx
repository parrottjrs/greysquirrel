import { useEffect, useRef, useState } from "react";
import "react-quill/dist/quill.snow.css";
import { useNavigate, useParams } from "react-router-dom";
import { useBreakpoints } from "../hooks/useBreakpoints";
import MobileNavbar from "../components/MobileNavbar";
import ShareModal from "../components/ShareModal";
import Navbar from "../components/Navbar";
import { Socket, io } from "socket.io-client";
import * as Y from "yjs";
import ReactQuill from "react-quill";
import { QuillBinding } from "y-quill";
import CustomQuill from "./CustomQuill";
import {
  applyDeltaSafely,
  authenticate,
  fetchAuthorizedUsers,
  refresh,
} from "../utils/functions";
import {
  FLEX_CENTER_LARGE,
  FLEX_COL_CENTER_MOBILE,
  MOUSEOUT_DIV,
} from "../styles/GeneralStyles";

export const Editor = () => {
  const { isMobile } = useBreakpoints();
  const params = useParams();
  const [docId] = useState(params.docId);
  const WS_URL = "ws://192.168.2.102:3000";
  const autoSaveDelay = 5000;
  const refreshTokenDelay = 540000; //nine minutes;
  const navigate = useNavigate();
  const [showShareModal, setShowShareModal] = useState(false);
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [userOwnsDoc, setUserOwnsDoc] = useState(null);
  const [authorizedUsers, setAuthorizedUsers] = useState<string[]>([]);
  const [authorization, setAuthorization] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  let binding = null;
  const currentUserIdRef = useRef(currentUserId);
  let quillRef = useRef<ReactQuill>(null);
  const yDoc = new Y.Doc();
  const yText = yDoc.getText(text.toString());

  const revokeSharedAccess = async (userName: string) => {
    await fetch("api/documents/shared/revoke", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ docId: docId, authorizedUserName: userName }),
    });
  };

  const handleRevokeSharedAccess = (userName: string) => {
    revokeSharedAccess(userName);

    setAuthorizedUsers((prevUsers: string[]) =>
      prevUsers.filter((authorizedUser) => authorizedUser !== userName)
    );
  };

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
      await fetch("/api/documents/save", {
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
      const response = await fetch("/api/documents/create", {
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
      setUserOwnsDoc(json.userOwnsDoc);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    authenticateUser();
    const newSocket = io(WS_URL, { query: { docId: docId } });
    setSocket(newSocket);

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const handleFetchAuthorizedUsers = async () => {
    const authorizedList = await fetchAuthorizedUsers(docId);
    setAuthorizedUsers(authorizedList);
  };

  useEffect(() => {
    fetchContent();
    if (userOwnsDoc) {
      handleFetchAuthorizedUsers();
    }

    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const newBinding = new QuillBinding(yText, quill);
      binding = newBinding;
    }

    let interval = setInterval(() => refreshToken(), refreshTokenDelay);
    return () => clearInterval(interval);
  }, [authorization, quillRef]);

  useEffect(() => {
    let timer: any = setTimeout(() => fetchSave(), autoSaveDelay);
    return () => clearTimeout(timer);
  }, [text, title]);

  const handleTextChange = async (text: string, delta: any, source: any) => {
    setText(text);
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

  useEffect(() => {
    if (socket) {
      socket.on("message", (data) => {
        if (data.userId === currentUserIdRef.current) {
          return;
        }
        const deltaString = data.content;
        const delta = JSON.parse(deltaString);
        const textToApply = delta.ops;
        applyDeltaSafely(yText, textToApply);
      });
    }
  }, [socket, currentUserId, text, yText]);

  const handleTitleChange = (title: string) => {
    setTitle(title);
  };
  const handleShareModal = () => {
    setShowShareModal(true);
  };
  return (
    authorization && (
      <div className={MOUSEOUT_DIV} onMouseLeave={fetchSave}>
        <div className={isMobile ? FLEX_COL_CENTER_MOBILE : FLEX_CENTER_LARGE}>
          {isMobile ? <MobileNavbar /> : <Navbar isLoggedIn={true} />}

          <div onBlur={() => fetchSave()}>
            <CustomQuill
              quillRef={quillRef}
              text={text}
              title={title}
              docId={docId}
              onTextChange={handleTextChange}
              onTitleChange={handleTitleChange}
              handleShareModal={handleShareModal}
              userOwnsDoc={userOwnsDoc}
            />
          </div>
        </div>
        {showShareModal && (
          <ShareModal
            docId={docId}
            title={title}
            authorizedUsers={authorizedUsers}
            onDeleteUser={handleRevokeSharedAccess}
            open={showShareModal}
            setOpen={setShowShareModal}
          />
        )}
      </div>
    )
  );
};
