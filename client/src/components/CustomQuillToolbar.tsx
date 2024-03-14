import React from "react";

export default function CustomQuillToolbar() {
  return (
    <div id="toolbar">
      <select className="ql-header" value="" onChange={(e) => e.persist()}>
        <option value="1" />
        <option value="2" />
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
      </select>
    </div>
  );
}
