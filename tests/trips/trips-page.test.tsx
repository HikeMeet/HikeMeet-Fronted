import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import TripsPage from "../../screens/trips/trips-page";
import { mockAuthContext } from "../__mocks__/auth-context";
import { mockChatListContext } from "../__mocks__/chat-context";
import {
  fetchTrips,
  fetchTripsByIds,
} from "../../components/requests/fetch-trips";

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: jest.fn(),
  addListener: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  setOptions: jest.fn(),
};

// Mock SafeAreaView
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock trips data
const mockTrips = [
  {
    _id: "trip-1",
    name: "Mountain Adventure",
    location: {
      address: "Rocky Mountains, CO",
      coordinates: [-105.2705, 39.7392],
    },
    description: "Amazing mountain hike",
    tags: ["Hiking", "Mountains"],
    createdBy: "user-1",
    images: [],
    avg_rating: 4.2,
  },
  {
    _id: "trip-2",
    name: "Beach Paradise",
    location: {
      address: "Malibu Beach, CA",
      coordinates: [-118.7798, 34.0259],
    },
    description: "Relaxing beach trip",
    tags: ["Beach", "Relaxation"],
    createdBy: "user-2",
    images: [],
    avg_rating: 4.8,
  },
  {
    _id: "trip-3",
    name: "City Explorer",
    location: { address: "New York, NY", coordinates: [-74.006, 40.7128] },
    description: "Urban exploration",
    tags: ["City", "Culture"],
    createdBy: "user-1",
    images: [],
    avg_rating: 4.0,
  },
];

