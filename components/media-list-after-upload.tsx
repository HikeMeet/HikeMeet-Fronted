import React from "react";
import { ScrollView, TouchableOpacity, View, Image } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { IImageModel } from "../interfaces/image-interface";

interface MediaListProps {
  media: IImageModel[];
  onPressItem: (index: number) => void;
}

const MediaList: React.FC<MediaListProps> = ({ media, onPressItem }) => {
  // Helper to choose the correct URL for display
  const getDisplayUri = (item: IImageModel): string => {
    return item.type === "video"
      ? item.video_sceenshot_url || item.url
      : item.url;
  };

  return (
    <ScrollView horizontal style={{ marginBottom: 16 }}>
      {media.map((item, index) => {
        const uri = getDisplayUri(item);
        if (!uri) return null;
        return (
          <TouchableOpacity key={index} onPress={() => onPressItem(index)}>
            <View style={{ position: "relative", marginRight: 8 }}>
              <Image
                source={{ uri }}
                style={{ width: 150, height: 150, borderRadius: 8 }}
                resizeMode="cover"
              />
              {item.type === "video" && (
                <View className="absolute top-2 left-2 bg-black/50 p-1 rounded-[20px]">
                  <FontAwesome name="play-circle" size={40} color="white" />
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

export default MediaList;
