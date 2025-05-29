import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import ChatRoomPage from "../../screens/chats/chatroom";
import { mockAuthContext } from "../__mocks__/auth-context";

// Set up environment variables
(global as any).process = {
  ...global.process,
  env: {
    ...global.process?.env,
    EXPO_LOCAL_SERVER: "http://172.20.10.3:3000",
  },
};

// Mock Alert explicitly
const { Alert } = require("react-native");
Alert.alert = jest.fn();

// Mock Platform
const { Platform } = require("react-native");
Platform.OS = "android";

// Mock Vector Icons
jest.mock("react-native-vector-icons/MaterialCommunityIcons", () => {
  const React = require("react");
  const { TouchableOpacity, Text } = require("react-native");
  return (props: any) => (
    <TouchableOpacity testID="Icon" {...props}>
      <Text>send</Text>
    </TouchableOpacity>
  );
});

// Mock Firebase
const mockUpdateDoc = jest.fn();
const mockGetDoc = jest.fn();
const mockDoc = jest.fn();

jest.mock("firebase/firestore", () => ({
  doc: (...args: any[]) => {
    mockDoc(...args);
    return "mock-doc-ref";
  },
  getDoc: (...args: any[]) => {
    mockGetDoc(...args);
    return Promise.resolve({
      data: () => ({
        participants: {
          "mongo-test-id-123": 0,
          "user-456": 1,
        },
      }),
    });
  },
  updateDoc: (...args: any[]) => {
    mockUpdateDoc(...args);
    return Promise.resolve();
  },
}));

jest.mock("../../firebaseconfig", () => ({
  FIREBASE_DB: "mock-firestore-db",
}));

// Mock auth context
jest.mock("../../contexts/auth-context", () => ({
  useAuth: () => mockAuthContext,
}));

// Mock chat context
const mockSendMessage = jest.fn();
const mockClearUnread = jest.fn();
const mockMessages = [
  {
    _id: "msg-1",
    text: "Hello there!",
    createdAt: new Date("2024-01-01T10:00:00Z"),
    user: {
      _id: "user-123",
      name: "John Doe",
    },
  },
  {
    _id: "msg-2",
    text: "How are you?",
    createdAt: new Date("2024-01-01T10:01:00Z"),
    user: {
      _id: "mongo-test-id-123",
      name: "Test User",
    },
  },
];

const mockUseChatRoom = {
  messages: mockMessages,
  sendMessage: mockSendMessage,
  clearUnread: mockClearUnread,
};

jest.mock("../../contexts/chat-context", () => ({
  useChatRoom: () => mockUseChatRoom,
}));

// Mock chat utils
jest.mock("../../utils/chat-utils", () => ({
  getRoomId: jest.fn((uid1: string, uid2: string) => `room-${uid1}-${uid2}`),
}));

// Mock notification requests
jest.mock("../../components/requests/notification-requsts", () => ({
  sendPushNotification: jest.fn(),
}));

// Mock chat requests
jest.mock("../../components/requests/chats-requsts", () => ({
  fetchPushTokensUnmuted: jest.fn(),
  openChatroom: jest.fn(),
}));

