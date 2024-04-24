import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import ShareModal from "./ShareModal";
import { QuillProps } from "../utils/customTypes";
import CustomQuillToolbar from "./CustomQuillToolbar";
import {
  CLICKABLE_TITLE,
  EDITOR_PARENT_CONTAINER,
  TITLE_INPUT_FIELD,
} from "../styles/CustomQuillEditorStyles";

export default function CustomQuillEditor({
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
      <div className={EDITOR_PARENT_CONTAINER}>
        <CustomQuillToolbar />
        {!shared && <ShareModal type="button" docId={docId} title={title} />}
      </div>
      <span>
        {editing || title === "" ? (
          <input
            className={TITLE_INPUT_FIELD}
            type="text"
            defaultValue={title ? title : "Untitled Document"}
            autoFocus={true}
            onBlur={(e) => {
              handleTitleBlur(e.target.value);
            }}
          />
        ) : (
          <div onClick={handleTitleClick} className={CLICKABLE_TITLE}>
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
        modules={CustomQuillEditor.modules}
        placeholder={"Enter text here..."}
      />
    </div>
  );
}

CustomQuillEditor.modules = {
  toolbar: {
    container: "#toolbar",
  },

  clipboard: {
    matchVisual: false,
  },
};
