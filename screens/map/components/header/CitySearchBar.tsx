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
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        text
      )}.json?access_token=${process.env.MAPBOX_TOKEN_PUBLIC}&autocomplete=true`;
      const resp = await fetch(url);
      const data = await resp.json();
      setResults(data?.features || []);
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
    <View className="relative z-50">
      <View className="flex-row items-center bg-white rounded-full px-3 py-2 shadow-sm">
        <Ionicons name="search" size={18} color="#666" />
        <TextInput
          placeholder={placeholder}
          value={value}
          onChangeText={handleSearch}
          className="flex-1 ml-2 text-sm text-gray-800 py-1"
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={clearInput} className="p-1 ml-2">
            <Ionicons name="close" size={18} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {results.length > 0 && (
        <ScrollView className="absolute top-12 w-full max-h-40 bg-white border border-gray-300 rounded-md shadow">
          {results.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleSelect(item)}
              className="px-3 py-2 border-b border-gray-200"
            >
              <Text className="text-sm text-gray-800">{item.place_name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
