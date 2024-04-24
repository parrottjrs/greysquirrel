import React, { useEffect, useState } from "react";
import { CANCEL_BUTTON, SENT_PARENT_CONTAINER } from "../styles/InvitesStyles";

type Invite = {
  invite_id: number;
  doc_id: number;
  sender_id: number;
  recipient_name: string;
  recipient_id: number;
  title: string;
};

export default function InvitesSent() {
  const [sharedInvites, setSharedInvites] = useState<Invite[]>([]);

  const filterInvites = (id: number) => {
    setSharedInvites((prevInvites) =>
      prevInvites.filter((invite) => invite.invite_id !== id)
    );
  };

  const fetchInvites = async () => {
    try {
      const response = await fetch("/api/invites-sent");
      const json = await response.json();
      if (json.success) {
        setSharedInvites(json.invites);
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

  const handleDelete = async (inviteId: any) => {
    await deleteInvite(inviteId);
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  return sharedInvites.map((invite: Invite) => {
    const { invite_id, recipient_name, title } = invite;
    return (
      <div className={SENT_PARENT_CONTAINER} key={invite_id}>
        <p>
          You shared "{title}" with {recipient_name}.
        </p>
        <div className="flex flex-row">
          <button
            className={CANCEL_BUTTON}
            onClick={() => handleDelete(invite_id)}
          >
            Cancel invite
          </button>
        </div>
      </div>
    );
  });
}
