import React from "react";
import { HashRouter, Route, Routes } from "react-router-dom";

import Editor from "./pages/Editor";
import Signup from "./pages/Signup";
import Documents from "./pages/Documents";
import NotFound from "./pages/404";
import Signin from "./pages/Signin";
import AwaitingVerification from "./pages/AwaitingVerification";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/editor/:docId" element={<Editor />} />
        <Route
          path="/verify-email/:emailToken?"
          element={<AwaitingVerification />}
        />
        <Route path="/*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
}
