import React from "react";
import { HashRouter, Route, Routes } from "react-router-dom";

import Editor from "./routes/Editor";
import Signup from "./routes/Signup";
import Documents from "./routes/Documents";
import NotFound from "./routes/404";
import Signin from "./routes/Signin";
import VerifyEmail from "./routes/VerifyEmail";
import Home from "./routes/Home";
import Account from "./routes/Account";
import Notifications from "./routes/Notifications";
import ForgotPassword from "./routes/ForgotPassword";

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
        <Route
          path="/forgot-password/:verificationToken?"
          element={<ForgotPassword />}
        />
        <Route path="/*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
}
