import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import PostDetailPage from "../../screens/posts/post-detail-page";
import { mockAuthContext } from "../__mocks__/auth-context";

// Mock SafeAreaView
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock PostActions component
jest.mock("../../screens/posts/components/post-action-buttons", () => {
  const React = require("react");
  const { View, Text, TouchableOpacity } = require("react-native");
  return function PostActions({ post, onLikeChange, onCommentsUpdated }: any) {
    return (
      <View testID="post-actions">
        <TouchableOpacity
          testID="like-button"
          onPress={() => {
            onLikeChange && onLikeChange();
          }}
        >
          <Text>Like ({post.likes?.length || 0})</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="comment-button"
          onPress={() => {
            onCommentsUpdated &&
              onCommentsUpdated([
                ...post.comments,
                {
                  _id: "new-comment",
                  author: { username: "test-user" },
                  content: "Test comment",
                  created_at: new Date().toISOString(),
                },
              ]);
          }}
        >
          <Text>Comment ({post.comments?.length || 0})</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="share-button">
          <Text>Share</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

// Mock MediaList component
jest.mock("../../components/media-list-after-upload", () => {
  const React = require("react");
  const { View, Text, TouchableOpacity } = require("react-native");
  return function MediaList({ media, onPressItem }: any) {
    return (
      <View testID="media-list">
        {media.map((item: any, index: number) => (
          <TouchableOpacity
            key={index}
            testID={`media-item-${index}`}
            onPress={() => onPressItem && onPressItem(index)}
          >
            <Text>
              {item.type}: {item.url}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };
});

// Mock FullScreenMediaModal component
jest.mock("../../components/media-fullscreen-modal", () => {
  const React = require("react");
  const { View, Text, TouchableOpacity } = require("react-native");
  return function FullScreenMediaModal({ media, initialIndex, onClose }: any) {
    return (
      <View testID="fullscreen-media-modal">
        <Text testID="current-media-index">Current: {initialIndex}</Text>
        <Text testID="media-count">Total: {media.length}</Text>
        <TouchableOpacity testID="close-fullscreen" onPress={onClose}>
          <Text>Close</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

// Mock InnerPostCard component
jest.mock("../../screens/posts/components/inner-post-card", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return function InnerPostCard({ post }: any) {
    return (
      <View testID="inner-post-card">
        <Text testID="original-post-content">{post.content}</Text>
        <Text testID="original-post-author">{post.author.username}</Text>
      </View>
    );
  };
});

// Mock ProfileHeaderLink component
jest.mock(
  "../../screens/my-profile/components/profile-image-name-button",
  () => {
    const React = require("react");
    const { TouchableOpacity, Text, View } = require("react-native");
    return function ProfileHeaderLink({
      userId,
      username,
      profileImage,
      navigation,
    }: any) {
      return (
        <TouchableOpacity
          testID={`profile-header-${userId}`}
          onPress={() => navigation.navigate("Profile", { userId })}
        >
          <View>
            <Text testID="profile-username">{username}</Text>
            <Text testID="profile-image">Profile Image: {profileImage}</Text>
          </View>
        </TouchableOpacity>
      );
    };
  }
);

// Mock PostOptionsModal component
jest.mock("../../screens/posts/components/post-setting-modal", () => {
  const React = require("react");
  const { Modal, View, Text, TouchableOpacity } = require("react-native");
  return function PostOptionsModal({
    visible,
    onClose,
    post,
    onEdit,
    onPostUpdated,
  }: any) {
    return (
      <Modal visible={visible} testID="post-options-modal" transparent>
        <View
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <TouchableOpacity testID="edit-post-button" onPress={onEdit}>
            <Text>Edit Post</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="delete-post-button"
            onPress={() => {
              onPostUpdated && onPostUpdated(post);
            }}
          >
            <Text>Delete Post</Text>
          </TouchableOpacity>
          <TouchableOpacity testID="close-options-modal" onPress={onClose}>
            <Text>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  };
});

// Mock EditableText component
jest.mock("../../screens/posts/components/editable-text-for-posts", () => {
  const React = require("react");
  const { View, TextInput, TouchableOpacity, Text } = require("react-native");
  return function EditableText({
    text,
    isEditing,
    onSaveComplete,
    onCancel,
  }: any) {
    const [editText, setEditText] = React.useState(text);

    if (!isEditing) return null;

    return (
      <View testID="editable-text">
        <TextInput
          testID="edit-text-input"
          value={editText}
          onChangeText={setEditText}
          multiline
        />
        <TouchableOpacity
          testID="save-edit-button"
          onPress={() => onSaveComplete(editText)}
        >
          <Text>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="cancel-edit-button" onPress={onCancel}>
          <Text>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

// Mock ParsedMentionText component
jest.mock("../../screens/posts/components/parsed-mention-text", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return function ParsedMentionText({ text }: any) {
    return <Text testID="parsed-mention-text">{text}</Text>;
  };
});

// Mock attached previews components
jest.mock("../../screens/posts/components/attached-group-preview", () => {
  const React = require("react");
  const { View, Text, TouchableOpacity } = require("react-native");
  return function SelectedGroupsList({ groups, navigation }: any) {
    return (
      <View testID="attached-groups">
        {groups.map((group: any) => (
          <TouchableOpacity
            key={group._id}
            testID={`attached-group-${group._id}`}
            onPress={() =>
              navigation.navigate("GroupDetails", { groupId: group._id })
            }
          >
            <Text>{group.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };
});

jest.mock("../../screens/posts/components/attached-trip-preview", () => {
  const React = require("react");
  const { View, Text, TouchableOpacity } = require("react-native");
  return function SelectedTripsList({ trips, navigation }: any) {
    return (
      <View testID="attached-trips">
        {trips.map((trip: any) => (
          <TouchableOpacity
            key={trip._id}
            testID={`attached-trip-${trip._id}`}
            onPress={() =>
              navigation.navigate("TripDetails", { tripId: trip._id })
            }
          >
            <Text>{trip.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };
});

// Mock react-native-gesture-handler
jest.mock("react-native-gesture-handler", () => {
  const actual = jest.requireActual("react-native-gesture-handler");
  return {
    ...actual,
    ScrollView: require("react-native").ScrollView,
  };
});

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

// Mock fetch
global.fetch = jest.fn();

// Mock post data
const mockPost = {
  _id: "post-123",
  content: "This is a test post content with @mention",
  author: {
    _id: "user-123",
    username: "testuser",
    profile_picture: { url: "https://example.com/profile.jpg" },
  },
  images: [
    {
      url: "https://example.com/image1.jpg",
      image_id: "img-1",
      type: "image",
    },
    {
      url: "https://example.com/video1.mp4",
      image_id: "vid-1",
      type: "video",
      video_sceenshot_url: "https://example.com/thumb1.jpg",
    },
  ],
  attached_groups: [
    { _id: "group-1", name: "Hiking Group" },
    { _id: "group-2", name: "Photography Group" },
  ],
  attached_trips: [
    { _id: "trip-1", name: "Mountain Adventure" },
    { _id: "trip-2", name: "Beach Trip" },
  ],
  likes: ["user1", "user2", "user3"],
  comments: [
    {
      _id: "comment-1",
      author: { username: "commenter1" },
      content: "Great post!",
      created_at: "2024-01-01T10:00:00Z",
    },
    {
      _id: "comment-2",
      author: { username: "commenter2" },
      content: "Nice photo!",
      created_at: "2024-01-01T11:00:00Z",
    },
  ],
  created_at: "2024-01-01T09:00:00Z",
  privacy: "public",
  is_shared: false,
};

const mockSharedPost = {
  ...mockPost,
  _id: "shared-post-123",
  content: "Sharing this amazing post!",
  is_shared: true,
  original_post: {
    _id: "original-post-123",
    content: "Original post content",
    author: { username: "originaluser" },
  },
};

describe("PostDetailPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset auth context
    mockAuthContext.mongoId = "mongo-test-id-123";

    // Reset fetch mock
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ post: mockPost }),
    });
  });

  const defaultRoute = {
    params: {
      postId: "post-123",
      onPostUpdated: jest.fn(),
    },
  };

  it("fetches and displays post details", async () => {
    const { getByTestId, getByText } = render(
      <PostDetailPage navigation={mockNavigation} route={defaultRoute} />
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${process.env.EXPO_LOCAL_SERVER}/api/post/post-123`
      );
    });

    await waitFor(() => {
      expect(getByTestId("parsed-mention-text")).toBeTruthy();
      expect(
        getByText("This is a test post content with @mention")
      ).toBeTruthy();
      expect(getByTestId("profile-username")).toBeTruthy();
      expect(getByText("testuser")).toBeTruthy();
    });
  });

  it("displays post metadata correctly", async () => {
    const { getByText } = render(
      <PostDetailPage navigation={mockNavigation} route={defaultRoute} />
    );

    await waitFor(() => {
      expect(getByText(/Posted on:/)).toBeTruthy();
      expect(getByText("Privacy: Public")).toBeTruthy();
    });
  });

  it("displays attached media", async () => {
    const { getByTestId } = render(
      <PostDetailPage navigation={mockNavigation} route={defaultRoute} />
    );

    await waitFor(() => {
      expect(getByTestId("media-list")).toBeTruthy();
      expect(getByTestId("media-item-0")).toBeTruthy();
      expect(getByTestId("media-item-1")).toBeTruthy();
    });
  });

  it("opens fullscreen media modal when media is tapped", async () => {
    const { getByTestId } = render(
      <PostDetailPage navigation={mockNavigation} route={defaultRoute} />
    );

    await waitFor(() => {
      expect(getByTestId("media-item-0")).toBeTruthy();
    });

    fireEvent.press(getByTestId("media-item-0"));

    await waitFor(() => {
      expect(getByTestId("fullscreen-media-modal")).toBeTruthy();
      expect(getByTestId("current-media-index")).toBeTruthy();
    });
  });

  it("closes fullscreen media modal", async () => {
    const { getByTestId, queryByTestId } = render(
      <PostDetailPage navigation={mockNavigation} route={defaultRoute} />
    );

    await waitFor(() => {
      fireEvent.press(getByTestId("media-item-0"));
    });

    await waitFor(() => {
      expect(getByTestId("fullscreen-media-modal")).toBeTruthy();
    });

    fireEvent.press(getByTestId("close-fullscreen"));

    await waitFor(() => {
      expect(queryByTestId("fullscreen-media-modal")).toBeNull();
    });
  });

  it("displays attached groups", async () => {
    const { getByTestId, getByText } = render(
      <PostDetailPage navigation={mockNavigation} route={defaultRoute} />
    );

    await waitFor(() => {
      expect(getByTestId("attached-groups")).toBeTruthy();
      expect(getByTestId("attached-group-group-1")).toBeTruthy();
      expect(getByText("Hiking Group")).toBeTruthy();
      expect(getByText("Photography Group")).toBeTruthy();
    });
  });

  it("displays attached trips", async () => {
    const { getByTestId, getByText } = render(
      <PostDetailPage navigation={mockNavigation} route={defaultRoute} />
    );

    await waitFor(() => {
      expect(getByTestId("attached-trips")).toBeTruthy();
      expect(getByTestId("attached-trip-trip-1")).toBeTruthy();
      expect(getByText("Mountain Adventure")).toBeTruthy();
      expect(getByText("Beach Trip")).toBeTruthy();
    });
  });

  it("navigates to group details when group is tapped", async () => {
    const { getByTestId } = render(
      <PostDetailPage navigation={mockNavigation} route={defaultRoute} />
    );

    await waitFor(() => {
      expect(getByTestId("attached-group-group-1")).toBeTruthy();
    });

    fireEvent.press(getByTestId("attached-group-group-1"));

    expect(mockNavigate).toHaveBeenCalledWith("GroupDetails", {
      groupId: "group-1",
    });
  });

  it("navigates to trip details when trip is tapped", async () => {
    const { getByTestId } = render(
      <PostDetailPage navigation={mockNavigation} route={defaultRoute} />
    );

    await waitFor(() => {
      expect(getByTestId("attached-trip-trip-1")).toBeTruthy();
    });

    fireEvent.press(getByTestId("attached-trip-trip-1"));

    expect(mockNavigate).toHaveBeenCalledWith("TripDetails", {
      tripId: "trip-1",
    });
  });

  it("displays post actions", async () => {
    const { getByTestId, getByText } = render(
      <PostDetailPage navigation={mockNavigation} route={defaultRoute} />
    );

    await waitFor(() => {
      expect(getByTestId("post-actions")).toBeTruthy();
      expect(getByTestId("like-button")).toBeTruthy();
      expect(getByText("Like (3)")).toBeTruthy();
      expect(getByText("Comment (2)")).toBeTruthy();
    });
  });

  it("handles post like action", async () => {
    const { getByTestId } = render(
      <PostDetailPage navigation={mockNavigation} route={defaultRoute} />
    );

    await waitFor(() => {
      expect(getByTestId("like-button")).toBeTruthy();
    });

    fireEvent.press(getByTestId("like-button"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2); // Initial fetch + like action refetch
    });
  });

  it("handles comment addition", async () => {
    const { getByTestId } = render(
      <PostDetailPage navigation={mockNavigation} route={defaultRoute} />
    );

    await waitFor(() => {
      expect(getByTestId("comment-button")).toBeTruthy();
    });

    fireEvent.press(getByTestId("comment-button"));

    // Comments should be updated in the post state
    await waitFor(() => {
      expect(getByTestId("comment-button")).toBeTruthy();
    });
  });

  it("opens post options modal", async () => {
    const { getByText, getByTestId } = render(
      <PostDetailPage navigation={mockNavigation} route={defaultRoute} />
    );

    await waitFor(() => {
      const optionsButton = getByText("⋮");
      fireEvent.press(optionsButton);
    });

    await waitFor(() => {
      expect(getByTestId("post-options-modal")).toBeTruthy();
      expect(getByTestId("edit-post-button")).toBeTruthy();
      expect(getByTestId("delete-post-button")).toBeTruthy();
    });
  });

  it("closes post options modal", async () => {
    const { getByText, getByTestId, queryByTestId } = render(
      <PostDetailPage navigation={mockNavigation} route={defaultRoute} />
    );

    await waitFor(() => {
      fireEvent.press(getByText("⋮"));
    });

    await waitFor(() => {
      expect(getByTestId("post-options-modal")).toBeTruthy();
    });

    fireEvent.press(getByTestId("close-options-modal"));

    await waitFor(() => {
      expect(queryByTestId("post-options-modal")).toBeNull();
    });
  });

  it("enters edit mode when edit is selected", async () => {
    const { getByText, getByTestId } = render(
      <PostDetailPage navigation={mockNavigation} route={defaultRoute} />
    );

    await waitFor(() => {
      fireEvent.press(getByText("⋮"));
    });

    await waitFor(() => {
      fireEvent.press(getByTestId("edit-post-button"));
    });

    await waitFor(() => {
      expect(getByTestId("editable-text")).toBeTruthy();
      expect(getByTestId("edit-text-input")).toBeTruthy();
    });
  });

  it("saves edited post content", async () => {
    const { getByText, getByTestId } = render(
      <PostDetailPage navigation={mockNavigation} route={defaultRoute} />
    );

    // Open edit mode
    await waitFor(() => {
      fireEvent.press(getByText("⋮"));
    });

    await waitFor(() => {
      fireEvent.press(getByTestId("edit-post-button"));
    });

    await waitFor(() => {
      const textInput = getByTestId("edit-text-input");
      fireEvent.changeText(textInput, "Updated post content");
    });

    fireEvent.press(getByTestId("save-edit-button"));

    await waitFor(() => {
      expect(getByText("Updated post content")).toBeTruthy();
    });
  });

  it("cancels post editing", async () => {
    const { getByText, getByTestId, queryByTestId } = render(
      <PostDetailPage navigation={mockNavigation} route={defaultRoute} />
    );

    // Open edit mode
    await waitFor(() => {
      fireEvent.press(getByText("⋮"));
    });

    await waitFor(() => {
      fireEvent.press(getByTestId("edit-post-button"));
    });

    await waitFor(() => {
      expect(getByTestId("editable-text")).toBeTruthy();
    });

    fireEvent.press(getByTestId("cancel-edit-button"));

    await waitFor(() => {
      expect(queryByTestId("editable-text")).toBeNull();
    });
  });

  it("handles post deletion", async () => {
    const { getByText, getByTestId } = render(
      <PostDetailPage navigation={mockNavigation} route={defaultRoute} />
    );

    await waitFor(() => {
      fireEvent.press(getByText("⋮"));
    });

    await waitFor(() => {
      fireEvent.press(getByTestId("delete-post-button"));
    });

    expect(mockGoBack).toHaveBeenCalled();
  });

  it("displays shared post with original post preview", async () => {
    // Mock shared post
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ post: mockSharedPost }),
    });

    const { getByTestId, getByText } = render(
      <PostDetailPage navigation={mockNavigation} route={defaultRoute} />
    );

    await waitFor(() => {
      expect(getByText("Sharing this amazing post!")).toBeTruthy();
      expect(getByTestId("inner-post-card")).toBeTruthy();
      expect(getByTestId("original-post-content")).toBeTruthy();
      expect(getByText("Original post content")).toBeTruthy();
    });
  });

  it("navigates to profile when profile header is tapped", async () => {
    const { getByTestId } = render(
      <PostDetailPage navigation={mockNavigation} route={defaultRoute} />
    );

    await waitFor(() => {
      expect(getByTestId("profile-header-user-123")).toBeTruthy();
    });

    fireEvent.press(getByTestId("profile-header-user-123"));

    expect(mockNavigate).toHaveBeenCalledWith("Profile", {
      userId: "user-123",
    });
  });

  it("handles fetch error gracefully", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    const { getByText } = render(
      <PostDetailPage navigation={mockNavigation} route={defaultRoute} />
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching post details:",
        expect.any(Error)
      );
      expect(getByText("Post not available or deleted.")).toBeTruthy();
    });

    consoleSpy.mockRestore();
  });

  it("displays private post privacy correctly", async () => {
    const privatePost = { ...mockPost, privacy: "private" };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ post: privatePost }),
    });

    const { getByText } = render(
      <PostDetailPage navigation={mockNavigation} route={defaultRoute} />
    );

    await waitFor(() => {
      expect(getByText("Privacy: Private")).toBeTruthy();
    });
  });

  it("calls onPostUpdated callback when provided", async () => {
    const onPostUpdated = jest.fn();
    const routeWithCallback = {
      params: {
        postId: "post-123",
        onPostUpdated,
      },
    };

    render(
      <PostDetailPage navigation={mockNavigation} route={routeWithCallback} />
    );

    await waitFor(() => {
      expect(onPostUpdated).toHaveBeenCalledWith(mockPost);
    });
  });

  it("handles post with no content gracefully", async () => {
    const noContentPost = { ...mockPost, content: "" };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ post: noContentPost }),
    });

    const { getByText } = render(
      <PostDetailPage navigation={mockNavigation} route={defaultRoute} />
    );

    await waitFor(() => {
      expect(getByText("No content.")).toBeTruthy();
    });
  });

  it("handles post with no media", async () => {
    const noMediaPost = { ...mockPost, images: [] };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ post: noMediaPost }),
    });

    const { queryByTestId } = render(
      <PostDetailPage navigation={mockNavigation} route={defaultRoute} />
    );

    await waitFor(() => {
      expect(queryByTestId("media-list")).toBeNull();
    });
  });

  it("handles post with no attached groups or trips", async () => {
    const minimalPost = {
      ...mockPost,
      attached_groups: [],
      attached_trips: [],
    };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ post: minimalPost }),
    });

    const { getByTestId } = render(
      <PostDetailPage navigation={mockNavigation} route={defaultRoute} />
    );

    await waitFor(() => {
      // Groups and trips containers should exist but be empty
      expect(getByTestId("attached-groups")).toBeTruthy();
      expect(getByTestId("attached-trips")).toBeTruthy();
    });
  });
});
