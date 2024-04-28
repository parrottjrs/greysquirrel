import React from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import Signup from "./routes/Signup";
import Documents from "./routes/Documents";
import NotFound from "./routes/NotFound";
import Signin from "./routes/Signin";
import Home from "./routes/Home";
import Account from "./routes/Account";
import Notifications from "./routes/Notifications";
import ForgotPassword from "./routes/ForgotPassword";
import VerifyAccount from "./routes/VerifyAccount";
import Edit from "./routes/Edit";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/edit/:docId" element={<Edit />} />
        <Route
          path="/verify-account/:emailToken?"
          element={<VerifyAccount />}
        />
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
