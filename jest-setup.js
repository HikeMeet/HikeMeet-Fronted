const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes(
        "An update to Animated(View) inside a test was not wrapped in act"
      )
    ) {
      return;
    }
    originalError(...args);
  };
});
