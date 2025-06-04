import React from "react";

export const mockUser = {
  uid: "test-uid-123",
  email: "test@example.com",
  displayName: "Test User",
};

export const mockMongoUser = {
  _id: "mongo-test-id-123",
  firebaseUid: "test-uid-123",
  email: "test@example.com",
  name: "Test User",
  unreadNotifications: 2,
  friends: [],
  friendRequests: [],
  favorite_trips: ["trip-1", "trip-2"],
  trip_history: [
    { trip: "trip-1", completed_at: "2024-01-15" },
    { trip: "trip-3", completed_at: "2024-01-20" },
  ],
};

export const mockAuthContext = {
  user: mockUser,
  mongoId: "mongo-test-id-123",
  mongoUser: mockMongoUser,
  isAuthenticated: true,
  loading: false,
  error: null,
  getToken: jest.fn().mockResolvedValue("mock-token"),
  fetchMongoUser: jest.fn().mockResolvedValue(mockMongoUser),
  login: jest.fn().mockResolvedValue({ user: mockUser }),
  register: jest.fn().mockResolvedValue({ user: mockUser }),
  logout: jest.fn().mockResolvedValue(undefined),
  updateUserProfile: jest.fn().mockResolvedValue(undefined),
};

export const AuthContext = React.createContext(mockAuthContext);

export const useAuth = () => mockAuthContext;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => (
  <AuthContext.Provider value={mockAuthContext}>
    {children}
  </AuthContext.Provider>
);
