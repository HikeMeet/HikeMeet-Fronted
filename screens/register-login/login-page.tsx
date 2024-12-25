/// <reference types="nativewind/types" />

import React, { useState } from "react";
import { View, Text, TextInput } from "react-native";
import { FIREBASE_AUTH } from "../../firebaseconfig";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auto = FIREBASE_AUTH;
  






  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold">Login Page</Text>
      <TextInput className=" forms- confirmation input input form-control"> valss</TextInput>
    </View>
  );
}
