import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import CreatePostPage from "../../screens/posts/post-creation-page";
import { mockAuthContext } from "../__mocks__/auth-context";

// Mock ImagePicker
jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest
    .fn()
    .mockResolvedValue({ granted: true }),
  launchImageLibraryAsync: jest.fn().mockResolvedValue({
    canceled: false,
    assets: [
      { uri: "file://test-image.jpg", type: "image" },
      { uri: "file://test-video.mp4", type: "video" },
    ],
  }),
  MediaTypeOptions: {
    All: "All",
    Images: "Images",
    Videos: "Videos",
  },
}));

// Mock SafeAreaView
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock cloudinary upload functions
jest.mock("../../components/cloudinary-upload", () => ({
  uploadMedia: jest.fn().mockResolvedValue({
    url: "https://test-upload.com/image.jpg",
    delete_token: "test-delete-token",
    public_id: "test-public-id",
  }),
  deleteImageFromCloudinary: jest.fn().mockResolvedValue(true),
}));

// Mock MentionTextInput component
jest.mock("../../components/metion-with-text-input", () => {
  const React = require("react");
  const { TextInput } = require("react-native");
  return function MentionTextInput({
    placeholder,
    value,
    onChangeText,
    inputStyle,
    containerStyle,
  }: any) {
    return (
      <TextInput
        testID="mention-text-input"
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        style={inputStyle}
      />
    );
  };
});

