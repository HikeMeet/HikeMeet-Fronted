import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => {
  const [showStartPicker, setShowStartPicker] = useState<boolean>(false);
  const [showEndPicker, setShowEndPicker] = useState<boolean>(false);

  return (
    <View>
      <Text className="mb-2">Scheduled Date Range</Text>
      <View className="flex-row space-x-4">
        {/* Start Date */}
        <TouchableOpacity
          onPress={() => setShowStartPicker(true)}
          className="bg-gray-100 p-3 rounded flex-1"
        >
          <Text className="text-center">
            {startDate ? formatDate(startDate) : "Start Date"}
          </Text>
        </TouchableOpacity>
        {/* End Date */}
        <TouchableOpacity
          onPress={() => setShowEndPicker(true)}
          className="bg-gray-100 p-3 rounded flex-1"
        >
          <Text className="text-center">
            {endDate ? formatDate(endDate) : "End Date"}
          </Text>
        </TouchableOpacity>
      </View>

      {showStartPicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(_, selectedDate) => {
            setShowStartPicker(false);
            if (selectedDate) {
              onStartDateChange(selectedDate);
              // If an end date exists but is before the new start, update it as well.
              if (endDate && selectedDate > endDate) {
                onEndDateChange(selectedDate);
              }
            }
          }}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endDate || startDate || new Date()}
          mode="date"
          display="default"
          minimumDate={startDate || new Date()}
          onChange={(_, selectedDate) => {
            setShowEndPicker(false);
            if (selectedDate) {
              onEndDateChange(selectedDate);
            }
          }}
        />
      )}
    </View>
  );
};

export default DateRangePicker;
