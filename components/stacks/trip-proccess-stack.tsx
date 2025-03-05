import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Import your trip-related screens
import TripsPage from "../../screens/trips/trips-page";
import CreateTripPage from "../../screens/trips/create-trip-page";

const Stack = createNativeStackNavigator();

const TripsStack = () => {
  return (
    <Stack.Navigator initialRouteName="TripsPage">
      <Stack.Screen
        name="TripsPage"
        component={TripsPage}
        options={{ title: "Trips" }}
      />
      <Stack.Screen
        name="CreateTripPage"
        component={CreateTripPage}
        options={{ title: "Create Trip" }}
      />
    </Stack.Navigator>
  );
};

export default TripsStack;
