import { Bell, BellDot } from "lucide-react";
import React, { useEffect, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

type Invite = {
  invite_id: number;
  doc_id: number;
  sender_id: number;
  sender_name: string;
  recipient_id: number;
};

export default function Invites() {
  let currentInvites: Array<Invite> = [];
  const [count, setCount] = useState(0);
  const [invites, setInvites] = useState(currentInvites);
  const [viewingInvites, setViewingInvites] = useState(false);

  const fetchInvites = async () => {
    try {
      const response = await fetch("/api/invite");
      const json = await response.json();
      setCount(json.invites ? json.invites.length : 0);
      return json.invites;
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
        const updatedInvites = invites.filter(
          (invite) => invite.invite_id !== id
        );
        setInvites(updatedInvites);
        setCount(count - 1);
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
    inviteId: number,
    docId: number,
    senderId: number,
    recipientId: number
  ) => {
    await acceptInvite(inviteId, docId, senderId, recipientId);

    setInvites((prevInvites) =>
      prevInvites.filter((invite) => invite.invite_id !== inviteId)
    );

    await deleteInvite(inviteId);
  };

  const handleDelete = (inviteId: number) => {
    deleteInvite(inviteId);
  };

  useEffect(() => {
    fetchInvites()
      .then((invites: any) => {
        if (invites) {
          setInvites(invites);
        }
      })
      .catch((error) => {
        console.error("Error fetching invites:", error);
      });
  }, []);

  return (
    <div>
      <DropdownMenu.Root open={viewingInvites && count > 0 ? true : false}>
        <DropdownMenu.Trigger asChild onClick={() => setViewingInvites(true)}>
          {count > 0 ? <BellDot /> : <Bell />}
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            onInteractOutside={() => setViewingInvites(false)}
          >
            {count > 0 ? (
              <div className="absolute z-0 p-2 w-28 mt-5 mr-4 rounded-xl bg-aeroBlue">
                <DropdownMenu.DropdownMenuLabel>
                  Invites
                </DropdownMenu.DropdownMenuLabel>
                {invites.map((invite: Invite) => {
                  const {
                    invite_id,
                    doc_id,
                    sender_name,
                    sender_id,
                    recipient_id,
                  } = invite;
                  return (
                    <DropdownMenu.Item key={invite_id}>
                      <div>
                        <p>
                          {sender_name} has invited you to work on a document
                          with them!
                        </p>
                        <button
                          onClick={() =>
                            handleAccept(
                              invite_id,
                              doc_id,
                              sender_id,
                              recipient_id
                            )
                          }
                        >
                          accept
                        </button>
                        <button onClick={() => handleDelete(invite_id)}>
                          decline
                        </button>
                      </div>
                    </DropdownMenu.Item>
                  );
                })}
              </div>
            ) : null}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
