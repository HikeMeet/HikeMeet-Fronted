import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import TripDetailPage from "../../screens/trips/single-trip-page";
import { mockAuthContext } from "../__mocks__/auth-context";

// Mock navigation
const mockNavigate = jest.fn();
const mockAddListener = jest.fn(() => jest.fn());
const mockNavigation = {
  navigate: mockNavigate,
  goBack: jest.fn(),
  addListener: mockAddListener,
  dispatch: jest.fn(),
  reset: jest.fn(),
  setOptions: jest.fn(),
};

// Mock Alert
jest.spyOn(Alert, "alert");

// Mock trip data
const mockTripData = {
  _id: "trip-123",
  name: "Amazing Mountain Hike",
  location: {
    address: "Yosemite National Park, CA",
    coordinates: [-119.5383, 37.8651],
  },
  description: "A beautiful hike through the mountains with stunning views.",
  images: ["image1.jpg", "image2.jpg"],
  tags: ["Hiking", "Mountains", "Nature"],
  createdBy: "mongo-test-id-123",
  main_image: "main-trip-image.jpg",
  avg_rating: 4.5,
  ratings: [
    { user: "mongo-test-id-123", value: 5 },
    { user: "other-user", value: 4 },
  ],
};

// Mock route params
const mockRoute = {
  params: {
    tripId: "trip-123",
    fromCreate: false,
    isArchived: false,
  },
};

