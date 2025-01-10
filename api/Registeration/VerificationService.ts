import axios from "axios";

// Interfaces for input and output
export interface VerificationRequestParams {
  username: string;
  email: string;
}

export interface VerificationResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface CodeVerificationParams {
  email: string;
  code: string;
}

export const sendVerificationCode = async ({
  username,
  email,
  password,
}: VerificationRequestParams & {
  password: string;
}): Promise<VerificationResponse> => {
  try {
    const response = await axios.post(
      `http://192.168.0.102:5000/api/request-verification`,
      {
        username,
        email,
        password,
      }
    );
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      error:
        error.response?.data?.message || "Failed to send verification code.",
    };
  }
};

export const verifyEmailCode = async ({
  email,
  code,
}: CodeVerificationParams): Promise<VerificationResponse> => {
  try {
    const response = await axios.post(
      `http://192.168.0.102:5000/api/verify-code`,
      {
        email,
        code,
      }
    );
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Invalid verification code.",
    };
  }
};

export const resendVerificationCode = async ({
  email,
}: Pick<VerificationRequestParams, "email">): Promise<VerificationResponse> => {
  try {
    console.log("Email passed to resendVerificationCode:", email); // בדוק את הערך של email כאן
    const response = await axios.post(
      `http://192.168.0.102:5000/api/resend-code`,
      {
        email,
      }
    );
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      error:
        error.response?.data?.message || "Failed to resend verification code.",
    };
  }
};
