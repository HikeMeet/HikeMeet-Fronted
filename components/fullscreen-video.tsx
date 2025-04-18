// FullScreenVideo.tsx
import { useEffect } from "react";
import React from "react";
import { TouchableOpacity, Text, View, Dimensions } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEvent } from "expo";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface FullScreenVideoProps {
  videoUrl: string;
  active: boolean;
}

const FullScreenVideo: React.FC<FullScreenVideoProps> = ({
  videoUrl,
  active,
}) => {
  const player = useVideoPlayer(videoUrl, (player) => {
    player.loop = true;
  });

  // Use effect to play or pause based on the "active" prop
  useEffect(() => {
    if (active) {
      player.play();
    } else {
      player.pause();
    }
  }, [active]);

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "black",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <VideoView
        style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
        contentFit="contain"
      />
      <TouchableOpacity
        onPress={() => {
          if (isPlaying) {
            player.pause();
          } else {
            player.play();
          }
        }}
        style={{
          position: "absolute",
          bottom: 50,
          backgroundColor: "rgba(255,255,255,0.7)",
          padding: 10,
          borderRadius: 5,
        }}
      >
        <Text style={{ color: "black" }}>{isPlaying ? "Pause" : "Play"}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default FullScreenVideo;
