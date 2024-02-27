import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreVertical } from "lucide-react";
import React, { useState } from "react";
import { STYLES } from "../utils/styles/styles";
import ShareModal from "./ShareModal";

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
            <div className="fixed -bottom-[1.85rem] left-12 p-2 pb-3 h-12 w-28 mt-5 mr-4 border-solid border rounded">
              <div>
                <DropdownMenu.Item>
                  <ShareModal />
                </DropdownMenu.Item>
              </div>

              {/* TODO: Rename function */}

              <DropdownMenu.Item>
                <button
                  className={STYLES.OPTIONS_TEXT}
                  onClick={() => handleDelete(docId)}
                >
                  Delete
                  {/* TODO: "move to trash" function */}
                </button>
              </DropdownMenu.Item>
            </div>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
