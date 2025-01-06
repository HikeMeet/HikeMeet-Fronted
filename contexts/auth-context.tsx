import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FIREBASE_AUTH } from "../firebaseconfig";
import { ActivityIndicator } from "react-native-paper";
import { View } from "react-native";
import { MongoUser } from "../interfaces/user-interface";

interface AuthContextProps {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isVerified: boolean;
  setIsVerified: React.Dispatch<React.SetStateAction<boolean>>;
  userId: string | null; // Add userId to the context
  mongoId: string | null; // MongoDB _id
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null); // State for userId
  const [mongoId, setMongoId] = useState<string | null>(null); // MongoDB _id

  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        const storedMongoId = await AsyncStorage.getItem("mongoId");

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsVerified(parsedUser.emailVerified || false);
          setUserId(parsedUser.uid || null); // Extract userId from the stored user
          if (storedMongoId) {
            setMongoId(storedMongoId);
          }
        }
      } catch (error) {
        console.error("Error loading user from AsyncStorage:", error);
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
          try {
            const response = await fetch(
              `${process.env.EXPO_LOCAL_SERVER}/api/user/${currentUser.uid}?firebase=true`
            );
            if (!response.ok) {
              throw new Error(`Error fetching user data: ${response.status}`);
            }
            const data: MongoUser = await response.json();
            setMongoId(data._id);
          } catch (error) {
            console.error("Error fetching user:", error);
          }

          //*******
          // endpoint */

          await AsyncStorage.setItem("user", JSON.stringify(currentUser));
          await AsyncStorage.setItem("mongoId", "");
        } else {
          setUser(null);
          setIsVerified(false);
          setUserId(null); // Clear userId when logged out
          await AsyncStorage.removeItem("user");
          await AsyncStorage.removeItem("mongoId");
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
      value={{ user, setUser, isVerified, setIsVerified, userId, mongoId }}
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
