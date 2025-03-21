import React, { useState, useRef, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Animated,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  TouchableOpacity,
} from "react-native";

interface TimePickerPopupProps {
  visible: boolean;
  initialTime?: string; // Format "HH:MM"
  onConfirm: (time: string) => void;
  onCancel: () => void;
}

const ITEM_HEIGHT = 40; // Height for each item in the list
const VISIBLE_ITEMS = 5; // 2 above, 1 center, 2 below
const PADDING = ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2); // Top & bottom padding

const hoursArray = Array.from({ length: 24 }, (_, i) => i);
const minutesArray = Array.from({ length: 60 }, (_, i) => i);

const TimePickerPopup: React.FC<TimePickerPopupProps> = ({
  visible,
  initialTime,
  onConfirm,
  onCancel,
}) => {
  // Selected values stored as numbers
  const [selectedHour, setSelectedHour] = useState<number>(0);
  const [selectedMinute, setSelectedMinute] = useState<number>(0);

  // Animated values for scroll position
  const hoursScrollY = useRef(new Animated.Value(0)).current;
  const minutesScrollY = useRef(new Animated.Value(0)).current;

  // Update initial selection from initialTime
  useEffect(() => {
    if (initialTime) {
      const parts = initialTime.split(":");
      if (parts.length === 2) {
        const initHour = parseInt(parts[0], 10);
        const initMinute = parseInt(parts[1], 10);
        setSelectedHour(initHour);
        setSelectedMinute(initMinute);
      }
    }
  }, [initialTime]);

  // Handler to update selected hour when scrolling stops.
  const onHourMomentumScrollEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const index =
      Math.round(offsetY / ITEM_HEIGHT) + Math.floor(VISIBLE_ITEMS / 2);
    const clampedIndex = Math.max(0, Math.min(hoursArray.length - 1, index));
    setSelectedHour(hoursArray[clampedIndex]);
  };

  const onMinuteMomentumScrollEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const index =
      Math.round(offsetY / ITEM_HEIGHT) + Math.floor(VISIBLE_ITEMS / 2);
    const clampedIndex = Math.max(0, Math.min(minutesArray.length - 1, index));
    setSelectedMinute(minutesArray[clampedIndex]);
  };

  // Render function for each hour item
  const renderHourItem = ({ item, index }: { item: number; index: number }) => {
    const centerIndex = Animated.divide(
      Animated.add(hoursScrollY, PADDING),
      ITEM_HEIGHT
    );
    const diff = Animated.subtract(index, centerIndex);
    const scale = diff.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: [0.8, 1.2, 0.8],
      extrapolate: "clamp",
    });
    const opacity = diff.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: [0.5, 1, 0.5],
      extrapolate: "clamp",
    });
    return (
      <Animated.View
        style={[styles.itemContainer, { transform: [{ scale }], opacity }]}
      >
        <Text style={styles.itemText}>{item.toString().padStart(2, "0")}</Text>
      </Animated.View>
    );
  };

  // Render function for each minute item
  const renderMinuteItem = ({
    item,
    index,
  }: {
    item: number;
    index: number;
  }) => {
    const centerIndex = Animated.divide(
      Animated.add(minutesScrollY, PADDING),
      ITEM_HEIGHT
    );
    const diff = Animated.subtract(index, centerIndex);
    const scale = diff.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: [0.8, 1.2, 0.8],
      extrapolate: "clamp",
    });
    const opacity = diff.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: [0.5, 1, 0.5],
      extrapolate: "clamp",
    });
    return (
      <Animated.View
        style={[styles.itemContainer, { transform: [{ scale }], opacity }]}
      >
        <Text style={styles.itemText}>{item.toString().padStart(2, "0")}</Text>
      </Animated.View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Select Time</Text>
          <View style={styles.pickerContainer}>
            <Animated.FlatList
              data={hoursArray}
              keyExtractor={(item) => item.toString()}
              renderItem={renderHourItem}
              style={styles.picker}
              contentContainerStyle={{ paddingVertical: PADDING }}
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_HEIGHT}
              decelerationRate="fast"
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: hoursScrollY } } }],
                { useNativeDriver: true }
              )}
              scrollEventThrottle={16}
              onMomentumScrollEnd={onHourMomentumScrollEnd}
            />
            <Text style={styles.colon}>:</Text>
            <Animated.FlatList
              data={minutesArray}
              keyExtractor={(item) => item.toString()}
              renderItem={renderMinuteItem}
              style={styles.picker}
              contentContainerStyle={{ paddingVertical: PADDING }}
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_HEIGHT}
              decelerationRate="fast"
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: minutesScrollY } } }],
                { useNativeDriver: true }
              )}
              scrollEventThrottle={16}
              onMomentumScrollEnd={onMinuteMomentumScrollEnd}
            />
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                onConfirm(
                  `${selectedHour.toString().padStart(2, "0")}:${selectedMinute
                    .toString()
                    .padStart(2, "0")}`
                )
              }
              style={styles.confirmButton}
            >
              <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  pickerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  picker: {
    width: 60,
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
  },
  colon: {
    fontSize: 24,
    fontWeight: "bold",
    marginHorizontal: 10,
  },
  itemContainer: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  itemText: {
    fontSize: 18,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#ccc",
    borderRadius: 5,
  },
  confirmButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "blue",
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default TimePickerPopup;
