import React from "react";

export const mockChatRoom = {
  _id: "room-123",
  participants: ["user1", "user2"],
  lastMessage: {
    text: "Hello there",
    createdAt: new Date("2024-01-01"),
    user: "user1",
  },
  createdAt: new Date("2024-01-01"),
};

export const mockChatListContext = {
  rooms: [mockChatRoom],
  loading: false,
  error: null,
  initializeRooms: jest.fn().mockResolvedValue(undefined),
  createRoom: jest.fn().mockResolvedValue(mockChatRoom),
  updateRoom: jest.fn().mockResolvedValue(undefined),
  deleteRoom: jest.fn().mockResolvedValue(undefined),
  markAsRead: jest.fn().mockResolvedValue(undefined),
};

export const ChatListContext = React.createContext(mockChatListContext);

export const useChatList = () => mockChatListContext;

export const ChatListProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <ChatListContext.Provider value={mockChatListContext}>
    {children}
  </ChatListContext.Provider>
);
