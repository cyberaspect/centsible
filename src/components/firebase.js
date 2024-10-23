// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "hackgwinnett-72d44.firebaseapp.com",
  projectId: "hackgwinnett-72d44",
  storageBucket: "hackgwinnett-72d44.appspot.com",
  messagingSenderId: "99056626704",
  appId: "1:99056626704:web:ffa5d68bc703c77c7a6e95",
  measurementId: "G-CGRWH6F405"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { analytics, auth, db };
