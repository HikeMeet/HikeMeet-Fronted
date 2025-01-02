import React from "react";
import { Button } from "react-native";
import { FIREBASE_AUTH } from "../../firebaseconfig";

interface LogoutButtonProps {
  onNavigateAfterLogout: (screen: string) => void; // פעולה שתופעל לניווט לאחר ההתנתקות
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ onNavigateAfterLogout }) => {
  const handleLogout = async () => {
    try {
      await FIREBASE_AUTH.signOut();
      console.log("User signed out");
      setTimeout(() => {
        onNavigateAfterLogout("Login"); // ניווט למסך ה-Login
      }, 100);
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  return <Button onPress={handleLogout} title="Logout" />;
};

export default LogoutButton;
