import { initializeApp } from "firebase/app";
import { getFirestore, collection } from "firebase/firestore";
import { initializeAuth } from "firebase/auth";
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

// Instead of getAuth(FIREBASE_APP), we will use initializeAuth + AsyncStorage
export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
  persistence: reactNativePersistence(AsyncStorage),
});

export const FIREBASE_DB = getFirestore(FIREBASE_APP);

export const USERS_COLLECTION = collection(FIREBASE_DB, "users");
export const ROOMS_COLLECTION = collection(FIREBASE_DB, "rooms");
