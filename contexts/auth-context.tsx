import React, { createContext, useContext, useEffect, useState } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onAuthStateChanged, User } from "firebase/auth";
import { FIREBASE_AUTH } from "../firebaseconfig";
import { MongoUser } from "../interfaces/user-interface";
import { IUser } from "../interfaces/post-interface";
import { styled } from "nativewind";
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledActivityIndicator = styled(ActivityIndicator);
interface AuthContextProps {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isVerified: boolean;
  setIsVerified: React.Dispatch<React.SetStateAction<boolean>>;
  userId: string | null;
  mongoId: string | null;
  setMongoId: React.Dispatch<React.SetStateAction<string | null>>;
  mongoUser: MongoUser | null;
  setMongoUser: React.Dispatch<React.SetStateAction<MongoUser | null>>;
  Users: IUser[];
  setUsers: React.Dispatch<React.SetStateAction<IUser[]>>;
  userFriendsMinDetail: MongoUser[];
  setUserFriendsMinDetail: React.Dispatch<React.SetStateAction<MongoUser[]>>;
  fetchMongoUser: (mongoIdToFetch: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // — your existing state
  const [user, setUser] = useState<User | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [mongoId, setMongoId] = useState<string | null>(null);
  const [mongoUser, setMongoUser] = useState<MongoUser | null>(null);
  const [Users, setUsers] = useState<IUser[]>([]);
  const [userFriendsMinDetail, setUserFriendsMinDetail] = useState<MongoUser[]>(
    []
  );

  // — loading & coordination flags
  const [loading, setLoading] = useState(true);
  const [cacheLoaded, setCacheLoaded] = useState(false);
  const [authHandled, setAuthHandled] = useState(false);

  // — ping your backend root or health
  // 1) A utility that aborts fetch after `timeoutMs`
  const fetchWithTimeout = async (
    url: string,
    options: RequestInit = {},
    timeoutMs = 3_000
  ): Promise<Response> => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(id);
    }
  };

  // 2) Use it in your pingBackend
  const pingBackend = async (): Promise<boolean> => {
    try {
      const res = await fetchWithTimeout(
        `${process.env.EXPO_LOCAL_SERVER}/api`,
        {},
        1_000 // give up after 1 second
      );
      return res.ok;
    } catch (err: any) {
      // if it was aborted or network‑down, we get here fast
      console.warn("Health check error:", err.name || err);
      return false;
    }
  };
  const waitForBackend = async (
    intervalMs = 2000,
    maxRetries = 35
  ): Promise<void> => {
    let attempts = 0;
    while (attempts < maxRetries) {
      if (await pingBackend()) {
        return;
      }
      attempts++;
      console.warn(`Health-check retry #${attempts}`);
      await new Promise((r) => setTimeout(r, intervalMs));
    }
    console.error(`Backend unreachable after ${maxRetries} attempts.`);
    // optionally throw here to stop startup
  };

  // — fetch Mongo user helper
  const fetchMongoUser = async (mongoIdToFetch: string) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/user/${mongoIdToFetch}`
      );
      if (!response.ok) {
        throw new Error(`Error fetching user data: ${response.status}`);
      }
      const data: MongoUser = await response.json();
      setMongoUser(data);
      setMongoId(data._id);
      await AsyncStorage.setItem("mongoId", data._id);
    } catch (error) {
      console.error("Error updating Mongo user:", error);
    }
  };

  // — load cached user & mongoId, then flag cacheLoaded
  const initializeAuth = async () => {
    await waitForBackend();
    try {
      const storedUser = await AsyncStorage.getItem("user");
      const storedMongoId = await AsyncStorage.getItem("mongoId");

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser) as User;
        setUser(parsedUser);
        setIsVerified(parsedUser.emailVerified || false);
        setUserId(parsedUser.uid || null);

        if (storedMongoId) {
          setMongoId(storedMongoId);
          fetchMongoUser(storedMongoId);
        }
      }
    } catch (err) {
      console.error("Error loading user from AsyncStorage:", err);
    } finally {
      setCacheLoaded(true);
    }
  };

  // — main effect: bootstrap cache load then auth subscription
  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | null = null;

    const bootstrap = async () => {
      await initializeAuth();

      unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (currentUser) => {
        if (!isMounted) return;

        if (currentUser) {
          setUser(currentUser);
          setIsVerified(currentUser.emailVerified);
          setUserId(currentUser.uid);
          await AsyncStorage.setItem("user", JSON.stringify(currentUser));

          if (currentUser.emailVerified) {
            try {
              // fetch Mongo user via firebase_id
              const resp = await fetch(
                `${process.env.EXPO_LOCAL_SERVER}/api/user/${currentUser.uid}?firebase=true`
              );
              if (!resp.ok) {
                throw new Error(`Fetch error: ${resp.status}`);
              }
              const data: MongoUser = await resp.json();
              setMongoId(data._id);
              setMongoUser(data);
              await AsyncStorage.setItem("mongoId", data._id);

              // fetch partial-all users
              const usersResp = await fetch(
                `${process.env.EXPO_LOCAL_SERVER}/api/user/partial-all`
              );
              if (!usersResp.ok) {
                throw new Error(`Fetch error: ${usersResp.status}`);
              }
              setUsers(await usersResp.json());
            } catch (error) {
              console.error("Error fetching user data:", error);
            }
          }
        } else {
          // no user
          console.log("No user is logged in");
          setUser(null);
          setIsVerified(false);
          setUserId(null);
          setMongoId(null);
          setMongoUser(null);
          setUsers([]);
          setUserFriendsMinDetail([]);
          await AsyncStorage.removeItem("user");
          await AsyncStorage.removeItem("mongoId");
        }

        // only on the first auth event do we mark it handled
        if (!authHandled) {
          setAuthHandled(true);
        }
      });
    };

    bootstrap();

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, []);

  // — turn off the spinner once both cache load & authHandled are true
  useEffect(() => {
    if (cacheLoaded && authHandled) {
      setLoading(false);
    }
  }, [cacheLoaded, authHandled]);

  if (loading) {
    return (
      <StyledView className="flex-1 justify-center items-center bg-white p-5">
        <StyledActivityIndicator size="large" color="#007AFF" />
        <StyledText className="mt-4 text-lg text-gray-600 text-center">
          Waiting for server to load…
        </StyledText>
      </StyledView>
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
        fetchMongoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
