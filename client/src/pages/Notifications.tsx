import React, { useState } from "react";
import { STYLES } from "../utils/styles/styles";
import Navbar from "../components/Navbar";
import InvitesSent from "../components/InvitesSent";
import InvitesRecieved from "../components/InvitesReceived";

export interface Invite {
  invite_id: number;
  doc_id: number;
  sender_id: number;
  sender_name: string;
  recipient_id: number;
}
export default function Notifications() {
  const [count, setCount] = useState(0);
  let currentInvites: Array<Invite> = [];
  const [invites, setInvites] = useState(currentInvites);
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
    </div>
  );
}
