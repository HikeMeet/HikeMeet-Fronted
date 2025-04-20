import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "../utils/register-for-pushnotification-async";
import { navigate, navigationRef } from "../root-navigation";
import { CommonActions } from "@react-navigation/native";
export type Subscription = ReturnType<
  typeof Notifications.addNotificationReceivedListener
>;
interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: Error | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const notificationListener = useRef<Subscription>();
  const responseListener = useRef<Subscription>();

  // Helper to navigate based on the notification’s data
  function handleNotificationResponse(
    response: Notifications.NotificationResponse
  ) {
    const { name, params } = response.notification.request.content.data as {
      name: string;
      params?: Record<string, any>;
    };

    if (!navigationRef.isReady()) return;
    navigationRef.dispatch(
      CommonActions.navigate({ name, params: params ?? {} })
    );

    // If it’s a nested PostPage, go into your PostStack
  }

  useEffect(() => {
    // 1) Cold‐start: if app was opened by tapping a notification
    (async () => {
      const lastResponse =
        await Notifications.getLastNotificationResponseAsync();
      if (lastResponse) {
        // wait until navigationRef.isReady() before firing
        const waitForNav = () => {
          if (navigationRef.isReady()) {
            handleNotificationResponse(lastResponse);
          } else {
            setTimeout(waitForNav, 50);
          }
        };
        waitForNav();
      }
    })();

    // 2) Register token
    registerForPushNotificationsAsync().then(
      (token: any) => setExpoPushToken(token),
      (error: any) => setError(error)
    );

    // 3) In‐app arrival listener (optional: shows receipt in console)
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log(
          "🔔 Notification received while the app is running.: ",
          notification
        );
        setNotification(notification);
      });

    // 4) In‐app tap listener
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(
        handleNotificationResponse
      );

    // 5) Cleanup
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{ expoPushToken, notification, error }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
