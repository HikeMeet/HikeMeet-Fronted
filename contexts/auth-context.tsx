import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ActivityIndicator, View, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onAuthStateChanged, User } from "firebase/auth";
import { FIREBASE_AUTH, FIREBASE_DB } from "../firebaseconfig";
import { MongoUser } from "../interfaces/user-interface";
import { IUser } from "../interfaces/post-interface";
import { styled } from "nativewind";
import * as Location from "expo-location";

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
  users: IUser[];
  setUsers: React.Dispatch<React.SetStateAction<IUser[]>>;
  userFriendsMinDetail: MongoUser[];
  setUserFriendsMinDetail: React.Dispatch<React.SetStateAction<MongoUser[]>>;
  fetchMongoUser: (id: string, byFirebase?: boolean) => Promise<void>;
  getToken: () => Promise<string | null>;
  userLocationState: [number, number] | null;
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
  const [users, setUsers] = useState<IUser[]>([]);
  const [userLocationState, setUserLocation] = useState<
    [number, number] | null
  >(null);
  const [userFriendsMinDetail, setUserFriendsMinDetail] = useState<MongoUser[]>(
    []
  );
  // — loading & coordination flags
  const [loading, setLoading] = useState(true);
  const [cacheLoaded, setCacheLoaded] = useState(false);
  const [authHandled, setAuthHandled] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;
      setUserLocation([longitude, latitude]);
    })();
  }, []);

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
  const fetchMongoUser = useCallback(async (id: string, byFirebase = false) => {
    const suffix = byFirebase ? "?firebase=true" : "";
    const url = `${process.env.EXPO_LOCAL_SERVER}/api/user/${id}${suffix}`;
    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error(`Error fetching user data: ${resp.status}`);
    }
    const data: MongoUser = await resp.json();
    setMongoUser(data);
    setMongoId(data._id);
    await AsyncStorage.setItem("mongoId", data._id);
  }, []);

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

  // — getToken
  const getToken = async () => {
    if (user) {
      const token = await user.getIdToken(true);
      return token;
    }
    return null;
  };

  const authContextValue = useMemo(
    () => ({
      user,
      setUser,
      isVerified,
      setIsVerified,
      userId,
      mongoId,
      setMongoId,
      mongoUser,
      setMongoUser,
      users,
      setUsers,
      userFriendsMinDetail,
      setUserFriendsMinDetail,
      fetchMongoUser,
      getToken,
      userLocationState,
    }),
    [
      user,
      isVerified,
      userId,
      mongoId,
      mongoUser,
      users,
      userFriendsMinDetail,
      fetchMongoUser,
      getToken,
      userLocationState,
    ]
  );
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
    <AuthContext.Provider value={authContextValue}>
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
