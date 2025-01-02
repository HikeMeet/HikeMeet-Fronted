import { FIREBASE_AUTH } from "../../firebaseconfig";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { saveToken } from "../tokenService";
import { insertUserToBackend } from "../userService";

export const handleRegisterService = async (
  email: string,
  password: string,
  username: string,
  firstName: string,
  lastName: string
): Promise<void> => {
  try {
    console.log("Starting Firebase registration...");
    const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
    const user = userCredential.user;

    // Save token locally
    const token = await user.getIdToken();
    await saveToken(token);

    console.log("Sending email verification...");
    await sendEmailVerification(user);

    console.log("Registering user to backend...");
    await insertUserToBackend({ username, email, firstName, lastName, password });

    console.log("User successfully registered.");
  } catch (error: any) {
    console.error("Error during registration:", error.message);
    throw new Error(error.message || "An unexpected error occurred during registration.");
  }
};
