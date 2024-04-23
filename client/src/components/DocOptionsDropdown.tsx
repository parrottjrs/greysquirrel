import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreVertical } from "lucide-react";
import React, { useState } from "react";
import ShareModal from "./ShareModal";
import {
  DocumentOptionsProps,
  SharedDocument,
  UserDocument,
} from "../utils/customTypes";
import {
  DOC_OPTIONS_CONTAINER,
  OPTIONS_TEXT,
} from "../utils/styles/DocPageStyles";

export default function DocOptionsDropdown({
  docId,
  title,
  ownerId,
  handleDocs,
  shared,
}: DocumentOptionsProps) {
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
    handleDocs((currentDocuments: any) => {
      return currentDocuments.filter(
        (document: UserDocument) => document.doc_id !== id
      );
    });
  };

  const fetchDeleteShared = async (docId: number, ownerId: number) => {
    try {
      await fetch("api/shared-docs", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ docId: docId, ownerId: ownerId }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteShared = async (docId: any, ownerId: any) => {
    await fetchDeleteShared(docId, ownerId);
    handleDocs((currentDocuments: any) => {
      return currentDocuments.filter(
        (document: SharedDocument) => document.doc_id !== docId
      );
    });
  };

  return (
    <DropdownMenu.Root open={show ? true : false}>
      <DropdownMenu.Trigger asChild onClick={() => setShow(true)}>
        <MoreVertical size={43} />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          onInteractOutside={() => {
            setShow(false);
          }}
        >
          <div className={DOC_OPTIONS_CONTAINER}>
            <DropdownMenu.Item>
              <ShareModal docId={docId} title={title} />
            </DropdownMenu.Item>

            {/* TODO: Rename function */}

            <DropdownMenu.Item>
              <button
                className={OPTIONS_TEXT}
                onClick={() => {
                  !shared
                    ? handleDelete(docId)
                    : handleDeleteShared(docId, ownerId);
                }}
              >
                Delete
                {/* TODO: "move to trash" function */}
              </button>
            </DropdownMenu.Item>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
