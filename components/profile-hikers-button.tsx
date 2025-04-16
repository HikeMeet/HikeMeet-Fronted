import React = require("react");
import { TouchableOpacity, Text } from "react-native";
import { MongoUser } from "../interfaces/user-interface";

interface HikerButtonProps {
  showHikers: boolean;
  toggleHikers: () => void;
  user: MongoUser | null;
}

const HikerButton: React.FC<HikerButtonProps> = ({
  showHikers,
  toggleHikers,
  user,
}) => {
  // Calculate the number of accepted friends from the passed in user.
  const acceptedCount = user?.friends
    ? user.friends.filter((friend: any) => friend.status === "accepted").length
    : 0;

  return (
    <TouchableOpacity
      onPress={toggleHikers}
      className={`px-3 py-1 rounded-full w-28 items-center mt-2 border-2 border-green-700 ${
        showHikers ? "bg-green-300" : "bg-green-500"
      }`}
    >
      <Text className={`text-white text-sm ${showHikers ? "font-bold" : ""}`}>
        Hikers ({acceptedCount})
      </Text>
    </TouchableOpacity>
  );
};

export default HikerButton;
