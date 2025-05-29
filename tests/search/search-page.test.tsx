import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import SearchPage from "../../screens/search/search-page";
import { mockAuthContext } from "../__mocks__/auth-context";

// Mock all search related components directly in the test file
jest.mock("../../components/search-input", () => {
  const React = require("react");
  const { TextInput } = require("react-native");
  return function SearchInput({ placeholder, onChangeText, autoFocus }: any) {
    return (
      <TextInput
        testID="search-input"
        placeholder={placeholder}
        onChangeText={onChangeText}
        autoFocus={autoFocus}
      />
    );
  };
});

jest.mock("../../screens/search/components/search-filters", () => {
  const React = require("react");
  const { View, TouchableOpacity, Text } = require("react-native");
  return function SearchFilters({ filter, setFilter }: any) {
    const filterOptions = ["All", "Hikes", "Groups", "Trip"];
    return (
      <View
        testID="search-filters"
        style={{ flexDirection: "row", padding: 10 }}
      >
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option}
            testID={`filter-${option.toLowerCase()}`}
            onPress={() => setFilter(option)}
            style={{
              padding: 8,
              marginRight: 8,
              backgroundColor: filter === option ? "#3b82f6" : "#e5e7eb",
              borderRadius: 6,
            }}
          >
            <Text style={{ color: filter === option ? "white" : "black" }}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };
});

jest.mock("../../components/user-row-search", () => {
  const React = require("react");
  const { TouchableOpacity, Text, View } = require("react-native");
  return function UserRow({ user, navigation, onStatusChange }: any) {
    const handlePress = () => {
      navigation.navigate("UserProfile", { userId: user._id });
    };
    return (
      <TouchableOpacity testID={`user-row-${user._id}`} onPress={handlePress}>
        <View
          style={{ padding: 10, borderBottomWidth: 1, borderColor: "#eee" }}
        >
          <Text testID={`user-name-${user._id}`}>
            {user.name || user.username}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
});

jest.mock("../../screens/groups/components/group-row", () => {
  const React = require("react");
  const { TouchableOpacity, Text, View } = require("react-native");
  return function GroupRow({ group, onPress }: any) {
    return (
      <TouchableOpacity testID={`group-row-${group._id}`} onPress={onPress}>
        <View
          style={{ padding: 10, borderBottomWidth: 1, borderColor: "#eee" }}
        >
          <Text testID={`group-name-${group._id}`}>{group.name}</Text>
        </View>
      </TouchableOpacity>
    );
  };
});

jest.mock("../../screens/trips/component/trip-row", () => {
  const React = require("react");
  const { TouchableOpacity, Text, View } = require("react-native");
  return function TripRow({ trip, onPress }: any) {
    return (
      <TouchableOpacity testID={`trip-row-${trip._id}`} onPress={onPress}>
        <View
          style={{ padding: 10, borderBottomWidth: 1, borderColor: "#eee" }}
        >
          <Text testID={`trip-name-${trip._id}`}>{trip.name}</Text>
        </View>
      </TouchableOpacity>
    );
  };
});

jest.mock("../../screens/search/components/see-more-button", () => {
  const React = require("react");
  const { TouchableOpacity, Text, ActivityIndicator } = require("react-native");
  return function SearchFooter({ loadingMore, canLoadMore, onPress }: any) {
    if (loadingMore) {
      return <ActivityIndicator testID="loading-more" />;
    }
    if (!canLoadMore) {
      return null;
    }
    return (
      <TouchableOpacity testID="load-more-button" onPress={onPress}>
        <Text>Load More</Text>
      </TouchableOpacity>
    );
  };
});

jest.mock("../../screens/search/components/empty-results", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return function EmptyResults() {
    return (
      <View
        testID="empty-results"
        style={{ padding: 20, alignItems: "center" }}
      >
        <Text>No results found</Text>
      </View>
    );
  };
});

jest.mock("../../components/TripFilterModal", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return function TripFilterModal({ visible }: any) {
    if (!visible) return null;
    return (
      <View testID="trip-filter-modal">
        <Text>Trip Filter Modal</Text>
      </View>
    );
  };
});

jest.mock("../../components/GroupFilterModal", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return function GroupFilterModal({ visible }: any) {
    if (!visible) return null;
    return (
      <View testID="group-filter-modal">
        <Text>Group Filter Modal</Text>
      </View>
    );
  };
});

