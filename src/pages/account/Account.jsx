import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";

export default function Account() {
  return (
		<Routes>
			<Route path="/" element={<Settings />} />
			<Route path="/login" element={<Login />} />
			<Route path="/signup" element={<Signup />} />
		</Routes>
	);
}

export function Settings() {
	return (<p>settings.test</p>);
}