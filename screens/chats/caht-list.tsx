// src/screens/HomeScreen.tsx
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Platform,
  SafeAreaView,
  StatusBar,
  View,
  Text,
  StyleSheet,
} from "react-native";
import * as Updates from "expo-updates";
import { useNotification } from "../../contexts/notification-context";

export default function HomeScreen() {
  const { notification, expoPushToken, error } = useNotification();
  const { currentlyRunning, isUpdateAvailable, isUpdatePending } =
    Updates.useUpdates();

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (isUpdatePending) {
      applyUpdate();
    }
  }, [isUpdatePending]);

  async function applyUpdate() {
    try {
      await Updates.reloadAsync();
    } catch {
      Alert.alert("Failed to reload update");
    } finally {
      setReloadKey((k) => k + 1);
    }
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </SafeAreaView>
    );
  }

  const showDownloadButton = isUpdateAvailable;
  const runTypeMessage = currentlyRunning.isEmbeddedLaunch
    ? "This app is running from built-in code"
    : "This app is running an update";

  return (
    <SafeAreaView key={reloadKey} style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.subtitle}>HikeMeet Updates</Text>
        <Text style={styles.message}>{runTypeMessage}</Text>

        <Button
          title="Check manually for updates"
          onPress={() => {
            Updates.checkForUpdateAsync().catch(() =>
              Alert.alert("Check failed")
            );
          }}
        />

        {showDownloadButton && (
          <View style={styles.buttonSpacing}>
            <Button
              title="Download and run update"
              onPress={() => {
                Updates.fetchUpdateAsync()
                  .then(() => {
                    /* once the update is downloaded, isUpdatePending will flip true,
                       and our useEffect will call applyUpdate() */
                  })
                  .catch(() => Alert.alert("Download failed"));
              }}
            />
          </View>
        )}

        <Text style={[styles.subtitle, styles.section]}>Your push token:</Text>
        <Text style={styles.tokenText}>{expoPushToken ?? "…"}</Text>

        <Text style={[styles.subtitle, styles.section]}>
          Latest notification:
        </Text>
        <Text style={styles.message}>
          {notification?.request.content.title ?? "No notifications yet"}
        </Text>
        <Text style={styles.dataText}>
          {notification
            ? JSON.stringify(notification.request.content.data, null, 2)
            : ""}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    backgroundColor: "#fff",
  },
  inner: {
    flex: 1,
    padding: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    marginBottom: 16,
  },
  section: {
    marginTop: 24,
  },
  buttonSpacing: {
    marginTop: 12,
    marginBottom: 24,
  },
  tokenText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 16,
  },
  dataText: {
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    marginTop: 4,
    color: "#555",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginTop: 50,
  },
});
