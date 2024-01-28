import { Bell, BellDot } from "lucide-react";
import React, { useEffect, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

const InviteItem = ({ invite }: any) => {
  const { inviteId, docId, senderName } = invite;

  const deleteInvite = async () => {
    try {
      const response = await fetch("/api/invite", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ inviteId: inviteId }),
      });
      const json = await response.json();
      return json;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const acceptInvite = async () => {
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

  const handleAccept = () => {
    acceptInvite();
    deleteInvite();
  };

  const handleDelete = () => {
    deleteInvite();
  };

  return (
    <div>
      <p>{senderName} has invited you to work on a document with them!</p>
      <button onClick={handleAccept}>accept</button>
      <button onClick={handleDelete}>decline</button>
    </div>
  );
};

export const Invites = () => {
  let currentInvites: any = [];
  const [count, setCount] = useState(0);
  const [invites, setInvites] = useState(currentInvites);
  const [notification, setNotification] = useState(false);

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

  useState(() => {
    fetchInvites()
      .then((invites) => {
        if (invites) {
          currentInvites.push(...invites);
        }
      })
      .catch((error) => {
        console.error("Error fetching invites:", error);
      });
  });

  return (
    <div>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          {count === 0 ? <Bell /> : <BellDot />}
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content>
            <div className="absolute z-0 p-2 w-28 mt-5 mr-4 rounded-xl bg-aeroBlue">
              {invites.map((invite: any) => {
                return (
                  <DropdownMenu.Item key={invite.inviteId}>
                    <InviteItem invite={invite} />
                  </DropdownMenu.Item>
                );
              })}
            </div>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
};
