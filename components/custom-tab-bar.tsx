import React = require("react");
import { View, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const CustomTabBar: React.FC<CustomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  return (
    <View className="flex-row justify-around items-center bg-white border-t border-gray-300 py-2">
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const iconName = getIconName(route.name);

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // אם זה הטאב של "Map", מציגים כפתור גדול יותר, ממוקם מעט בצד ימין
        if (route.name === "Map") {
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              // מעט גדול ומורם
              className="items-center justify-center"
              style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                backgroundColor: isFocused ? "#16a34a" : "#4ade80", // ירוק בהיר כשלא ממוקד, ירוק כהה כשכן
                marginTop: -20, // מרים אותו מעל הבר
                shadowColor: "#000",
                shadowOpacity: 0.15,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
                elevation: 4,
              }}
            >
              <Icon name={iconName} size={32} color="#fff" />
              {/* אפשר להוסיף טקסט קטן מתחת לאייקון (לא חובה) */}
            </TouchableOpacity>
          );
        }

        // טאב רגיל
        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            className="flex items-center w-16"
          >
            <View className="items-center justify-center w-12 h-8 rounded-full">
              <Icon
                name={iconName}
                size={28}
                color={isFocused ? "#16a34a" : "#aaa"}
              />
            </View>
            <Text
              className={`text-xs mt-1 ${
                isFocused ? "text-green-600 font-bold" : "text-gray-400"
              }`}
            >
              {route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

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
    case "Map":
      return "map"; // אייקון מפת
    default:
      return "help-circle";
  }
};

export default CustomTabBar;
