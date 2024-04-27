import React from "react";

export default function CustomQuillToolbar() {
  return (
    <div id="toolbar">
      <div className="flex flex-row justify-center gap-[15px]">
        <select className="ql-size ql-picker" onChange={(e) => e.persist()} />
        <button className="ql-bold" />
        <button className="ql-italic" />
        <button className="ql-underline" />
        <button className="ql-list" value="ordered" />
        <button className="ql-list" value="bullet" />
        <button className="ql-link" />
      </div>
    </div>
  );
}
