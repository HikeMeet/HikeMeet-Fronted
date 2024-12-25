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
  apiKey: "AIzaSyDEaZ1g62ZbD-m4c5tPOpUpyuWV-cn1QF4",
  authDomain: "hikemeet-a918c.firebaseapp.com",
  projectId: "hikemeet-a918c",
  storageBucket: "hikemeet-a918c.firebasestorage.app",
  messagingSenderId: "887562416024",
  appId: "1:887562416024:web:22ca1d6acb12ea7b0f05ed",
  measurementId: "G-FL074B78P0"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_DB = getFirestore(FIREBASE_APP);


const analytics = getAnalytics(FIREBASE_APP);