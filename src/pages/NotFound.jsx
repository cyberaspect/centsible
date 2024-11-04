import { Button, Link } from "@nextui-org/react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { setTitle } from "../App";
import { auth } from "../components/firebase";

export default function NotFound() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setTitle("404");
    if (auth.currentUser)
      if (location.pathname === "/")
        navigate("/dashboard");
  }, [auth.currentUser]);
  
  return (
    <div className="flex flex-col h-screen items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-lg mb-4">Sorry, but the page you are looking for does not exist. 😅</p>
      <Link href="/dashboard">
        <Button color="primary">Take me back, Chief!</Button>
      </Link>
    </div>
  );
}