import { Bell, BellDot } from "lucide-react";
import React, { useEffect, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

type Invite = {
  inviteId: number;
  docId: number;
  senderName: string;
};

export default function Invites() {
  let currentInvites: Array<Invite> = [];
  const [count, setCount] = useState(0);
  const [invites, setInvites] = useState(currentInvites);

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
        const updatedInvites = currentInvites.filter(
          (invite) => invite.inviteId !== id
        );
        setInvites(updatedInvites);
        setCount(count - 1);
      }
      const json = await response.json();
      return json;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const acceptInvite = async (inviteId: number, docId: number) => {
    try {
      const response = await fetch("/api/accept-invite", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ inviteId: inviteId, docId: docId }),
      });
      const json = await response.json();
      return json;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const handleAccept = (inviteId: number, docId: number) => {
    acceptInvite(inviteId, docId);
    deleteInvite(inviteId);
  };

  const handleDelete = (inviteId: number) => {
    deleteInvite(inviteId);
  };

  useEffect(() => {
    fetchInvites()
      .then((invites) => {
        if (invites) {
          currentInvites.push(...invites);
        }
      })
      .catch((error) => {
        console.error("Error fetching invites:", error);
      });
  }, []);

  return (
    <div>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          {count > 0 ? <BellDot /> : <Bell />}
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content>
            {count > 0 ? (
              <div className="absolute z-0 p-2 w-28 mt-5 mr-4 rounded-xl bg-aeroBlue">
                {invites.map((invite: Invite) => {
                  const { inviteId, docId, senderName } = invite;
                  return (
                    <DropdownMenu.Item key={invite.inviteId}>
                      <div>
                        <p>
                          {senderName} has invited you to work on a document
                          with them!
                        </p>
                        <button onClick={() => handleAccept(inviteId, docId)}>
                          accept
                        </button>
                        <button onClick={() => handleDelete(inviteId)}>
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
