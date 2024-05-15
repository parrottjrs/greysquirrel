import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import InvitesSent from "../components/InvitesSent";
import InvitesRecieved from "../components/InvitesReceived";
import { authenticate, refresh } from "../utils/functions";
import { useNavigate } from "react-router-dom";
import { useBreakpoints } from "../hooks/useBreakpoints";
import MobileNavbar from "./MobileNavbar";
import {
  FLEX_CENTER_LARGE,
  FLEX_COL_CENTER,
  FLEX_COL_CENTER_MOBILE,
  FLEX_COL_LEFT,
  GENERIC_HEADER,
} from "../styles/GeneralStyles";
import {
  DOCUMENTS_SWITCH_OFF,
  DOCUMENTS_SWITCH_ON,
} from "../styles/DocPageStyles";

export const NotificationsBody = () => {
  const { isMobile } = useBreakpoints();
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
      const { success } = await authenticate();
      if (!success) {
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
      <div className={isMobile ? FLEX_COL_CENTER : ""}>
        {!isMobile ? (
          <Navbar isLoggedIn={true} page={"notifications"} />
        ) : (
          <MobileNavbar />
        )}
        <div className={`${FLEX_COL_LEFT} gap-[46px]`}>
          <h1 className={GENERIC_HEADER}>Notifications</h1>
          <div className="flex flex row gap-[16px]">
            <button
              className={
                notifications === "shared"
                  ? DOCUMENTS_SWITCH_ON
                  : DOCUMENTS_SWITCH_OFF
              }
              onClick={() => setNotifications("shared")}
            >
              Shared with me
            </button>
            <button
              className={
                notifications === "pending"
                  ? DOCUMENTS_SWITCH_ON
                  : DOCUMENTS_SWITCH_OFF
              }
              onClick={() => setNotifications("pending")}
            >
              Pending invites
            </button>
          </div>
          <div className="flex flex-col gap-[35px]">
            {notifications === "shared" && <InvitesRecieved />}
            {notifications === "pending" && <InvitesSent />}
          </div>
        </div>
      </div>
    )
  );
};
