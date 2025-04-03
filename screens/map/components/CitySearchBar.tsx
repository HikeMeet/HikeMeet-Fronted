// ./components/CitySearchBar.tsx

import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
  StyleSheet,
} from "react-native";

type CitySearchBarProps = {
  onSelectLocation: (coords: [number, number], placeName: string) => void;
  onClearLocation: () => void;
  placeholder?: string;
};

export default function CitySearchBar({
  onSelectLocation,
  onClearLocation,
  placeholder = "Search city...",
}: CitySearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  async function handleSearch(text: string) {
    setQuery(text);
    if (text.length < 3) {
      setResults([]);
      if (text.length === 0) {
        onClearLocation();
      }
      return;
    }

    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        text
      )}.json?access_token=${process.env.MAPBOX_TOKEN_PUBLIC}&autocomplete=true`;
      const resp = await fetch(url);
      const data = await resp.json();
      if (data && data.features) {
        setResults(data.features);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("Error fetching Mapbox results:", error);
      setResults([]);
    }
  }

  function handleSelect(item: any) {
    const [lon, lat] = item.geometry.coordinates;
    onSelectLocation([lon, lat], item.place_name);
    setQuery(item.place_name);
    setResults([]);
  }

  function clearInput() {
    setQuery("");
    setResults([]);
    onClearLocation();
  }

  return (
    <View style={{ zIndex: 9999 }}>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder={placeholder}
          value={query}
          onChangeText={handleSearch}
          style={styles.input}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={clearInput} style={styles.clearButton}>
            <Text style={styles.clearText}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      {results.length > 0 && (
        <ScrollView style={styles.resultsContainer}>
          {results.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.resultItem}
              onPress={() => handleSelect(item)}
            >
              <Text>{item.place_name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    position: "relative",
    backgroundColor: "#f1f1f1",
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    padding: 6,
  },
  clearButton: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  clearText: {
    fontSize: 16,
    color: "#777",
  },
  resultsContainer: {
    position: "absolute",
    top: 46,
    width: "100%",
    maxHeight: 150,
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    borderTopWidth: 0,
    zIndex: 9999,
  },
  resultItem: {
    padding: 8,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
});
