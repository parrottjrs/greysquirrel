import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreVertical } from "lucide-react";
import React, { useState } from "react";

interface Document {
  doc_id?: number;
  title?: string;
  content?: string;
  authorizedUsers: string[];
}

interface ChildProps {
  docId?: number;
  handleDocs: React.Dispatch<React.SetStateAction<Document[]>>;
}

export default function DocumentOptionsDropdown({
  docId,
  handleDocs,
}: ChildProps) {
  const [show, setShow] = useState(false);

  const fetchDelete = async (id: any) => {
    try {
      await fetch("api/documents", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ docId: id }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: any) => {
    await fetchDelete(id);
    handleDocs((currentDocuments) => {
      return currentDocuments.filter(
        (document: Document) => document.doc_id !== id
      );
    });
  };

  return (
    <div>
      <DropdownMenu.Root open={show ? true : false}>
        <DropdownMenu.Trigger asChild onClick={() => setShow(true)}>
          <MoreVertical />
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            onInteractOutside={() => {
              setShow(false);
            }}
          >
            <div className="absolute z-0 p-2 w-28 mt-5 mr-4 rounded-xl bg-aeroBlue">
              <DropdownMenu.Item>
                <button className="bg-none" onClick={() => handleDelete(docId)}>
                  Delete
                </button>
              </DropdownMenu.Item>
            </div>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
