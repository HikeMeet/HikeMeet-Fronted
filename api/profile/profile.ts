import axios from "axios";
import { getToken } from "../tokenService";
import { jwtDecode } from "jwt-decode";

export interface UserProfile {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  bio?: string;
  rank?: string;
  posts?: Array<{
    title: string;
    content: string;
    date: Date;
  }>;
}

export const fetchUserProfile = async (userId: any) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("Token not found. Please login again.");
    }

    // Decode the token to extract user ID
    const decodedToken = jwtDecode<{ user_id: string }>(token);
    const userId = decodedToken.user_id;

    const response = await fetch(`${process.env.EXPO_BASE_IP}/api/user/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user profile.");
    }

    const userProfile = await response.json();
    return userProfile;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};
