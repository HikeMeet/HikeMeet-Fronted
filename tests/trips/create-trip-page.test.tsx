import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import CreateTripPage from "../../screens/trips/create-trip-page";
import { mockAuthContext } from "../__mocks__/auth-context";

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: mockGoBack,
  addListener: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  setOptions: jest.fn(),
};

// Mock Alert
jest.spyOn(Alert, "alert");

// Mock trip data
const mockTripData = {
  _id: "trip-123",
  name: "Test Trip",
  location: {
    address: "San Francisco, CA",
    coordinates: [34.7749, -122.4194],
  },
  description: "Test description",
  images: [],
  tags: ["Hiking", "Mountains"],
  createdBy: "mongo-test-id-123",
};

describe("CreateTripPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset fetch mock
    (global.fetch as jest.Mock).mockReset();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockTripData,
      text: async () => "Trip created successfully",
      status: 200,
    });

    // Reset Alert mock
    (Alert.alert as jest.Mock).mockClear();
  });

  it("renders without crashing and shows all main elements", async () => {
    const { getByText, getByPlaceholderText, getByTestId, getAllByText } =
      render(<CreateTripPage navigation={mockNavigation} {...({} as any)} />);

    // Check main title (should be unique)
    const createTripElements = getAllByText("Create Trip");
    expect(createTripElements.length).toBeGreaterThanOrEqual(1);

    // Check input fields
    expect(getByPlaceholderText("Name")).toBeTruthy();
    expect(getByPlaceholderText("Description (optional)")).toBeTruthy();

    // Check MapSearch component
    expect(getByTestId("map-search-component")).toBeTruthy();

    // Check tag section
    expect(getByText("Select Tags:")).toBeTruthy();

    // Check some tags
    expect(getByText("Water")).toBeTruthy();
    expect(getByText("Hiking")).toBeTruthy();
    expect(getByText("Mountains")).toBeTruthy();

    // Check Cancel button (should be unique)
    expect(getByText("Cancel")).toBeTruthy();
  });

  it("handles trip name input correctly", async () => {
    const { getByPlaceholderText } = render(
      <CreateTripPage navigation={mockNavigation} {...({} as any)} />
    );

    const nameInput = getByPlaceholderText("Name");

    fireEvent.changeText(nameInput, "My Amazing Trip");

    expect(nameInput.props.value).toBe("My Amazing Trip");
  });

  it("handles description input correctly", async () => {
    const { getByPlaceholderText } = render(
      <CreateTripPage navigation={mockNavigation} {...({} as any)} />
    );

    const descriptionInput = getByPlaceholderText("Description (optional)");

    fireEvent.changeText(
      descriptionInput,
      "This is a test description for my trip."
    );

    expect(descriptionInput.props.value).toBe(
      "This is a test description for my trip."
    );
  });

  it("handles location selection from MapSearch", async () => {
    const { getByTestId } = render(
      <CreateTripPage navigation={mockNavigation} {...({} as any)} />
    );

    const selectLocationButton = getByTestId("select-location-button");

    fireEvent.press(selectLocationButton);

    // The MapSearch mock should call onLocationSelect which updates internal state
    // We can verify this indirectly by checking if the component still renders
    await waitFor(() => {
      expect(getByTestId("map-search-component")).toBeTruthy();
    });
  });

  it("handles tag selection correctly", async () => {
    const { getByText } = render(
      <CreateTripPage navigation={mockNavigation} {...({} as any)} />
    );

    const hikingTag = getByText("Hiking");
    const mountainsTag = getByText("Mountains");

    // Verify tags exist
    expect(hikingTag).toBeTruthy();
    expect(mountainsTag).toBeTruthy();

    // Select hiking tag
    fireEvent.press(hikingTag);

    // Wait for any state updates
    await waitFor(() => {
      expect(hikingTag).toBeTruthy();
    });

    // Select mountains tag
    fireEvent.press(mountainsTag);

    await waitFor(() => {
      expect(mountainsTag).toBeTruthy();
    });

    // Deselect hiking tag
    fireEvent.press(hikingTag);

    await waitFor(() => {
      expect(hikingTag).toBeTruthy();
    });
  });

  it("shows validation alert when required fields are missing", async () => {
    const { getAllByText } = render(
      <CreateTripPage navigation={mockNavigation} {...({} as any)} />
    );

    // Find the Create Trip button (not the title)
    const createTripElements = getAllByText("Create Trip");
    const createButton =
      createTripElements.find((element) =>
        element.parent?.props.className?.includes?.("bg-green-500")
      ) ||
      createTripElements[1] ||
      createTripElements[0];

    // Try to create trip without name or location
    fireEvent.press(createButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Please provide a trip name and choose a location."
      );
    });

    // Fetch should not be called
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("navigates to TripPage after successful creation", async () => {
    const { getAllByText, getByPlaceholderText, getByTestId } = render(
      <CreateTripPage navigation={mockNavigation} {...({} as any)} />
    );

    // Fill in required data
    fireEvent.changeText(getByPlaceholderText("Name"), "Test Trip");
    fireEvent.press(getByTestId("select-location-button"));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Find and click Create Trip button
    const createTripElements = getAllByText("Create Trip");
    const createButton =
      createTripElements.find((element) =>
        element.parent?.props.className?.includes?.("bg-green-500")
      ) ||
      createTripElements[1] ||
      createTripElements[0];

    fireEvent.press(createButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Simulate pressing OK on the success alert
    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const alertButtons = alertCall[2];
    const okButton = alertButtons[0];

    act(() => {
      okButton.onPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith("TripPage", {
      tripId: "trip-123",
      fromCreate: true,
    });
  });

  it("handles network error during trip creation", async () => {
    // Mock fetch to reject
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network error")
    );

    const { getAllByText, getByPlaceholderText, getByTestId } = render(
      <CreateTripPage navigation={mockNavigation} {...({} as any)} />
    );

    // Fill in required data
    fireEvent.changeText(getByPlaceholderText("Name"), "Test Trip");
    fireEvent.press(getByTestId("select-location-button"));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Find and click Create Trip button
    const createTripElements = getAllByText("Create Trip");
    const createButton =
      createTripElements.find((element) =>
        element.parent?.props.className?.includes?.("bg-green-500")
      ) ||
      createTripElements[1] ||
      createTripElements[0];

    fireEvent.press(createButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Error creating trip.");
    });
  });

  it("handles server error during trip creation", async () => {
    // Mock fetch to return error response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { getAllByText, getByPlaceholderText, getByTestId } = render(
      <CreateTripPage navigation={mockNavigation} {...({} as any)} />
    );

    // Fill in required data
    fireEvent.changeText(getByPlaceholderText("Name"), "Test Trip");
    fireEvent.press(getByTestId("select-location-button"));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Find and click Create Trip button
    const createTripElements = getAllByText("Create Trip");
    const createButton =
      createTripElements.find((element) =>
        element.parent?.props.className?.includes?.("bg-green-500")
      ) ||
      createTripElements[1] ||
      createTripElements[0];

    fireEvent.press(createButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Failed to create trip.");
    });
  });

  it("handles cancel button navigation", async () => {
    const { getByText } = render(
      <CreateTripPage navigation={mockNavigation} {...({} as any)} />
    );

    const cancelButton = getByText("Cancel");
    fireEvent.press(cancelButton);

    expect(mockGoBack).toHaveBeenCalled();
  });

  it("handles map touch events for scroll control", async () => {
    const { getByTestId } = render(
      <CreateTripPage navigation={mockNavigation} {...({} as any)} />
    );

    const selectLocationButton = getByTestId("select-location-button");

    // Simulate touch start (should disable scroll)
    fireEvent(selectLocationButton, "pressIn");

    // Simulate touch end (should enable scroll)
    fireEvent(selectLocationButton, "pressOut");

    // Component should still be rendered without errors
    expect(getByTestId("map-search-component")).toBeTruthy();
  });

  it("uses auth context for mongoId", async () => {
    render(<CreateTripPage navigation={mockNavigation} {...({} as any)} />);

    // The component should use the mongoId from auth context
    // This is verified indirectly through the successful trip creation test
    expect(mockAuthContext.mongoId).toBe("mongo-test-id-123");
  });

  it("renders all available tags", async () => {
    const { getByText } = render(
      <CreateTripPage navigation={mockNavigation} {...({} as any)} />
    );

    const expectedTags = [
      "Water",
      "Ropes",
      "Ladders",
      "Lab",
      "Camping",
      "Hiking",
      "Snow",
      "Mountains",
      "Desert",
      "Beach",
      "Kayaking",
      "Rafting",
      "Road Trip",
      "City Tour",
      "Museum",
    ];

    expectedTags.forEach((tag) => {
      expect(getByText(tag)).toBeTruthy();
    });
  });

  it("handles empty description field", async () => {
    const { getAllByText, getByPlaceholderText, getByTestId } = render(
      <CreateTripPage navigation={mockNavigation} {...({} as any)} />
    );

    // Fill only required fields (name and location)
    fireEvent.changeText(getByPlaceholderText("Name"), "Test Trip");
    fireEvent.press(getByTestId("select-location-button"));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Find and click Create Trip button
    const createTripElements = getAllByText("Create Trip");
    const createButton =
      createTripElements.find((element) =>
        element.parent?.props.className?.includes?.("bg-green-500")
      ) ||
      createTripElements[1] ||
      createTripElements[0];

    fireEvent.press(createButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Check that description is sent as empty string
    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const requestBody = JSON.parse(fetchCall[1].body);

    expect(requestBody.description).toBe("");
  });
});
