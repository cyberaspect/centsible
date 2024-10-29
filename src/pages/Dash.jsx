import React, { useEffect, useState } from 'react';
import { auth, db } from '../components/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Avatar, Button, CircularProgress, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, Link, Navbar, NavbarBrand, NavbarContent, NavbarItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@nextui-org/react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { setTitle } from '../App';
import { Coins, CoinsIcon } from 'lucide-react';
import TotalBalance from './dash/TotalBalance';
import ActionButton from './dash/Action';

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

export default function Dash() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [oneTimePopoverVisible, setOneTimePopoverVisible] = useState(true);
  const [subscriptionPopoverVisible, setSubscriptionPopoverVisible] = useState(true);

  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleOneTimeClick = () => {
    setOneTimePopoverVisible(true);
    setSubscriptionPopoverVisible(false);
  };

  const handleSubscriptionClick = () => {
    setSubscriptionPopoverVisible(true);
    setOneTimePopoverVisible(false);
  };

  const handleHelpClick = () => {
    setIsHelpModalOpen(true);
  };

  const handleCloseHelpModal = () => {
    setIsHelpModalOpen(false);
  };

  useEffect(() => {
    setTitle("Centsible Dashboard", false);
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, 'hc5', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
            // console.log(userData);
          } else {
            console.log('CreateUser Error: User document not found');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // useEffect(() => {
  //   const handleKeyPress = (event) => {
  //     if (event.key === 'e') {
  //       console.log(userData);
  //       console.log(auth.currentUser);
  //     }
  //   };

  //   window.addEventListener('keypress', handleKeyPress);

  //   return () => {
  //     window.removeEventListener('keypress', handleKeyPress);
  //   };
  // }, [userData]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("You've signed out. Goodbye, friend!");
      navigate("/");
    } catch (error) {
      console.error("Error on logout:", error);
    }
  };

  if (loading) {
    const randomMessage = randomLoadingMessages[randint(0, randomLoadingMessages.length - 1)];
    
    return (
      <div className="flex flex-col h-screen items-center justify-center">
        <CircularProgress className="mb-2" aria-label="Loading..." />
        <p className="text-default-600"><span className="text-default-400">{randomMessage}</span>&nbsp;Hang tight!</p>
      </div>
    );
  }

  return (
    <>
      <ReNavbar userData={userData} handleHelp={handleHelpClick} />
      <HelpFormModal isOpen={isHelpModalOpen} onClose={handleCloseHelpModal} />
      <Routes>
        <Route path="/" element={<Home userData={userData} />} />
        <Route path="/edit" element={<Edit userData={userData} />} />
      </Routes>
      <ActionButton userData={userData} />
    </>
  );
};

export function Home({ userData }) {
  useEffect(() => {
    setTitle("F - Dashboard");
  }, []);

  return (
    <div>
      <div className="p-10 mt-5 grid grid-cols-1 gap-8">
        <div
          className={`grid md:grid-cols-2 mdb:grid-cols-2 xl:grid-cols-3 gap-8`}
        >
          <TotalBalance />
          <p>AreaChartBox</p>
          <p>YourCards</p>
          <div className="hidden md:inline-block xl:hidden h-[100%]">
            <p>curmarket</p>
          </div>
        </div>
        <div className="grid grid-cols-12 grid-rows-12 child:gap-8 space-y-8 xl:space-x-8">
          <div className={`col-span-12 2xl:col-span-9 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 row-span-12`}>
              <p>income info map</p>
            <div className="md:hidden xl:inline-block">
              <p>cur</p>
            </div>
            <div className="md:col-span-2 xl:col-span-3">
              <p>curtable</p>
            </div>
          </div>
          {/* //TODO should fix margin start */}
          <div className="col-span-12 grid md:grid-cols-2 2xl:grid-cols-1 2xl:col-span-3 row-span-12 space-y-8 !ms-0 2xl:!ms-8 2xl:!mt-0">
<p>Quick Transfer</p>
<p>Bebop</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Edit({ userData }) {
  useEffect(() => {
    setTitle("Edit Budget - Dashboard");
  }, []);

  return (
    <div>
      <h1>Edit</h1>
    </div>
  );
}

export function ReNavbar({ userData, handleHelp }) {
  const navigate = useNavigate();
  const [curLoc, setCurLoc] = useState(window.location.pathname);

  useEffect(() => {
    setCurLoc(window.location.pathname);
  }, [curLoc]);

  const isLoc = (path) => {
    let curPath = curLoc;
    if (curPath.startsWith('/dashboard')) {
      curPath = curPath.replace('/dashboard', '') || '/';
    }

    return path === curPath;
  }

  return (
    <>
      <Navbar>
        <NavbarBrand className="flex-row gap-x-1">
          <CoinsIcon />
          <p className="text-inherit">BE <span className="font-bold">CENTSIBLE</span></p>
        </NavbarBrand>
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem isActive={isLoc('/')}>
            <Link href="/dashboard" color={isLoc('/') ? "warning" : "foreground"} aria-current={isLoc('/') ? "page" : null}>
              Overview
            </Link>
          </NavbarItem>
          <NavbarItem isActive={isLoc('/custom')}>
            <Link href="/dashboard" color={isLoc('/custom') ? "warning" : "foreground"} aria-current={isLoc('/custom') ? "page" : null}>
              History
            </Link>
          </NavbarItem>
          <NavbarItem isActive={isLoc('/custom')}>
            <Link href="/dashboard" color={isLoc('/custom') ? "warning" : "foreground"} aria-current={isLoc('/custom') ? "page" : null}>
              Account
            </Link>
          </NavbarItem>
        </NavbarContent>

        <NavbarContent as="div" justify="end">
          <Dropdown placement="bottom-end" aria-label='Account Options'>
            <DropdownTrigger>
              <Avatar
                as="button"
                className="transition-transform"
                color="warning"
                name={userData?.name ? `${userData?.name.split(' ')[0][0].toUpperCase()}${userData.name.split(' ')[1][0].toUpperCase()}` : 'G'}
                size="sm"
                src={auth.currentUser?.photoURL || undefined}
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="profile" aria-label="profile" className="gap-2"> {/* h14 */}
                <p className="font-semibold">{userData?.name}</p>
                <p className="text-default-500">{auth.currentUser?.email}</p>
              </DropdownItem>
              <DropdownItem onPress={() => navigate('/account')} key="account">My Account</DropdownItem>
              <DropdownItem key="history" aria-label="history">Transaction History</DropdownItem>
              <DropdownItem key="configurations" aria-label="config">Configurations</DropdownItem>
              <DropdownItem key="help_and_feedback" aria-label="help_and_feedback" onPress={handleHelp}>Help & Feedback</DropdownItem>
              <DropdownItem key="logout" aria-label="logout" color="danger" onPress={() => navigate('/account')}>
                Log Out {userData?.name ? `${userData.name.split(' ')[0]}...` : ''}
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>
      </Navbar>
    </>
  );
}

export function HelpFormModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" className="absolute">
      <ModalContent>
        <ModalHeader>Help & Feedback</ModalHeader>
        <ModalBody>
          <iframe
            src="https://docs.google.com/forms/d/e/1FAIpQLSdDUk9UVgTksktwJvEGItrJ9GOetH7pmUWFatyO_-UieCQClw/viewform?embedded=true"
            height={window.innerHeight - 200}
            aria-label="Help & Feedback Form"
            className='-mt-3'
          >
            <CircularProgress />
          </iframe>
        </ModalBody>
        <ModalFooter className="-mt-16">
          <Button radius="none" color="warning" onPress={onClose}>
            I'm done!
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}