import { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";
import Constants from "expo-constants";
import * as Location from "expo-location";
import { styled } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

// Only import Mapbox if not running in Expo Go
let Mapbox = null;
let StyledMapView: any;
let StyledCamera: any;
if (Constants.appOwnership !== "expo") {
  Mapbox = require("@rnmapbox/maps").default;
  StyledMapView = styled(Mapbox.MapView as any);
  StyledCamera = styled(Mapbox.Camera as any);
}

const StyledIonicons = styled(Ionicons);

type MapSearchProps = {
  onLocationSelect: (coords: [number, number], address: string) => void;
  userLocation?: [number, number];
  initialLocation: [number, number] | null;
  onMapTouchStart?: () => void;
  onMapTouchEnd?: () => void;
  loading?: boolean;
};

const MapSearch: React.FC<MapSearchProps> = ({
  onLocationSelect,
  userLocation,
  initialLocation,
  onMapTouchStart,
  onMapTouchEnd,
  loading,
}) => {
  // Always call hooks unconditionally
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(
    initialLocation
  );
  const [hasInit, setHasInit] = useState<boolean>(false);

  const [clearOnEdit, setClearOnEdit] = useState<boolean>(false);
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    if (initialLocation && cameraRef.current) {
      setSelectedCoords(initialLocation);
      cameraRef.current.flyTo(initialLocation, 100);
    }
  }, [initialLocation]);

  useEffect(() => {
    if (!initialLocation) return;
    (async () => {
      try {
        const [longitude, latitude] = initialLocation;
        const addresses = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        let addressStr: string;
        if (addresses.length > 0) {
          const a = addresses[0];
          addressStr =
            `${a.name || ""} ${a.street || ""} ${a.city || ""} ${a.region || ""} ${a.country || ""}`.trim();
        } else {
          addressStr = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        }
        // update the search‐box:
        setQuery(addressStr);
        if (!hasInit) {
          onLocationSelect(initialLocation, addressStr);
          setHasInit(true);
        }
      } catch (e) {
        console.warn("Reverse‐geocode failed on init:", e);
      }
    })();
  }, [initialLocation]);

  const searchGoogle = async (text: string) => {
    setQuery(text);
    if (text.length < 3) {
      setResults([]);
      return;
    }
    try {
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        text
      )}&key=${process.env.GOOGLEMAP_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data && data.results) {
        // Convert Google Places results to match our interface
        const convertedResults = data.results
          .slice(0, 6) // Limit to 6 results
          .map((place: any) => ({
            id: place.place_id,
            place_name: place.formatted_address || place.name,
            geometry: {
              coordinates: [
                place.geometry.location.lng,
                place.geometry.location.lat,
              ],
            },
          }));
        setResults(convertedResults);
      } else {
        console.error("No results found in Google response:", data);
        setResults([]);
      }
    } catch (error) {
      console.error("Error fetching Google Places results:", error);
      setResults([]);
    }
  };

  const handleSearchSelect = (item: any) => {
    const [longitude, latitude] = item.geometry.coordinates;
    setSelectedCoords([longitude, latitude]);
    setQuery(item.place_name);
    setResults([]);
    if (cameraRef.current) {
      cameraRef.current.flyTo([longitude, latitude], 100);
    }
    onLocationSelect([longitude, latitude], item.place_name);
  };

  const handleMapPress = async (e: any) => {
    const { geometry } = e;
    const [longitude, latitude] = geometry.coordinates;
    setSelectedCoords([longitude, latitude]);
    if (cameraRef.current) {
      cameraRef.current.flyTo([longitude, latitude], 100);
    }
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      let addressStr: string;
      if (addresses.length > 0) {
        const addr = addresses[0];
        addressStr =
          `${addr.name || ""} ${addr.street || ""} ${addr.city || ""} ${addr.region || ""} ${addr.country || ""}`.trim();
      } else {
        addressStr = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
      }
      setQuery(addressStr);
      onLocationSelect([longitude, latitude], addressStr);
    } catch (error) {
      console.error("Reverse geocode error:", error);
      const fallback = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
      setQuery(fallback);
      onLocationSelect([longitude, latitude], fallback);
    }
  };

  const handleRecenter = async () => {
    try {
      // 1) Determine coords: prefer passed-in userLocation, otherwise ask GPS
      let coords: [number, number];
      if (userLocation) {
        coords = userLocation;
      } else {
        const { coords: loc } = await Location.getCurrentPositionAsync({});
        coords = [loc.longitude, loc.latitude];
      }

      // 2) Move camera & pin
      if (cameraRef.current) {
        cameraRef.current.flyTo(coords, 100);
      }
      setSelectedCoords(coords);

      // 3) Reverse–geocode into a human address
      const [lng, lat] = coords;
      let addressStr: string;
      try {
        const addresses = await Location.reverseGeocodeAsync({
          latitude: lat,
          longitude: lng,
        });
        if (addresses.length > 0) {
          const a = addresses[0];
          addressStr =
            `${a.name || ""} ${a.street || ""} ${a.city || ""} ${a.region || ""} ${a.country || ""}`.trim();
        } else {
          addressStr = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        }
      } catch {
        addressStr = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      }

      // 4) Update the search box and notify parent
      setQuery(addressStr);
      onLocationSelect(coords, addressStr);
    } catch (error) {
      console.error("Error in handleRecenter:", error);
    }
  };

  // Conditionally render based on Mapbox availability
  return (
    <View className="p-[10px]">
      {!Mapbox ? (
        <View style={{ padding: 10, alignItems: "center" }}>
          <Text>
            Map is disabled in Expo Go. Please use a custom dev client to view
            maps.
          </Text>
        </View>
      ) : (
        <>
          {/* Combined Search/Text Field with Clear Button */}
          <View className="relative mb-2">
            <TextInput
              placeholder="Search for a location"
              value={query}
              onFocus={() => {
                if (query !== "") setClearOnEdit(true);
              }}
              onChangeText={(text) => searchGoogle(text)}
              className="w-full h-10 p-2 pr-10 border border-gray-400 rounded text-left"
            />
            {query.length > 0 && (
              <TouchableOpacity
                onPress={() => setQuery("")}
                className="absolute right-2 inset-y-2 flex items-center bg-gray-200 rounded-full w-6 h-6"
              >
                <Text className="text-xs inset-y-1 text-gray-600">×</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* List of Search Results */}
          {results.length > 0 &&
            results.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleSearchSelect(item)}
                className="p-[10px] border-b border-gray-300"
              >
                <View>
                  <Text>{item.place_name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          {/* Map View */}
          <View
            className="h-[300px] mt-[10px] relative"
            onTouchStart={() => onMapTouchStart && onMapTouchStart()}
            onTouchEnd={() => onMapTouchEnd && onMapTouchEnd()}
            onTouchCancel={() => onMapTouchEnd && onMapTouchEnd()}
          >
            {/*
              Now that we know Mapbox is available,
              define the styled components.
            */}
            {(() => {
              return (
                <StyledMapView className="flex-1" onPress={handleMapPress}>
                  <StyledCamera
                    ref={cameraRef}
                    centerCoordinate={
                      selectedCoords || initialLocation || [0, 0]
                    }
                    zoomLevel={13}
                  />
                  {selectedCoords && (
                    <Mapbox.PointAnnotation
                      id="selected"
                      coordinate={selectedCoords}
                    >
                      <StyledIonicons
                        name="location-sharp"
                        size={30}
                        className="text-red-500"
                      />
                    </Mapbox.PointAnnotation>
                  )}
                </StyledMapView>
              );
            })()}
            {loading && (
              <View
                pointerEvents="none"
                className="absolute top-0 left-0 right-0 bottom-0 bg-white bg-opacity-60 flex justify-center items-center z-20"
              >
                <ActivityIndicator size="large" color="#0000ff" />
              </View>
            )}

            <TouchableOpacity
              onPress={handleRecenter}
              className="absolute bottom-[10px] right-[10px] bg-white p-2 rounded-[20px] shadow-md z-10"
            >
              <Text className="text-[12px] text-black">My Location</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

export default MapSearch;
