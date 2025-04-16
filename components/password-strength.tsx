import React = require("react");
import { Text } from "react-native";

export function evaluatePasswordStrength(
  password: string,
  enforceStrongPassword: boolean
): string | null {
  let score = 0;

  // Criteria for scoring
  if (password.length >= 8) score++; // Minimum length requirement
  if (/[A-Z]/.test(password)) score++; // Contains uppercase letter
  if (/[0-9]/.test(password)) score++; // Contains digit
  if (/[^A-Za-z0-9]/.test(password)) score++; // Contains special character

  // Determine strength based on score
  if (enforceStrongPassword) {
    if (score === 4) {
      return null; // No error for strong password
    } else if (score === 3) {
      return "Password strength is moderate. Consider making it stronger.";
    } else {
      return "Password strength is weak";
    }
  } else {
    // Simple validation: At least 8 characters and contains digits
    if (password.length >= 8 && /[0-9]/.test(password)) {
      return null; // Sufficient password
    }
    return "Password must be at least 8 characters and contain digits.";
  }
}

const PasswordStrength = ({
  password,
  enforceStrongPassword = true,
}: {
  password: string;
  enforceStrongPassword?: boolean;
}) => {
  if (!password) return null;

  const strength = evaluatePasswordStrength(password, enforceStrongPassword);

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
