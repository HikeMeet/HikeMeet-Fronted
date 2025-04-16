import React = require("react");
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Import your trip-related screens
import SingleGroupPage from "../../screens/groups/single-group-page";
import CreateGroupPage from "../../screens/groups/create-groups-page";
import EditGroupPage from "../../screens/groups/group-edit-page";

const Stack = createNativeStackNavigator();

const GroupStack = () => {
  return (
    <Stack.Navigator initialRouteName="CreateGroupPage">
      <Stack.Screen
        name="CreateGroupPage"
        component={CreateGroupPage}
        options={{ title: "Create Group", headerShown: false }}
      />
      <Stack.Screen
        name="GroupPage"
        component={SingleGroupPage as React.ComponentType<any>}
        options={{ title: "Group Page", headerShown: false }}
      />
      <Stack.Screen
        name="EditGroupPage"
        component={EditGroupPage as React.ComponentType<any>}
        options={{ title: "Edit Group", headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default GroupStack;
