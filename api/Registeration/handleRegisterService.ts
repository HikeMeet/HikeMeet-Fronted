import { registerUser } from "./register";
import { createFirebaseUser } from "./firebaseAuth";

export interface RegisterServiceParams {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const handleRegisterService = async ({
  username,
  email,
  password,
  firstName,
  lastName,
}: RegisterServiceParams): Promise<{ success: boolean; error?: string }> => {
  try {
    const serverResponse = await registerUser({username,email,password,firstName,lastName});

    if (!serverResponse.success) {
      throw new Error(serverResponse.error);
    }

    const firebaseResponse = await createFirebaseUser(email, password);

    if (!firebaseResponse.success) {
      throw new Error(firebaseResponse.error);
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Registration failed." };
  }
};
