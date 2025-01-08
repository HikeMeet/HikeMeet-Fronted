// firebaseconfig.ts (או js)

// 1) במקום לייבא getAuth מ-"firebase/auth", נייבא את initializeAuth ו-getReactNativePersistence
//    מתוך "firebase/auth/react-native"
// 2) נוסיף ייבוא של AsyncStorage מ-@react-native-async-storage/async-storage

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// נסה/י כך:
import {
  initializeAuth,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as firebaseAuth from "firebase/auth";
const reactNativePersistence = (firebaseAuth as any).getReactNativePersistence;

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);

// במקום getAuth(FIREBASE_APP), נשתמש ב-initializeAuth + AsyncStorage
export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
  persistence: reactNativePersistence(AsyncStorage),
});

export const FIREBASE_DB = getFirestore(FIREBASE_APP);

// אנליטיקס בריאקט נייטיב לרוב לא נתמך ממש "Out of the box",
// אבל אם זה לא זורק שגיאה אפשר להשאיר.
const analytics = getAnalytics(FIREBASE_APP);
