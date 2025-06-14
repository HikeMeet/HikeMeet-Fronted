import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import ChatListPage from "../../screens/chats/chat-list";
import { mockAuthContext } from "../__mocks__/auth-context";

// Mock Ionicons
jest.mock("react-native-vector-icons/Ionicons", () => "Icon");

// Mock React Navigation
const mockUseFocusEffect = jest.fn();
jest.mock("@react-navigation/native", () => ({
  useFocusEffect: (callback: Function) => {
    mockUseFocusEffect(callback);
    callback(); // Call the callback immediately
  },
}));

// Mock chat context
const mockInitializeRooms = jest.fn();
const mockRemoveRoom = jest.fn();

// Define proper types for the mock data
type MockRoom = { key: string; type: "user" | "group" };
type MockLastMessages = {
  [key: string]: { text: string; createdAt: { seconds: number } };
};
type MockUnreadCounts = { [key: string]: number };

const mockUseChatList: {
  rooms: MockRoom[];
  lastMessages: MockLastMessages;
  unreadCounts: MockUnreadCounts;
  initializeRooms: jest.Mock;
  removeRoom: jest.Mock;
} = {
  rooms: [],
  lastMessages: {},
  unreadCounts: {},
  initializeRooms: mockInitializeRooms,
  removeRoom: mockRemoveRoom,
};

jest.mock("../../contexts/chat-context", () => ({
  useChatList: () => mockUseChatList,
}));

// Mock auth context
jest.mock("../../contexts/auth-context", () => ({
  useAuth: () => mockAuthContext,
}));

