import React, { useEffect, useState } from 'react';
import { auth, db } from '../components/firebase';
import { doc, getDoc, collection, getDocs, onSnapshot } from 'firebase/firestore'; // snapshots?
import { signOut } from 'firebase/auth';
import { Avatar, Button, CircularProgress, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, Link, Navbar, NavbarBrand, NavbarContent, NavbarItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@nextui-org/react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { setTitle } from '../App';
import { DollarSign, CoinsIcon, BellIcon } from 'lucide-react';
import TotalBalance from './dash/TotalBalance';
import ActionButton from './dash/Action';
import { NumericFormat } from 'react-number-format';
import Rechart from './dash/Rechart';
import RechartTags from './dash/RechartTags';
import Retable from './dash/Retable';
import HistoryTable from './dash/Table';
import { useTheme } from 'next-themes';

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
];

function randint(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function Dash() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [oneTimePopoverVisible, setOneTimePopoverVisible] = useState(true);
  const [subscriptionPopoverVisible, setSubscriptionPopoverVisible] = useState(true);
  const [purchases, setPurchases] = useState([]);

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
    const user = auth.currentUser;
    if (!user) return;

    const userDocRef = doc(db, 'hc5', user.uid);

    const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        setUserData(doc.data());
      } else {
        console.log('CreateUser Error: User document not found');
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching user data:', error);
      setLoading(false);
    });

    const purchasesCollectionRef = collection(db, "hc5", user.uid, "purchases");

    const unsubscribePurchases = onSnapshot(purchasesCollectionRef, (snapshot) => {
      const purchasesData = [];
      snapshot.forEach((doc) => {
        purchasesData.push({ id: doc.id, ...doc.data() });
      });
      setPurchases(purchasesData);
    }, (error) => {
      console.error('Error fetching purchases:', error);
    });

    return () => {
      unsubscribeUser();
      unsubscribePurchases();
    };
  }, []);

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
        <Route path="/" element={<Home userData={userData} purchases={purchases} />} />
        <Route path="/history" element={<History userData={userData} />} />
        <Route path="/settings" element={<Edit userData={userData} />} />
      </Routes>
      <ActionButton userData={userData} />
    </>
  );
}

export function Home({ userData, purchases }) {
  useEffect(() => {
    setTitle("Centsible Dashboard", false);
  }, []);

  // grid md:grid-cols-12 mdb:grid-cols-2 xl:grid-cols-3 gap-4 p-6
  // className="col-span-4 row-span-10 bg-default-100 rounded-2xl p-6 flex items-center justify-center"
  // className="col-span-1 row-span-1 bg-default-100 rounded-2xl p-6 flex items-center justify-between"

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 grid-rows-3 gap-4 p-6 grid-flow-row-dense h-full">
      <div className="col-span-1 space-y-2">
        <div className="bg-default-100 rounded-2xl p-3 flex items-center justify-center">
          <p className="text-default-500">Happy {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()]}, {userData?.name ? userData.name.split(" ")[0] : "Guest"}!</p>
        </div>
        <div className="bg-default-100 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-default-500">Total Balance</p>
            <h2 className="text-2xl font-semibold text-default-900">
            <NumericFormat value={userData?.balance} displayType={'text'} thousandSeparator={true} prefix={'$'} />
            </h2>
          </div>
          <div className="flex items-center justify-center bg-default-200 rounded-full h-12 w-12">
            <DollarSign />
          </div>
        </div>
        
        <div className="bg-default-100 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-default-500">Alerts</p>
            <h2 className="text-2xl font-semibold text-default-900">
              {userData?.balance < 0 ? (
                "You are in debt!"
              ) : "No new alerts"}
            </h2>
          </div>
          <div className="flex items-center justify-center bg-default-200 rounded-full h-12 w-12">
            <BellIcon />
          </div>
        </div>
      </div>

      <div className="col-span-4 sm:col-span-3 row-span-1">
        <Retable />
      </div>
      
      <div className="col-span-4 sm:col-span-2 row-span-1">
        <Rechart purchases={purchases} />
      </div>

      <div className="col-span-4 sm:col-span-2 row-span-1">
        <RechartTags purchases={purchases} />
      </div>

      <div className="col-span-4">
        <div className="bg-default-100 rounded-2xl p-3 flex items-center justify-center">
          <p className="text-default-500">Let's get saving!</p>
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
      <h1>Budget Settings</h1>
    </div>
  );
}

export function History({ userData }) {
  useEffect(() => {
    setTitle("History - Dashboard");
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-5">Transaction History</h1>
      <HistoryTable />
    </div>
  );
}

export function ReNavbar({ userData, handleHelp }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [curLoc, setCurLoc] = useState(location.pathname);
  const {resolvedTheme, setTheme} = useTheme();

  useEffect(() => {
    setCurLoc(location.pathname);
  }, [location]);

  const isLoc = (path) => {
    let curPath = curLoc;
    if (curPath.startsWith('/dashboard')) {
      curPath = curPath.replace('/dashboard', '') || '/';
    }
    return path === curPath;
  };

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
          <NavbarItem isActive={isLoc('/history')}>
            <Link href="/dashboard/history" color={isLoc('/history') ? "warning" : "foreground"} aria-current={isLoc('/history') ? "page" : null}>
              History
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link className={resolvedTheme === "dark" ? "text-white cursor-pointer" : "text-black cursor-pointer"} onPress={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
              {resolvedTheme === "dark" ? "Light Theme" : "Dark Theme"} {/* 🌞🌙 */}
            </Link>
          </NavbarItem>
          {/* <NavbarItem isActive={isLoc('/settings')}>
            <Link href="/dashboard/settings" color={isLoc('/settings') ? "warning" : "foreground"} aria-current={isLoc('/settings') ? "page" : null}>
              Settings
            </Link>
          </NavbarItem> */}
        </NavbarContent>

        <NavbarContent as="div" justify="end">
          <Dropdown placement="bottom-end">
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
              <DropdownItem onPress={() => navigate('/dashboard')} key="profile" className="gap-2">
                <p className="font-semibold">{userData?.name}</p>
                <p className="text-default-500">{auth.currentUser?.email}</p>
              </DropdownItem>
              <DropdownItem onPress={() => navigate('/account')} key="account">My Account</DropdownItem>
              <DropdownItem onPress={() => navigate('/dashboard/history')} key="team_settings">Transaction History</DropdownItem>
              <DropdownItem onPress={() => navigate('/dashboard/settings')} key="settings">Edit Budget</DropdownItem>
              <DropdownItem key="help_and_feedback" onPress={handleHelp}>Help & Feedback</DropdownItem>
              <DropdownItem key="logout" color="danger" onPress={() => navigate('/account')}>
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>
      </Navbar>
    </>
  );
}

export function HelpFormModal({ isOpen, onClose }) {
  const [btnVisible, setBtnVisible] = useState(true);
  const [btnOff, setBtnOff] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setBtnVisible(false);
    setTimeout(() => {
      setBtnVisible(true);
    }, 1200);
  }, [isOpen]);

  useEffect(() => {
    if (btnVisible) return;
    setBtnOff(true);
    setTimeout(() => {
      setBtnOff(false);
    }, 5000);
  }, [btnVisible]);

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
          <Button radius="none" className={!btnVisible ? "invisible" : null} color="warning" onPress={onClose} isDisabled={btnOff}>
            I'm done!
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}