import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useAuth } from "../../contexts/auth-context";
import { RadioButton } from "react-native-paper";

const PostPrivacySettingScreen = ({ navigation }: any) => {
  const { mongoUser, mongoId, fetchMongoUser } = useAuth();
  const [value, setValue] = useState("public");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mongoUser?.privacySettings?.postVisibility) {
      setValue(mongoUser.privacySettings.postVisibility);
    }
  }, [mongoUser]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/privacy/update-privacy`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: mongoId,
            postVisibility: value,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to update");
      await fetchMongoUser(mongoId!);
      Alert.alert("Success", "Your post visibility was updated.");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating privacy:", error);
      Alert.alert("Error", "Could not update your settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 p-5 bg-white">
      <Text className="text-xl font-semibold mb-5">
        Who can see your posts?
      </Text>
      <RadioButton.Group onValueChange={setValue} value={value}>
        <View className="mb-4">
          <RadioButton.Item label="Everyone (public)" value="public" />
          <RadioButton.Item label="Friends only" value="friends" />
        </View>
      </RadioButton.Group>

      <TouchableOpacity
        className="bg-blue-500 py-3 rounded mt-4"
        disabled={loading}
        onPress={handleSave}
      >
        <Text className="text-center text-white text-lg">
          {loading ? "Saving..." : "Save Settings"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default PostPrivacySettingScreen;
