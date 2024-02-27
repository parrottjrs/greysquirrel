import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useForm } from "react-hook-form";
import { STYLES } from "../utils/styles/styles";

interface FormData {
  recipientName: string;
}

export default function ShareModal({ docId }: any) {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      recipientName: "",
    },
  });

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
        setOpen(true);
        return setDoesNotExist(true);
      }
      setOpen(false);
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
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className={STYLES.OPTIONS_TEXT}>Share</button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content className="absolute left-1/4 top-1/2 w-96 h-48 p-4 pr-10 border border-solid rounded-lg bg-white">
          <Dialog.Title className={`${STYLES.DOC_HEADER} pb-2`}>
            Share your document
          </Dialog.Title>
          <Dialog.Description className={STYLES.INSTRUCTIONS}>
            Enter your friend/colleague's username
          </Dialog.Description>
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
            <input className={STYLES.CREATE_BUTTON} type="submit" />
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
