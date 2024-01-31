import React from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Editor from "./pages/Editor";
import Signup from "./pages/Signup";
import Documents from "./pages/Documents";
import NotFound from "./pages/404";
import SessionExpired from "./pages/SessionExpired";
import Signin from "./pages/Home";
import Auth from "./pages/Auth";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/home" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/editor/:docId" element={<Editor />} />
        <Route path="/expired" element={<SessionExpired />} />
        <Route path="/*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
}
