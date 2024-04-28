import React from "react";
import { Quill } from "react-quill";
import {
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  FormatUnderlined,
  Link,
} from "@mui/icons-material";
export default function CustomQuillToolbar() {
  const icons = Quill.import("ui/icons");
  icons["bold"] = null;
  icons["italic"] = null;
  icons["underline"] = null;
  icons["link"] = null;
  icons["list"] = null;
  icons["size"] = null;

  return (
    <div id="toolbar">
      <div className="flex flex-row items-center justify-center gap-[10px]">
        <select className="ql-size">
          <option value="small"></option>
          <option selected></option>
          <option value="large"></option>
          <option value="huge"></option>
        </select>
        <button className="ql-bold">
          <FormatBold className="text-nero" />
        </button>
        <button className="ql-italic">
          <FormatItalic className="text-nero" />
        </button>
        <button className="ql-underline">
          <FormatUnderlined className="text-nero" />
        </button>
        <button className="ql-link">
          <Link className="text-nero" />
        </button>
        <button className="ql-list" value="ordered">
          <FormatListNumbered className="text-nero" />
        </button>
        <button className="ql-list" value="bullet">
          <FormatListBulleted className="text-nero" />
        </button>
      </div>
    </div>
  );
}
