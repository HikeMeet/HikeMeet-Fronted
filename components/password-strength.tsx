import React from "react";
import { Text } from "react-native";

export function evaluatePasswordStrength(password: string): string | null {
  let score = 0;

  // Criteria for scoring
  if (password.length >= 8) score++; // Minimum length requirement
  if (/[A-Z]/.test(password)) score++; // Contains uppercase letter
  if (/[0-9]/.test(password)) score++; // Contains digit
  if (/[^A-Za-z0-9]/.test(password)) score++; // Contains special character

  // Determine strength based on score
  if (score === 4) {
    return null; // No error for strong password
  } else if (score === 3) {
    return "Password strength is moderate. Consider making it stronger.";
  } else {
    return "Password strength is weak. Please include uppercase letters, numbers, and special characters.";
  }
}

const PasswordStrength = ({ password }: { password: string }) => {
  if (!password) return null;

  const strength = evaluatePasswordStrength(password);

  const getStrengthColor = () => {
    if (!strength) return "text-green-400"; // Strong password
    if (strength.includes("moderate")) return "text-yellow-400";
    return "text-red-400"; // Weak password
  };

  return (
    <Text className={`text-center font-bold mb-4 ${getStrengthColor()}`}>
      {strength || "Password is strong"}
    </Text>
  );
};

export default PasswordStrength;
