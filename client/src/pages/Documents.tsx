import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import DocumentsGrid from "../components/DocumentsGrid";
import SharedDocumentsGrid from "../components/SharedDocumentsGrid";
import { authenticate, refresh } from "../utils/functions";
import InvitesRecieved from "../components/InvitesReceived";
import InvitesSent from "../components/InvitesSent";
import Navbar from "../components/Navbar";
import { STYLES } from "../utils/styles/styles";

export interface Invite {
  invite_id: number;
  doc_id: number;
  sender_id: number;
  sender_name: string;
  recipient_id: number;
}

export default function Documents() {
  const refreshTokenDelay = 540000; //nine minutes;
  const [authorization, setAuthorization] = useState(false);
  const [count, setCount] = useState(0);
  let currentInvites: Array<Invite> = [];
  const [invites, setInvites] = useState(currentInvites);
  const navigate = useNavigate();

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

  const fetchCreate = async () => {
    const response = await fetch("/api/create", {
      method: "POST",
      headers: { "content-type": "application /json" },
    });
    const json = await response.json();
    return json.docId;
  };

  const handleClick = async () => {
    const id = await fetchCreate();
    navigate(`/editor/${id}`);
  };

  useEffect(() => {
    let interval = setInterval(() => refreshToken(), refreshTokenDelay);
    return () => clearInterval(interval);
  }, [authorization]);

  useEffect(() => {
    authenticateUser();
  }, []);

  const inviteChange = (newInvitesList: Array<Invite>) => {
    setInvites(newInvitesList);
  };

  const countChange = (newCount: number) => {
    setCount(newCount);
  };

  const filterInvites = (id: number) => {
    setInvites((prevInvites) =>
      prevInvites.filter((invite) => invite.invite_id !== id)
    );

    setCount((prevCount) => {
      const updatedCount = prevCount - 1;
      return updatedCount;
    });
  };

  return (
    authorization && (
      <div>
        <Navbar isLoggedIn={true} />
        <InvitesRecieved
          invites={invites}
          count={count}
          inviteChange={inviteChange}
          countChange={countChange}
          filterInvites={filterInvites}
        />
        <InvitesSent />
        <LogoutButton />
        <div className={STYLES.DOCUMENTS_CONTAINER}>
          <div className="flex flex-row justify-between">
            <h1 className={STYLES.WELCOME_HEADER}>My Documents</h1>
            <button className={STYLES.CREATE_BUTTON} onClick={handleClick}>
              New Document
            </button>
          </div>
          <span className={STYLES.PARAGRAPH}>Files</span>
          <DocumentsGrid />
          <SharedDocumentsGrid invites={invites} />
        </div>
      </div>
    )
  );
}
