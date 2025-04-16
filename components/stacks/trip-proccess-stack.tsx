import React = require("react");
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Import your trip-related screens
import CreateTripPage from "../../screens/trips/create-trip-page";
import TripDetailPage from "../../screens/trips/single-trip-page";

const Stack = createNativeStackNavigator();

const TripsStack = () => {
  return (
    <Stack.Navigator initialRouteName="CreateTripPage">
      <Stack.Screen
        name="CreateTripPage"
        component={CreateTripPage}
        options={{ title: "Create Trip", headerShown: false }}
      />
      <Stack.Screen
        name="TripPage"
        component={TripDetailPage as React.ComponentType<any>}
        options={{ title: "Trip Page" }}
      />
    </Stack.Navigator>
  );
};

export default TripsStack;
