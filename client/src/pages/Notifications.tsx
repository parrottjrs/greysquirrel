import React, { useEffect, useState } from "react";
import { STYLES } from "../utils/styles";
import Navbar from "../components/Navbar";
import InvitesSent from "../components/InvitesSent";
import InvitesRecieved from "../components/InvitesReceived";
import { authenticate, refresh } from "../utils/functions";
import { useNavigate } from "react-router-dom";

export interface Invite {
  invite_id: number;
  doc_id: number;
  sender_id: number;
  sender_name: string;
  recipient_id: number;
}
export default function Notifications() {
  const refreshTokenDelay = 540000; //nine minutes;
  const [authorization, setAuthorization] = useState(false);
  const [notifications, setNotifications] = useState("shared");

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

  useEffect(() => {
    let interval = setInterval(() => refreshToken(), refreshTokenDelay);
    return () => clearInterval(interval);
  }, [authorization]);

  useEffect(() => {
    authenticateUser();
  }, []);

  return (
    authorization && (
      <div>
        <Navbar isLoggedIn={true} page={"notifications"} />
        <div className={STYLES.DOCUMENTS_CONTAINER}>
          <h1 className={`${STYLES.WELCOME_HEADER} mb-14`}>Notifications</h1>
          <div>
            <button
              className={
                notifications === "shared"
                  ? STYLES.DOCUMENTS_SWITCH_SELECTED
                  : STYLES.DOCUMENTS_SWITCH
              }
              onClick={() => setNotifications("shared")}
            >
              Shared with me
            </button>
            <button
              className={
                notifications === "pending"
                  ? STYLES.DOCUMENTS_SWITCH_SELECTED
                  : STYLES.DOCUMENTS_SWITCH
              }
              onClick={() => setNotifications("pending")}
            >
              Pending invites
            </button>
          </div>
          {notifications === "shared" && <InvitesRecieved />}
          {notifications === "pending" && <InvitesSent />}
        </div>
      </div>
    )
  );
}
