import { Button, Input, Tooltip, Divider } from "@nextui-org/react";
import { useState, useEffect, useMemo } from "react";
import { link } from "../../components/styles";
import { HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";

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
    // Add more error codes and messages as needed
  };

  return errorMessages[errorCode] || 'An unknown error occurred!';
};

export default function Login() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [visible, isVisible] = useState(false);
	const [errorMessage, setErrorMessage] = useState(null);
	const { theme, resolvedTheme } = useTheme();

  const isInvalid = useMemo(() => {
    if (username === "") return false;

    return username.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i) ? false : true;
  }, [username]);

  const continueWithID = async (e) => {
    e.preventDefault();
    
    const email = value;
    const verifyIdentity = new Promise(async (resolve, reject) => {
      try {
        const usercred = await signInWithEmailAndPassword(auth, email, password);
        navigate('/account');
        resolve();
      } catch (error) {
        let errorMessage = error.message;
        if (errorMessage.startsWith("Firebase: Error (")) {
          errorMessage = getErrorMessage((error.message).split("Firebase: Error (")[1].split(").")[0]);
        } else if (errorMessage.startsWith("FirebaseError: Firebase: Error (")) {
          errorMessage = errorMessage.split("FirebaseError: Firebase: Error (")[1].split(").")[0];
        } else if (errorMessage.includes("auth/too-many-requests")) {
          errorMessage = "Access to your account has been temporarily disabled due to too many failed login attempts. You can immediately restore it by resetting your password or just try again a little bit later. Sorry!";
        }
        console.error("Error signing in:", error);
        setErrorMessage(errorMessage);
        reject(new Error(errorMessage));
      }
    });
  
    toast.promise(verifyIdentity, {
      loading: 'Verifying your identity... hang tight!',
      success: 'Welcome in!',
      error: (error) => `Failed to sign in: ${error.message}`,
    });
  };


	return (
		<div className="flex items-center h-screen justify-center p-4">
			<div className="flex h-full w-full items-center justify-center">
				<div className="flex w-full max-w-sm flex-col gap-4 rounded-lg">
					<div className="flex flex-col items-center pb-6">
						<div className="flex flex-row items-center space-x-2 mb-2">
							<span><img src="/assets/intellectra.png" alt="Intellectra! logo" width={120} /></span>
							<Divider orientation="vertical" />
							<span><img src="/assets/infinite_icon.png" alt="Infinite icon" width={120} /></span>
						</div>
						<p className="text-xl font-medium">Login with Intellectra!</p>
						<p className="text-sm text-default-500">to continue to Infinite Network</p>
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
								placeholder="m0neysaver4@centsible.com"
								errorMessage="Please enter a valid email"
								onValueChange={setUsername}
								endContent={
									<Tooltip content={<div className="flex items-center justify-center"><p>For testing purposes,&nbsp;<Link className={link()} to="/dev/playintellectra/cyberaspect/secure.md">use these credentials</Link></p></div>} key="hclogin" size="md" closeDelay={500} showArrow>
										<HelpCircle color={resolvedTheme === "dark" ? "#ababab" : "#666666"} className="ml-1 cursor-pointer" />
									</Tooltip>
								}
							/>
							<Input
								type={isVisible ? "text" : "password"}
								label="Password"
								name="password"
								radius="sm"
								variant="faded"
								placeholder="•••••••••••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								isClearable
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
						<Link to="/dev/playintellectra/cyberaspect/secure.md" className="text-primary no-underline hover:opacity-80">
							<span className="line-through">Sign Up</span>&nbsp;<span className="text-default-foreground">Click here for your temporary judge login</span>
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}