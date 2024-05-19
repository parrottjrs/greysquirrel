import { useEffect, useState } from "react";
import { clipText, formatDate } from "../utils/functions";
import { BOLD_TEXT_BLACK } from "../styles/GeneralStyles";
import { Invite } from "../utils/customTypes";
import {
  PENDING_INVITE,
  RED_BUTTON,
  SHARE_DATE_TEXT,
} from "../styles/InvitesStyles";

export default function InvitesSent() {
  const [sharedInvites, setSharedInvites] = useState<Invite[]>([]);

  const filterInvites = (id: number) => {
    setSharedInvites((prevInvites) =>
      prevInvites.filter((invite) => invite.invite_id !== id)
    );
  };

  const fetchInvites = async () => {
    try {
      const response = await fetch("/api/invites/pending/sent");
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
      const response = await fetch("/api/invites/delete", {
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
    const { invite_id, recipient_name, title, share_date } = invite;
    const formattedShareDate = formatDate(share_date);
    const newTitle = title ? clipText(title, "title") : "Untitled";
    return (
      <div className={PENDING_INVITE} key={invite_id}>
        <p className={`${BOLD_TEXT_BLACK} m-0`}>
          You shared "{newTitle}" with {recipient_name}.
        </p>

        <button className={RED_BUTTON} onClick={() => handleDelete(invite_id)}>
          Cancel
        </button>
        <p className={`${SHARE_DATE_TEXT} m-0`}>
          Date shared: {formattedShareDate}{" "}
        </p>
      </div>
    );
  });
}