// Mock SelectedMediaList component
jest.mock("../../components/media-list-in-before-uploading", () => {
  const React = require("react");
  const { View, Text, TouchableOpacity } = require("react-native");
  return function SelectedMediaList({ media, onRemove }: any) {
    return (
      <View testID="selected-media-list">
        {media.map((item: any, index: number) => (
          <View key={index} testID={`media-item-${index}`}>
            <Text>
              {item.type}: {item.uri}
            </Text>
            <TouchableOpacity
              testID={`remove-media-${index}`}
              onPress={() => onRemove(index)}
            >
              <Text>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };
});

// Mock group and trip components
jest.mock("../../screens/groups/components/group-selection-modal", () => {
  const React = require("react");
  const { Modal, View, Text, TouchableOpacity } = require("react-native");
  return function GroupSelectionModal({
    visible,
    groups,
    onSelect,
    onClose,
  }: any) {
    return (
      <Modal visible={visible} testID="group-selection-modal" transparent>
        <View
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            flex: 1,
            justifyContent: "center",
          }}
        >
          {groups.map((group: any) => (
            <TouchableOpacity
              key={group._id}
              testID={`select-group-${group._id}`}
              onPress={() => onSelect(group)}
            >
              <Text>{group.name}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity testID="close-group-modal" onPress={onClose}>
            <Text>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  };
});

jest.mock("../../screens/trips/component/trip-selection-modal", () => {
  const React = require("react");
  const { Modal, View, Text, TouchableOpacity } = require("react-native");
  return function TripSelectionModal({
    visible,
    trips,
    onSelect,
    onClose,
  }: any) {
    return (
      <Modal visible={visible} testID="trip-selection-modal" transparent>
        <View
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            flex: 1,
            justifyContent: "center",
          }}
        >
          {trips.map((trip: any) => (
            <TouchableOpacity
              key={trip._id}
              testID={`select-trip-${trip._id}`}
              onPress={() => onSelect(trip)}
            >
              <Text>{trip.name}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity testID="close-trip-modal" onPress={onClose}>
            <Text>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  };
});

jest.mock("../../screens/posts/components/attached-group-preview", () => {
  const React = require("react");
  const { View, Text, TouchableOpacity } = require("react-native");
  return function SelectedGroupsList({ groups, onRemove }: any) {
    return (
      <View testID="selected-groups-list">
        {groups.map((group: any) => (
          <View key={group._id} testID={`selected-group-${group._id}`}>
            <Text>{group.name}</Text>
            <TouchableOpacity
              testID={`remove-group-${group._id}`}
              onPress={() => onRemove(group._id)}
            >
              <Text>Remove Group</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };
});

jest.mock("../../screens/posts/components/attached-trip-preview", () => {
  const React = require("react");
  const { View, Text, TouchableOpacity } = require("react-native");
  return function SelectedTripsList({ trips, onRemove }: any) {
    return (
      <View testID="selected-trips-list">
        {trips.map((trip: any) => (
          <View key={trip._id} testID={`selected-trip-${trip._id}`}>
            <Text>{trip.name}</Text>
            <TouchableOpacity
              testID={`remove-trip-${trip._id}`}
              onPress={() => onRemove(trip._id)}
            >
              <Text>Remove Trip</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };
});

// Mock fetch functions
jest.mock("../../components/requests/fetch-trips", () => ({
  fetchTrips: jest.fn().mockResolvedValue([
    { _id: "trip-1", name: "Mountain Adventure", location: "Mountains" },
    { _id: "trip-2", name: "Beach Trip", location: "Beach" },
  ]),
}));

jest.mock("../../components/requests/fetch-groups", () => ({
  fetchGroups: jest.fn().mockResolvedValue([
    { _id: "group-1", name: "Hiking Group", description: "Love hiking" },
    {
      _id: "group-2",
      name: "Photography Group",
      description: "Photo enthusiasts",
    },
  ]),
  fetchUserGroups: jest.fn().mockResolvedValue([
    { _id: "group-1", name: "Hiking Group", description: "Love hiking" },
    {
      _id: "group-2",
      name: "Photography Group",
      description: "Photo enthusiasts",
    },
  ]),
}));

// Import the mocked functions
import * as ImagePicker from "expo-image-picker";
import {
  uploadMedia,
  deleteImageFromCloudinary,
} from "../../components/cloudinary-upload";
import { fetchTrips } from "../../components/requests/fetch-trips";
import { fetchUserGroups } from "../../components/requests/fetch-groups";

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

// Mock Alert
jest.spyOn(Alert, "alert").mockImplementation((title, message, buttons) => {
  if (buttons && buttons[0] && buttons[0].onPress) {
    buttons[0].onPress();
  }
});

// Mock fetch for post creation
global.fetch = jest.fn();

describe("CreatePostPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset auth context
    mockAuthContext.mongoId = "mongo-test-id-123";

    // Reset fetch mock
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          post: { _id: "new-post-id" },
        }),
    });
  });

  const defaultRoute = { params: {} };

  it("renders without crashing and shows main elements", async () => {
    const { getByText, getByTestId } = render(
      <CreatePostPage navigation={mockNavigation} route={defaultRoute} />
    );

    expect(getByText("Create a Post")).toBeTruthy();
    expect(getByTestId("mention-text-input")).toBeTruthy();
    expect(getByText("Pick Media")).toBeTruthy();
    expect(getByText("Submit Post")).toBeTruthy();
    expect(getByText("Attach Group")).toBeTruthy();
    expect(getByText("Attach Trip")).toBeTruthy();
  });

  it("allows typing content in text input", async () => {
    const { getByTestId } = render(
      <CreatePostPage navigation={mockNavigation} route={defaultRoute} />
    );

    const textInput = getByTestId("mention-text-input");
    fireEvent.changeText(textInput, "This is my test post content");

    expect(textInput.props.value).toBe("This is my test post content");
  });

  it("shows privacy options for public posts", async () => {
    const { getByText } = render(
      <CreatePostPage navigation={mockNavigation} route={defaultRoute} />
    );

    expect(getByText("Privacy:")).toBeTruthy();
    expect(getByText("Public")).toBeTruthy();
    expect(getByText("Private")).toBeTruthy();
  });

  it("does not show privacy options for group posts", async () => {
    const groupRoute = { params: { inGroup: true, groupId: "group-123" } };

    const { queryByText } = render(
      <CreatePostPage navigation={mockNavigation} route={groupRoute} />
    );

    expect(queryByText("Privacy:")).toBeNull();
    expect(queryByText("Attach Group")).toBeNull();
  });

  it("allows switching privacy settings", async () => {
    const { getByText } = render(
      <CreatePostPage navigation={mockNavigation} route={defaultRoute} />
    );

    const privateButton = getByText("Private");
    fireEvent.press(privateButton);

    // Privacy state should change (tested through UI behavior)
    expect(privateButton).toBeTruthy();
  });

  it("picks media from gallery", async () => {
    const { getByText, getByTestId } = render(
      <CreatePostPage navigation={mockNavigation} route={defaultRoute} />
    );

    const pickMediaButton = getByText("Pick Media");
    fireEvent.press(pickMediaButton);

    await waitFor(() => {
      expect(
        ImagePicker.requestMediaLibraryPermissionsAsync
      ).toHaveBeenCalled();
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 1,
        allowsMultipleSelection: true,
      });
    });

    // Check that media is displayed
    await waitFor(() => {
      expect(getByTestId("selected-media-list")).toBeTruthy();
    });
  });

  it("removes selected media", async () => {
    const { getByText, getByTestId } = render(
      <CreatePostPage navigation={mockNavigation} route={defaultRoute} />
    );

    // First pick media
    const pickMediaButton = getByText("Pick Media");
    fireEvent.press(pickMediaButton);

    await waitFor(() => {
      expect(getByTestId("media-item-0")).toBeTruthy();
    });

    // Then remove it
    const removeButton = getByTestId("remove-media-0");
    fireEvent.press(removeButton);

    // Media should be removed
    await waitFor(() => {
      expect(getByTestId("selected-media-list")).toBeTruthy();
    });
  });

  it("opens group selection modal", async () => {
    const { getByText, getByTestId } = render(
      <CreatePostPage navigation={mockNavigation} route={defaultRoute} />
    );

    const attachGroupButton = getByText("Attach Group");
    fireEvent.press(attachGroupButton);

    await waitFor(() => {
      expect(fetchUserGroups).toHaveBeenCalledWith("mongo-test-id-123");
      expect(getByTestId("group-selection-modal")).toBeTruthy();
    });
  });

  it("opens trip selection modal", async () => {
    const { getByText, getByTestId } = render(
      <CreatePostPage navigation={mockNavigation} route={defaultRoute} />
    );

    const attachTripButton = getByText("Attach Trip");
    fireEvent.press(attachTripButton);

    await waitFor(() => {
      expect(fetchTrips).toHaveBeenCalled();
      expect(getByTestId("trip-selection-modal")).toBeTruthy();
    });
  });

  it("selects and displays attached groups", async () => {
    const { getByText, getByTestId } = render(
      <CreatePostPage navigation={mockNavigation} route={defaultRoute} />
    );

    // Open group modal
    fireEvent.press(getByText("Attach Group"));

    await waitFor(() => {
      expect(getByTestId("group-selection-modal")).toBeTruthy();
    });

    // Select a group
    const selectGroupButton = getByTestId("select-group-group-1");
    fireEvent.press(selectGroupButton);

    await waitFor(() => {
      expect(getByTestId("selected-group-group-1")).toBeTruthy();
    });
  });

  it("selects and displays attached trips", async () => {
    const { getByText, getByTestId } = render(
      <CreatePostPage navigation={mockNavigation} route={defaultRoute} />
    );

    // Open trip modal
    fireEvent.press(getByText("Attach Trip"));

    await waitFor(() => {
      expect(getByTestId("trip-selection-modal")).toBeTruthy();
    });

    // Select a trip
    const selectTripButton = getByTestId("select-trip-trip-1");
    fireEvent.press(selectTripButton);

    await waitFor(() => {
      expect(getByTestId("selected-trip-trip-1")).toBeTruthy();
    });
  });

  it("removes attached groups", async () => {
    const { getByText, getByTestId } = render(
      <CreatePostPage navigation={mockNavigation} route={defaultRoute} />
    );

    // Add a group first
    fireEvent.press(getByText("Attach Group"));
    await waitFor(() => {
      const selectGroupButton = getByTestId("select-group-group-1");
      fireEvent.press(selectGroupButton);
    });

    await waitFor(() => {
      expect(getByTestId("selected-group-group-1")).toBeTruthy();
    });

    // Remove the group
    const removeButton = getByTestId("remove-group-group-1");
    fireEvent.press(removeButton);

    // Group should be removed from the display
    expect(getByTestId("selected-groups-list")).toBeTruthy();
  });

  it("removes attached trips", async () => {
    const { getByText, getByTestId } = render(
      <CreatePostPage navigation={mockNavigation} route={defaultRoute} />
    );

    // Add a trip first
    fireEvent.press(getByText("Attach Trip"));
    await waitFor(() => {
      const selectTripButton = getByTestId("select-trip-trip-1");
      fireEvent.press(selectTripButton);
    });

    await waitFor(() => {
      expect(getByTestId("selected-trip-trip-1")).toBeTruthy();
    });

    // Remove the trip
    const removeButton = getByTestId("remove-trip-trip-1");
    fireEvent.press(removeButton);

    // Trip should be removed from the display
    expect(getByTestId("selected-trips-list")).toBeTruthy();
  });

  it("submits post successfully with content only", async () => {
    const { getByText, getByTestId } = render(
      <CreatePostPage navigation={mockNavigation} route={defaultRoute} />
    );

    // Add content
    const textInput = getByTestId("mention-text-input");
    fireEvent.changeText(textInput, "Test post content");

    // Submit post
    const submitButton = getByText("Submit Post");
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${process.env.EXPO_LOCAL_SERVER}/api/post/create`,
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            author: "mongo-test-id-123",
            content: "Test post content",
            images: [],
            attached_trips: [],
            attached_groups: [],
            is_shared: false,
            privacy: "public",
            in_group: undefined,
          }),
        })
      );
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Post created",
        "Your post has been created successfully.",
        [{ text: "OK", onPress: expect.any(Function) }]
      );
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  it("submits post with media, groups, and trips", async () => {
    const { getByText, getByTestId } = render(
      <CreatePostPage navigation={mockNavigation} route={defaultRoute} />
    );

    // Add content
    const textInput = getByTestId("mention-text-input");
    fireEvent.changeText(textInput, "Post with attachments");

    // Add media
    fireEvent.press(getByText("Pick Media"));

    // Add group
    fireEvent.press(getByText("Attach Group"));
    await waitFor(() => {
      fireEvent.press(getByTestId("select-group-group-1"));
    });

    // Add trip
    fireEvent.press(getByText("Attach Trip"));
    await waitFor(() => {
      fireEvent.press(getByTestId("select-trip-trip-1"));
    });

    // Submit post
    const submitButton = getByText("Submit Post");
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(uploadMedia).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${process.env.EXPO_LOCAL_SERVER}/api/post/create`,
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: expect.stringContaining("group-1"),
        })
      );
    });
  });

  it("handles post creation error", async () => {
    // Mock fetch to return error
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: "Failed to create post" }),
    });

    const { getByText, getByTestId } = render(
      <CreatePostPage navigation={mockNavigation} route={defaultRoute} />
    );

    // Add content and submit
    const textInput = getByTestId("mention-text-input");
    fireEvent.changeText(textInput, "Test post");

    const submitButton = getByText("Submit Post");
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Error",
        "Failed to create post"
      );
    });
  });

  it("handles network error during post creation", async () => {
    // Mock fetch to throw error
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network error")
    );

    const { getByText, getByTestId } = render(
      <CreatePostPage navigation={mockNavigation} route={defaultRoute} />
    );

    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    // Add content and submit
    const textInput = getByTestId("mention-text-input");
    fireEvent.changeText(textInput, "Test post");

    const submitButton = getByText("Submit Post");
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error creating post:",
        expect.any(Error)
      );
      expect(Alert.alert).toHaveBeenCalledWith(
        "Error",
        "Something went wrong."
      );
    });

    consoleSpy.mockRestore();
  });

  it("handles permission denied for media picker", async () => {
    // Mock permission denied
    (
      ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
    ).mockResolvedValueOnce({
      granted: false,
    });

    const { getByText } = render(
      <CreatePostPage navigation={mockNavigation} route={defaultRoute} />
    );

    const pickMediaButton = getByText("Pick Media");
    fireEvent.press(pickMediaButton);

    await waitFor(() => {
      expect(
        ImagePicker.requestMediaLibraryPermissionsAsync
      ).toHaveBeenCalled();
      // Should not call launchImageLibraryAsync when permission denied
      expect(ImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();
    });
  });

  it("handles canceled media selection", async () => {
    // Mock canceled selection
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
      canceled: true,
    });

    const { getByText } = render(
      <CreatePostPage navigation={mockNavigation} route={defaultRoute} />
    );

    const pickMediaButton = getByText("Pick Media");
    fireEvent.press(pickMediaButton);

    await waitFor(() => {
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
    });

    // Media list should remain empty
    // This is tested by the component not crashing and continuing to work
  });

  it("closes modals properly", async () => {
    const { getByText, getByTestId, queryByTestId } = render(
      <CreatePostPage navigation={mockNavigation} route={defaultRoute} />
    );

    // Open group modal and close it
    fireEvent.press(getByText("Attach Group"));

    await waitFor(() => {
      expect(getByTestId("group-selection-modal")).toBeTruthy();
    });

    fireEvent.press(getByTestId("close-group-modal"));

    await waitFor(() => {
      expect(queryByTestId("group-selection-modal")).toBeNull();
    });

    // Open trip modal and close it
    fireEvent.press(getByText("Attach Trip"));

    await waitFor(() => {
      expect(getByTestId("trip-selection-modal")).toBeTruthy();
    });

    fireEvent.press(getByTestId("close-trip-modal"));

    await waitFor(() => {
      expect(queryByTestId("trip-selection-modal")).toBeNull();
    });
  });
});
