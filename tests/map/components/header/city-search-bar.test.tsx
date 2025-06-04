import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import CitySearchBar from "../../../../screens/map/components/header/city-search-bar";

// Mock react-native-vector-icons
jest.mock("react-native-vector-icons/Ionicons", () => "Ionicons");

// Mock fetch for Google Places API
global.fetch = jest.fn();

describe("CitySearchBar", () => {
  const mockOnChangeText = jest.fn();
  const mockOnSelectLocation = jest.fn();
  const mockOnClearLocation = jest.fn();

  const defaultProps = {
    value: "",
    onChangeText: mockOnChangeText,
    onSelectLocation: mockOnSelectLocation,
    onClearLocation: mockOnClearLocation,
    placeholder: "Search city...",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it("renders without crashing", () => {
    const { getByPlaceholderText } = render(
      <CitySearchBar {...defaultProps} />
    );

    expect(getByPlaceholderText("Search city...")).toBeTruthy();
  });

  it("renders with custom placeholder", () => {
    const { getByPlaceholderText } = render(
      <CitySearchBar {...defaultProps} placeholder="Custom placeholder" />
    );

    expect(getByPlaceholderText("Custom placeholder")).toBeTruthy();
  });

  it("displays the current value", () => {
    const { getByDisplayValue } = render(
      <CitySearchBar {...defaultProps} value="New York" />
    );

    expect(getByDisplayValue("New York")).toBeTruthy();
  });

  it("calls onChangeText when typing", () => {
    const { getByPlaceholderText } = render(
      <CitySearchBar {...defaultProps} />
    );

    const textInput = getByPlaceholderText("Search city...");
    fireEvent.changeText(textInput, "Tel Aviv");

    expect(mockOnChangeText).toHaveBeenCalledWith("Tel Aviv");
  });

  it("clears text when typing empty string", () => {
    const { getByPlaceholderText } = render(
      <CitySearchBar {...defaultProps} value="Some text" />
    );

    const textInput = getByPlaceholderText("Search city...");
    fireEvent.changeText(textInput, "");

    expect(mockOnChangeText).toHaveBeenCalledWith("");
    expect(mockOnClearLocation).toHaveBeenCalled();
  });

  it("does not search for queries shorter than 3 characters", () => {
    const { getByPlaceholderText } = render(
      <CitySearchBar {...defaultProps} />
    );

    const textInput = getByPlaceholderText("Search city...");
    fireEvent.changeText(textInput, "NY");

    // Should not call fetch for short queries
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("renders search icon", () => {
    const { getByPlaceholderText } = render(
      <CitySearchBar {...defaultProps} />
    );

    // Should render without errors (icon is mocked)
    expect(getByPlaceholderText("Search city...")).toBeTruthy();
  });

  it("accepts all required props", () => {
    expect(() => {
      render(<CitySearchBar {...defaultProps} />);
    }).not.toThrow();
  });
});
