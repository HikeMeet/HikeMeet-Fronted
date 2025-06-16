import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import ProfilePage from "../../screens/my-profile/my-profile";
import { mockAuthContext } from "../__mocks__/auth-context";

// Mock React Navigation
const mockUseFocusEffect = jest.fn();
jest.mock("@react-navigation/native", () => ({
  useFocusEffect: (callback: Function) => {
    mockUseFocusEffect(callback);
    setImmediate(() => {
      callback();
    });
  },
}));

// Mock auth context
jest.mock("../../contexts/auth-context", () => ({
  useAuth: () => mockAuthContext,
}));

// Mock chat context
const mockInitializeRooms = jest.fn();
jest.mock("../../contexts/chat-context", () => ({
  useChatList: () => ({
    initializeRooms: mockInitializeRooms,
  }),
}));

// Mock fetchPostsForUser API
const mockFetchPostsForUser = jest.fn();
jest.mock("../../components/requests/fetch-posts", () => ({
  fetchPostsForUser: mockFetchPostsForUser,
}));

// Mock components with simple implementations
jest.mock("../../screens/posts/components/create-post-buton", () => {
  const React = require("react");
  const { TouchableOpacity, Text } = require("react-native");
  return ({ navigation, location, onPress }: any) => (
    <TouchableOpacity testID="create-post-button" onPress={onPress}>
      <Text>Create Post</Text>
    </TouchableOpacity>
  );
});

jest.mock("../../screens/my-profile/components/profile-bio-section", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return ({ bio }: any) => (
    <View testID="bio-section">
      <Text testID="bio-text">{bio || "No bio available"}</Text>
    </View>
  );
});

jest.mock("../../components/profile-hikers-button", () => {
  const React = require("react");
  const { TouchableOpacity, Text } = require("react-native");
  return ({ showHikers, toggleHikers, user }: any) => (
    <TouchableOpacity testID="hikers-button" onPress={toggleHikers}>
      <Text testID="hikers-button-text">
        {showHikers
          ? "Hide Hikers"
          : `${user?.followers?.length || 0} Followers`}
      </Text>
    </TouchableOpacity>
  );
});

jest.mock("../../components/profile-image", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return ({ initialImage, size, id, uploadType }: any) => (
    <View testID="profile-image" style={{ width: size, height: size }}>
      <Text testID="profile-image-id">{id}</Text>
    </View>
  );
});

// Mock PostCard - render nothing for simplicity
jest.mock("../../screens/posts/components/post-card-on-feeds", () => {
  return () => null;
});

// Mock HikersList
jest.mock("../../components/hikers-list-in-profile", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return ({ isMyProfile, navigation, profileId, headerComponent }: any) => (
    <View testID="hikers-list">
      <Text testID="hikers-list-title">Hikers List</Text>
      <Text testID="hikers-profile-id">{profileId}</Text>
      {headerComponent}
    </View>
  );
});

jest.mock("../../screens/my-profile/components/rank-images", () => ({
  getRankIcon: (rankName: string) => {
    const React = require("react");
    const { View, Text } = require("react-native");
    return ({ width, height }: any) => (
      <View testID={`rank-icon-${rankName}`} style={{ width, height }}>
        <Text testID="rank-icon-text">{rankName} Icon</Text>
      </View>
    );
  },
}));

jest.mock("../../screens/my-profile/components/rank-info-modal", () => {
  const React = require("react");
  const { Modal, View, Text, TouchableOpacity } = require("react-native");
  return ({ visible, onClose, rankName, exp, isMyProfile }: any) => (
    <Modal visible={visible} testID="rank-info-modal">
      <View testID="rank-modal-content">
        <Text testID="rank-modal-name">{rankName}</Text>
        <Text testID="rank-modal-exp">EXP: {exp}</Text>
        <TouchableOpacity testID="rank-modal-close" onPress={onClose}>
          <Text>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
});

// Mock vector icons
jest.mock("react-native-vector-icons/MaterialIcons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return ({ name, size, color, ...props }: any) => (
    <Text testID={`icon-${name}`} {...props}>
      {name}
    </Text>
  );
});

jest.mock("@expo/vector-icons", () => ({
  FontAwesome: ({ name, size, ...props }: any) => {
    const React = require("react");
    const { Text } = require("react-native");
    return (
      <Text testID={`fontawesome-${name}`} {...props}>
        {name}
      </Text>
    );
  },
}));

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  setOptions: jest.fn(),
};

// Sample user data
const mockUser = {
  _id: "user-123",
  username: "adventurer_hiker",
  first_name: "John",
  last_name: "Doe",
  email: "john.doe@example.com",
  profile_picture: "https://example.com/profile.jpg",
  bio: "I love hiking and exploring nature!",
  rank: "Explorer",
  exp: 1250,
  followers: [
    { _id: "follower-1", username: "hiker1" },
    { _id: "follower-2", username: "hiker2" },
  ],
  following: [{ _id: "following-1", username: "nature_lover" }],
  facebook_link: "https://facebook.com/johndoe",
  instagram_link: "https://instagram.com/johndoe",
};

