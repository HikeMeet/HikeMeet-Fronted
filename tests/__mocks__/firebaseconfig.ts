// Mock firebase config
export const firebaseConfig = {
  apiKey: "mock-api-key",
  authDomain: "mock-auth-domain",
  projectId: "mock-project-id",
  storageBucket: "mock-storage-bucket",
  messagingSenderId: "mock-sender-id",
  appId: "mock-app-id",
};

const mockApp = {
  name: "mock-app",
  options: firebaseConfig,
};

export const app = mockApp;
export const auth = {};
export const db = {};
export const storage = {};
