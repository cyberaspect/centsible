import { Button, Input, Tooltip, Divider } from "@nextui-org/react";
import { useState, useEffect, useMemo } from "react";
import { HelpCircle } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { setTitle } from "../../App";
import toast from "react-hot-toast";
import { auth } from "../../components/firebase";
import { getAuth, setPersistence, signInWithEmailAndPassword, browserLocalPersistence } from "firebase/auth"

const getErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/popup-closed-by-user': 'Looks like you closed the popup!',
    'auth/email-already-exists': 'That ID is already in use by another user!',
    'auth/insufficient-permission	': 'You do not have permission to perform this action!',
    'auth/invalid-credential': 'Those credentials look invalid. Try again!',
    'auth/internal-error': 'An internal error occurred! Our bad - give it another shot!',
    'auth/too-many-requests': 'Woah, we\'re dizzy! - You have attempted to sign in too many times. Please try again later!',
    'auth/invalid-email': 'That ID is not valid!',
    'auth/user-not-found': 'No user found with this ID.',
    'auth/wrong-password': 'The password is incorrect.',
    'auth/weak-password': 'The password is too weak.',
    'auth/missing-password': 'We\'ll need a password to log you in!',
  };

  return errorMessages[errorCode] || 'An unknown error occurred!';
};

export default function Login() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [visible, isVisible] = useState(false);
	const [errorMessage, setErrorMessage] = useState(null);
	const { theme, resolvedTheme } = useTheme();
	const navigate = useNavigate();
	useEffect(() => {
		setTitle("Login")}, []); // AHHHHHHHHHH

	const isInvalid = useMemo(() => {
	  if (username === "") return false;
	
	  return username.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i) ? false : true;
	}, [username]);
	
	const continueWithID = async (e) => {
	  e.preventDefault();
	  
	  const email = username;
	  const auth = getAuth();
	
	  try {
		await setPersistence(auth, browserLocalPersistence);
		const usercred = await signInWithEmailAndPassword(auth, email, password);
		window.location.href = "/dashboard";
	  } catch (error) {
		let errorMessage = error.message;
		if (errorMessage.startsWith("Firebase: Error (")) {
		  errorMessage = getErrorMessage((error.message).split("Firebase: Error (")[1].split(").")[0]);
		} else if (errorMessage.startsWith("FirebaseError: Firebase: Error (")) {
		  errorMessage = errorMessage.split("FirebaseError: Firebase: Error (")[1].split(").")[0];
		} else if (errorMessage.includes("auth/too-many-requests")) {
		  errorMessage = "Access to your account has been temporarily disabled due to too many failed login attempts. You can immediately restore it by resetting your password or just try again a little bit later. Sorry!";
		}
		toast.error(errorMessage);
	  }
	};

	return (
		<div className="flex items-center h-screen justify-center p-4">
			<div className="flex h-full w-full items-center justify-center">
				<div className="flex w-full max-w-sm flex-col gap-4 rounded-lg">
					<div className="flex flex-col items-center pb-6">
						<div className="flex flex-row items-center space-x-2 mb-2">
							<span><img src="/assets/logo.png" className="cursor-pointer" alt="Censible coin icon" width={80} /></span>
						</div>
						<p className="text-xl font-medium">Login to Censible</p>
						<p className="text-sm text-default-500">to continue spending sensibly</p>
					</div>
					<form className="flex flex-col" onSubmit={continueWithID}>
						<div className="mb-3">
							<Input
								value={username}
								type="email"
								className={isInvalid && "mb-3"}
								label="Email"
								radius="sm"
								variant="faded"
								isInvalid={isInvalid}
								color={isInvalid ? "danger" : "default"}
								// placeholder="m0neysaver4@centsible.com"
								placeholder="&nbsp;"
								errorMessage="Please enter a valid email"
								onValueChange={setUsername}
								endContent={
									<Tooltip content={<div className="flex items-center justify-center"><p>For testing purposes,&nbsp;<a href="/dev/cyberaspect/tempcred">use these credentials</a></p></div>} key="hclogin" size="md" closeDelay={500} showArrow>
										<HelpCircle color={resolvedTheme === "dark" ? "#ababab" : "#666666"} className="ml-1 cursor-pointer" />
									</Tooltip>
								}
							/>
							<Input
								type="password"
								label="Password"
								name="password"
								radius="sm"
								variant="faded"
								placeholder="&nbsp;"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								isRequired
								// ref={passwordInputRef}
								// endContent={
								// 	<button className="outline-none" type="button" onClick={() => {
								// 		setIsVisible(!isVisible);
								// 		if (passwordInputRef.current) {
								// 			passwordInputRef.current.focus();
								// 		}
								// 	}} aria-label="toggle password visibility">
								// 		{isVisible ? (
								// 			<EyeIcon className="text-2xl text-default-400 pointer-events-none" />
								// 		) : (
								// 			<EyeOffIcon className="text-2xl text-default-400 pointer-events-none" />
								// 		)}
								// 	</button>
								// }
							/>
						</div>
						<div className="flex flex-col gap-2 w-full items-center justify-center">
							<Button className="w-full" type="submit" color="primary">Login</Button>
							{errorMessage ? <p className="italic text-default-600 text-sm">Failed to sign in: {errorMessage}</p> : null}
						</div>
					</form>
					{/* Continue With Google in CWG.html */}
					<p className="text-center text-sm">
						Don't have an account yet?&nbsp;
							<a className="text-primary no-underline hover:opacity-80" href="/dev/cyberaspect/tempcred">
								<span className="line-through">Sign Up</span>&nbsp;<span className="text-default-foreground">Click here for your temporary judge login</span>
							</a>
					</p>
				</div>
			</div>
		</div>
	);
}