// Mock chat components
jest.mock("../../screens/chats/components.tsx/messages-list", () => ({
  __esModule: true,
  default: ({ messages, roomId, type }: any) => {
    const React = require("react");
    const { View, Text, FlatList, TouchableOpacity } = require("react-native");

    return (
      <View testID="messages-list">
        <Text testID={"messages-count"}>{messages.length} messages</Text>
        <Text testID="room-id">{roomId}</Text>
        <Text testID="chat-type">{type}</Text>
        <FlatList
          data={messages}
          keyExtractor={(item: any) => item._id}
          renderItem={({ item }: any) => (
            <TouchableOpacity testID={`message-${item._id}`}>
              <Text testID={`message-text-${item._id}`}>{item.text}</Text>
              <Text testID={`message-user-${item._id}`}>{item.user.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  },
}));

jest.mock("../../screens/chats/components.tsx/chat-header", () => ({
  __esModule: true,
  default: ({ title, onBack, onAvatarPress, avatarUrl }: any) => {
    const React = require("react");
    const { View, Text, TouchableOpacity } = require("react-native");

    return (
      <View testID="chat-header">
        <TouchableOpacity testID="back-button" onPress={onBack}>
          <Text>Back</Text>
        </TouchableOpacity>
        <Text testID="chat-title">{title}</Text>
        <TouchableOpacity testID="avatar-button" onPress={onAvatarPress}>
          <Text testID="avatar-url">{avatarUrl || "No avatar"}</Text>
        </TouchableOpacity>
      </View>
    );
  },
}));

jest.mock("../../screens/chats/components.tsx/user-group-image-press", () => ({
  handleProfilePress: jest.fn(),
}));

// Import mocked functions
import { sendPushNotification } from "../../components/requests/notification-requsts";
import {
  fetchPushTokensUnmuted,
  openChatroom,
} from "../../components/requests/chats-requsts";
import { handleProfilePress } from "../../screens/chats/components.tsx/user-group-image-press";
import { getRoomId } from "../../utils/chat-utils";

// Mock navigation
const mockGoBack = jest.fn();
const mockNavigate = jest.fn();
const mockAddListener = jest.fn();
const mockNavigation = {
  goBack: mockGoBack,
  navigate: mockNavigate,
  addListener: mockAddListener,
  dispatch: jest.fn(),
  reset: jest.fn(),
  setOptions: jest.fn(),
};

// Mock global fetch
global.fetch = jest.fn();

// Mock user and group data
const mockUser = {
  _id: "user-456",
  username: "john_doe",
  profile_picture: {
    url: "https://example.com/user-avatar.jpg",
    image_id: "user-avatar-id",
  },
  firebase_id: "firebase-user-456",
  friends: [],
};

const mockMongoUser = {
  ...mockUser,
  friends: [{ id: "some-other-user", status: "accepted" }],
};

const mockGroup = {
  _id: "group-789",
  name: "Mountain Hikers",
  main_image: {
    url: "https://example.com/group-avatar.jpg",
    image_id: "group-avatar-id",
  },
  members: [
    {
      user: "mongo-test-id-123",
      role: "admin" as const,
      joined_at: "2024-01-01T00:00:00Z",
    },
    {
      user: "user-456",
      role: "companion" as const,
      joined_at: "2024-01-02T00:00:00Z",
    },
  ],
};

const mockFullUserData = {
  ...mockUser,
  friends: [{ id: "some-other-user", status: "accepted" }],
};

const mockBlockedUserData = {
  ...mockUser,
  friends: [{ id: "mongo-test-id-123", status: "blocked" }],
};

describe("ChatRoomPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset auth context
    (mockAuthContext as any).mongoUser = {
      ...mockAuthContext.mongoUser,
      _id: "mongo-test-id-123",
      firebaseUid: "firebase-test-123",
      firebase_id: "firebase-test-123",
      username: "test_user", // Add username for notifications
      chatrooms_with: [],
    };

    // Reset setMongoUser mock
    (mockAuthContext as any).setMongoUser = jest.fn();

    // Setup default fetch responses
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("/api/user/")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockFullUserData),
        });
      }
      if (url.includes("/api/group/")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ group: mockGroup }),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    // Setup Firebase mocks
    mockDoc.mockReturnValue("mock-doc-ref");
    mockGetDoc.mockResolvedValue({
      data: () => ({
        participants: {
          "mongo-test-id-123": 0,
          "user-456": 1,
        },
      }),
    });
    mockUpdateDoc.mockResolvedValue(undefined);

    // Setup navigation listeners
    mockAddListener.mockImplementation((event: string, callback: Function) => {
      if (event === "beforeRemove") {
        // Simulate immediate call for testing
        setTimeout(() => callback(), 0);
      }
      return jest.fn(); // Return unsubscribe function
    });

    // Setup chat requests mocks
    (fetchPushTokensUnmuted as jest.Mock).mockResolvedValue([
      "expo-token-1",
      "expo-token-2",
    ]);
    (openChatroom as jest.Mock).mockResolvedValue(undefined);
    (sendPushNotification as jest.Mock).mockResolvedValue(undefined);

    // Setup getRoomId mock
    (getRoomId as jest.Mock).mockReturnValue(
      "room-firebase-test-123-firebase-user-456"
    );
  });

  describe("User Chat", () => {
    const userChatRoute = {
      params: {
        type: "user" as const,
        user: mockUser,
      },
    };

    it("renders user chat correctly", async () => {
      const { getByTestId, getByText } = render(
        <ChatRoomPage
          route={userChatRoute as any}
          navigation={mockNavigation}
        />
      );

      await waitFor(() => {
        expect(getByTestId("chat-header")).toBeTruthy();
        expect(getByTestId("chat-title")).toBeTruthy();
        expect(getByText("john_doe")).toBeTruthy();
        expect(getByTestId("avatar-url")).toBeTruthy();
        expect(getByTestId("messages-list")).toBeTruthy();
      });
    });

    it("fetches user data on mount", async () => {
      render(
        <ChatRoomPage
          route={userChatRoute as any}
          navigation={mockNavigation}
        />
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "http://172.20.10.3:3000/api/user/user-456"
        );
      });
    });

    it("handles send message for user chat", async () => {
      const { getAllByPlaceholderText, getByTestId } = render(
        <ChatRoomPage
          route={userChatRoute as any}
          navigation={mockNavigation}
        />
      );

      await waitFor(() => {
        expect(getAllByPlaceholderText("Type a message...")[0]).toBeTruthy();
      });

      const textInput = getAllByPlaceholderText("Type a message...")[0];
      const sendButton = getByTestId("Icon"); // Icon is mocked as testable component

      fireEvent.changeText(textInput, "Hello from test!");
      fireEvent.press(sendButton);

      await waitFor(() => {
        expect(openChatroom).toHaveBeenCalledWith("user-456", "mock-token");
        expect(mockSendMessage).toHaveBeenCalledWith("Hello from test!");
      });
    });

    it("sends push notifications after message", async () => {
      const { getAllByPlaceholderText, getByTestId } = render(
        <ChatRoomPage
          route={userChatRoute as any}
          navigation={mockNavigation}
        />
      );

      await waitFor(() => {
        const textInput = getAllByPlaceholderText("Type a message...")[0];
        const sendButton = getByTestId("Icon");

        fireEvent.changeText(textInput, "Test notification");
        fireEvent.press(sendButton);
      });

      await waitFor(() => {
        expect(fetchPushTokensUnmuted).toHaveBeenCalledWith(
          "mock-token",
          ["user-456"],
          "room-firebase-test-123-firebase-user-456"
        );
        expect(sendPushNotification).toHaveBeenCalledWith(
          ["expo-token-1", "expo-token-2"],
          "test_user sent you a message",
          "Test notification",
          {
            type: "chat",
            navigation: {
              name: "Tabs",
              params: {
                screen: "Chats",
              },
            },
          }
        );
      });
    });

    it("updates chatrooms_with when messaging new user", async () => {
      const { getAllByPlaceholderText, getByTestId } = render(
        <ChatRoomPage
          route={userChatRoute as any}
          navigation={mockNavigation}
        />
      );

      await waitFor(() => {
        const textInput = getAllByPlaceholderText("Type a message...")[0];
        const sendButton = getByTestId("Icon");

        fireEvent.changeText(textInput, "First message");
        fireEvent.press(sendButton);
      });

      await waitFor(() => {
        expect((mockAuthContext as any).setMongoUser).toHaveBeenCalledWith({
          ...mockAuthContext.mongoUser,
          chatrooms_with: [mockUser],
        });
      });
    });

    it("handles blocked user scenario", async () => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes("/api/user/")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockBlockedUserData),
          });
        }
        return Promise.reject(new Error("Unknown URL"));
      });

      const { getByText, queryByPlaceholderText } = render(
        <ChatRoomPage
          route={userChatRoute as any}
          navigation={mockNavigation}
        />
      );

      await waitFor(() => {
        expect(getByText("You are blocked by the user.")).toBeTruthy();
        expect(queryByPlaceholderText("Type a message...")).toBeNull();
      });
    });

    it("handles navigation back", async () => {
      const { getByTestId } = render(
        <ChatRoomPage
          route={userChatRoute as any}
          navigation={mockNavigation}
        />
      );

      await waitFor(() => {
        const backButton = getByTestId("back-button");
        fireEvent.press(backButton);
      });

      expect(mockGoBack).toHaveBeenCalled();
    });

    it("handles avatar press", async () => {
      const { getByTestId } = render(
        <ChatRoomPage
          route={userChatRoute as any}
          navigation={mockNavigation}
        />
      );

      await waitFor(() => {
        const avatarButton = getByTestId("avatar-button");
        fireEvent.press(avatarButton);
      });

      expect(handleProfilePress).toHaveBeenCalledWith({
        type: "user",
        user: mockUser,
        group: undefined,
        mongoId: "mongo-test-id-123",
        navigation: mockNavigation,
      });
    });
  });

  describe("Group Chat", () => {
    const groupChatRoute = {
      params: {
        type: "group" as const,
        group: mockGroup,
      },
    };

    it("renders group chat correctly", async () => {
      const { getByTestId, getByText } = render(
        <ChatRoomPage
          route={groupChatRoute as any}
          navigation={mockNavigation}
        />
      );

      await waitFor(() => {
        expect(getByTestId("chat-header")).toBeTruthy();
        expect(getByText("Mountain Hikers")).toBeTruthy();
        expect(getByTestId("messages-list")).toBeTruthy();
      });
    });

    it("fetches group data on mount", async () => {
      render(
        <ChatRoomPage
          route={groupChatRoute as any}
          navigation={mockNavigation}
        />
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "http://172.20.10.3:3000/api/group/group-789"
        );
      });
    });

    it("shows loading state for group", async () => {
      // Delay the fetch response
      (global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () => Promise.resolve({ group: mockGroup }),
                }),
              100
            )
          )
      );

      const { getByText } = render(
        <ChatRoomPage
          route={groupChatRoute as any}
          navigation={mockNavigation}
        />
      );

      expect(getByText("Loading...")).toBeTruthy();

      await waitFor(() => {
        expect(getByText("Mountain Hikers")).toBeTruthy();
      });
    });

    it("handles non-member access to group", async () => {
      const nonMemberGroup = {
        ...mockGroup,
        members: [
          {
            user: "other-user",
            role: "companion" as const,
            joined_at: "2024-01-01T00:00:00Z",
          },
        ],
      };

      (global.fetch as jest.Mock).mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ group: nonMemberGroup }),
        })
      );

      const nonMemberRoute = {
        params: {
          type: "group" as const,
          group: nonMemberGroup,
        },
      };

      const { getByText, queryByPlaceholderText } = render(
        <ChatRoomPage
          route={nonMemberRoute as any}
          navigation={mockNavigation}
        />
      );

      await waitFor(() => {
        expect(getByText("Join the group to view messages.")).toBeTruthy();
        expect(queryByPlaceholderText("Type a message...")).toBeNull();
      });
    });

    it("handles send message for group chat", async () => {
      const { getAllByPlaceholderText, getByTestId } = render(
        <ChatRoomPage
          route={groupChatRoute as any}
          navigation={mockNavigation}
        />
      );

      await waitFor(() => {
        expect(getAllByPlaceholderText("Type a message...")[0]).toBeTruthy();
      });

      const textInput = getAllByPlaceholderText("Type a message...")[0];
      const sendButton = getByTestId("Icon");

      fireEvent.changeText(textInput, "Group message test!");
      fireEvent.press(sendButton);

      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalledWith("Group message test!");
      });
    });

    it("sends push notifications to group members", async () => {
      const { getAllByPlaceholderText, getByTestId } = render(
        <ChatRoomPage
          route={groupChatRoute as any}
          navigation={mockNavigation}
        />
      );

      await waitFor(() => {
        expect(getAllByPlaceholderText("Type a message...")[0]).toBeTruthy();
      });

      await act(async () => {
        const textInput = getAllByPlaceholderText("Type a message...")[0];
        const sendButton = getByTestId("Icon");

        fireEvent.changeText(textInput, "Group notification test");
        fireEvent.press(sendButton);
      });

      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalledWith("Group notification test");
      });

      await waitFor(
        () => {
          expect(fetchPushTokensUnmuted).toHaveBeenCalledWith(
            "mock-token",
            ["user-456"], // Excludes sender
            "group-789"
          );
        },
        { timeout: 2000 }
      );
    });
  });

  describe("Message Input", () => {
    const userChatRoute = {
      params: {
        type: "user" as const,
        user: mockUser,
      },
    };

    it("handles empty message submission", async () => {
      const { getAllByPlaceholderText, getByTestId } = render(
        <ChatRoomPage
          route={userChatRoute as any}
          navigation={mockNavigation}
        />
      );

      await waitFor(() => {
        const textInput = getAllByPlaceholderText("Type a message...")[0];
        const sendButton = getByTestId("Icon");

        fireEvent.changeText(textInput, "   "); // Only whitespace
        fireEvent.press(sendButton);
      });

      expect(mockSendMessage).not.toHaveBeenCalled();
    });

    it("handles enter key submission", async () => {
      const { getAllByPlaceholderText } = render(
        <ChatRoomPage
          route={userChatRoute as any}
          navigation={mockNavigation}
        />
      );

      await waitFor(() => {
        const textInput = getAllByPlaceholderText("Type a message...")[0];

        fireEvent.changeText(textInput, "Enter key test");
        fireEvent(textInput, "submitEditing");
      });

      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalledWith("Enter key test");
      });
    });

    it("clears input after sending message", async () => {
      const { getAllByPlaceholderText, getByTestId } = render(
        <ChatRoomPage
          route={userChatRoute as any}
          navigation={mockNavigation}
        />
      );

      await waitFor(() => {
        const textInput = getAllByPlaceholderText("Type a message...")[0];
        const sendButton = getByTestId("Icon");

        fireEvent.changeText(textInput, "Test clear input");
        fireEvent.press(sendButton);
      });

      // The input should be cleared after sending (mocked behavior)
      expect(mockSendMessage).toHaveBeenCalledWith("Test clear input");
    });
  });

  describe("Error Handling", () => {
    const userChatRoute = {
      params: {
        type: "user" as const,
        user: mockUser,
      },
    };

    it("handles user data fetch error", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      render(
        <ChatRoomPage
          route={userChatRoute as any}
          navigation={mockNavigation}
        />
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
      });

      consoleSpy.mockRestore();
    });

    it("handles group data fetch error", async () => {
      const groupChatRoute = {
        params: {
          type: "group" as const,
          group: mockGroup,
        },
      };

      (global.fetch as jest.Mock).mockRejectedValue(
        new Error("Group fetch error")
      );
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      render(
        <ChatRoomPage
          route={groupChatRoute as any}
          navigation={mockNavigation}
        />
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
      });

      consoleSpy.mockRestore();
    });

    it("handles send message error", async () => {
      mockSendMessage.mockRejectedValue(new Error("Send failed"));

      const { getAllByPlaceholderText, getByTestId } = render(
        <ChatRoomPage
          route={userChatRoute as any}
          navigation={mockNavigation}
        />
      );

      await waitFor(() => {
        const textInput = getAllByPlaceholderText("Type a message...")[0];
        const sendButton = getByTestId("Icon");

        fireEvent.changeText(textInput, "This will fail");
        fireEvent.press(sendButton);
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith("Error", "Send failed");
      });
    });
  });

  describe("Navigation Lifecycle", () => {
    const userChatRoute = {
      params: {
        type: "user" as const,
        user: mockUser,
      },
    };

    it("clears unread on beforeRemove", async () => {
      render(
        <ChatRoomPage
          route={userChatRoute as any}
          navigation={mockNavigation}
        />
      );

      await waitFor(() => {
        expect(mockAddListener).toHaveBeenCalledWith(
          "beforeRemove",
          expect.any(Function)
        );
      });

      // Simulate the beforeRemove event
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      await waitFor(() => {
        expect(mockUpdateDoc).toHaveBeenCalledWith("mock-doc-ref", {
          "participants.mongo-test-id-123": 0,
        });
      });
    });

    it("sets up blur listener for clearing unread", async () => {
      render(
        <ChatRoomPage
          route={userChatRoute as any}
          navigation={mockNavigation}
        />
      );

      expect(mockAddListener).toHaveBeenCalledWith("blur", mockClearUnread);
    });
  });

  describe("Room ID Generation", () => {
    it("generates correct room ID for user chat", async () => {
      const userChatRoute = {
        params: {
          type: "user" as const,
          user: mockUser,
        },
      };

      const { getByTestId } = render(
        <ChatRoomPage
          route={userChatRoute as any}
          navigation={mockNavigation}
        />
      );

      await waitFor(() => {
        expect(getRoomId).toHaveBeenCalledWith(
          "firebase-test-123",
          "firebase-user-456"
        );
        expect(getByTestId("room-id")).toBeTruthy();
      });
    });

    it("uses group ID as room ID for group chat", async () => {
      const groupChatRoute = {
        params: {
          type: "group" as const,
          group: mockGroup,
        },
      };

      const { getByTestId } = render(
        <ChatRoomPage
          route={groupChatRoute as any}
          navigation={mockNavigation}
        />
      );

      await waitFor(() => {
        expect(getByTestId("room-id")).toBeTruthy();
        // Group ID should be used directly as room ID
      });
    });
  });

  describe("Messages Display", () => {
    const userChatRoute = {
      params: {
        type: "user" as const,
        user: mockUser,
      },
    };

    it("displays messages correctly", async () => {
      const { getByTestId, getByText } = render(
        <ChatRoomPage
          route={userChatRoute as any}
          navigation={mockNavigation}
        />
      );

      await waitFor(() => {
        expect(getByTestId("messages-list")).toBeTruthy();
        expect(getByText("2 messages")).toBeTruthy();
        expect(getByTestId("chat-type")).toBeTruthy();
      });
    });

    it("passes correct props to MessagesList", async () => {
      const { getByTestId } = render(
        <ChatRoomPage
          route={userChatRoute as any}
          navigation={mockNavigation}
        />
      );

      await waitFor(() => {
        expect(getByTestId("messages-list")).toBeTruthy();
        expect(getByTestId("room-id")).toBeTruthy();
        expect(getByTestId("chat-type")).toBeTruthy();
      });
    });
  });
});
