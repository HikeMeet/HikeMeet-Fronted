import { useRef, useEffect } from "react";
import {
  Dimensions,
  ScrollView,
  Image,
  TouchableOpacity,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FullScreenVideo from "./fullscreen-video";
import { IImageModel } from "../interfaces/image-interface";
import React from "react";

interface FullScreenMediaModalProps {
  media: IImageModel[];
  initialIndex: number;
  onClose: () => void;
}

const FullScreenMediaModal: React.FC<FullScreenMediaModalProps> = ({
  media,
  initialIndex,
  onClose,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const { width, height } = Dimensions.get("window");

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: initialIndex * width,
        animated: false,
      });
    }
  }, [initialIndex, width]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        ref={scrollViewRef}
      >
        {media.map((item, index) => (
          <View
            key={index}
            style={{
              width,
              height,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {item.type === "video" ? (
              <FullScreenVideo videoUrl={item.url} active={false} />
            ) : (
              <Image
                source={{ uri: item.url }}
                style={{ width, height, resizeMode: "contain" }}
              />
            )}
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity
        style={{
          position: "absolute",
          top: 40,
          right: 20,
          backgroundColor: "rgba(255,255,255,0.7)",
          padding: 10,
          borderRadius: 20,
        }}
        onPress={onClose}
      >
        <Text style={{ color: "black", fontSize: 18 }}>Close</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default FullScreenMediaModal;
