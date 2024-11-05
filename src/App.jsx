import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import { CircularProgress, NextUIProvider } from "@nextui-org/react";
import { link } from "./components/styles";
import { Toaster } from 'react-hot-toast';
import { useEffect } from "react";
import { auth } from "./components/firebase";

import Account from "./pages/account/Account";
import Dash from "./pages/Dash";
import ProtectedRoute from "./pages/ProtectedRoute";
import NotFound from "./pages/NotFound";
import { PurchaseProvider } from "./components/PurchaseContext";

export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) {
      localStorage.removeItem("uid");
    }
  }, [auth.currentUser]);

  return (
    <NextUIProvider navigate={navigate}>
      <PurchaseProvider>
        <Routes>
          {/* <Route path="/" element={<Navigate to="/dashboard" />} /> */}
          <Route path="/dashboard/*" element={<ProtectedRoute><Dash /></ProtectedRoute>} />
          <Route path="/account/*" element={<Account />} />
          <Route path="/dev/cyberaspect/tempcred" element={<p>Username: create@hackgwinnett.org<br></br>Password: hc5judge<br></br><Link className={link()} to="/account/login">Go to login</Link></p>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </PurchaseProvider>
    </NextUIProvider>
  );
}

export function setTitle(title = "", suffix = true) {
  if (title === "") return document.title = "Centsible";
  else if (!suffix) return document.title = title;
  else return document.title = title + " - Centsible"
}