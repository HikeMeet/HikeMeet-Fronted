// GroupFormFields.tsx
import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import TripSelector from "../../../components/trip-selector-for-group";
import DateRangePicker from "../../../components/schedual-time-group";
import TimePickerPopup from "../../../components/time-picker";

interface LabeledTextInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  numberOfLines?: number;
  className?: string;
}

export const LabeledTextInput: React.FC<LabeledTextInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  multiline,
  numberOfLines,
  className = "",
}) => (
  <View className={`mb-4 ${className}`}>
    <Text className="mb-2">{label}</Text>
    <TextInput
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
      numberOfLines={numberOfLines}
      className="bg-gray-100 p-3 rounded"
    />
  </View>
);

interface TripSelectorFieldProps {
  label: string;
  selectedTrip: string;
  onSelectTrip: (tripId: string) => void;
}

export const TripSelectorField: React.FC<TripSelectorFieldProps> = ({
  label,
  selectedTrip,
  onSelectTrip,
}) => (
  <View className="mb-4">
    <Text className="mb-2">{label}</Text>
    <TripSelector selectedTripId={selectedTrip} onSelectTrip={onSelectTrip} />
  </View>
);

interface MaxMembersFieldProps {
  value: string;
  onChangeText: (text: string) => void;
}

export const MaxMembersField: React.FC<MaxMembersFieldProps> = ({
  value,
  onChangeText,
}) => (
  <View className="flex-1 mr-2">
    <Text className="mb-2">Maximum Members</Text>
    <TextInput
      placeholder="Max"
      maxLength={2}
      keyboardType="numeric"
      value={value}
      onChangeText={onChangeText}
      className="bg-gray-100 p-3 rounded w-16"
    />
  </View>
);

interface PrivacyFieldProps {
  privacy: "public" | "private";
  setPrivacy: (privacy: "public" | "private") => void;
}

export const PrivacyField: React.FC<PrivacyFieldProps> = ({
  privacy,
  setPrivacy,
}) => (
  <View className="flex-1 ml-2">
    <Text className="mb-2">Privacy</Text>
    <View className="flex-row">
      <TouchableOpacity
        onPress={() => setPrivacy("public")}
        className={`px-4 py-2 mr-2 rounded ${
          privacy === "public" ? "bg-green-500" : "bg-gray-200"
        }`}
      >
        <Text
          className={`${privacy === "public" ? "text-white" : "text-black"} font-semibold`}
        >
          Public
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setPrivacy("private")}
        className={`px-4 py-2 rounded ${
          privacy === "private" ? "bg-green-500" : "bg-gray-200"
        }`}
      >
        <Text
          className={`${privacy === "private" ? "text-white" : "text-black"} font-semibold`}
        >
          Private
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

interface DifficultyFieldProps {
  difficulty: string;
  setDifficulty: (difficulty: string) => void;
}

export const DifficultyField: React.FC<DifficultyFieldProps> = ({
  difficulty,
  setDifficulty,
}) => {
  const difficulties = ["beginner", "intermediate", "advanced", "hardcore"];
  return (
    <View className="mb-4">
      <Text className="mb-2">Difficulty</Text>
      <View className="flex-row flex-wrap justify-between">
        {difficulties.map((diff) => (
          <TouchableOpacity
            key={diff}
            onPress={() => setDifficulty(diff)}
            className={`w-[48%] px-3 py-2 mb-2 rounded ${
              difficulty === diff ? "bg-blue-500" : "bg-gray-200"
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                difficulty === diff ? "text-white" : "text-black"
              }`}
            >
              {diff.charAt(0).toUpperCase() + diff.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

interface DateRangePickerFieldProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
}

export const DateRangePickerField: React.FC<DateRangePickerFieldProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => (
  <View className="mb-4">
    <DateRangePicker
      startDate={startDate}
      endDate={endDate}
      onStartDateChange={onStartDateChange}
      onEndDateChange={onEndDateChange}
    />
  </View>
);

interface EmbarkedAtFieldProps {
  embarkedAt: string;
  setEmbarkedAt: (time: string) => void;
  showTimePicker: boolean;
  setShowTimePicker: (show: boolean) => void;
}

export const EmbarkedAtField: React.FC<EmbarkedAtFieldProps> = ({
  embarkedAt,
  setEmbarkedAt,
  showTimePicker,
  setShowTimePicker,
}) => (
  <View className="mb-4">
    <Text className="mb-2">Embarked At (HH:MM)</Text>
    <TouchableOpacity
      onPress={() => setShowTimePicker(true)}
      className="bg-gray-100 p-3 rounded"
    >
      <Text className="text-center">
        {embarkedAt ? embarkedAt : "Select time (HH:MM)"}
      </Text>
    </TouchableOpacity>
    {showTimePicker && (
      <TimePickerPopup
        visible={showTimePicker}
        initialTime={embarkedAt}
        onConfirm={(time: string) => {
          setEmbarkedAt(time);
          setShowTimePicker(false);
        }}
        onCancel={() => setShowTimePicker(false)}
      />
    )}
  </View>
);
