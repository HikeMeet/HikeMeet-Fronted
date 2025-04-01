// screens/map/components/CategoryBar.tsx
import React from "react";
import { ScrollView, TouchableOpacity, Text, View } from "react-native";

type CategoryBarProps = {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
};

// דוגמה לקטגוריות מוגדרות מראש: gas, parking, food, cafe וכו'
const categories = [
  { key: "gas", label: "Gas" },
  { key: "parking", label: "Parking" },
  { key: "food", label: "Food" },
  { key: "cafe", label: "Cafe" },
  { key: "hotel", label: "Hotel" },
  { key: "ev", label: "EV Charger" },
];

export default function CategoryBar({
  selectedCategory,
  onSelectCategory,
}: CategoryBarProps) {
  return (
    <ScrollView
      horizontal
      className="flex-row mt-3"
      showsHorizontalScrollIndicator={false}
    >
      {categories.map((cat) => {
        const isActive = cat.key === selectedCategory;
        return (
          <TouchableOpacity
            key={cat.key}
            onPress={() => onSelectCategory(cat.key)}
            className={`mr-3 px-4 py-2 rounded-full ${
              isActive ? "bg-blue-600" : "bg-gray-200"
            }`}
          >
            <Text
              className={`font-semibold ${
                isActive ? "text-white" : "text-gray-700"
              }`}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        );
      })}

      {/* כפתור "All" לביטול סינון */}
      <TouchableOpacity
        onPress={() => onSelectCategory("")}
        className={`px-4 py-2 rounded-full ${
          selectedCategory === "" ? "bg-blue-600" : "bg-gray-200"
        }`}
      >
        <Text
          className={`font-semibold ${
            selectedCategory === "" ? "text-white" : "text-gray-700"
          }`}
        >
          All
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
