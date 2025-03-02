import React from "react";
import { TouchableOpacity, Text } from "react-native";

interface HikerButtonProps {
  showHikers: boolean;
  toggleHikers: () => void;
}

const HikerButton: React.FC<HikerButtonProps> = ({
  showHikers,
  toggleHikers,
}) => {
  return (
    <TouchableOpacity
      onPress={toggleHikers}
      className={`bg-green-500 px-3 py-1 rounded-full w-28 items-center mt-2 ${
        showHikers ? "border-2 border-green-700" : ""
      }`}
    >
      <Text className="text-white text-sm">Hikers</Text>
    </TouchableOpacity>
  );
};

export default HikerButton;