describe("ProfilePage - Simple Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchPostsForUser.mockResolvedValue([]);
    (mockAuthContext as any).mongoUser = mockUser;
    (mockAuthContext as any).mongoId = "user-123";
    (mockAuthContext as any).fetchMongoUser = jest.fn();
  });

  describe("Basic Rendering", () => {
    it("displays basic user details", () => {
      const { getByText, getByTestId } = render(
        <ProfilePage navigation={mockNavigation} />
      );

      expect(getByText("adventurer_hiker")).toBeTruthy();
      expect(getByText("John Doe")).toBeTruthy();
      expect(getByTestId("profile-image")).toBeTruthy();
      expect(getByTestId("bio-section")).toBeTruthy();
    });

    it("displays user rank and icon", () => {
      const { getByText, getByTestId } = render(
        <ProfilePage navigation={mockNavigation} />
      );

      expect(getByText("Rank: Explorer")).toBeTruthy();
      expect(getByTestId("rank-icon-Explorer")).toBeTruthy();
    });

    it("displays settings button", () => {
      const { getByTestId } = render(
        <ProfilePage navigation={mockNavigation} />
      );

      expect(getByTestId("icon-settings")).toBeTruthy();
    });

    it("displays social media links", () => {
      const { getByTestId } = render(
        <ProfilePage navigation={mockNavigation} />
      );

      expect(getByTestId("fontawesome-facebook-square")).toBeTruthy();
      expect(getByTestId("fontawesome-instagram")).toBeTruthy();
    });

    it("displays create post button", () => {
      const { getByTestId } = render(
        <ProfilePage navigation={mockNavigation} />
      );

      expect(getByTestId("create-post-button")).toBeTruthy();
    });
  });

  describe("User Interactions", () => {
    it("navigates to settings when settings button is pressed", () => {
      const { getByTestId } = render(
        <ProfilePage navigation={mockNavigation} />
      );

      const settingsButton = getByTestId("icon-settings");
      fireEvent.press(settingsButton);

      expect(mockNavigate).toHaveBeenCalledWith("AccountStack", {
        screen: "Settings",
      });
    });

    it("toggles between posts view and followers list", async () => {
      const { getByTestId, queryByTestId } = render(
        <ProfilePage navigation={mockNavigation} />
      );

      // Click followers button
      const hikersButton = getByTestId("hikers-button");
      fireEvent.press(hikersButton);

      await waitFor(() => {
        expect(getByTestId("hikers-list")).toBeTruthy();
      });

      // Click again to return to posts
      fireEvent.press(hikersButton);

      await waitFor(() => {
        expect(queryByTestId("hikers-list")).toBeNull();
      });
    });

    it("shows rank modal when rank is clicked", async () => {
      const { getByText, getByTestId } = render(
        <ProfilePage navigation={mockNavigation} />
      );

      const rankText = getByText("Rank: Explorer");
      fireEvent.press(rankText);

      await waitFor(() => {
        expect(getByTestId("rank-info-modal")).toBeTruthy();
        expect(getByTestId("rank-modal-name")).toHaveTextContent("Explorer");
        expect(getByTestId("rank-modal-exp")).toHaveTextContent("EXP: 1250");
      });
    });

    it("closes rank modal", async () => {
      const { getByText, getByTestId, queryByTestId } = render(
        <ProfilePage navigation={mockNavigation} />
      );

      // Open modal
      const rankText = getByText("Rank: Explorer");
      fireEvent.press(rankText);

      await waitFor(() => {
        expect(getByTestId("rank-info-modal")).toBeTruthy();
      });

      // Close modal
      const closeButton = getByTestId("rank-modal-close");
      fireEvent.press(closeButton);

      await waitFor(() => {
        expect(queryByTestId("rank-info-modal")).toBeNull();
      });
    });

    it("allows clicking on social media links", () => {
      const { getByTestId } = render(
        <ProfilePage navigation={mockNavigation} />
      );

      const facebookIcon = getByTestId("fontawesome-facebook-square");
      const instagramIcon = getByTestId("fontawesome-instagram");

      expect(() => fireEvent.press(facebookIcon)).not.toThrow();
      expect(() => fireEvent.press(instagramIcon)).not.toThrow();
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("shows error message when user data is missing", () => {
      (mockAuthContext as any).mongoUser = null;

      const { getByText } = render(<ProfilePage navigation={mockNavigation} />);

      expect(getByText("Failed to load user data.")).toBeTruthy();
      expect(getByText("Retry")).toBeTruthy();
    });

    it("allows retry when user data is missing", () => {
      (mockAuthContext as any).mongoUser = null;

      const { getByText } = render(<ProfilePage navigation={mockNavigation} />);

      const retryButton = getByText("Retry");
      fireEvent.press(retryButton);

      expect(mockNavigate).toHaveBeenCalledWith("ProfilePage");
    });

    it("handles user without rank", () => {
      const userWithoutRank = { ...mockUser, rank: null };
      (mockAuthContext as any).mongoUser = userWithoutRank;

      const { queryByText } = render(
        <ProfilePage navigation={mockNavigation} />
      );

      expect(queryByText("Rank:")).toBeNull();
    });

    it("handles user without social media links", () => {
      const userWithoutSocial = {
        ...mockUser,
        facebook_link: null,
        instagram_link: null,
      };
      (mockAuthContext as any).mongoUser = userWithoutSocial;

      const { queryByTestId } = render(
        <ProfilePage navigation={mockNavigation} />
      );

      expect(queryByTestId("fontawesome-facebook-square")).toBeNull();
      expect(queryByTestId("fontawesome-instagram")).toBeNull();
    });

    it("handles empty bio", () => {
      const userWithoutBio = { ...mockUser, bio: null };
      (mockAuthContext as any).mongoUser = userWithoutBio;

      const { getByTestId } = render(
        <ProfilePage navigation={mockNavigation} />
      );

      expect(getByTestId("bio-text")).toHaveTextContent("No bio available");
    });

    it("handles empty followers", () => {
      const userWithoutFollowers = { ...mockUser, followers: [] };
      (mockAuthContext as any).mongoUser = userWithoutFollowers;

      const { getByTestId } = render(
        <ProfilePage navigation={mockNavigation} />
      );

      expect(getByTestId("hikers-button-text")).toHaveTextContent(
        "0 Followers"
      );
    });
  });

  describe("Lifecycle and Helper Functions", () => {
    it("calls useFocusEffect when component is loaded", () => {
      render(<ProfilePage navigation={mockNavigation} />);

      expect(mockUseFocusEffect).toHaveBeenCalled();
    });

    it("initializes chat rooms on load", async () => {
      render(<ProfilePage navigation={mockNavigation} />);

      await waitFor(() => {
        expect(mockInitializeRooms).toHaveBeenCalled();
      });
    });

    it("refreshes user data on load", async () => {
      render(<ProfilePage navigation={mockNavigation} />);

      await waitFor(() => {
        expect(mockAuthContext.fetchMongoUser).toHaveBeenCalledWith("user-123");
      });
    });

    it("handles post loading errors gracefully", async () => {
      mockFetchPostsForUser.mockRejectedValue(new Error("Network error"));
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(<ProfilePage navigation={mockNavigation} />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error fetching posts for user:",
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe("Complete Flows", () => {
    it("flow: view profile -> open rank modal -> close -> settings", async () => {
      const { getByText, getByTestId } = render(
        <ProfilePage navigation={mockNavigation} />
      );

      // Open rank modal
      const rankText = getByText("Rank: Explorer");
      fireEvent.press(rankText);

      await waitFor(() => {
        expect(getByTestId("rank-info-modal")).toBeTruthy();
      });

      // Close modal
      const closeButton = getByTestId("rank-modal-close");
      fireEvent.press(closeButton);

      // Navigate to settings
      const settingsButton = getByTestId("icon-settings");
      fireEvent.press(settingsButton);

      expect(mockNavigate).toHaveBeenCalledWith("AccountStack", {
        screen: "Settings",
      });
    });

    it("flow: toggle to followers -> back to posts", async () => {
      const { getByTestId, queryByTestId } = render(
        <ProfilePage navigation={mockNavigation} />
      );

      const hikersButton = getByTestId("hikers-button");

      // Go to followers
      fireEvent.press(hikersButton);
      await waitFor(() => {
        expect(getByTestId("hikers-list")).toBeTruthy();
      });

      // Back to posts
      fireEvent.press(hikersButton);
      await waitFor(() => {
        expect(queryByTestId("hikers-list")).toBeNull();
      });
    });

    it("checks all interface components", () => {
      const { getByText, getByTestId } = render(
        <ProfilePage navigation={mockNavigation} />
      );

      // Check all main components
      expect(getByText("adventurer_hiker")).toBeTruthy();
      expect(getByText("John Doe")).toBeTruthy();
      expect(getByText("Rank: Explorer")).toBeTruthy();
      expect(getByTestId("profile-image")).toBeTruthy();
      expect(getByTestId("bio-section")).toBeTruthy();
      expect(getByTestId("hikers-button")).toBeTruthy();
      expect(getByTestId("icon-settings")).toBeTruthy();
      expect(getByTestId("create-post-button")).toBeTruthy();
      expect(getByTestId("fontawesome-facebook-square")).toBeTruthy();
      expect(getByTestId("fontawesome-instagram")).toBeTruthy();
      expect(getByTestId("rank-icon-Explorer")).toBeTruthy();
    });
  });
});
