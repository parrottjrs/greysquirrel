import React from "react";
import { HashRouter, Route, Routes } from "react-router-dom";

import Editor from "./pages/Editor";
import Signup from "./pages/Signup";
import Documents from "./pages/Documents";
import NotFound from "./pages/404";
import Signin from "./pages/Signin";
import VerifyEmail from "./pages/VerifyEmail";
import Home from "./pages/Home";
import Account from "./pages/Account";
import Notifications from "./pages/Notifications";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/editor/:docId/:shared?" element={<Editor />} />
        <Route path="/verify-email/:emailToken?" element={<VerifyEmail />} />
        <Route path="/account" element={<Account />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
}
