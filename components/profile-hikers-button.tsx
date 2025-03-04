import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { useAuth } from "../contexts/auth-context";

interface HikerButtonProps {
  showHikers: boolean;
  toggleHikers: () => void;
}

const HikerButton: React.FC<HikerButtonProps> = ({
  showHikers,
  toggleHikers,
}) => {
  const { mongoUser } = useAuth();

  // Calculate the number of accepted friends directly from mongoUser.
  const acceptedCount = mongoUser?.friends
    ? mongoUser.friends.filter((friend: any) => friend.status === "accepted")
        .length
    : 0;

  return (
    <TouchableOpacity
      onPress={toggleHikers}
      className={`bg-green-500 px-3 py-1 rounded-full w-28 items-center mt-2 ${
        showHikers ? "border-2 border-green-700" : ""
      }`}
    >
      <Text className="text-white text-sm">Hikers ({acceptedCount})</Text>
    </TouchableOpacity>
  );
};

export default HikerButton;
