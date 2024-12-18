import React from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require("../../assets/images/landing_page.jpg")} // עדכן לנתיב התמונה שלך
      style={styles.background}
      resizeMode="cover" // מתאים את התמונה למסך
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>HikeMeet</Text>
        <Text style={styles.text}>ברוך הבא לאפליקציית הטיולים שלך!</Text>
        <Button
          title="Login"
          onPress={() => router.push("/register_login/login")}
        />
        <Button
          title="Register"
          onPress={() => router.push("/register_login/register")}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // אפקט כהה על הרקע
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 20,
  },
});
