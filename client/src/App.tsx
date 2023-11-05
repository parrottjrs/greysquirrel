import React from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Editor from "./pages/Editor";
import Signup from "./pages/Signup";
import Documents from "./pages/Documents";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/:username/documents" element={<Documents />} />
        <Route path="/editor" element={<Editor />} />
      </Routes>
    </HashRouter>
  );
}
