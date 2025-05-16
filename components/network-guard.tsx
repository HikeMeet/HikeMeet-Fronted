import React, { useEffect, useState } from "react";
import * as Network from "expo-network";
import { View, Text, TouchableOpacity } from "react-native";

interface Props {
  children: React.ReactNode;
}

const NetworkGuard: React.FC<Props> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);

  const checkConnection = async () => {
    const state = await Network.getNetworkStateAsync();
    setIsConnected(!!state.isConnected && state.isInternetReachable !== false);
  };

  useEffect(() => {
    checkConnection();

    const interval = setInterval(checkConnection, 3000); 
    return () => clearInterval(interval);
  }, []);

  if (!isConnected) {
    return (
      <View className="flex-1 justify-center items-center bg-white px-4">
        <Text className="text-xl font-bold text-red-600 mb-4 text-center">
          No Internet Connection
        </Text>
        <Text className="text-center text-gray-600 mb-4">
          Please connect to the internet to continue using the app.
        </Text>
        <TouchableOpacity
          onPress={checkConnection}
          className="bg-blue-600 px-6 py-3 rounded-full"
        >
          <Text className="text-white font-bold">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <>{children}</>;
};

export default NetworkGuard;
