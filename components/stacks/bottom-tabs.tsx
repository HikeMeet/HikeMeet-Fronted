import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "../../screens/home-page/home";
import ProfilePage from "../../screens/my-profile/my-profile";
import GroupsPage from "../../screens/groups/groups-page";
import TripsPage from "../../screens/trips/trips-page";
import ChatListPage from "../../screens/chats/caht-list";
import { View, Text } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Provider } from "react-native-paper";
import tw from "tailwind-react-native-classnames";

const Tab = createBottomTabNavigator();

const CustomTabBar = (props: any) => (
  <View style={tw`flex-row justify-around items-center absolute bottom-3 left-3 right-3 bg-white rounded-xl shadow-md py-2`}>
    {props.state.routes.map((route: any, index: number) => {
      const isFocused = props.state.index === index;
      const color = isFocused ? "#16a34a" : "#aaa";
      const iconName = getIconName(route.name);

      return (
        <View key={route.key} style={tw`items-center`}>
          <Icon
            name={iconName}
            size={isFocused ? 28 : 24}
            color={color}
            onPress={() => props.navigation.navigate(route.name)}
          />
          {isFocused && <Text style={tw`text-xs text-green-600 mt-1`}>{route.name}</Text>}
        </View>
      );
    })}
  </View>
);

const getIconName = (routeName: string) => {
  switch (routeName) {
    case "Home":
      return "home";
    case "Profile":
      return "account";
    case "Groups":
      return "account-group";
    case "Trips":
      return "map-marker";
    case "Chats":
      return "chat";
    default:
      return "help-circle";
  }
};

const BottomTabs = () => {
  return (
    <Provider>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: "none" },
        }}
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="Profile" component={ProfilePage} />
        <Tab.Screen name="Groups" component={GroupsPage} />
        <Tab.Screen name="Trips" component={TripsPage} />
        <Tab.Screen name="Chats" component={ChatListPage} />
      </Tab.Navigator>
    </Provider>
  );
};

export default BottomTabs;
