import React from "react";
import { Text } from "react-native";

function evaluatePasswordStrength(password: string): string {
  let score = 0;

  // Criteria for scoring
  if (password.length >= 8) score++; // Minimum length requirement
  if (/[A-Z]/.test(password)) score++; // Contains uppercase letter
  if (/[0-9]/.test(password)) score++; // Contains digit
  if (/[^A-Za-z0-9]/.test(password)) score++; // Contains special character

  // Determine strength based on score
  if (score === 4) {
    return "Strong";
  } else if (score === 3) {
    return "Moderate";
  } else {
    return "Weak";
  }
}

const PasswordStrength = ({ password }: { password: string }) => {
  if (!password) return null;

  const passwordStrength = evaluatePasswordStrength(password);

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case "Strong":
        return "text-green-400";
      case "Moderate":
        return "text-yellow-400";
      default:
        return "text-red-400";
    }
  };

  return (
    <Text className={`text-center font-bold mb-4 ${getStrengthColor()}`}>
      Password Strength: {passwordStrength}
    </Text>
  );
};

export default PasswordStrength;
