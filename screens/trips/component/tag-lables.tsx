import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";

// your master list of tags…
export const TRIP_TAGS = [
  "Water",
  "Ropes",
  "Ladders",
  "Lab",
  "Camping",
  "Hiking",
  "Snow",
  "Mountains",
  "Desert",
  "Beach",
  "Kayaking",
  "Rafting",
  "Road Trip",
  "City Tour",
  "Museum",
  "Backpacking",
  "Glamping",
  "Eco-Tourism",
  "Wildlife Safari",
  "Birdwatching",
  "Skiing",
  "Snowboarding",
  "Surfing",
  "Snorkeling",
  "Scuba Diving",
  "Rock Climbing",
  "Mountaineering",
  "Canoeing",
  "Fishing",
  "Mountain Biking",
  "Cycling",
  "Hot Air Balloon",
  "Wine Tasting",
  "Foodie",
  "Wellness Retreat",
  "Yoga Retreat",
  "Meditation",
  "Spa",
  "Festival",
  "Cultural",
  "Historical",
  "Photography",
  "Stargazing",
  "Volunteering",
  "Family-Friendly",
  "Romantic",
  "Solo Travel",
  "Group Adventure",
  "Off-Roading",
  "Urban Exploration",
  "Jungle Trek",
  "Desert Safari",
  "Ice Caving",
  "Volcano Hike",
  "Caving",
  "Zip-lining",
  "Helicopter Tour",
  "Snowmobiling",
  "Sailing",
  "Deep Sea Fishing",
  "Geocaching",
  "Wild Camping",
  "Ghost Tour",
  "Hot Springs",
  "Rail Journey",
  "Island Hopping",
  "River Cruise",
  "Glacier Walk",
  "Polar Expedition",
  "Temple Tour",
  "Monastery Stay",
  "Farm Stay",
  "Homestay",
  "Language Immersion",
  "Art Workshop",
  "Music Festival",
  "Sports Event",
  "Golf Trip",
  "Theme Park",
  "Cruise",
  "Pilgrimage",
  "Adventure Racing",
  "Rainforest Expedition",
  "Mountain Retreat",
  "Urban Safari",
];
interface TagPickerProps {
  /** controlled list of selected tags */
  selectedTags?: string[];
  /** callback when a tag is tapped */
  onTagPress?: (tag: string) => void;
  /** how many tags per row */
  tagsPerRow?: number;
  /** how many rows to show before “Show More” */
  previewRows?: number;
}

export default function TagPicker({
  selectedTags: selectedTagsProp,
  onTagPress,
  tagsPerRow = 10,
  previewRows = 3,
}: TagPickerProps) {
  // group into rows
  const rows = useMemo(() => {
    const out: string[][] = [];
    for (let i = 0; i < TRIP_TAGS.length; i += tagsPerRow) {
      out.push(TRIP_TAGS.slice(i, i + tagsPerRow));
    }
    return out;
  }, [tagsPerRow]);

  // local state only if uncontrolled
  const [localSelected, setLocalSelected] = useState<string[]>([]);
  const isControlled =
    Array.isArray(selectedTagsProp) && typeof onTagPress === "function";
  const selectedTags = isControlled ? selectedTagsProp! : localSelected;

  // show/hide rows
  const [showAll, setShowAll] = useState(false);
  const displayedRows = showAll ? rows : rows.slice(0, previewRows);

  // toggle logic
  const handlePress = (tag: string) => {
    if (isControlled) {
      onTagPress!(tag);
    } else {
      setLocalSelected((prev) =>
        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
      );
    }
  };

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexDirection: "column" }}
      >
        {displayedRows.map((row, rowIdx) => (
          <View key={rowIdx} style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {row.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  onPress={() => handlePress(tag)}
                  style={{
                    margin: 4,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 999,
                    borderWidth: 1,
                    backgroundColor: isSelected ? "#3B82F6" : "#FFFFFF",
                    borderColor: isSelected ? "#3B82F6" : "#D1D5DB",
                  }}
                >
                  <Text style={{ color: isSelected ? "#FFFFFF" : "#000000" }}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {rows.length > previewRows && (
        <TouchableOpacity
          onPress={() => setShowAll((v) => !v)}
          style={{ marginTop: 8, alignSelf: "flex-start" }}
        >
          <Text style={{ color: "#2563EB" }}>
            {showAll
              ? "Show Less ▲"
              : `Show More (${rows.length - previewRows} more) ▼`}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
