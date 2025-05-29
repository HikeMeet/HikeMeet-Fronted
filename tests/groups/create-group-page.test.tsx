import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import CreateGroupPage from "../../screens/groups/create-groups-page";
import { mockAuthContext } from "../__mocks__/auth-context";

// Set up environment variables
(global as any).process = {
  ...global.process,
  env: {
    ...global.process?.env,
    EXPO_LOCAL_SERVER: "http://172.20.10.3:3000",
  },
};

// Mock Alert
const { Alert } = require("react-native");
Alert.alert = jest.fn();

// Mock auth context
jest.mock("../../contexts/auth-context", () => ({
  useAuth: () => mockAuthContext,
}));

// Mock the form components
jest.mock("../../screens/groups/components/edit-page-components", () => ({
  LabeledTextInput: ({
    label,
    placeholder,
    value,
    onChangeText,
    testID,
    ...props
  }: any) => {
    const React = require("react");
    const { TextInput, Text, View } = require("react-native");

    return (
      <View
        testID={
          testID || `labeled-input-${label?.toLowerCase().replace(/\s+/g, "-")}`
        }
      >
        <Text testID={`label-${label?.toLowerCase().replace(/\s+/g, "-")}`}>
          {label}
        </Text>
        <TextInput
          testID={`input-${label?.toLowerCase().replace(/\s+/g, "-")}`}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          {...props}
        />
      </View>
    );
  },

  TripSelectorField: ({ label, selectedTrip, onSelectTrip }: any) => {
    const React = require("react");
    const { TouchableOpacity, Text, View } = require("react-native");

    return (
      <View testID="trip-selector-field">
        <Text testID="trip-selector-label">{label}</Text>
        <TouchableOpacity
          testID="trip-selector-button"
          onPress={() => onSelectTrip("trip-123")}
        >
          <Text testID="trip-selector-text">
            {selectedTrip ? "Trip Selected" : "Select Trip"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  },

  MaxMembersField: ({ value, onChangeText }: any) => {
    const React = require("react");
    const { TextInput, Text, View } = require("react-native");

    return (
      <View testID="max-members-field">
        <Text testID="max-members-label">Max Members</Text>
        <TextInput
          testID="max-members-input"
          value={value}
          onChangeText={onChangeText}
          placeholder="Enter max members"
        />
      </View>
    );
  },

  PrivacyField: ({ privacy, setPrivacy }: any) => {
    const React = require("react");
    const { TouchableOpacity, Text, View } = require("react-native");

    return (
      <View testID="privacy-field">
        <Text testID="privacy-label">Privacy</Text>
        <TouchableOpacity
          testID="privacy-public"
          onPress={() => setPrivacy("public")}
        >
          <Text testID="privacy-public-text">
            {privacy === "public" ? "✓" : ""} Public
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="privacy-private"
          onPress={() => setPrivacy("private")}
        >
          <Text testID="privacy-private-text">
            {privacy === "private" ? "✓" : ""} Private
          </Text>
        </TouchableOpacity>
      </View>
    );
  },

  DifficultyField: ({ difficulty, setDifficulty }: any) => {
    const React = require("react");
    const { TouchableOpacity, Text, View } = require("react-native");

    return (
      <View testID="difficulty-field">
        <Text testID="difficulty-label">Difficulty</Text>
        <TouchableOpacity
          testID="difficulty-easy"
          onPress={() => setDifficulty("easy")}
        >
          <Text testID="difficulty-easy-text">
            {difficulty === "easy" ? "✓" : ""} Easy
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="difficulty-medium"
          onPress={() => setDifficulty("medium")}
        >
          <Text testID="difficulty-medium-text">
            {difficulty === "medium" ? "✓" : ""} Medium
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="difficulty-hard"
          onPress={() => setDifficulty("hard")}
        >
          <Text testID="difficulty-hard-text">
            {difficulty === "hard" ? "✓" : ""} Hard
          </Text>
        </TouchableOpacity>
      </View>
    );
  },

  DateRangePickerField: ({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
  }: any) => {
    const React = require("react");
    const { TouchableOpacity, Text, View } = require("react-native");

    return (
      <View testID="date-range-picker-field">
        <Text testID="date-range-label">Date Range</Text>
        <TouchableOpacity
          testID="start-date-picker"
          onPress={() => onStartDateChange(new Date("2024-01-15"))}
        >
          <Text testID="start-date-text">
            {startDate ? startDate.toDateString() : "Select Start Date"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="end-date-picker"
          onPress={() => onEndDateChange(new Date("2024-01-16"))}
        >
          <Text testID="end-date-text">
            {endDate ? endDate.toDateString() : "Select End Date"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  },

  TimeFields: ({
    startTime,
    setStartTime,
    finishTime,
    setFinishTime,
    showStartPicker,
    setShowStartPicker,
    showFinishPicker,
    setShowFinishPicker,
  }: any) => {
    const React = require("react");
    const { TouchableOpacity, Text, View } = require("react-native");

    return (
      <View testID="time-fields">
        <Text testID="time-fields-label">Times</Text>
        <TouchableOpacity
          testID="start-time-picker"
          onPress={() => {
            setShowStartPicker(true);
            setStartTime("09:00");
          }}
        >
          <Text testID="start-time-text">
            {startTime || "Select Start Time"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="finish-time-picker"
          onPress={() => {
            setShowFinishPicker(true);
            setFinishTime("17:00");
          }}
        >
          <Text testID="finish-time-text">
            {finishTime || "Select Finish Time"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  },
}));

// Mock GroupCreatedModal
jest.mock("../../components/post-group-creatonal", () => {
  const React = require("react");
  const { View, Text, TouchableOpacity } = require("react-native");

  return ({ visible, onOk, group, navigation }: any) => {
    if (!visible) return null;

    return (
      <View testID="group-created-modal">
        <Text testID="modal-title">Group Created Successfully!</Text>
        <Text testID="modal-group-name">{group?.name}</Text>
        <TouchableOpacity testID="modal-ok-button" onPress={onOk}>
          <Text>Go to Group</Text>
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

// Mock global fetch
global.fetch = jest.fn();

// Sample data
const mockTrip = {
  _id: "trip-123",
  title: "Mount Everest Hike",
  location: "Nepal",
};

const mockGroup = {
  _id: "group-456",
  name: "Test Group",
  trip: "trip-123",
  max_members: 10,
  privacy: "public",
  description: "Test Description",
  difficulty: "medium",
};

describe("CreateGroupPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup successful fetch response by default
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockGroup),
    });

    // Reset auth context
    (mockAuthContext as any).mongoId = "user-123";
  });

  describe("Basic Rendering", () => {
    it("renders all form fields correctly", () => {
      const route = { params: {} };
      const { getByTestId } = render(
        <CreateGroupPage navigation={mockNavigation} route={route} />
      );

      expect(getByTestId("labeled-input-group-name")).toBeTruthy();
      expect(getByTestId("labeled-input-description")).toBeTruthy();
      expect(getByTestId("trip-selector-field")).toBeTruthy();
      expect(getByTestId("max-members-field")).toBeTruthy();
      expect(getByTestId("privacy-field")).toBeTruthy();
      expect(getByTestId("difficulty-field")).toBeTruthy();
      expect(getByTestId("date-range-picker-field")).toBeTruthy();
      expect(getByTestId("time-fields")).toBeTruthy();
    });

    it("displays create group button", () => {
      const route = { params: {} };
      const { getByText } = render(
        <CreateGroupPage navigation={mockNavigation} route={route} />
      );

      expect(getByText("Create Group")).toBeTruthy();
    });

    it("renders with default privacy as public", () => {
      const route = { params: {} };
      const { getByTestId } = render(
        <CreateGroupPage navigation={mockNavigation} route={route} />
      );

      expect(getByTestId("privacy-public-text")).toHaveTextContent("✓ Public");
    });
  });

  describe("Form Input Handling", () => {
    it("handles group name input correctly", () => {
      const route = { params: {} };
      const { getByTestId } = render(
        <CreateGroupPage navigation={mockNavigation} route={route} />
      );

      const groupNameInput = getByTestId("input-group-name");
      fireEvent.changeText(groupNameInput, "Amazing Hiking Group");

      expect(groupNameInput.props.value).toBe("Amazing Hiking Group");
    });

    it("handles description input correctly", () => {
      const route = { params: {} };
      const { getByTestId } = render(
        <CreateGroupPage navigation={mockNavigation} route={route} />
      );

      const descriptionInput = getByTestId("input-description");
      fireEvent.changeText(descriptionInput, "This is a great hiking group");

      expect(descriptionInput.props.value).toBe("This is a great hiking group");
    });

    it("handles max members input correctly", () => {
      const route = { params: {} };
      const { getByTestId } = render(
        <CreateGroupPage navigation={mockNavigation} route={route} />
      );

      const maxMembersInput = getByTestId("max-members-input");
      fireEvent.changeText(maxMembersInput, "15");

      expect(maxMembersInput.props.value).toBe("15");
    });

    it("handles trip selection correctly", () => {
      const route = { params: {} };
      const { getByTestId } = render(
        <CreateGroupPage navigation={mockNavigation} route={route} />
      );

      const tripSelector = getByTestId("trip-selector-button");
      fireEvent.press(tripSelector);

      expect(getByTestId("trip-selector-text")).toHaveTextContent(
        "Trip Selected"
      );
    });

    it("handles privacy selection correctly", () => {
      const route = { params: {} };
      const { getByTestId } = render(
        <CreateGroupPage navigation={mockNavigation} route={route} />
      );

      const privateOption = getByTestId("privacy-private");
      fireEvent.press(privateOption);

      expect(getByTestId("privacy-private-text")).toHaveTextContent(
        "✓ Private"
      );
    });

    it("handles difficulty selection correctly", () => {
      const route = { params: {} };
      const { getByTestId } = render(
        <CreateGroupPage navigation={mockNavigation} route={route} />
      );

      const hardOption = getByTestId("difficulty-hard");
      fireEvent.press(hardOption);

      expect(getByTestId("difficulty-hard-text")).toHaveTextContent("✓ Hard");
    });

    it("handles date range selection correctly", () => {
      const route = { params: {} };
      const { getByTestId } = render(
        <CreateGroupPage navigation={mockNavigation} route={route} />
      );

      const startDatePicker = getByTestId("start-date-picker");
      const endDatePicker = getByTestId("end-date-picker");

      fireEvent.press(startDatePicker);
      fireEvent.press(endDatePicker);

      expect(getByTestId("start-date-text")).toHaveTextContent(
        "Mon Jan 15 2024"
      );
      expect(getByTestId("end-date-text")).toHaveTextContent("Tue Jan 16 2024");
    });

    it("handles time selection correctly", () => {
      const route = { params: {} };
      const { getByTestId } = render(
        <CreateGroupPage navigation={mockNavigation} route={route} />
      );

      const startTimePicker = getByTestId("start-time-picker");
      const finishTimePicker = getByTestId("finish-time-picker");

      fireEvent.press(startTimePicker);
      fireEvent.press(finishTimePicker);

      expect(getByTestId("start-time-text")).toHaveTextContent("09:00");
      expect(getByTestId("finish-time-text")).toHaveTextContent("17:00");
    });
  });

  describe("Pre-fill from Trip", () => {
    it("pre-fills trip selection when trip is passed in route params", () => {
      const route = { params: { trip: mockTrip } };
      const { getByTestId } = render(
        <CreateGroupPage navigation={mockNavigation} route={route} />
      );

      expect(getByTestId("trip-selector-text")).toHaveTextContent(
        "Trip Selected"
      );
    });

    it("handles empty route params gracefully", () => {
      const route = { params: {} };
      const { getByTestId } = render(
        <CreateGroupPage navigation={mockNavigation} route={route} />
      );

      expect(getByTestId("trip-selector-text")).toHaveTextContent(
        "Select Trip"
      );
    });
  });

  describe("Form Validation", () => {
    it("shows alert when required fields are missing", async () => {
      const route = { params: {} };
      const { getByText } = render(
        <CreateGroupPage navigation={mockNavigation} route={route} />
      );

      const createButton = getByText("Create Group");
      fireEvent.press(createButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "Missing Fields",
          "Please fill in all required fields."
        );
      });
    });

    it("does not submit when group name is missing", async () => {
      const route = { params: {} };
      const { getByText, getByTestId } = render(
        <CreateGroupPage navigation={mockNavigation} route={route} />
      );

      // Fill in other required fields but not group name
      fireEvent.press(getByTestId("trip-selector-button"));
      fireEvent.changeText(getByTestId("max-members-input"), "10");

      const createButton = getByText("Create Group");
      fireEvent.press(createButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalled();
        expect(global.fetch).not.toHaveBeenCalled();
      });
    });

    it("does not submit when trip is not selected", async () => {
      const route = { params: {} };
      const { getByText, getByTestId } = render(
        <CreateGroupPage navigation={mockNavigation} route={route} />
      );

      // Fill in other required fields but not trip
      fireEvent.changeText(getByTestId("input-group-name"), "Test Group");
      fireEvent.changeText(getByTestId("max-members-input"), "10");

      const createButton = getByText("Create Group");
      fireEvent.press(createButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalled();
        expect(global.fetch).not.toHaveBeenCalled();
      });
    });

    it("does not submit when max members is missing", async () => {
      const route = { params: {} };
      const { getByText, getByTestId } = render(
        <CreateGroupPage navigation={mockNavigation} route={route} />
      );

      // Fill in other required fields but not max members
      fireEvent.changeText(getByTestId("input-group-name"), "Test Group");
      fireEvent.press(getByTestId("trip-selector-button"));

      const createButton = getByText("Create Group");
      fireEvent.press(createButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalled();
        expect(global.fetch).not.toHaveBeenCalled();
      });
    });
  });

  describe("Group Creation", () => {
    it("creates group successfully with all required fields", async () => {
      const route = { params: {} };
      const { getByText, getByTestId } = render(
        <CreateGroupPage navigation={mockNavigation} route={route} />
      );

      // Fill in all required fields
      fireEvent.changeText(getByTestId("input-group-name"), "Amazing Group");
      fireEvent.changeText(
        getByTestId("input-description"),
        "Great hiking group"
      );
      fireEvent.press(getByTestId("trip-selector-button"));
      fireEvent.changeText(getByTestId("max-members-input"), "15");
      fireEvent.press(getByTestId("difficulty-medium"));

      const createButton = getByText("Create Group");
      fireEvent.press(createButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "http://172.20.10.3:3000/api/group/create",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: "Amazing Group",
              trip: "trip-123",
              max_members: 15,
              privacy: "public",
              description: "Great hiking group",
              difficulty: "medium",
              scheduled_start: null,
              scheduled_end: null,
              embarked_at: "",
              finish_time: "",
              created_by: "user-123",
            }),
          }
        );
      });
    });

    it("creates group with all optional fields filled", async () => {
      const route = { params: {} };
      const { getByText, getByTestId } = render(
        <CreateGroupPage navigation={mockNavigation} route={route} />
      );

      // Fill in all fields
      fireEvent.changeText(getByTestId("input-group-name"), "Complete Group");
      fireEvent.changeText(
        getByTestId("input-description"),
        "Full description"
      );
      fireEvent.press(getByTestId("trip-selector-button"));
      fireEvent.changeText(getByTestId("max-members-input"), "20");
      fireEvent.press(getByTestId("privacy-private"));
      fireEvent.press(getByTestId("difficulty-hard"));
      fireEvent.press(getByTestId("start-date-picker"));
      fireEvent.press(getByTestId("end-date-picker"));
      fireEvent.press(getByTestId("start-time-picker"));
      fireEvent.press(getByTestId("finish-time-picker"));

      const createButton = getByText("Create Group");
      fireEvent.press(createButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "http://172.20.10.3:3000/api/group/create",
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: expect.stringContaining('"privacy":"private"'),
          })
        );
      });
    });

    it("shows loading state during group creation", async () => {
      const route = { params: {} };
      const { getByText, getByTestId } = render(
        <CreateGroupPage navigation={mockNavigation} route={route} />
      );

      // Mock delayed response
      (global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () => Promise.resolve(mockGroup),
                }),
              100
            )
          )
      );

      // Fill required fields
      fireEvent.changeText(getByTestId("input-group-name"), "Test Group");
      fireEvent.press(getByTestId("trip-selector-button"));
      fireEvent.changeText(getByTestId("max-members-input"), "10");

      const createButton = getByText("Create Group");
      fireEvent.press(createButton);

      // Should show loading state
      expect(getByText("Creating...")).toBeTruthy();

      await waitFor(() => {
        expect(getByText("Create Group")).toBeTruthy();
      });
    });

    it("shows success modal after successful creation", async () => {
      const route = { params: {} };
      const { getByText, getByTestId, queryByTestId } = render(
        <CreateGroupPage navigation={mockNavigation} route={route} />
      );

      // Fill required fields
      fireEvent.changeText(getByTestId("input-group-name"), "Success Group");
      fireEvent.press(getByTestId("trip-selector-button"));
      fireEvent.changeText(getByTestId("max-members-input"), "10");

      const createButton = getByText("Create Group");
      fireEvent.press(createButton);

      await waitFor(() => {
        expect(getByTestId("group-created-modal")).toBeTruthy();
        expect(getByTestId("modal-title")).toBeTruthy();
      });
    });

    it("navigates to group page when modal OK is pressed", async () => {
      const route = { params: {} };
      const { getByText, getByTestId } = render(
        <CreateGroupPage navigation={mockNavigation} route={route} />
      );

      // Fill required fields and create group
      fireEvent.changeText(getByTestId("input-group-name"), "Nav Group");
      fireEvent.press(getByTestId("trip-selector-button"));
      fireEvent.changeText(getByTestId("max-members-input"), "10");

      const createButton = getByText("Create Group");
      fireEvent.press(createButton);

      await waitFor(() => {
        expect(getByTestId("group-created-modal")).toBeTruthy();
      });

      const okButton = getByTestId("modal-ok-button");
      fireEvent.press(okButton);

      expect(mockNavigate).toHaveBeenCalledWith("GroupPage", {
        groupId: mockGroup._id,
        fromCreate: true,
      });
    });
  });

  describe("Error Handling", () => {
    it("handles API error response", async () => {
      const route = { params: {} };
      const { getByText, getByTestId } = render(
        <CreateGroupPage navigation={mockNavigation} route={route} />
      );

      // Mock error response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: "Group name already exists" }),
      });

      // Fill required fields
      fireEvent.changeText(getByTestId("input-group-name"), "Duplicate Group");
      fireEvent.press(getByTestId("trip-selector-button"));
      fireEvent.changeText(getByTestId("max-members-input"), "10");

      const createButton = getByText("Create Group");
      fireEvent.press(createButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "Error",
          "Group name already exists"
        );
      });
    });

    it("handles network error", async () => {
      const route = { params: {} };
      const { getByText, getByTestId } = render(
        <CreateGroupPage navigation={mockNavigation} route={route} />
      );

      // Mock network error
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      // Fill required fields
      fireEvent.changeText(getByTestId("input-group-name"), "Network Group");
      fireEvent.press(getByTestId("trip-selector-button"));
      fireEvent.changeText(getByTestId("max-members-input"), "10");

      const createButton = getByText("Create Group");
      fireEvent.press(createButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "Error",
          "Something went wrong while creating the group."
        );
      });
    });

    it("handles API error without specific error message", async () => {
      const route = { params: {} };
      const { getByText, getByTestId } = render(
        <CreateGroupPage navigation={mockNavigation} route={route} />
      );

      // Mock error response without specific message
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({}),
      });

      // Fill required fields
      fireEvent.changeText(getByTestId("input-group-name"), "Error Group");
      fireEvent.press(getByTestId("trip-selector-button"));
      fireEvent.changeText(getByTestId("max-members-input"), "10");

      const createButton = getByText("Create Group");
      fireEvent.press(createButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "Error",
          "Failed to create group."
        );
      });
    });

    it("resets creating state after error", async () => {
      const route = { params: {} };
      const { getByText, getByTestId } = render(
        <CreateGroupPage navigation={mockNavigation} route={route} />
      );

      // Mock error
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Error"));

      // Fill required fields
      fireEvent.changeText(
        getByTestId("input-group-name"),
        "Error Reset Group"
      );
      fireEvent.press(getByTestId("trip-selector-button"));
      fireEvent.changeText(getByTestId("max-members-input"), "10");

      const createButton = getByText("Create Group");
      fireEvent.press(createButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalled();
      });

      // Button should be back to normal state
      expect(getByText("Create Group")).toBeTruthy();
    });
  });

  describe("Edge Cases", () => {
    it("handles route without params", () => {
      const route = {};
      const { getByTestId } = render(
        <CreateGroupPage navigation={mockNavigation} route={route} />
      );

      expect(getByTestId("trip-selector-text")).toHaveTextContent(
        "Select Trip"
      );
    });

    it("handles null mongoId", async () => {
      (mockAuthContext as any).mongoId = null;

      const route = { params: {} };
      const { getByText, getByTestId } = render(
        <CreateGroupPage navigation={mockNavigation} route={route} />
      );

      // Fill required fields
      fireEvent.changeText(getByTestId("input-group-name"), "Null User Group");
      fireEvent.press(getByTestId("trip-selector-button"));
      fireEvent.changeText(getByTestId("max-members-input"), "10");

      const createButton = getByText("Create Group");
      fireEvent.press(createButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            body: expect.stringContaining('"created_by":null'),
          })
        );
      });
    });

    it("handles modal without group data", async () => {
      const route = { params: {} };
      const { getByText, getByTestId } = render(
        <CreateGroupPage navigation={mockNavigation} route={route} />
      );

      // Mock response without group data
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(null),
      });

      // Fill required fields
      fireEvent.changeText(getByTestId("input-group-name"), "No Data Group");
      fireEvent.press(getByTestId("trip-selector-button"));
      fireEvent.changeText(getByTestId("max-members-input"), "10");

      const createButton = getByText("Create Group");
      fireEvent.press(createButton);

      await waitFor(() => {
        expect(getByTestId("group-created-modal")).toBeTruthy();
      });

      const okButton = getByTestId("modal-ok-button");
      fireEvent.press(okButton);

      // Should not navigate if no group data
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