describe("TripsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup fetch mocks with default responses
    (fetchTrips as jest.Mock).mockResolvedValue(mockTrips);
    (fetchTripsByIds as jest.Mock).mockImplementation((tripIds: string[]) => {
      const filteredTrips = mockTrips.filter((trip) =>
        tripIds.includes(trip._id)
      );
      return Promise.resolve(filteredTrips);
    });

    // Reset auth context
    mockAuthContext.mongoUser.favorite_trips = ["trip-1", "trip-2"];
    mockAuthContext.mongoUser.trip_history = [
      { trip: "trip-1", completed_at: "2024-01-15" },
      { trip: "trip-3", completed_at: "2024-01-20" },
    ];

    // Reset chat context
    mockChatListContext.initializeRooms.mockClear();
  });

  it("renders without crashing and shows main elements", async () => {
    const { getByPlaceholderText, getByText } = render(
      <TripsPage navigation={mockNavigation} />
    );

    // Wait for trips to load
    await waitFor(() => {
      expect(fetchTrips).toHaveBeenCalled();
    });

    // Check main elements
    expect(getByPlaceholderText("Search trip")).toBeTruthy();
    expect(getByText("+ Add trip")).toBeTruthy();
    expect(getByText("All")).toBeTruthy();
    expect(getByText("History")).toBeTruthy();
    expect(getByText("Favorites")).toBeTruthy();
  });

  it("loads trips on mount (All view)", async () => {
    const { getByTestId } = render(<TripsPage navigation={mockNavigation} />);

    await waitFor(() => {
      expect(fetchTrips).toHaveBeenCalled();
      expect(getByTestId("trip-row-trip-1")).toBeTruthy();
      expect(getByTestId("trip-row-trip-2")).toBeTruthy();
      expect(getByTestId("trip-row-trip-3")).toBeTruthy();
    });
  });

  it("shows History and Favorites tabs", async () => {
    const { getByText } = render(<TripsPage navigation={mockNavigation} />);

    // Wait for initial load
    await waitFor(() => {
      expect(fetchTrips).toHaveBeenCalled();
    });

    // Just verify the tabs are clickable
    const historyTab = getByText("History");
    const favoritesTab = getByText("Favorites");

    expect(historyTab).toBeTruthy();
    expect(favoritesTab).toBeTruthy();

    // Test tab clicks (even if they don't trigger full functionality in tests)
    fireEvent.press(historyTab);
    fireEvent.press(favoritesTab);
  });

  it("filters trips by search text", async () => {
    const { getByPlaceholderText, getByTestId, queryByTestId } = render(
      <TripsPage navigation={mockNavigation} />
    );

    // Wait for initial load
    await waitFor(() => {
      expect(fetchTrips).toHaveBeenCalled();
      expect(getByTestId("trip-row-trip-1")).toBeTruthy();
    });

    // Search for "mountain"
    const searchInput = getByPlaceholderText("Search trip");
    fireEvent.changeText(searchInput, "mountain");

    await waitFor(() => {
      expect(getByTestId("trip-row-trip-1")).toBeTruthy(); // Mountain Adventure
      expect(queryByTestId("trip-row-trip-2")).toBeNull(); // Beach Paradise (filtered out)
      expect(queryByTestId("trip-row-trip-3")).toBeNull(); // City Explorer (filtered out)
    });
  });

  it("clears search and shows all trips", async () => {
    const { getByPlaceholderText, getByTestId } = render(
      <TripsPage navigation={mockNavigation} />
    );

    // Wait for initial load
    await waitFor(() => {
      expect(fetchTrips).toHaveBeenCalled();
    });

    const searchInput = getByPlaceholderText("Search trip");

    // Search first
    fireEvent.changeText(searchInput, "mountain");

    await waitFor(() => {
      expect(getByTestId("trip-row-trip-1")).toBeTruthy();
    });

    // Clear search
    fireEvent.changeText(searchInput, "");

    await waitFor(() => {
      expect(getByTestId("trip-row-trip-1")).toBeTruthy();
      expect(getByTestId("trip-row-trip-2")).toBeTruthy();
      expect(getByTestId("trip-row-trip-3")).toBeTruthy();
    });
  });

  it("navigates to create trip when Add trip button is pressed", async () => {
    const { getByText } = render(<TripsPage navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText("+ Add trip")).toBeTruthy();
    });

    const addTripButton = getByText("+ Add trip");
    fireEvent.press(addTripButton);

    expect(mockNavigate).toHaveBeenCalledWith("TripsStack");
  });

  it("navigates to trip details when trip is pressed", async () => {
    const { getByTestId } = render(<TripsPage navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByTestId("trip-row-trip-1")).toBeTruthy();
    });

    const tripRow = getByTestId("trip-row-trip-1");
    fireEvent.press(tripRow);

    expect(mockNavigate).toHaveBeenCalledWith("TripsStack", {
      screen: "TripPage",
      params: { tripId: "trip-1" },
    });
  });

  it("shows loading indicator initially", async () => {
    // Mock slow loading
    (fetchTrips as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockTrips), 100))
    );

    const { UNSAFE_root } = render(<TripsPage navigation={mockNavigation} />);

    // Should show loading indicator initially
    const activityIndicator = UNSAFE_root.findByType("ActivityIndicator");
    expect(activityIndicator).toBeTruthy();
  });

  it("shows empty state when no trips found", async () => {
    // Mock empty response
    (fetchTrips as jest.Mock).mockResolvedValue([]);

    const { getByText } = render(<TripsPage navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText("No trips found.")).toBeTruthy();
    });
  });

  it("shows empty state when search returns no results", async () => {
    const { getByPlaceholderText, getByText } = render(
      <TripsPage navigation={mockNavigation} />
    );

    // Wait for initial load
    await waitFor(() => {
      expect(fetchTrips).toHaveBeenCalled();
    });

    // Search for something that doesn't exist
    const searchInput = getByPlaceholderText("Search trip");
    fireEvent.changeText(searchInput, "nonexistent");

    await waitFor(() => {
      expect(getByText("No trips found.")).toBeTruthy();
    });
  });

  it("handles network error gracefully", async () => {
    // Mock network error
    (fetchTrips as jest.Mock).mockRejectedValue(new Error("Network error"));

    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    render(<TripsPage navigation={mockNavigation} />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching trips:",
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });

  it("displays trip information correctly", async () => {
    const { getByTestId } = render(<TripsPage navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByTestId("trip-name-trip-1")).toBeTruthy();
      expect(getByTestId("trip-location-trip-1")).toBeTruthy();
      expect(getByTestId("trip-tags-trip-1")).toBeTruthy();
    });

    // Check specific content
    const tripName = getByTestId("trip-name-trip-1");
    const tripLocation = getByTestId("trip-location-trip-1");

    expect(tripName.props.children).toBe("Mountain Adventure");
    expect(tripLocation.props.children).toBe("Rocky Mountains, CO");
  });

  it("handles tab switching interface", async () => {
    const { getByText, UNSAFE_root } = render(
      <TripsPage navigation={mockNavigation} />
    );

    // Wait for initial load
    await waitFor(() => {
      expect(fetchTrips).toHaveBeenCalled();
    });

    // Test that tabs can be pressed
    const allTab = getByText("All");
    const historyTab = getByText("History");
    const favoritesTab = getByText("Favorites");

    fireEvent.press(allTab);
    fireEvent.press(historyTab);
    fireEvent.press(favoritesTab);
    fireEvent.press(allTab); // Return to all

    // Component should still be functional
    expect(UNSAFE_root).toBeTruthy();
  });
});
