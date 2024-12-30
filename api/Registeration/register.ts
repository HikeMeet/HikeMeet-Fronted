import axios from "axios";
export interface RegisterUserParams {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RegisterUserResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export const registerUser = async ({
  username,
  email,
  password,
  firstName,
  lastName,
}: RegisterUserParams): Promise<RegisterUserResponse> => {
  try {
    const response = await axios.post(`${process.env.EXPO_BASE_IP}/api/user/insert`, {
      username,
      email,
      password,
      firstName,
      lastName,
    });

    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Unable connecting to the server.",
    };
  }
};
