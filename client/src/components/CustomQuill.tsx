import React from "react";
import ReactQuill from "react-quill";
import ShareModal from "./ShareModal";

interface QuillProps {
  text: string;
  title: string;
  docId: string | undefined;
  onChange: (text: string) => void;
}

const CustomToolbar = () => (
  <div id="toolbar">
    <select
      className="ql-header"
      defaultValue={""}
      onChange={(e) => e.persist()}
    >
      <option value="1" />
      <option value="2" />
      <option selected />
    </select>
    <button className="ql-bold" />
    <button className="ql-italic" />
    <select className="ql-color">
      <option value="red" />
      <option value="green" />
      <option value="blue" />
      <option value="orange" />
      <option value="violet" />
      <option value="#d0d1d2" />
      <option selected />
    </select>
  </div>
);

export default function CustomQuill({
  text,
  title,
  docId,
  onChange,
}: QuillProps) {
  return (
    <div className="w-full">
      <div className="w-[51.25rem] flex flex-row justify-between">
        <CustomToolbar />

        <span className="border border-solid ">
          <ShareModal docId={docId} title={title} />
        </span>
      </div>

      <h2>{title}</h2>
      <ReactQuill
        className="react-quill"
        value={text}
        onChange={onChange}
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