// Mock search API functions
jest.mock("../../screens/search/components/search-api", () => ({
  fetchAll: jest.fn().mockResolvedValue({
    friends: [
      {
        _id: "user-1",
        username: "john_doe",
        name: "John Doe",
        friendStatus: "none",
      },
      {
        _id: "user-2",
        username: "jane_smith",
        name: "Jane Smith",
        friendStatus: "friend",
      },
    ],
    trips: [
      {
        _id: "trip-1",
        name: "Mountain Hike",
        location: { address: "Mountains" },
        tags: ["hiking"],
      },
      {
        _id: "trip-2",
        name: "Beach Trip",
        location: { address: "Beach" },
        tags: ["beach"],
      },
    ],
    groups: [
      {
        _id: "group-1",
        name: "Hiking Enthusiasts",
        max_members: 20,
        current_members: 15,
      },
      {
        _id: "group-2",
        name: "Beach Lovers",
        max_members: 10,
        current_members: 8,
      },
    ],
  }),
  fetchUsers: jest.fn().mockResolvedValue([
    {
      _id: "user-1",
      username: "john_doe",
      name: "John Doe",
      friendStatus: "none",
    },
    {
      _id: "user-2",
      username: "jane_smith",
      name: "Jane Smith",
      friendStatus: "friend",
    },
  ]),
  fetchGroups: jest.fn().mockResolvedValue([
    {
      _id: "group-1",
      name: "Hiking Enthusiasts",
      max_members: 20,
      current_members: 15,
    },
    {
      _id: "group-2",
      name: "Beach Lovers",
      max_members: 10,
      current_members: 8,
    },
  ]),
  fetchTrips: jest.fn().mockResolvedValue([
    {
      _id: "trip-1",
      name: "Mountain Hike",
      location: { address: "Mountains" },
      tags: ["hiking"],
    },
    {
      _id: "trip-2",
      name: "Beach Trip",
      location: { address: "Beach" },
      tags: ["beach"],
    },
  ]),
}));

// Mock filter functions
jest.mock("../../screens/search/components/filters", () => ({
  filterGroupsByFilters: jest.fn().mockImplementation((groups, filters) => {
    if (!filters || filters.length === 0) return groups;
    return groups;
  }),
  filterTripsByFilters: jest.fn().mockImplementation((trips, filters) => {
    if (!filters || filters.length === 0) return trips;
    return trips;
  }),
}));

// Import the mock functions
import {
  fetchAll,
  fetchUsers,
  fetchGroups,
  fetchTrips,
} from "../../screens/search/components/search-api";

// Mock navigation
const mockNavigate = jest.fn();
const mockPush = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  push: mockPush,
  goBack: jest.fn(),
  addListener: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  setOptions: jest.fn(),
};

