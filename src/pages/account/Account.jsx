import { useEffect, useState } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, CircularProgress, useDisclosure, Input, Popover, PopoverTrigger, PopoverContent } from "@nextui-org/react";
import { deleteUser, signOut, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import { auth } from "../../components/firebase";
import toast from "react-hot-toast";

export default function Account() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Settings />} />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
      />
      <Route
        path="/signup"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Signup />}
      />
    </Routes>
  );
}

export function Settings() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isDeleteBtn, setIsDeleteBtn] = useState(false);
  const [isJudge, setIsJudge] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const navigate = useNavigate();

  const onDeleteConfirmationValueChanged = (e) => {
    if (e.target.value.toLowerCase() === "create@hackgwinnett.org") {
      setIsDeleteBtn(false);
      setIsJudge(true);
    } else if (e.target.value.toLowerCase() === auth.currentUser.email) {
      setIsDeleteBtn(true);
      setIsJudge(false);
    } else {
      setIsDeleteBtn(false);
      setIsJudge(false);
    }
  };

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/account/login");
    }
  }, [auth.currentUser]);

  const logoutUser = async () => {
    try {
      await signOut(auth);
      console.log("User signed out");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const doOnOpen = () => {
    onOpen();
    onDeleteConfirmationValueChanged("");
  };

  const doOnClose = async (doDelete = false) => {
    onClose();
    setIsDeleteBtn(false);
    setIsJudge(false);

    if (doDelete) {
      try {
        const user = auth.currentUser;
        if (user) {
          await deleteUser(user);
          console.log("User deleted");
        } else {
          console.log("No user is signed in");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleChangePassword = async () => {
    setIsChangingPassword(true);
    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      toast.success("Password updated successfully!");
      setIsChangingPassword(false);
      onClose();
    } catch (error) {
      toast.error("Oops, that's an error... ", error);
      console.error("Error on handleChangePassword!!1:", error);
      setIsChangingPassword(false);
    }
  };

  return (
    <>
      <div className="flex flex-col h-screen items-center justify-center">
      <p className="text-lg">Back to the previous page?</p>
        <Button
          className="mt-2"
          color="primary"
          isDisabled={isOpen}
          onPress={() => window.history.back()}
        >
          Take me back, Chief!
        </Button>
        <br></br>
        <p className="text-lg">Log Out of Centsible</p>
        <p className="text-default-500">
          Don't worry, all your data will be here once you log in again.
        </p>
        <Button
          className="mt-2"
          color="default"
          isDisabled={isOpen}
          onPress={logoutUser}
        >
          See you later, alligator!
        </Button>
        <br></br>
        <p className="text-lg">Change Password</p>
        <p className="text-default-500">
          You're going to need your old password for this.
        </p>
        <Popover placement="top" showArrow offset={10}>
          <PopoverTrigger>
            <Button
              className="mt-2"
              color="default"
              isDisabled={isOpen}
              onPress={onOpen}
            >
              Change password
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="py-3 px-2">
              <Input
                className="mb-1"
                label="Current Password"
                // placeholder="Enter your current password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                variant="bordered"
              />
              <Input
                label="New Password"
                // placeholder="Enter the password you want to use"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                variant="bordered"
              />
              <Button
                className="mt-2"
                color="primary"
                isDisabled={isChangingPassword}
                onPress={handleChangePassword}
              >
                {isChangingPassword ? "Hold it..." : "Change Password"}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <br></br>
        <p>
          Deleting your account is permanent and cannot be undone.
        </p>
        <p className="text-default-500 text-sm">
          All budget data will be removed, including transactions, categories,
          and budget periods.
        </p>
        <Button
          className="mt-2"
          color="danger"
          isDisabled={isOpen}
          onPress={doOnOpen}
        >
          Delete account
        </Button>
      </div>
      <Modal
        isOpen={isOpen}
        onClose={doOnClose}
        backdrop={"blur"}
        hideCloseButton
        placement={"center"}
        size={"md"}
        motionProps={{
          variants: {
            enter: {
              opacity: 1,
              rotate: [-1, 1.3, 0, -1, 1.3, 0, -1, 1.3, 0, -1, 1.3, 0],
              transition: {
                opacity: {
                  duration: 0.3,
                  ease: "easeOut",
                },
                rotate: {
                  duration: 0.5,
                  ease: "linear",
                },
              },
            },
            exit: {
              opacity: 0,
              transition: {
                duration: 0.2,
              },
            },
          },
        }}
      >
        <ModalContent>
          {(doOnClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 -mb-4">
                Hey! Listen!
              </ModalHeader>
              <ModalBody>
                <p>
                  <span className="text-default-600">
                    We're sorry to see you go :&#40;
                  </span>
                  <br></br>To delete your account, type in your email below.
                </p>
                <Input
                  autoFocus={true}
                  onChange={(e) => onDeleteConfirmationValueChanged(e)}
                  placeholder="Enter your email"
                />
                {isJudge && (
                  <p className="-mt-1 text-default-500 text-sm cursor-default">
                    You don't own this account. Only{" "}
                    <span className="text-white">cybraspct_dev</span> can remove
                    it.
                  </p>
                )}
              </ModalBody>
              <ModalFooter>
                <Button onPress={doOnClose}>Nevermind! 😲</Button>
                <Button
                  color="danger"
                  isDisabled={!isDeleteBtn}
                  onPress={() => doOnClose(true)}
                >
                  Goodbye! 😢
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}