import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

type Props = {
  value: string;
  onChangeText: (t: string) => void;
  onSelectLocation: (coords: [number, number], placeName: string) => void;
  onClearLocation: () => void;
  placeholder?: string;
};

export default function CitySearchBar({
  value,
  onChangeText,
  onSelectLocation,
  onClearLocation,
  placeholder = "Search city...",
}: Props) {
  const [results, setResults] = React.useState<any[]>([]);

  async function handleSearch(text: string) {
    onChangeText(text);
    if (text.length < 3) {
      setResults([]);
      if (text.length === 0) onClearLocation();
      return;
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        text
      )}&key=${process.env.GOOGLEMAP_API_KEY}`;

      const resp = await fetch(url);
      const data = await resp.json();

      if (data && data.results) {
        // Convert Google Places results to match our interface and limit to 6 results
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
        setResults([]);
      }
    } catch {
      setResults([]);
    }
  }

  function handleSelect(item: any) {
    const [lon, lat] = item.geometry.coordinates;
    onSelectLocation([lon, lat], item.place_name);
    onChangeText(item.place_name);
    setResults([]);
  }

  function clearInput() {
    onChangeText("");
    setResults([]);
    onClearLocation();
  }

  return (
    <View className="relative">
      {/* Search Bar */}
      <View className="flex-row items-center bg-white rounded-full px-4 py-2 shadow-md">
        <Ionicons name="search" size={18} color="#666" />
        <TextInput
          placeholder={placeholder}
          value={value}
          onChangeText={handleSearch}
          className="flex-1 ml-2 text-sm text-gray-800"
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={clearInput} className="p-1 ml-2">
            <Ionicons name="close" size={18} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Results Dropdown */}
      {results.length > 0 && (
        <ScrollView
          className="absolute top-12 w-full max-h-60 bg-white border border-gray-300 rounded-xl shadow-lg"
          style={{ zIndex: 9999, elevation: 10 }}
        >
          {results.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleSelect(item)}
              className="px-4 py-3 border-b border-gray-200"
            >
              <Text className="text-sm text-gray-800">{item.place_name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
