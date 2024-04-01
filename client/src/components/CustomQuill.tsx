import React, { useState } from "react";
import ReactQuill from "react-quill";
import ShareModal from "./ShareModal";
import { QuillProps } from "../utils/customTypes";
import CustomQuillToolbar from "./CustomQuillToolbar";

export default function CustomQuill({
  quillRef,
  text,
  title,
  docId,
  onTextChange,
  onTitleChange,
  shared,
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
      <div className="w-[51.25rem] flex flex-row justify-between mb-[1.66rem]">
        <CustomQuillToolbar />
        {!shared && <ShareModal type="button" docId={docId} title={title} />}
      </div>
      <span>
        {editing || title === "" ? (
          <input
            className="h-[1.5rem] l-[24.62rem] py-[0.62rem] pl-[0.62rem] mb-[1.66rem] font-IBM text-nero text-2xl font-medium border rounded-[0.62rem] items center"
            type="text"
            defaultValue={title ? title : "Untitled Document"}
            autoFocus={true}
            onBlur={(e) => {
              handleTitleBlur(e.target.value);
            }}
          />
        ) : (
          <div
            onClick={handleTitleClick}
            className="mb-[1.66rem] font-IBM text-2xl text-nero font-medium"
          >
            {title}
          </div>
        )}
      </span>
      <ReactQuill
        ref={quillRef}
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
