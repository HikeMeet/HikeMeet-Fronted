import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FIREBASE_AUTH } from "../firebaseconfig";
import { ActivityIndicator, View } from "react-native";
import { MongoUser } from "../interfaces/user-interface";
import { IUser } from "../interfaces/post-interface";

interface AuthContextProps {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isVerified: boolean;
  setIsVerified: React.Dispatch<React.SetStateAction<boolean>>;
  userId: string | null; // firebase_id
  mongoId: string | null; // MongoDB _id
  mongoUser: MongoUser | null;
  setMongoUser: React.Dispatch<React.SetStateAction<MongoUser | null>>;
  Users: IUser[] | [];
  setUsers: React.Dispatch<React.SetStateAction<IUser[] | []>>;

  setMongoId: React.Dispatch<React.SetStateAction<string | null>>;
  userFriendsMinDetail: MongoUser[];
  setUserFriendsMinDetail: React.Dispatch<React.SetStateAction<MongoUser[]>>;
  fetchMongoUser: (mongoIdToFetch: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [mongoId, setMongoId] = useState<string | null>(null);
  const [mongoUser, setMongoUser] = useState<MongoUser | null>(null);
  const [Users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userFriendsMinDetail, setUserFriendsMinDetail] = useState<MongoUser[]>(
    []
  );

  // Function to fetch Mongo user by mongoId or firebase id if necessary.
  const fetchMongoUser = async (mongoIdToFetch: string) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/user/${mongoIdToFetch}`
      );
      if (!response.ok) {
        throw new Error(`Error fetching user data: ${response.status}`);
      }
      const data: MongoUser = await response.json();
      console.log("Fetched Mongossssssssssssss user:", data);
      setMongoUser(data);

      // Optionally update mongoId if needed.
      setMongoId(data._id);
      await AsyncStorage.setItem("mongoId", data._id);
    } catch (error) {
      console.log("Error updating Mongo user:", error);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        const storedMongoId = await AsyncStorage.getItem("mongoId");

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsVerified(parsedUser.emailVerified || false);
          setUserId(parsedUser.uid || null);
          if (storedMongoId) {
            setMongoId(storedMongoId);
            fetchMongoUser(storedMongoId);
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
          setUserId(currentUser.uid);

          if (currentUser.emailVerified) {
            try {
              console.log("Fetching user from MongoDB...");
              // This endpoint fetches Mongo user using the firebase_id
              const response = await fetch(
                `${process.env.EXPO_LOCAL_SERVER}/api/user/${currentUser.uid}?firebase=true`
              );
              if (!response.ok) {
                throw new Error(`Error fetching user data: ${response.status}`);
              }
              const data: MongoUser = await response.json();
              setMongoId(data._id);
              setMongoUser(data);
              await AsyncStorage.setItem("user", JSON.stringify(currentUser));
              await AsyncStorage.setItem("mongoId", data._id);

              const usersResponse = await fetch(
                `${process.env.EXPO_LOCAL_SERVER}/api/user/partial-all`
              );
              if (!usersResponse.ok) {
                throw new Error(
                  `Error fetching user data: ${usersResponse.status}`
                );
              }
              setUsers(await usersResponse.json());
            } catch (error) {
              console.error("Error fetching user:", error);
            }
          }

          await AsyncStorage.setItem("user", JSON.stringify(currentUser));
        } else {
          console.log("No user is logged in");
          setUser(null);
          setIsVerified(false);
          setUserId(null);
          setMongoId(null);
          setUsers([]);
          setMongoUser(null);
          setUserFriendsMinDetail([]);
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
      value={{
        user,
        setUser,
        isVerified,
        setIsVerified,
        userId,
        mongoId,
        setMongoId,
        mongoUser,
        setMongoUser,
        Users,
        setUsers,
        userFriendsMinDetail,
        setUserFriendsMinDetail,
        fetchMongoUser, // Expose the function here
      }}
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
