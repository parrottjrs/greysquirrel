import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { STYLES } from "../utils/styles";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

interface FormData {
  recipientName: string;
}
interface ChildProps {
  docId: any;
  title?: string;
}
export default function ShareModal({ docId, title }: ChildProps) {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      recipientName: "",
    },
  });

  const [sent, setSent] = useState(false);
  const [open, setOpen] = useState(false);
  const [doesNotExist, setDoesNotExist] = useState(false);
  const [shareInput, setShareInput] = useState("");

  const fetchInvite = async (docId: number | undefined, recipient: string) => {
    try {
      const response = await fetch("/api/invite", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ docId: docId, recipient: recipient }),
      });
      const json = await response.json();
      if (json.message === "Recipient does not exist") {
        return setDoesNotExist(true);
      }
      setDoesNotExist(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setShareInput("");
  }, [open]);

  const handleChange = (value: string) => {
    setShareInput(value);
  };

  const handleInvite = async (data: FormData) => {
    if (!data.recipientName) {
      return null;
    }
    await fetchInvite(docId, data.recipientName);
    setSent(true);
  };

  return (
    <DropdownMenu.Root open={open ? true : false}>
      <DropdownMenu.Trigger asChild onClick={() => setOpen(true)}>
        <button className={STYLES.OPTIONS_TEXT}>Share</button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="fixed flex flex-col items-left -top-24 right-36 max-h-60 w-96 p-4 pr-10 drop-shadow-2xl rounded-lg bg-white"
          onInteractOutside={() => {
            setOpen(false);
          }}
        >
          <h2 className={`${STYLES.DOC_HEADER} pb-4`}>
            Share "{title ? title : "Untitled Document"}"
          </h2>
          {sent ? (
            <div className="flex flex-col">
              <span className={STYLES.INSTRUCTIONS}>Invite successful!</span>
              <button
                className={STYLES.CREATE_BUTTON}
                onClick={() => setOpen(false)}
              >
                OK
              </button>
            </div>
          ) : (
            <div>
              <span className={STYLES.INSTRUCTIONS}>
                Enter your friend/colleague's username
              </span>
              <form onSubmit={handleSubmit(handleInvite)} autoComplete="off">
                <div>
                  <input
                    className={STYLES.FORM_INPUT}
                    id="titleInput"
                    type="text"
                    {...register("recipientName")}
                    autoComplete="off"
                    value={shareInput}
                    onChange={(e) => handleChange(e.target.value)}
                  />
                  {doesNotExist && <p>User doesn't exist!</p>}
                </div>
                <div className="flex flex-row justify-between">
                  <button className={STYLES.CREATE_BUTTON} type="submit">
                    Share
                  </button>
                  <button
                    className={STYLES.CREATE_BUTTON}
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
