import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FIREBASE_AUTH } from "../firebaseconfig";
import { ActivityIndicator } from "react-native-paper";
import { View } from "react-native";

interface AuthContextProps {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isVerified: boolean;
  setIsVerified: React.Dispatch<React.SetStateAction<boolean>>;
  userId: string | null; // Add userId to the context
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null); // State for userId
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsVerified(parsedUser.emailVerified || false);
          setUserId(parsedUser.uid || null); // Extract userId from the stored user
        }
      } catch (error) {
        console.error("Error loading user from Async Storage:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const unsubscribe = onAuthStateChanged(
      FIREBASE_AUTH,
      async (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          setIsVerified(currentUser.emailVerified);
          setUserId(currentUser.uid); // Set userId from Firebase user object
          await AsyncStorage.setItem("user", JSON.stringify(currentUser));
        } else {
          setUser(null);
          setIsVerified(false);
          setUserId(null); // Clear userId when logged out
          await AsyncStorage.removeItem("user");
        }
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <AuthContext.Provider
      value={{ user, setUser, isVerified, setIsVerified, userId }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
