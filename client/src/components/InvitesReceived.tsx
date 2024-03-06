import React, { useEffect, useState } from "react";
import { STYLES } from "../utils/styles/styles";
import { clipText } from "../utils/functions";

export interface Invite {
  invite_id: number;
  doc_id: number;
  sender_id: number;
  sender_name: string;
  recipient_id: number;
  title: string;
  share_date: string;
}

export default function InvitesRecieved() {
  const [invites, setInvites] = useState<Invite[]>([]);

  const filterInvites = (id: number) => {
    setInvites((prevInvites) =>
      prevInvites.filter((invite) => invite.invite_id !== id)
    );
  };

  const fetchInvites = async () => {
    try {
      const response = await fetch("/api/invites-received");
      const json = await response.json();
      if (json.success) {
        setInvites(json.invites);
      }
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const deleteInvite = async (id: number) => {
    try {
      const response = await fetch("/api/invite", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ inviteId: id }),
      });
      if (response.ok) {
        filterInvites(id);
      }
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const acceptInvite = async (
    inviteId: number,
    docId: number,
    senderId: number,
    recipientId: number
  ) => {
    try {
      await fetch("/api/accept-invite", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          inviteId: inviteId,
          docId: docId,
          senderId: senderId,
          recipientId: recipientId,
        }),
      });
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const handleAccept = async (
    inviteId: any,
    docId: any,
    senderId: any,
    recipientId: any
  ) => {
    await acceptInvite(inviteId, docId, senderId, recipientId);
    await deleteInvite(inviteId);
  };

  const handleDelete = async (inviteId: any) => {
    await deleteInvite(inviteId);
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  return invites.map((invite: Invite) => {
    const {
      invite_id,
      doc_id,
      sender_name,
      sender_id,
      recipient_id,
      title,
      share_date,
    } = invite;
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const formattedShareDate = new Date(share_date).toLocaleDateString(
      [],
      options
    );
    const newTitle = title ? clipText(title, "title") : "Untitled";
    return (
      <div
        className="relative flex flex-col justify-between h-24 w-3/4 p-4 my-4 border-solid border border-dustyGray rounded-lg overflow-hidden"
        key={invite_id}
      >
        <p className="text-nero font-sans mt-1">
          <span className="underline">{sender_name}</span> shared "{newTitle}"
          with you.
        </p>
        <p className="text-boulder text-sm font-sans md:text-lg mt-0">
          Date shared: {formattedShareDate}
        </p>
        <div className="flex flex-row ">
          <button
            aria-label="accept-invitation"
            className="border-0 bg-transparent text-nero font-sans mr-2"
            onClick={() =>
              handleAccept(invite_id, doc_id, sender_id, recipient_id)
            }
          >
            accept
          </button>
          <button
            aria-label="decline-invitation"
            className="border-0 bg-transparent text-roman font-sans"
            onClick={() => handleDelete(invite_id)}
          >
            decline
          </button>
        </div>
      </div>
    );
  });
}
