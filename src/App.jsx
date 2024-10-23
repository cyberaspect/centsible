import { Routes, Route, Navigate, Link } from "react-router-dom";
import { link } from "./components/styles";
import { Toaster } from 'react-hot-toast';

import Account from "./pages/account/Account";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/account/settings" />} />
        <Route path="/account/*" element={<Account />} />
        <Route path="/dev/playintellectra/cyberaspect/secure.md" element={<p>Username: create@hackgwinnett.org<br></br>Password: hc5judge<br></br><Link className={link()} to="/account/login">Go to login</Link></p>} />
      </Routes>
      <Toaster />
    </>
  )
}

export function setTitle(title = "", suffix = true) {
  if (title === "") return document.title = "Infinite";
  else if (!suffix) return document.title = title;
  else return document.title = title + " - Infinite"
}