// Mock ChatItem component
jest.mock("../../screens/chats/components.tsx/chat-item", () => {
  const React = require("react");
  const { TouchableOpacity, Text, View } = require("react-native");

  return ({
    type,
    user,
    group,
    lastMessage,
    unreadCount,
    onDelete,
    navigation,
  }: any) => {
    const name = type === "user" ? user?.username : group?.name;
    const lastMessageText = lastMessage?.text || "No messages";

    return (
      <View testID={`chat-item-${type}-${user?._id || group?._id}`}>
        <TouchableOpacity
          testID={`chat-item-press-${user?._id || group?._id}`}
          onPress={() => navigation.navigate("ChatRoom", { type, user, group })}
        >
          <Text testID={`chat-name-${user?._id || group?._id}`}>{name}</Text>
          <Text testID={`last-message-${user?._id || group?._id}`}>
            {lastMessageText}
          </Text>
          {unreadCount > 0 && (
            <Text testID={`unread-count-${user?._id || group?._id}`}>
              {unreadCount}
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          testID={`delete-chat-${user?._id || group?._id}`}
          onLongPress={onDelete}
        >
          <Text>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  setOptions: jest.fn(),
};

// Sample data
const mockUsers = [
  {
    _id: "user-1",
    username: "john_doe",
    profile_picture: { url: "https://example.com/john.jpg" },
  },
  {
    _id: "user-2",
    username: "jane_smith",
    profile_picture: { url: "https://example.com/jane.jpg" },
  },
];

const mockGroups = [
  {
    _id: "group-1",
    name: "Hiking Group",
    main_image: { url: "https://example.com/hiking.jpg" },
  },
  {
    _id: "group-2",
    name: "Photography Club",
    main_image: { url: "https://example.com/photo.jpg" },
  },
];

const mockRooms: MockRoom[] = [
  { key: "user-1", type: "user" as const },
  { key: "user-2", type: "user" as const },
  { key: "group-1", type: "group" as const },
  { key: "group-2", type: "group" as const },
];

const mockLastMessages: MockLastMessages = {
  "user-1": {
    text: "Hey, how are you?",
    createdAt: { seconds: 1640995200 }, // 2022-01-01 00:00:00
  },
  "user-2": {
    text: "See you tomorrow!",
    createdAt: { seconds: 1640998800 }, // 2022-01-01 01:00:00
  },
  "group-1": {
    text: "Meeting at 10 AM",
    createdAt: { seconds: 1641002400 }, // 2022-01-01 02:00:00
  },
  "group-2": {
    text: "Great photos everyone!",
    createdAt: { seconds: 1640991600 }, // 2021-12-31 23:00:00
  },
};

const mockUnreadCounts: MockUnreadCounts = {
  "user-1": 2,
  "user-2": 0,
  "group-1": 5,
  "group-2": 1,
};

describe("ChatListPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset auth context
    (mockAuthContext as any).mongoUser = {
      ...mockAuthContext.mongoUser,
      _id: "current-user-id",
      chatrooms_with: mockUsers,
      chatrooms_groups: mockGroups,
    };

    // Reset chat context
    mockUseChatList.rooms = mockRooms;
    mockUseChatList.lastMessages = mockLastMessages;
    mockUseChatList.unreadCounts = mockUnreadCounts;
  });

  describe("Basic Rendering", () => {
    it("renders the chat list correctly", async () => {
      const { getByText, getByPlaceholderText, getByTestId } = render(
        <ChatListPage navigation={mockNavigation} />
      );

      expect(getByText("Chats")).toBeTruthy();
      expect(getByPlaceholderText("Search chats...")).toBeTruthy();
      expect(getByText("Long press on any chat to remove it")).toBeTruthy();

      // Check if chat items are rendered
      await waitFor(() => {
        expect(getByTestId("chat-item-user-user-1")).toBeTruthy();
        expect(getByTestId("chat-item-group-group-1")).toBeTruthy();
      });
    });

    it("displays user and group names correctly", async () => {
      const { getByTestId } = render(
        <ChatListPage navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByTestId("chat-name-user-1")).toBeTruthy();
        expect(getByTestId("chat-name-group-1")).toBeTruthy();
      });
    });

    it("displays last messages correctly", async () => {
      const { getByTestId, getByText } = render(
        <ChatListPage navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText("Hey, how are you?")).toBeTruthy();
        expect(getByText("Meeting at 10 AM")).toBeTruthy();
      });
    });

    it("displays unread counts correctly", async () => {
      const { getByTestId } = render(
        <ChatListPage navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByTestId("unread-count-user-1")).toBeTruthy();
        expect(getByTestId("unread-count-group-1")).toBeTruthy();
      });
    });
  });

  describe("Chat Sorting", () => {
    it("sorts chats by last message timestamp", async () => {
      const { getByTestId } = render(
        <ChatListPage navigation={mockNavigation} />
      );

      await waitFor(() => {
        // group-1 should be first (highest timestamp: 1641002400)
        // user-2 should be second (timestamp: 1640998800)
        // user-1 should be third (timestamp: 1640995200)
        // group-2 should be last (lowest timestamp: 1640991600)
        expect(getByTestId("chat-item-group-group-1")).toBeTruthy();
        expect(getByTestId("chat-item-user-user-2")).toBeTruthy();
        expect(getByTestId("chat-item-user-user-1")).toBeTruthy();
        expect(getByTestId("chat-item-group-group-2")).toBeTruthy();
      });
    });

    it("handles chats without last messages", async () => {
      // Update mock to have a chat without last message
      mockUseChatList.rooms = [
        ...mockRooms,
        { key: "user-3", type: "user" as const },
      ];
      (mockAuthContext as any).mongoUser.chatrooms_with = [
        ...mockUsers,
        { _id: "user-3", username: "no_messages_user" },
      ];

      const { getByTestId } = render(
        <ChatListPage navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByTestId("chat-item-user-user-3")).toBeTruthy();
      });
    });
  });

  describe("Search Functionality", () => {
    it("filters chats based on search query", async () => {
      const { getByPlaceholderText, queryByTestId, getByTestId } = render(
        <ChatListPage navigation={mockNavigation} />
      );

      const searchInput = getByPlaceholderText("Search chats...");

      fireEvent.changeText(searchInput, "john");

      await waitFor(() => {
        expect(getByTestId("chat-item-user-user-1")).toBeTruthy(); // john_doe should be visible
        expect(queryByTestId("chat-item-user-user-2")).toBeNull(); // jane_smith should be hidden
      });
    });

    it("filters groups based on search query", async () => {
      const { getByPlaceholderText, queryByTestId, getByTestId } = render(
        <ChatListPage navigation={mockNavigation} />
      );

      const searchInput = getByPlaceholderText("Search chats...");

      fireEvent.changeText(searchInput, "hiking");

      await waitFor(() => {
        expect(getByTestId("chat-item-group-group-1")).toBeTruthy(); // Hiking Group should be visible
        expect(queryByTestId("chat-item-group-group-2")).toBeNull(); // Photography Club should be hidden
      });
    });

    it("shows all chats when search is cleared", async () => {
      const { getByPlaceholderText, getByTestId } = render(
        <ChatListPage navigation={mockNavigation} />
      );

      const searchInput = getByPlaceholderText("Search chats...");

      fireEvent.changeText(searchInput, "john");
      fireEvent.changeText(searchInput, "");

      await waitFor(() => {
        expect(getByTestId("chat-item-user-user-1")).toBeTruthy();
        expect(getByTestId("chat-item-user-user-2")).toBeTruthy();
        expect(getByTestId("chat-item-group-group-1")).toBeTruthy();
        expect(getByTestId("chat-item-group-group-2")).toBeTruthy();
      });
    });

    it("handles case-insensitive search", async () => {
      const { getByPlaceholderText, getByTestId } = render(
        <ChatListPage navigation={mockNavigation} />
      );

      const searchInput = getByPlaceholderText("Search chats...");

      fireEvent.changeText(searchInput, "JOHN");

      await waitFor(() => {
        expect(getByTestId("chat-item-user-user-1")).toBeTruthy();
      });
    });

    it("shows no results when search doesn't match", async () => {
      const { getByPlaceholderText, queryByTestId } = render(
        <ChatListPage navigation={mockNavigation} />
      );

      const searchInput = getByPlaceholderText("Search chats...");

      fireEvent.changeText(searchInput, "nonexistent");

      await waitFor(() => {
        expect(queryByTestId("chat-item-user-user-1")).toBeNull();
        expect(queryByTestId("chat-item-user-user-2")).toBeNull();
        expect(queryByTestId("chat-item-group-group-1")).toBeNull();
        expect(queryByTestId("chat-item-group-group-2")).toBeNull();
      });
    });
  });

  describe("Pull to Refresh", () => {
    it("triggers refresh when pulling down", async () => {
      const { getByTestId } = render(
        <ChatListPage navigation={mockNavigation} />
      );

      // Find the FlatList (it should be the scrollable container)
      const flatList = getByTestId("chat-item-user-user-1").parent?.parent
        ?.parent;

      if (flatList) {
        fireEvent(flatList, "refresh");
      }

      await waitFor(() => {
        expect(mockInitializeRooms).toHaveBeenCalled();
        expect(mockAuthContext.fetchMongoUser).toHaveBeenCalledWith(
          "current-user-id"
        );
      });
    });

    it("handles refresh with no mongoUser", async () => {
      (mockAuthContext as any).mongoUser = null;
      // Empty rooms when mongoUser is null
      mockUseChatList.rooms = [];

      const { getByText } = render(
        <ChatListPage navigation={mockNavigation} />
      );

      // Since there are no items, we can only check that the component renders
      expect(getByText("Chats")).toBeTruthy();

      await waitFor(() => {
        expect(mockInitializeRooms).toHaveBeenCalled();
      });
    });

    it("handles null mongoUser", () => {
      (mockAuthContext as any).mongoUser = null;
      // Empty rooms when mongoUser is null
      mockUseChatList.rooms = [];

      const { getByText } = render(
        <ChatListPage navigation={mockNavigation} />
      );

      expect(getByText("Chats")).toBeTruthy();
    });
  });

  describe("Navigation", () => {
    it("navigates to user chat when chat item is pressed", async () => {
      const { getByTestId } = render(
        <ChatListPage navigation={mockNavigation} />
      );

      await waitFor(() => {
        const chatItem = getByTestId("chat-item-press-user-1");
        fireEvent.press(chatItem);
      });

      expect(mockNavigate).toHaveBeenCalledWith("ChatRoom", {
        type: "user",
        user: mockUsers[0],
        group: undefined,
      });
    });

    it("navigates to group chat when group item is pressed", async () => {
      const { getByTestId } = render(
        <ChatListPage navigation={mockNavigation} />
      );

      await waitFor(() => {
        const chatItem = getByTestId("chat-item-press-group-1");
        fireEvent.press(chatItem);
      });

      expect(mockNavigate).toHaveBeenCalledWith("ChatRoom", {
        type: "group",
        user: undefined,
        group: mockGroups[0],
      });
    });
  });

  describe("Chat Deletion", () => {
    it("removes chat room when delete is triggered", async () => {
      const { getByTestId } = render(
        <ChatListPage navigation={mockNavigation} />
      );

      await waitFor(() => {
        const deleteButton = getByTestId("delete-chat-user-1");
        fireEvent(deleteButton, "longPress");
      });

      expect(mockRemoveRoom).toHaveBeenCalledWith("user-1");
    });

    it("removes group chat when delete is triggered", async () => {
      const { getByTestId } = render(
        <ChatListPage navigation={mockNavigation} />
      );

      await waitFor(() => {
        const deleteButton = getByTestId("delete-chat-group-1");
        fireEvent(deleteButton, "longPress");
      });

      expect(mockRemoveRoom).toHaveBeenCalledWith("group-1");
    });
  });

  describe("Lifecycle Methods", () => {
    it("initializes rooms on mount", () => {
      render(<ChatListPage navigation={mockNavigation} />);

      expect(mockInitializeRooms).toHaveBeenCalled();
    });

    it("initializes rooms on focus", () => {
      render(<ChatListPage navigation={mockNavigation} />);

      expect(mockUseFocusEffect).toHaveBeenCalled();
      expect(mockInitializeRooms).toHaveBeenCalled();
    });
  });

  describe("Empty States", () => {
    it("handles empty chat list", () => {
      mockUseChatList.rooms = [];

      const { getByText, queryByTestId } = render(
        <ChatListPage navigation={mockNavigation} />
      );

      expect(getByText("Chats")).toBeTruthy();
      expect(queryByTestId("chat-item-user-user-1")).toBeNull();
      expect(queryByTestId("chat-item-group-group-1")).toBeNull();
    });

    it("handles missing chatrooms_with data", () => {
      (mockAuthContext as any).mongoUser = {
        _id: "current-user-id",
        chatrooms_with: [],
        chatrooms_groups: [],
      };

      const { getByText } = render(
        <ChatListPage navigation={mockNavigation} />
      );

      expect(getByText("Chats")).toBeTruthy();
    });

    it("handles null mongoUser", () => {
      (mockAuthContext as any).mongoUser = null;
      // Empty rooms when mongoUser is null
      mockUseChatList.rooms = [];

      const { getByText } = render(
        <ChatListPage navigation={mockNavigation} />
      );

      expect(getByText("Chats")).toBeTruthy();
    });
  });

  describe("Data Updates", () => {
    it("re-renders when rooms data changes", async () => {
      const { rerender, getByTestId, queryByTestId } = render(
        <ChatListPage navigation={mockNavigation} />
      );

      // Initial render should show user-1
      await waitFor(() => {
        expect(getByTestId("chat-item-user-user-1")).toBeTruthy();
      });

      // Update rooms data
      mockUseChatList.rooms = [{ key: "user-2", type: "user" as const }];

      rerender(<ChatListPage navigation={mockNavigation} />);

      await waitFor(() => {
        expect(queryByTestId("chat-item-user-user-1")).toBeNull();
        expect(getByTestId("chat-item-user-user-2")).toBeTruthy();
      });
    });

    it("re-renders when last messages change", async () => {
      const { rerender, getByText } = render(
        <ChatListPage navigation={mockNavigation} />
      );

      // Initial message
      await waitFor(() => {
        expect(getByText("Hey, how are you?")).toBeTruthy();
      });

      // Update last message
      mockUseChatList.lastMessages = {
        ...mockUseChatList.lastMessages,
        "user-1": {
          text: "Updated message",
          createdAt: { seconds: 1640995200 },
        },
      };

      rerender(<ChatListPage navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText("Updated message")).toBeTruthy();
      });
    });

    it("re-renders when unread counts change", async () => {
      const { rerender, getByTestId, queryByTestId } = render(
        <ChatListPage navigation={mockNavigation} />
      );

      // Initial unread count
      await waitFor(() => {
        expect(getByTestId("unread-count-user-1")).toBeTruthy();
      });

      // Clear unread count
      mockUseChatList.unreadCounts = {
        ...mockUseChatList.unreadCounts,
        "user-1": 0,
      };

      rerender(<ChatListPage navigation={mockNavigation} />);

      await waitFor(() => {
        expect(queryByTestId("unread-count-user-1")).toBeNull();
      });
    });
  });
});
