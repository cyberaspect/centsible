import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../components/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { CircularProgress } from "@nextui-org/react";

const randomLoadingMessages = [
  "Smarter spending coming your way.",
  "Just a moment...",
  "We're fetching your data.",
  "Your data is on its way.",
  "We're almost there -",
  "Just a few more seconds...",
  "We're working -",
  "We're on it -",
  "Beep boop. Boop beep?"
]

function randint(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    const randomMessage = randomLoadingMessages[randint(0, randomLoadingMessages.length - 1)];

    return (
      <div className="flex flex-col h-screen items-center justify-center">
        <CircularProgress className="mb-2" aria-label="Loading..." />
        <p className="text-default-600"><span className="text-default-400">{randomMessage}</span>&nbsp;Hang tight!</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/account/login" />;
  }

  return children;
};

export default ProtectedRoute;