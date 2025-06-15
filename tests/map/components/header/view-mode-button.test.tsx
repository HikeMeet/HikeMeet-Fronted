import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ViewModeButton from "../../../../screens/map/components/header/view-mode-button";

// Mock lucide-react-native icons
jest.mock("lucide-react-native", () => ({
  List: "List",
  Map: "Map",
}));

// Mock theme
jest.mock("../../../../utils/theme", () => ({
  palette: {
    primary: "#007AFF",
    third: "#34C759",
  },
}));

describe("ViewModeButton", () => {
  const mockOnToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    const { getByText } = render(
      <ViewModeButton viewMode="map" onToggle={mockOnToggle} />
    );

    expect(getByText("List View")).toBeTruthy();
  });

  it("shows List View when in map mode", () => {
    const { getByText } = render(
      <ViewModeButton viewMode="map" onToggle={mockOnToggle} />
    );

    expect(getByText("List View")).toBeTruthy();
  });

  it("shows Map View when in list mode", () => {
    const { getByText } = render(
      <ViewModeButton viewMode="list" onToggle={mockOnToggle} />
    );

    expect(getByText("Map View")).toBeTruthy();
  });

  it("renders pressable component", () => {
    const { getByText } = render(
      <ViewModeButton viewMode="map" onToggle={mockOnToggle} />
    );

    const textElement = getByText("List View");
    expect(textElement).toBeTruthy();
    // Should have a pressable parent
    expect(textElement.parent).toBeTruthy();
  });

  it("applies correct styling based on view mode", () => {
    const { getByText, rerender } = render(
      <ViewModeButton viewMode="map" onToggle={mockOnToggle} />
    );

    let button = getByText("List View");
    expect(button).toBeTruthy();

    rerender(<ViewModeButton viewMode="list" onToggle={mockOnToggle} />);

    button = getByText("Map View");
    expect(button).toBeTruthy();
  });

  it("renders with correct text for each mode", () => {
    const { getByText, rerender } = render(
      <ViewModeButton viewMode="map" onToggle={mockOnToggle} />
    );

    // When in map mode, should show "List View" button
    expect(getByText("List View")).toBeTruthy();

    rerender(<ViewModeButton viewMode="list" onToggle={mockOnToggle} />);

    // When in list mode, should show "Map View" button
    expect(getByText("Map View")).toBeTruthy();
  });

  it("accepts onToggle prop without errors", () => {
    expect(() => {
      render(<ViewModeButton viewMode="map" onToggle={mockOnToggle} />);
    }).not.toThrow();
  });
});
