import { FIREBASE_AUTH } from "../../firebaseconfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

export interface FirebaseAuthResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export const createFirebaseUser = async (
  email: string,
  password: string
): Promise<FirebaseAuthResponse> => {
  try {
    const result = await createUserWithEmailAndPassword(
      FIREBASE_AUTH,
      email,
      password
    );
    return { success: true, data: result.user };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to create user in Firebase.",
    };
  }
};

export const loginFirebaseUser = async (
  email: string,
  password: string
): Promise<FirebaseAuthResponse> => {
  try {
    const result = await signInWithEmailAndPassword(
      FIREBASE_AUTH,
      email,
      password
    );
    return { success: true, data: result.user };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to log in to Firebase.",
    };
  }
};
