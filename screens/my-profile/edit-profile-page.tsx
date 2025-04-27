import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { useAuth } from "../../contexts/auth-context";

const EditProfilePage = ({ navigation }: any) => {
  const { mongoUser, mongoId, setMongoUser } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [facebookUsername, setFacebookUsername] = useState("");
  const [instagramUsername, setInstagramUsername] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mongoUser) {
      setFirstName(mongoUser.first_name || "");
      setLastName(mongoUser.last_name || "");
      setBio(mongoUser.bio || "");
      // extract username portion from existing URLs
      const fbUrl = mongoUser.facebook_link || "";
      const igUrl = mongoUser.instagram_link || "";
      const fbName = fbUrl
        .replace(/https?:\/\/(www\.)?facebook\.com\//, "")
        .replace(/\/$/, "");
      const igName = igUrl
        .replace(/https?:\/\/(www\.)?instagram\.com\//, "")
        .replace(/\/$/, "");
      setFacebookUsername(fbName);
      setInstagramUsername(igName);
    }
  }, [mongoUser]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        first_name: firstName,
        last_name: lastName,
        bio,
        facebook_link: facebookUsername
          ? `https://facebook.com/${facebookUsername}`
          : "",
        instagram_link: instagramUsername
          ? `https://instagram.com/${instagramUsername}`
          : "",
      };

      const res = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/user/${mongoId}/update`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error("Failed to update profile");
      setMongoUser(await res.json());
      navigation.goBack();
    } catch (err) {
      console.error("Update Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <View className="mb-4">
            <Text className="text-sm font-medium mb-1">First Name</Text>
            <TextInput
              className="border border-gray-300 rounded p-2"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium mb-1">Last Name</Text>
            <TextInput
              className="border border-gray-300 rounded p-2"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium mb-1">Bio</Text>
            <TextInput
              className="border border-gray-300 rounded p-2 h-24"
              value={bio}
              onChangeText={setBio}
              multiline
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium mb-1">Facebook Username</Text>
            <TextInput
              className="border border-gray-300 rounded p-2"
              value={facebookUsername}
              onChangeText={setFacebookUsername}
              placeholder="e.g. lior.engel"
              autoCapitalize="none"
            />
          </View>

          <View className="mb-6">
            <Text className="text-sm font-medium mb-1">Instagram Username</Text>
            <TextInput
              className="border border-gray-300 rounded p-2"
              value={instagramUsername}
              onChangeText={setInstagramUsername}
              placeholder="e.g. lior.engel"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            className="bg-blue-500 rounded p-4 items-center"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold">Save</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default styled(EditProfilePage);
