// passwordUtils.ts

export function evaluatePasswordStrength(password: string): string {
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
