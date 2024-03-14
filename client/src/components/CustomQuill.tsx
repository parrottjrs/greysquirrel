import React, { useState } from "react";
import ReactQuill from "react-quill";
import ShareModal from "./ShareModal";
import { QuillProps } from "../utils/customTypes";
import CustomQuillToolbar from "./CustomQuillToolbar";

export default function CustomQuill({
  text,
  title,
  docId,
  onTextChange,
  onTitleChange,
}: QuillProps) {
  const [editing, setEditing] = useState(false);

  const handleTitleClick = () => {
    setEditing(true);
  };

  const handleTitleBlur = (title: string) => {
    setEditing(false);
    onTitleChange(title);
  };

  return (
    <div className="w-full">
      <div className="w-[51.25rem] flex flex-row justify-between">
        <CustomQuillToolbar />
        <span className="border border-solid ">
          <ShareModal docId={docId} title={title} />
        </span>
      </div>
      <span>
        {editing ? (
          <input
            className="h-[2.5rem] l-[21.8rem] py-[0.55rem] pl-[0.55rem]"
            type="text"
            defaultValue={title}
            onBlur={(e) => {
              handleTitleBlur(e.target.value);
            }}
          />
        ) : (
          <h2 onClick={handleTitleClick}>{title}</h2>
        )}
      </span>
      <ReactQuill
        className="react-quill"
        value={text}
        onChange={onTextChange}
        preserveWhitespace={true}
        modules={CustomQuill.modules}
        placeholder={"Enter text here..."}
      />
    </div>
  );
}

CustomQuill.modules = {
  toolbar: {
    container: "#toolbar",
  },
  clipboard: {
    matchVisual: false,
  },
};
