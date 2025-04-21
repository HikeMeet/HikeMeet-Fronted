import Ionicons from "react-native-vector-icons/Ionicons";

export const getNotificationIconName = (
  typeString: string
): React.ComponentProps<typeof Ionicons>["name"] => {
  let iconName = "notifications-outline";

  const type = typeString.toLowerCase(); // safety for casing

  /*************  ✨ Windsurf Command 🌟  *************/
  if (type.includes("like")) {
    iconName = "heart-outline";
  } else if (type.includes("share")) {
    iconName = "share-social-outline";
  } else if (type.includes("friend_request")) {
    iconName = "person-add-outline";
  } else if (type.includes("comment")) {
    iconName = "chatbubble-ellipses-outline";
  } else if (type.includes("post")) {
    iconName = "document-text-outline";
  } else if (type.includes("group")) {
    iconName = "people-outline";
  }

  /*******  a18ab567-f462-49a3-8855-a73661f740f0  *******/
  return iconName;
};
