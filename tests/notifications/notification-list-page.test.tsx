import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import NotificationsPage from "../../screens/notifications/notification-list-page";
import { mockAuthContext } from "../__mocks__/auth-context";

// Mock Ionicons
jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

// Mock notification requests
jest.mock("../../components/requests/notification-requsts", () => ({
  fetchNotifications: jest.fn(),
  markAllNotificationsAsRead: jest.fn(),
  clearAllNotifications: jest.fn(),
}));

// Mock NotificationRow component
jest.mock("../../screens/notifications/components/notification-row", () => ({
  NotificationRow: ({ item, navigation }: any) => {
    const React = require("react");
    const { TouchableOpacity, Text, View } = require("react-native");

    return (
      <TouchableOpacity
        testID={`notification-row-${item._id}`}
        onPress={() => {
          if (item.type === "post_like" && item.post_id) {
            navigation.navigate("PostDetail", { postId: item.post_id });
          } else if (item.type === "trip_invitation" && item.trip_id) {
            navigation.navigate("TripDetail", { tripId: item.trip_id });
          }
        }}
      >
        <View
          style={{
            backgroundColor: item.read ? "#f9f9f9" : "#e3f2fd",
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: "#e0e0e0",
          }}
        >
          <Text testID={`notification-message-${item._id}`}>
            {item.message}
          </Text>
          <Text
            testID={`notification-time-${item._id}`}
            style={{ fontSize: 12, color: "#666" }}
          >
            {item.created_at}
          </Text>
          {!item.read && (
            <View
              testID={`unread-indicator-${item._id}`}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#2196f3",
                position: "absolute",
                top: 8,
                right: 8,
              }}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  },
}));

// Mock useAuth hook
jest.mock("../../contexts/auth-context", () => ({
  useAuth: () => mockAuthContext,
}));

// Import mocked functions
import {
  fetchNotifications,
  markAllNotificationsAsRead,
  clearAllNotifications,
} from "../../components/requests/notification-requsts";

// Mock navigation
const mockGoBack = jest.fn();
const mockNavigate = jest.fn();
const mockNavigation = {
  goBack: mockGoBack,
  navigate: mockNavigate,
  addListener: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  setOptions: jest.fn(),
};

// Mock notification data
const mockNotifications = [
  {
    _id: "notif-1",
    message: "John liked your post",
    type: "post_like",
    post_id: "post-123",
    user_id: "user-456",
    read: false,
    created_at: "2024-01-01T10:00:00Z",
  },
  {
    _id: "notif-2",
    message: "You were invited to Mountain Hiking trip",
    type: "trip_invitation",
    trip_id: "trip-789",
    user_id: "user-101",
    read: true,
    created_at: "2024-01-01T09:00:00Z",
  },
  {
    _id: "notif-3",
    message: "Sarah commented on your post",
    type: "post_comment",
    post_id: "post-456",
    user_id: "user-789",
    read: false,
    created_at: "2024-01-01T08:00:00Z",
  },
  {
    _id: "notif-4",
    message: "New group message in Photographers",
    type: "group_message",
    group_id: "group-123",
    user_id: "user-555",
    read: true,
    created_at: "2024-01-01T07:00:00Z",
  },
  {
    _id: "notif-5",
    message: "Mike started following you",
    type: "follow",
    user_id: "user-888",
    read: false,
    created_at: "2024-01-01T06:00:00Z",
  },
];

describe("NotificationsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset auth context
    mockAuthContext.mongoId = "mongo-test-id-123";

    // Reset fetch notifications mock
    (fetchNotifications as jest.Mock).mockResolvedValue(mockNotifications);
  });

  it("fetches and displays notifications", async () => {
    const { getByText, getByTestId } = render(
      <NotificationsPage navigation={mockNavigation} />
    );

    await waitFor(() => {
      expect(fetchNotifications).toHaveBeenCalledWith("mock-token");
    });

    await waitFor(() => {
      expect(getByText("Notifications")).toBeTruthy();
      expect(getByTestId("notification-row-notif-1")).toBeTruthy();
      expect(getByText("John liked your post")).toBeTruthy();
      expect(
        getByText("You were invited to Mountain Hiking trip")
      ).toBeTruthy();
    });
  });

  it("displays header with action buttons", async () => {
    const { getByText } = render(
      <NotificationsPage navigation={mockNavigation} />
    );

    await waitFor(() => {
      expect(getByText("Notifications")).toBeTruthy();
      expect(getByText("Mark all read")).toBeTruthy();
      expect(getByText("Clear all")).toBeTruthy();
    });
  });

  it("shows unread indicators for unread notifications", async () => {
    const { getByTestId } = render(
      <NotificationsPage navigation={mockNavigation} />
    );

    await waitFor(() => {
      // Should show unread indicators for unread notifications
      expect(getByTestId("unread-indicator-notif-1")).toBeTruthy();
      expect(getByTestId("unread-indicator-notif-3")).toBeTruthy();
      expect(getByTestId("unread-indicator-notif-5")).toBeTruthy();

      // Should not show for read notifications
      expect(() => getByTestId("unread-indicator-notif-2")).toThrow();
      expect(() => getByTestId("unread-indicator-notif-4")).toThrow();
    });
  });

  it("marks all notifications as read", async () => {
    const { getByText, getByTestId } = render(
      <NotificationsPage navigation={mockNavigation} />
    );

    await waitFor(() => {
      expect(getByTestId("unread-indicator-notif-1")).toBeTruthy();
    });

    const markAllReadButton = getByText("Mark all read");
    fireEvent.press(markAllReadButton);

    await waitFor(() => {
      expect(markAllNotificationsAsRead).toHaveBeenCalledWith("mock-token");
      expect(mockAuthContext.fetchMongoUser).toHaveBeenCalledWith(
        "mongo-test-id-123"
      );
    });

    // Unread indicators should be gone (optimistic UI)
    await waitFor(() => {
      expect(() => getByTestId("unread-indicator-notif-1")).toThrow();
      expect(() => getByTestId("unread-indicator-notif-3")).toThrow();
    });
  });

  it("clears all notifications", async () => {
    const { getByText, getByTestId, queryByTestId } = render(
      <NotificationsPage navigation={mockNavigation} />
    );

    await waitFor(() => {
      expect(getByTestId("notification-row-notif-1")).toBeTruthy();
    });

    const clearAllButton = getByText("Clear all");
    fireEvent.press(clearAllButton);

    await waitFor(() => {
      expect(clearAllNotifications).toHaveBeenCalledWith("mock-token");
    });

    // All notifications should be gone (optimistic UI)
    await waitFor(() => {
      expect(queryByTestId("notification-row-notif-1")).toBeNull();
      expect(getByText("No notifications")).toBeTruthy();
    });
  });

  it("navigates to post detail when post notification is tapped", async () => {
    const { getByTestId } = render(
      <NotificationsPage navigation={mockNavigation} />
    );

    await waitFor(() => {
      expect(getByTestId("notification-row-notif-1")).toBeTruthy();
    });

    fireEvent.press(getByTestId("notification-row-notif-1"));

    expect(mockNavigate).toHaveBeenCalledWith("PostDetail", {
      postId: "post-123",
    });
  });

  it("navigates to trip detail when trip notification is tapped", async () => {
    const { getByTestId } = render(
      <NotificationsPage navigation={mockNavigation} />
    );

    await waitFor(() => {
      expect(getByTestId("notification-row-notif-2")).toBeTruthy();
    });

    fireEvent.press(getByTestId("notification-row-notif-2"));

    expect(mockNavigate).toHaveBeenCalledWith("TripDetail", {
      tripId: "trip-789",
    });
  });

  it("shows empty state when no notifications", async () => {
    (fetchNotifications as jest.Mock).mockResolvedValue([]);

    const { getByText } = render(
      <NotificationsPage navigation={mockNavigation} />
    );

    await waitFor(() => {
      expect(getByText("No notifications")).toBeTruthy();
    });
  });

  it("handles fetch notifications error", async () => {
    (fetchNotifications as jest.Mock).mockRejectedValue(
      new Error("Network error")
    );

    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    const { getByText } = render(
      <NotificationsPage navigation={mockNavigation} />
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching notifications:",
        expect.any(Error)
      );
      expect(getByText("No notifications")).toBeTruthy();
    });

    consoleSpy.mockRestore();
  });

  it("handles mark all read error", async () => {
    (markAllNotificationsAsRead as jest.Mock).mockRejectedValue(
      new Error("API error")
    );

    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    const { getByText, getByTestId } = render(
      <NotificationsPage navigation={mockNavigation} />
    );

    await waitFor(() => {
      expect(getByTestId("notification-row-notif-1")).toBeTruthy();
    });

    const markAllReadButton = getByText("Mark all read");
    fireEvent.press(markAllReadButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error marking all read:",
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });

  it("handles clear all error and reverts optimistic UI", async () => {
    (clearAllNotifications as jest.Mock).mockRejectedValue(
      new Error("API error")
    );

    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    const { getByText, getByTestId } = render(
      <NotificationsPage navigation={mockNavigation} />
    );

    await waitFor(() => {
      expect(getByTestId("notification-row-notif-1")).toBeTruthy();
    });

    const clearAllButton = getByText("Clear all");
    fireEvent.press(clearAllButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error clearing notifications:",
        expect.any(Error)
      );
    });

    // Should reload notifications after error
    await waitFor(() => {
      expect(fetchNotifications).toHaveBeenCalledTimes(2); // Initial + reload after error
    });

    consoleSpy.mockRestore();
  });

  it("handles missing token gracefully", async () => {
    // Temporarily override getToken for this test
    const originalGetToken = mockAuthContext.getToken;
    mockAuthContext.getToken = jest.fn().mockResolvedValue(null);

    const { getByText } = render(
      <NotificationsPage navigation={mockNavigation} />
    );

    await waitFor(() => {
      expect(fetchNotifications).not.toHaveBeenCalled();
      expect(getByText("No notifications")).toBeTruthy();
    });

    // Restore original function
    mockAuthContext.getToken = originalGetToken;
  });

  it("displays notification timestamps", async () => {
    const { getByTestId } = render(
      <NotificationsPage navigation={mockNavigation} />
    );

    await waitFor(() => {
      expect(getByTestId("notification-time-notif-1")).toBeTruthy();
      expect(getByTestId("notification-time-notif-2")).toBeTruthy();
    });
  });

  it("handles mark all read when no token", async () => {
    // Temporarily override getToken for this test
    const originalGetToken = mockAuthContext.getToken;
    mockAuthContext.getToken = jest.fn().mockResolvedValue(null);

    const { getByText } = render(
      <NotificationsPage navigation={mockNavigation} />
    );

    await waitFor(() => {
      const markAllReadButton = getByText("Mark all read");
      fireEvent.press(markAllReadButton);
    });

    expect(markAllNotificationsAsRead).not.toHaveBeenCalled();

    // Restore original function
    mockAuthContext.getToken = originalGetToken;
  });

  it("handles clear all when no token", async () => {
    // Temporarily override getToken for this test
    const originalGetToken = mockAuthContext.getToken;
    mockAuthContext.getToken = jest.fn().mockResolvedValue(null);

    const { getByText } = render(
      <NotificationsPage navigation={mockNavigation} />
    );

    await waitFor(() => {
      const clearAllButton = getByText("Clear all");
      fireEvent.press(clearAllButton);
    });

    expect(clearAllNotifications).not.toHaveBeenCalled();

    // Restore original function
    mockAuthContext.getToken = originalGetToken;
  });

  it("displays first 10 notifications when many are available", async () => {
    // Create 15 notifications to test pagination display
    const manyNotifications = Array.from({ length: 15 }, (_, i) => ({
      _id: `notif-${i + 1}`,
      message: `Notification ${i + 1}`,
      type: "post_like",
      post_id: `post-${i}`,
      user_id: `user-${i}`,
      read: i % 2 === 0,
      created_at: `2024-01-01T${10 + i}:00:00Z`,
    }));

    (fetchNotifications as jest.Mock).mockResolvedValue(manyNotifications);

    const { getByTestId, queryByTestId } = render(
      <NotificationsPage navigation={mockNavigation} />
    );

    await waitFor(() => {
      expect(getByTestId("notification-row-notif-1")).toBeTruthy();
      expect(getByTestId("notification-row-notif-10")).toBeTruthy();
      // Should not show item 11 initially (only first 10)
      expect(queryByTestId("notification-row-notif-11")).toBeNull();
    });
  });
});
