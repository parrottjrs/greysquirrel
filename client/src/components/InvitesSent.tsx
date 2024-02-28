import { UserRoundX } from "lucide-react";
import React, { useEffect, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

type Invite = {
  invite_id: number;
  doc_id: number;
  sender_id: number;
  recipient_name: string;
  recipient_id: number;
  title: string;
};

export default function InvitesSent() {
  // let currentInvites: Array<Invite> = [];
  // const invitesRefreshDelay = 900000;
  // const [count, setCount] = useState(0);
  // const [invites, setInvites] = useState(currentInvites);
  // const [viewingInvites, setViewingInvites] = useState(false);

  // const fetchInvites = async () => {
  //   try {
  //     const response = await fetch("/api/invites-sent");
  //     const json = await response.json();
  //     setCount(json.invites ? json.invites.length : 0);
  //     return json.invites;
  //   } catch (err) {
  //     console.error(err);
  //     return false;
  //   }
  // };

  // const deleteInvite = async (id: number) => {
  //   try {
  //     const response = await fetch("/api/invite", {
  //       method: "DELETE",
  //       headers: { "content-type": "application/json" },
  //       body: JSON.stringify({ inviteId: id }),
  //     });
  //     if (response.ok) {
  //       setInvites((prevInvites) =>
  //         prevInvites.filter((invite) => invite.invite_id !== id)
  //       );

  //       setCount((prevCount) => {
  //         const updatedCount = prevCount - 1;
  //         return updatedCount;
  //       });
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     return false;
  //   }
  // };

  // const acceptInvite = async (
  //   inviteId: number,
  //   docId: number,
  //   senderId: number,
  //   recipientId: number
  // ) => {
  //   try {
  //     await fetch("/api/accept-invite", {
  //       method: "POST",
  //       headers: { "content-type": "application/json" },
  //       body: JSON.stringify({
  //         inviteId: inviteId,
  //         docId: docId,
  //         senderId: senderId,
  //         recipientId: recipientId,
  //       }),
  //     });
  //   } catch (err) {
  //     console.error(err);
  //     return false;
  //   }
  // };

  // const handleAccept = async (
  //   inviteId: number,
  //   docId: number,
  //   senderId: number,
  //   recipientId: number
  // ) => {
  //   await acceptInvite(inviteId, docId, senderId, recipientId);
  //   await deleteInvite(inviteId);
  // };

  // const handleDelete = async (inviteId: number) => {
  //   await deleteInvite(inviteId);
  // };

  // const handleFetch = async () => {
  //   await fetchInvites()
  //     .then((invites: any) => {
  //       if (invites) {
  //         setInvites(invites);
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching invites:", error);
  //     });
  // };

  // useEffect(() => {
  //   handleFetch();
  // }, []);

  // useEffect(() => {
  //   let interval = setInterval(() => {
  //     handleFetch();
  //   }, invitesRefreshDelay);
  //   return () => clearInterval(interval);
  // }, [invites, count, viewingInvites]);

  // useEffect(() => {
  //   if (count === 0) {
  //     setViewingInvites(false);
  //   }
  // }, [invites, count, viewingInvites]);
  // return (
  //   <div>
  //     <DropdownMenu.Root open={viewingInvites && count > 0 ? true : false}>
  //       <DropdownMenu.Trigger asChild onClick={() => setViewingInvites(true)}>
  //         <UserRoundX />
  //       </DropdownMenu.Trigger>
  //       <DropdownMenu.Portal>
  //         <DropdownMenu.Content
  //           onInteractOutside={() => {
  //             setViewingInvites(false);
  //           }}
  //         >
  //           {count > 0 ? (
  //             <div className="absolute z-0 p-2 w-28 mt-5 mr-4 rounded-xl bg-aeroBlue">
  //               <DropdownMenu.DropdownMenuLabel>
  //                 Pending Invites
  //               </DropdownMenu.DropdownMenuLabel>
  //               {invites.map((invite: Invite) => {
  //                 const {
  //                   invite_id,
  //                   doc_id,
  //                   recipient_name,
  //                   sender_id,
  //                   recipient_id,
  //                 } = invite;
  //                 return (
  //                   <DropdownMenu.Item key={invite_id}>
  //                     <div>
  //                       <p>{recipient_name}</p>

  //                       <button onClick={() => handleDelete(invite_id)}>
  //                         Cancel invite
  //                       </button>
  //                     </div>
  //                   </DropdownMenu.Item>
  //                 );
  //               })}
  //             </div>
  //           ) : null}
  //         </DropdownMenu.Content>
  //       </DropdownMenu.Portal>
  //     </DropdownMenu.Root>
  //   </div>
  // );
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
      console.log(json);
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
    const {
      invite_id,
      doc_id,
      sender_id,
      recipient_id,
      recipient_name,
      title,
    } = invite;
    return (
      <div
        className="relative flex flex-col justify-between h-24 p-4 my-4 border-solid border border-dustyGray rounded-lg overflow-hidden"
        key={invite_id}
      >
        <p>
          You shared "{title}" with {recipient_name}.
        </p>
        <div className="flex flex-row">
          <button
            className="border-0 bg-transparent text-vividViolet "
            onClick={() => handleDelete(invite_id)}
          >
            Cancel invite
          </button>
        </div>
      </div>
    );
  });
}
