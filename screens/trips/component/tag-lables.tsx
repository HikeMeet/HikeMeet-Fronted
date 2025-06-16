import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";

// Pass in your tag list via props, or import directly:
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
export default function TagPicker() {
  const tagsPerRow = 10;

  // 1) Group into rows of exactly `tagsPerRow`
  const rows = useMemo(() => {
    const out: string[][] = [];
    for (let i = 0; i < TRIP_TAGS.length; i += tagsPerRow) {
      out.push(TRIP_TAGS.slice(i, i + tagsPerRow));
    }
    return out;
  }, [TRIP_TAGS]);

  // 2) Control whether we show all rows or just the first 3
  const [showAll, setShowAll] = useState(false);
  const displayedRows = showAll ? rows : rows.slice(0, 3);

  // 3) Local selection state
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const toggleTag = (tag: string) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );

  return (
    <View className="">
      {displayedRows.map((row, rowIdx) => (
        <View key={rowIdx} className="flex-row flex-wrap ">
          {row.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <TouchableOpacity
                key={tag}
                onPress={() => toggleTag(tag)}
                className={`
                  m-1 px-2 py-1 border rounded-full
                  ${
                    isSelected
                      ? "bg-blue-500 border-blue-500"
                      : "bg-white border-gray-300"
                  }
                `}
              >
                <Text className={isSelected ? "text-white" : "text-black"}>
                  {tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      {/* 4) Left-aligned Show More / Show Less */}
      {rows.length > 3 && (
        <TouchableOpacity
          onPress={() => setShowAll((v) => !v)}
          className="mt-1 self-start"
        >
          <Text className="text-blue-600">
            {showAll ? "Show Less ▲" : `Show More (${rows.length - 3} more) ▼`}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