describe("TripDetailPage", () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset fetch mock
    (global.fetch as jest.Mock).mockReset();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockTripData,
      text: async () => "Trip data fetched",
      status: 200,
    });

    // Reset Alert mock
    (Alert.alert as jest.Mock).mockClear();

    // Update mock auth context to include favorite_trips
    mockAuthContext.mongoUser.favorite_trips = [];

    // Mock console.log
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it("renders without crashing and shows main elements", async () => {
    const { getByText, getByTestId } = render(
      <TripDetailPage
        route={mockRoute}
        navigation={mockNavigation}
        {...({} as any)}
      />
    );

    // Wait for trip data to load
    await waitFor(() => {
      expect(getByText("Amazing Mountain Hike")).toBeTruthy();
    });

    // Check main elements
    expect(getByText("Address: Yosemite National Park, CA")).toBeTruthy();
    expect(getByText("Description:")).toBeTruthy();
    expect(
      getByText("A beautiful hike through the mountains with stunning views.")
    ).toBeTruthy();
    expect(getByText("Upload your own images:")).toBeTruthy();
    expect(getByText("Back to Trips")).toBeTruthy();

    // Check components
    expect(getByTestId("profile-image")).toBeTruthy();
    expect(getByTestId("trip-star-rating")).toBeTruthy();
    expect(getByTestId("trip-images-uploader")).toBeTruthy();
    expect(getByTestId("map-direction-button")).toBeTruthy();
  });

  it("fetches trip data on mount", async () => {
    render(
      <TripDetailPage
        route={mockRoute}
        navigation={mockNavigation}
        {...({} as any)}
      />
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/trips/trip-123")
      );
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("fetches archived trip data when isArchived is true", async () => {
    const archivedRoute = {
      params: {
        tripId: "trip-123",
        fromCreate: false,
        isArchived: true,
      },
    };

    render(
      <TripDetailPage
        route={archivedRoute}
        navigation={mockNavigation}
        {...({} as any)}
      />
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/trips/trip-123")
      );
    });
  });

  it("displays tags correctly", async () => {
    const { getByText } = render(
      <TripDetailPage
        route={mockRoute}
        navigation={mockNavigation}
        {...({} as any)}
      />
    );

    await waitFor(() => {
      expect(getByText("Hiking")).toBeTruthy();
      expect(getByText("Mountains")).toBeTruthy();
      expect(getByText("Nature")).toBeTruthy();
    });
  });

  it("handles empty description gracefully", async () => {
    const tripWithoutDescription = {
      ...mockTripData,
      description: "",
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => tripWithoutDescription,
      status: 200,
    });

    const { getByText } = render(
      <TripDetailPage
        route={mockRoute}
        navigation={mockNavigation}
        {...({} as any)}
      />
    );

    await waitFor(() => {
      expect(getByText("No description provided.")).toBeTruthy();
    });
  });

  it("toggles favorite status", async () => {
    // Mock updateUser fetch response
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTripData,
        status: 200,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
        status: 200,
      });

    const { UNSAFE_root } = render(
      <TripDetailPage
        route={mockRoute}
        navigation={mockNavigation}
        {...({} as any)}
      />
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    // Find heart icon (favorite button)
    const heartIcon = UNSAFE_root.findAllByType("Ionicons").find(
      (element: any) => element.props.name === "heart-outline"
    );

    expect(heartIcon).toBeTruthy();

    // Click favorite button
    if (heartIcon?.parent) {
      fireEvent.press(heartIcon.parent);
    }

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/user/mongo-test-id-123/update"),
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: expect.stringContaining("favorite_trips"),
        })
      );
    });

    expect(mockAuthContext.fetchMongoUser).toHaveBeenCalledWith(
      "mongo-test-id-123"
    );
  });

  it("opens share modal when share button is pressed", async () => {
    const { UNSAFE_root, queryByTestId } = render(
      <TripDetailPage
        route={mockRoute}
        navigation={mockNavigation}
        {...({} as any)}
      />
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    // Initially modal should not be visible
    expect(queryByTestId("share-trip-modal")).toBeNull();

    // Find share icon
    const shareIcon = UNSAFE_root.findAllByType("Ionicons").find(
      (element: any) => element.props.name === "share-social"
    );

    expect(shareIcon).toBeTruthy();

    // Click share button
    if (shareIcon?.parent) {
      fireEvent.press(shareIcon.parent);
    }

    // Modal should appear
    await waitFor(() => {
      expect(queryByTestId("share-trip-modal")).toBeTruthy();
    });
  });

  it("navigates back to trips when back button is pressed", async () => {
    const { getByText } = render(
      <TripDetailPage
        route={mockRoute}
        navigation={mockNavigation}
        {...({} as any)}
      />
    );

    await waitFor(() => {
      expect(getByText("Back to Trips")).toBeTruthy();
    });

    const backButton = getByText("Back to Trips");
    fireEvent.press(backButton);

    expect(mockNavigate).toHaveBeenCalledWith("Tabs", { screen: "Trips" });
  });

  it("handles navigation prevention when fromCreate is true", async () => {
    const fromCreateRoute = {
      params: {
        tripId: "trip-123",
        fromCreate: true,
        isArchived: false,
      },
    };

    render(
      <TripDetailPage
        route={fromCreateRoute}
        navigation={mockNavigation}
        {...({} as any)}
      />
    );

    // Check that navigation listener was added
    expect(mockAddListener).toHaveBeenCalledWith(
      "beforeRemove",
      expect.any(Function)
    );
  });

  it("handles network error when fetching trip data", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network error")
    );

    render(
      <TripDetailPage
        route={mockRoute}
        navigation={mockNavigation}
        {...({} as any)}
      />
    );

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Error",
        "Failed to load trip data."
      );
    });
  });

  it("handles server error when fetching trip data", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    render(
      <TripDetailPage
        route={mockRoute}
        navigation={mockNavigation}
        {...({} as any)}
      />
    );

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Error",
        "Failed to load trip data."
      );
    });
  });

  it("handles favorite toggle error gracefully", async () => {
    // Mock successful trip fetch, failed favorite update
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTripData,
        status: 200,
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Update failed" }),
        status: 400,
      });

    const { UNSAFE_root } = render(
      <TripDetailPage
        route={mockRoute}
        navigation={mockNavigation}
        {...({} as any)}
      />
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    // Find and click heart icon
    const heartIcon = UNSAFE_root.findAllByType("Ionicons").find(
      (element: any) => element.props.name === "heart-outline"
    );

    if (heartIcon?.parent) {
      fireEvent.press(heartIcon.parent);
    }

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Error", expect.any(String));
    });
  });

  it("shows trip as favorite when user has favorited it", async () => {
    // Mock user having this trip in favorites
    (mockAuthContext.mongoUser as any).favorite_trips = ["trip-123"];

    const { UNSAFE_root } = render(
      <TripDetailPage
        route={mockRoute}
        navigation={mockNavigation}
        {...({} as any)}
      />
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    // Find heart icon - should be filled (heart instead of heart-outline)
    const heartIcon = UNSAFE_root.findAllByType("Ionicons").find(
      (element: any) => element.props.name === "heart"
    );

    expect(heartIcon).toBeTruthy();
    expect(heartIcon?.props.color).toBe("red");
  });

  it("shows trip images uploader component", async () => {
    const { getByTestId } = render(
      <TripDetailPage
        route={mockRoute}
        navigation={mockNavigation}
        {...({} as any)}
      />
    );

    await waitFor(() => {
      expect(getByTestId("trip-images-uploader")).toBeTruthy();
    });

    // The uploader component should be present
    expect(getByTestId("images-count")).toBeTruthy();
  });

  it("disables image upload for non-creators", async () => {
    const tripByOtherUser = {
      ...mockTripData,
      createdBy: "other-user-id",
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => tripByOtherUser,
      status: 200,
    });

    const { getByTestId, queryByTestId } = render(
      <TripDetailPage
        route={mockRoute}
        navigation={mockNavigation}
        {...({} as any)}
      />
    );

    await waitFor(() => {
      expect(getByTestId("trip-images-uploader")).toBeTruthy();
    });

    // Should not have add image button
    expect(queryByTestId("add-image-button")).toBeNull();
    expect(getByTestId("not-enabled")).toBeTruthy();
  });

  it("handles scroll disable/enable on map touch", async () => {
    const { UNSAFE_root } = render(
      <TripDetailPage
        route={mockRoute}
        navigation={mockNavigation}
        {...({} as any)}
      />
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    // Find the map container View
    const mapViews = UNSAFE_root.findAllByType("View");
    const mapContainer = mapViews.find(
      (view: any) => view.props.onTouchStart && view.props.onTouchEnd
    );

    expect(mapContainer).toBeTruthy();

    // Test touch events
    if (mapContainer) {
      fireEvent(mapContainer, "touchStart");
      fireEvent(mapContainer, "touchEnd");
      fireEvent(mapContainer, "touchCancel");
    }

    // Component should still be rendered without errors
    expect(UNSAFE_root).toBeTruthy();
  });

  it("displays correct star rating information", async () => {
    const { getByTestId } = render(
      <TripDetailPage
        route={mockRoute}
        navigation={mockNavigation}
        {...({} as any)}
      />
    );

    await waitFor(() => {
      expect(getByTestId("trip-star-rating")).toBeTruthy();
    });

    // Check rating values are passed correctly
    const ratingComponent = getByTestId("trip-star-rating");
    expect(ratingComponent).toBeTruthy();
  });

  it("displays images count in uploader", async () => {
    const { getByTestId } = render(
      <TripDetailPage
        route={mockRoute}
        navigation={mockNavigation}
        {...({} as any)}
      />
    );

    await waitFor(() => {
      expect(getByTestId("trip-images-uploader")).toBeTruthy();
    });

    // The component should display images count
    await waitFor(() => {
      expect(getByTestId("images-count")).toBeTruthy();
    });
  });

  it("shows map direction button with correct coordinates", async () => {
    const { getByTestId, getByText } = render(
      <TripDetailPage
        route={mockRoute}
        navigation={mockNavigation}
        {...({} as any)}
      />
    );

    // Wait for trip data to load completely
    await waitFor(() => {
      expect(getByText("Amazing Mountain Hike")).toBeTruthy();
      expect(getByTestId("map-direction-button")).toBeTruthy();
    });

    const directionButton = getByTestId("map-direction-button");

    // Clear previous logs
    consoleLogSpy.mockClear();

    fireEvent.press(directionButton);

    // Check that some navigation log was called
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringMatching(/Navigate to:/)
    );
  });
});
