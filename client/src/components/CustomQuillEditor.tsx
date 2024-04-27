import React, { useState } from "react";
import ReactQuill from "react-quill";
import { QuillProps } from "../utils/customTypes";
import CustomQuillToolbar from "./CustomQuillToolbar";
import Link from "./Link";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { CLICKABLE_TITLE } from "../styles/CustomQuillEditorStyles";
import { SHARE_BUTTON_TEXT } from "../styles/InvitesStyles";
import {
  FLEX_COL_CENTER_MOBILE,
  FLEX_COL_LEFT,
  FORM_INPUT_FIELD,
} from "../styles/GeneralStyles";

export default function CustomQuillEditor({
  quillRef,
  text,
  title,
  onTextChange,
  onTitleChange,
  handleShareModal,
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
    <div className={`${FLEX_COL_CENTER_MOBILE}`}>
      <div className={`${FLEX_COL_LEFT} gap-[60px]`}>
        <a
          href="#/documents"
          className="text-[18px] text-nero font-medium no-underline"
        >
          <div className="flex flex row items-center gap-[8px]">
            <ArrowBackIcon /> <span>back to documents</span>
          </div>
        </a>
        <div className="flex flex-col items-start gap-[30px]">
          <CustomQuillToolbar />
          <button className={SHARE_BUTTON_TEXT} onClick={handleShareModal}>
            <Link /> Share
          </button>
        </div>
        <div>
          {editing || title === "" ? (
            <input
              className={`${FORM_INPUT_FIELD} mb-[29px]`}
              type="text"
              defaultValue={title ? title : "Untitled Document"}
              autoFocus={true}
              onBlur={(e) => {
                handleTitleBlur(e.target.value);
              }}
            />
          ) : (
            <span onClick={handleTitleClick} className={CLICKABLE_TITLE}>
              {title}
            </span>
          )}

          <ReactQuill
            ref={quillRef}
            className="mt-[29px] react-quill"
            value={text}
            onChange={onTextChange}
            preserveWhitespace={true}
            modules={CustomQuillEditor.modules}
            placeholder={"Enter text here..."}
          />
        </div>
      </div>
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
