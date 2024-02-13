import { Bell, BellDot } from "lucide-react";
import React, { useEffect, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Invite } from "../pages/Documents";

interface ChildProps {
  invites: Array<Invite>;
  count: number;
  inviteChange: (newInvitesList: Array<Invite>) => void;
  countChange: (newCount: number) => void;
  filterInvites: (id: number) => void;
}

export default function InvitesRecieved({
  invites,
  count,
  inviteChange,
  countChange,
  filterInvites,
}: ChildProps) {
  const invitesRefreshDelay = 900000;

  const [viewingInvites, setViewingInvites] = useState(false);

  const fetchInvites = async () => {
    try {
      const response = await fetch("/api/invites-received");
      const json = await response.json();
      countChange(json.invites ? json.invites.length : 0);
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
    inviteId: number,
    docId: number,
    senderId: number,
    recipientId: number
  ) => {
    await acceptInvite(inviteId, docId, senderId, recipientId);
    await deleteInvite(inviteId);
  };

  const handleDelete = async (inviteId: number) => {
    await deleteInvite(inviteId);
  };

  const handleFetch = async () => {
    await fetchInvites()
      .then((invites: any) => {
        if (invites) {
          inviteChange(invites);
        }
      })
      .catch((error) => {
        console.error("Error fetching invites:", error);
      });
  };

  useEffect(() => {
    handleFetch();
  }, []);

  useEffect(() => {
    let interval = setInterval(() => {
      handleFetch();
    }, invitesRefreshDelay);
    return () => clearInterval(interval);
  }, [invites, count, viewingInvites]);

  useEffect(() => {
    if (count === 0) {
      setViewingInvites(false);
    }
  }, [invites, count, viewingInvites]);
  return (
    <div>
      <DropdownMenu.Root open={viewingInvites && count > 0 ? true : false}>
        <DropdownMenu.Trigger asChild onClick={() => setViewingInvites(true)}>
          {count > 0 ? <BellDot /> : <Bell />}
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            onInteractOutside={() => {
              setViewingInvites(false);
            }}
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
