import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useAuth } from "../contexts/auth-context";

interface BioSectionProps {
  bio: string;
}

const BioSection: React.FC<BioSectionProps> = ({ bio: initialBio }) => {
  const [bio, setBio] = useState<string>(initialBio);
  const [editingBio, setEditingBio] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const { mongoId } = useAuth();

  const handleSaveBio = async () => {
    setSaving(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/user/${mongoId}/update`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ bio }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update bio.");
      }
      Alert.alert("Success", "Bio updated successfully.");
      setEditingBio(false);
    } catch (error) {
      console.error("Error updating bio:", error);
      Alert.alert("Error", "Failed to update bio. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="mt-4">
      <Text className="text-sm font-bold mb-2">Bio</Text>
      {editingBio ? (
        <View className="relative">
          <TextInput
            className="border border-gray-300 p-2 rounded min-h-[40px] pr-16"
            placeholder="Write your bio here..."
            multiline
            value={bio}
            onChangeText={setBio}
          />
          <View className="absolute right-2 top-2 flex-row items-center">
            <TouchableOpacity
              onPress={handleSaveBio}
              className="bg-green-500 p-1 rounded-full mr-2"
              disabled={saving}
            >
              <Text className="text-white text-center">✔</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setEditingBio(false)}
              className="bg-red-500 p-1 rounded-full"
            >
              <Text className="text-white text-center">✘</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-gray-700 flex-1">
            {bio || "No bio provided."}
          </Text>
          <TouchableOpacity
            onPress={() => setEditingBio(true)}
            className="ml-2 bg-blue-500 px-3 py-1 rounded"
          >
            <Text className="text-white">Edit</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default BioSection;
