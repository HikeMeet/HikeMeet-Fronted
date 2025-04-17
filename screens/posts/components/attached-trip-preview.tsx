import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import TripRow from "../../trips/component/trip-row";
import { Trip } from "../../../interfaces/trip-interface";

interface SelectedTripsListProps {
  trips: Trip[];
  onRemove?: (tripId: string) => void;
  navigation: any;
}

const SelectedTripsList: React.FC<SelectedTripsListProps> = ({
  trips,
  onRemove,
  navigation,
}) => {
  if (trips.length === 0) return null;
  return (
    <View className="mb-4">
      <Text className="text-lg font-semibold mb-2">Attached Groups:</Text>
      {trips.map((trip) => (
        <View
          key={trip._id}
          style={{ paddingRight: 16 }} // Adjust or add padding as needed.
          className="flex-row items-center"
        >
          <TripRow
            trip={trip}
            onPress={() => {
              navigation.push("TripsStack", {
                screen: "TripPage",
                params: { tripId: trip._id },
              });
            }}
          />
          {onRemove && (
            <TouchableOpacity onPress={() => onRemove(trip._id)}>
              <Icon
                name="close"
                size={20}
                color="red"
                style={{ marginLeft: 8 }} // Add margin to the left of the button.
              />
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
};

export default SelectedTripsList;
