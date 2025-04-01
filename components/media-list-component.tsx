import React from "react";
import { View, Image, TouchableOpacity, Text } from "react-native";

export interface ILocalMedia {
  uri: string;
  type: "image" | "video";
}

interface SelectedMediaListProps {
  media: ILocalMedia[];
  onRemove: (index: number) => void;
}

const SelectedMediaList: React.FC<SelectedMediaListProps> = ({ media, onRemove }) => {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 16 }}>
      {media.map((item, index) => (
        <View key={index} style={{ marginRight: 8, marginBottom: 8 }}>
          <Image
            source={{ uri: item.uri }}
            style={{ width: 80, height: 80, borderRadius: 4 }}
          />
          <TouchableOpacity
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              borderRadius: 12,
              padding: 2,
            }}
            onPress={() => onRemove(index)}
          >
            <Text style={{ color: "white", fontSize: 12 }}>X</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

export default SelectedMediaList;
