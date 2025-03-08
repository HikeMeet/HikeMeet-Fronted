import React, { useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import Mapbox from "@rnmapbox/maps";
import * as Location from "expo-location";
import { styled } from "nativewind";

const StyledMapView = styled(Mapbox.MapView);
const StyledCamera = styled(Mapbox.Camera);

type MapSearchProps = {
  onLocationSelect: (coords: [number, number], address: string) => void;
  initialLocation: [number, number] | null;
  onMapTouchStart?: () => void;
  onMapTouchEnd?: () => void;
};

const MapSearch: React.FC<MapSearchProps> = ({
  onLocationSelect,
  initialLocation,
  onMapTouchStart,
  onMapTouchEnd,
}) => {
  // Holds the text for the combined search field.
  const [query, setQuery] = useState<string>("");
  // Holds the autocomplete results from Mapbox.
  const [results, setResults] = useState<any[]>([]);
  // Coordinates of the selected/tapped location.
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(
    null
  );
  // Flag to determine if the field should be cleared on first letter typed.
  const [clearOnEdit, setClearOnEdit] = useState<boolean>(false);
  const cameraRef = useRef<Mapbox.Camera>(null);

  // Searches the Mapbox Geocoding API when the user types.
  const searchMapbox = async (text: string) => {
    // If the field should be cleared, we let the new text come through
    // and then disable the flag.
    if (clearOnEdit) {
      setQuery(text);
      setClearOnEdit(false);
    }
    // Update query value (searchMapbox will also update it below).
    setQuery(text);
    if (text.length < 3) {
      setResults([]);
      return;
    }
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        text
      )}.json?access_token=${process.env.MAPBOX_TOKEN_PUBLIC}&autocomplete=true`;
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.features) {
        setResults(data.features);
      } else {
        console.error("No features found in response:", data);
        setResults([]);
      }
    } catch (error) {
      console.error("Error fetching Mapbox results:", error);
    }
  };

  // When a user selects a search result.
  const handleSearchSelect = (item: any) => {
    const [longitude, latitude] = item.geometry.coordinates;
    setSelectedCoords([longitude, latitude]);
    setQuery(item.place_name);
    setResults([]);
    if (cameraRef.current) {
      cameraRef.current.flyTo([longitude, latitude], 1000);
    }
    onLocationSelect([longitude, latitude], item.place_name);
  };

  // When the user taps on the map.
  const handleMapPress = async (e: any) => {
    const { geometry } = e;
    const [longitude, latitude] = geometry.coordinates;
    setSelectedCoords([longitude, latitude]);
    if (cameraRef.current) {
      cameraRef.current.flyTo([longitude, latitude], 1000);
    }
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      let addressStr: string;
      if (addresses.length > 0) {
        const addr = addresses[0];
        // Build an address string from available fields.
        addressStr =
          `${addr.name || ""} ${addr.street || ""} ${addr.city || ""} ${addr.region || ""} ${addr.country || ""}`.trim();
      } else {
        addressStr = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
      }
      setQuery(addressStr); // Update the search field with the tapped location.
      onLocationSelect([longitude, latitude], addressStr);
    } catch (error) {
      console.error("Reverse geocode error:", error);
      const fallback = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
      setQuery(fallback);
      onLocationSelect([longitude, latitude], fallback);
    }
  };

  // Recenter the map to the initial location (user's location).
  const handleRecenter = () => {
    if (initialLocation && cameraRef.current) {
      cameraRef.current.flyTo(initialLocation, 1000);
    }
  };

  return (
    <View style={{ padding: 10 }}>
      {/* Combined Search/Text Field */}
      <TextInput
        placeholder="Search for a location"
        value={query}
        // When the field is focused and has text, enable clearing on edit.
        onFocus={() => {
          if (query !== "") setClearOnEdit(true);
        }}
        onChangeText={(text) => {
          searchMapbox(text);
        }}
        style={{
          padding: 10,
          borderColor: "gray",
          borderWidth: 1,
          borderRadius: 5,
          marginBottom: 10,
          textAlign: "left",
        }}
      />
      {/* List of Search Results */}
      {results.length > 0 &&
        results.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => handleSearchSelect(item)}
            style={{
              padding: 10,
              borderBottomWidth: 1,
              borderColor: "#ccc",
            }}
          >
            <Text>{item.place_name}</Text>
          </TouchableOpacity>
        ))}
      {/* Map View */}
      <View
        style={{ height: 300, marginTop: 10, position: "relative" }}
        onTouchStart={() => onMapTouchStart && onMapTouchStart()}
        onTouchEnd={() => onMapTouchEnd && onMapTouchEnd()}
        onTouchCancel={() => onMapTouchEnd && onMapTouchEnd()}
      >
        <StyledMapView style={{ flex: 1 }} onPress={handleMapPress}>
          <StyledCamera
            ref={cameraRef}
            centerCoordinate={selectedCoords || initialLocation || [0, 0]}
            zoomLevel={14}
          />
          {selectedCoords && (
            <Mapbox.PointAnnotation id="selected" coordinate={selectedCoords}>
              <View
                style={{ backgroundColor: "red", padding: 5, borderRadius: 5 }}
              >
                <Text style={{ color: "white" }}>Selected</Text>
              </View>
            </Mapbox.PointAnnotation>
          )}
        </StyledMapView>
        <TouchableOpacity
          onPress={handleRecenter}
          style={{
            position: "absolute",
            bottom: 10,
            right: 10,
            backgroundColor: "white",
            padding: 8,
            borderRadius: 20,
            shadowColor: "#000",
            shadowOpacity: 0.3,
            shadowRadius: 3,
            zIndex: 10,
            elevation: 10,
          }}
        >
          <Text style={{ fontSize: 12, color: "black" }}>My Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MapSearch;