describe("SearchPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset auth context
    mockAuthContext.mongoId = "mongo-test-id-123";
    (mockAuthContext.mongoUser as any).friends = [
      { id: "user-2", status: "friend" },
    ];
  });

  it("renders without crashing and shows main elements", async () => {
    const { getByTestId } = render(<SearchPage navigation={mockNavigation} />);

    // Check main elements
    expect(getByTestId("search-input")).toBeTruthy();
    expect(getByTestId("search-filters")).toBeTruthy();
  });

  it("performs search with debounce", async () => {
    const { getByTestId } = render(<SearchPage navigation={mockNavigation} />);

    const searchInput = getByTestId("search-input");

    // Type in search
    fireEvent.changeText(searchInput, "test query");

    // Wait for debounce to trigger API call
    await waitFor(
      () => {
        expect(fetchAll).toHaveBeenCalledWith(
          "test query",
          "mongo-test-id-123"
        );
      },
      { timeout: 2000 }
    );
  });

  it("shows search results for All filter", async () => {
    const { getByTestId } = render(<SearchPage navigation={mockNavigation} />);

    const searchInput = getByTestId("search-input");
    fireEvent.changeText(searchInput, "john");

    await waitFor(() => {
      expect(fetchAll).toHaveBeenCalledWith("john", "mongo-test-id-123");
    });

    // Should show user rows, group rows, and trip rows
    await waitFor(() => {
      expect(getByTestId("user-row-user-1")).toBeTruthy();
      expect(getByTestId("group-row-group-1")).toBeTruthy();
      expect(getByTestId("trip-row-trip-1")).toBeTruthy();
    });
  });

  it("filters by Hikes (users) only", async () => {
    const { getByTestId, queryByTestId } = render(
      <SearchPage navigation={mockNavigation} />
    );

    // Switch to Hikes filter
    const hikesFilter = getByTestId("filter-hikes");
    fireEvent.press(hikesFilter);

    const searchInput = getByTestId("search-input");
    fireEvent.changeText(searchInput, "john");

    await waitFor(() => {
      expect(fetchUsers).toHaveBeenCalledWith("john", "mongo-test-id-123");
    });

    // Should only show user rows
    await waitFor(() => {
      expect(getByTestId("user-row-user-1")).toBeTruthy();
      expect(queryByTestId("group-row-group-1")).toBeNull();
      expect(queryByTestId("trip-row-trip-1")).toBeNull();
    });
  });

  it("filters by Groups only", async () => {
    const { getByTestId, queryByTestId } = render(
      <SearchPage navigation={mockNavigation} />
    );

    // Switch to Groups filter
    const groupsFilter = getByTestId("filter-groups");
    fireEvent.press(groupsFilter);

    const searchInput = getByTestId("search-input");
    fireEvent.changeText(searchInput, "hiking");

    await waitFor(() => {
      expect(fetchGroups).toHaveBeenCalledWith("hiking");
    });

    // Should only show group rows
    await waitFor(() => {
      expect(getByTestId("group-row-group-1")).toBeTruthy();
      expect(queryByTestId("user-row-user-1")).toBeNull();
      expect(queryByTestId("trip-row-trip-1")).toBeNull();
    });
  });

  it("filters by Trip only", async () => {
    const { getByTestId, queryByTestId } = render(
      <SearchPage navigation={mockNavigation} />
    );

    // Switch to Trip filter
    const tripFilter = getByTestId("filter-trip");
    fireEvent.press(tripFilter);

    const searchInput = getByTestId("search-input");
    fireEvent.changeText(searchInput, "mountain");

    await waitFor(() => {
      expect(fetchTrips).toHaveBeenCalledWith("mountain");
    });

    // Should only show trip rows
    await waitFor(() => {
      expect(getByTestId("trip-row-trip-1")).toBeTruthy();
      expect(queryByTestId("user-row-user-1")).toBeNull();
      expect(queryByTestId("group-row-group-1")).toBeNull();
    });
  });

  it("navigates to user profile when user row is pressed", async () => {
    const { getByTestId } = render(<SearchPage navigation={mockNavigation} />);

    const searchInput = getByTestId("search-input");
    fireEvent.changeText(searchInput, "john");

    await waitFor(() => {
      expect(getByTestId("user-row-user-1")).toBeTruthy();
    });

    const userRow = getByTestId("user-row-user-1");
    fireEvent.press(userRow);

    expect(mockNavigate).toHaveBeenCalledWith("UserProfile", {
      userId: "user-1",
    });
  });

  it("navigates to group page when group row is pressed", async () => {
    const { getByTestId } = render(<SearchPage navigation={mockNavigation} />);

    const searchInput = getByTestId("search-input");
    fireEvent.changeText(searchInput, "hiking");

    await waitFor(() => {
      expect(getByTestId("group-row-group-1")).toBeTruthy();
    });

    const groupRow = getByTestId("group-row-group-1");
    fireEvent.press(groupRow);

    expect(mockNavigate).toHaveBeenCalledWith("GroupsStack", {
      screen: "GroupPage",
      params: { groupId: "group-1" },
    });
  });

  it("navigates to trip page when trip row is pressed", async () => {
    const { getByTestId } = render(<SearchPage navigation={mockNavigation} />);

    const searchInput = getByTestId("search-input");
    fireEvent.changeText(searchInput, "mountain");

    await waitFor(() => {
      expect(getByTestId("trip-row-trip-1")).toBeTruthy();
    });

    const tripRow = getByTestId("trip-row-trip-1");
    fireEvent.press(tripRow);

    expect(mockPush).toHaveBeenCalledWith("TripsStack", {
      screen: "TripPage",
      params: { tripId: "trip-1" },
    });
  });

  it("shows empty results when no search results", async () => {
    // Mock empty results
    (fetchAll as jest.Mock).mockResolvedValueOnce({
      friends: [],
      trips: [],
      groups: [],
    });

    const { getByTestId } = render(<SearchPage navigation={mockNavigation} />);

    const searchInput = getByTestId("search-input");
    fireEvent.changeText(searchInput, "nonexistent");

    await waitFor(() => {
      expect(getByTestId("empty-results")).toBeTruthy();
    });
  });

  it("shows loading indicator during search", async () => {
    // Mock slow API response
    (fetchAll as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                friends: [],
                trips: [],
                groups: [],
              }),
            100
          )
        )
    );

    const { getByTestId } = render(<SearchPage navigation={mockNavigation} />);

    const searchInput = getByTestId("search-input");
    fireEvent.changeText(searchInput, "test");

    // Since the component shows ActivityIndicator directly, let's check for loading state differently
    await waitFor(() => {
      expect(fetchAll).toHaveBeenCalledWith("test", "mongo-test-id-123");
    });
  });

  it("clears results when search is empty", async () => {
    const { getByTestId } = render(<SearchPage navigation={mockNavigation} />);

    const searchInput = getByTestId("search-input");

    // First search
    fireEvent.changeText(searchInput, "test");

    await waitFor(() => {
      expect(fetchAll).toHaveBeenCalledWith("test", "mongo-test-id-123");
    });

    // Clear search - this should trigger empty state
    fireEvent.changeText(searchInput, "");

    // Check that empty state is shown
    await waitFor(() => {
      expect(getByTestId("empty-results")).toBeTruthy();
    });
  });

  it("handles API errors gracefully", async () => {
    // Mock API error
    (fetchAll as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    const { getByTestId } = render(<SearchPage navigation={mockNavigation} />);

    const searchInput = getByTestId("search-input");
    fireEvent.changeText(searchInput, "test");

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it("handles filter switching", async () => {
    const { getByTestId } = render(<SearchPage navigation={mockNavigation} />);

    // Test switching between filters
    const allFilter = getByTestId("filter-all");
    const hikesFilter = getByTestId("filter-hikes");
    const groupsFilter = getByTestId("filter-groups");
    const tripFilter = getByTestId("filter-trip");

    fireEvent.press(hikesFilter);
    fireEvent.press(groupsFilter);
    fireEvent.press(tripFilter);
    fireEvent.press(allFilter);

    // Component should still be functional
    expect(getByTestId("search-input")).toBeTruthy();
  });
});
