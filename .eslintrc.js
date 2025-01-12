// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: "expo",
  ignorePatterns: ["/dist/*"],
  rules: {
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }], // Warn about unused variables except those prefixed with "_"
    "no-console": "warn", // Warn about console statements (useful for debugging but should be removed in production)
    eqeqeq: ["error", "always"], // Enforce strict equality (`===` and `!==`) instead of `==` or `!=`
    semi: ["error", "always"], // Require semicolons
    quotes: ["error", "double", { avoidEscape: true }], // Enforce single quotes except when escaping
  },
};
