import React, { useEffect, useState } from "react";

export interface Invite {
  invite_id: number;
  doc_id: number;
  sender_id: number;
  sender_name: string;
  recipient_id: number;
  title: string;
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
    const { invite_id, doc_id, sender_name, sender_id, recipient_id, title } =
      invite;
    return (
      <div
        className="relative flex flex-col justify-between h-24 p-4 my-4 border-solid border border-dustyGray rounded-lg overflow-hidden"
        key={invite_id}
      >
        <p>
          {sender_name} shared "{title}" with you.
        </p>
        <div className="flex flex-row">
          <button
            className="border-0 bg-transparent text-vividViolet mr-2"
            onClick={() =>
              handleAccept(invite_id, doc_id, sender_id, recipient_id)
            }
          >
            accept
          </button>
          <button
            className="border-0 bg-transparent text-vividViolet "
            onClick={() => handleDelete(invite_id)}
          >
            decline
          </button>
        </div>
      </div>
    );
  });
}
