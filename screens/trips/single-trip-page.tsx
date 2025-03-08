import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Linking,
  Alert,
  BackHandler,
} from "react-native";
import Mapbox from "@rnmapbox/maps";
import { styled } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import ImageUploadPhotos from "../../components/insert-images-create-trip";

const StyledMapView = styled(Mapbox.MapView);
const StyledCamera = styled(Mapbox.Camera);

type TripDetailProps = {
  route: { params: { tripId: string } };
  navigation: any;
};

const TripDetailPage: React.FC<TripDetailProps> = ({ route, navigation }) => {
  // States for trip details
  const [tripName, setTripName] = useState<string>("");
  const [rating, setRating] = useState<number>(0);
  const [locationText, setLocationText] = useState<string>("");
  // Use trip coordinates from backend, not the user's location.
  const [coordinates, setCoordinates] = useState<[number, number]>([0, 0]);
  const [tags, setTags] = useState<string[]>([]);
  const [bio, setBio] = useState<string>("");

  // Fetch trip data from the backend using the tripId parameter.
  useEffect(() => {
    const fetchTripData = async () => {
      try {
        const tripId = route.params.tripId;
        console.log("Trip ID:", tripId);
        const response = await fetch(
          `${process.env.EXPO_LOCAL_SERVER}/api/trips/${tripId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch trip data");
        }
        const data = await response.json();
        // Update state with the fetched data
        setTripName(data.name);
        setLocationText(data.location.address);
        setCoordinates(data.location.coordinates); // Trip's coordinates from backend
        setTags(data.tags || []);
        setBio(data.description || "");
        // For demo purposes, we assume rating is returned (or default it)
        setRating(data.rating || 4.5);
      } catch (error) {
        console.error("Error fetching trip data:", error);
        Alert.alert("Error", "Failed to load trip data.");
      }
    };

    if (route?.params?.tripId) {
      fetchTripData();
    }
  }, [route.params.tripId]);

  // Override header back button to always go to TripsPage
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate("TripsPage")}
          style={{ marginLeft: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Handle hardware back button on Android
  useEffect(() => {
    const backAction = () => {
      navigation.navigate("TripsPage");
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [navigation]);

  const renderStars = () => {
    const stars = [];
    let remaining = rating;
    for (let i = 0; i < 5; i++) {
      if (remaining >= 1) {
        stars.push(<Ionicons key={i} name="star" size={16} color="#FFD700" />);
        remaining -= 1;
      } else if (remaining >= 0.5) {
        stars.push(
          <Ionicons key={i} name="star-half" size={16} color="#FFD700" />
        );
        remaining = 0;
      } else {
        stars.push(
          <Ionicons key={i} name="star-outline" size={16} color="#FFD700" />
        );
      }
    }
    return <View className="flex-row">{stars}</View>;
  };

  const handleGetDirection = () => {
    const [longitude, latitude] = coordinates;
    console.log("Coordinates:", coordinates);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "Could not open the map.")
    );
  };

  return (
    <ScrollView className="flex-1 bg-white p-4">
      {/* Trip Name & Rating */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-bold">{tripName}</Text>
        <View className="flex-row items-center">
          {renderStars()}
          <Text className="ml-1 text-sm">{rating.toFixed(1)}</Text>
        </View>
      </View>

      {/* Location */}
      <Text className="mb-2">{locationText}</Text>

      {/* Map snippet showing the trip's location */}
      <View className="w-full h-48 bg-gray-200 mb-2 relative">
        <StyledMapView className="flex-1">
          <StyledCamera centerCoordinate={coordinates} zoomLevel={12} />
        </StyledMapView>
        <TouchableOpacity
          className="absolute bottom-2 right-2 bg-blue-600 p-2 rounded items-center"
          onPress={handleGetDirection}
        >
          <Text className="text-white text-xs">Get Direction</Text>
        </TouchableOpacity>
      </View>

      {/* Tags */}
      <View className="flex-row flex-wrap mb-4">
        {tags.map((tag, index) => (
          <View
            key={index}
            className="border border-blue-500 rounded-full px-3 py-1 mr-2 mb-2"
          >
            <Text className="text-blue-500 text-sm">{tag}</Text>
          </View>
        ))}
      </View>

      {/* Bio / Description */}
      <Text className="font-bold mb-1">Description:</Text>
      <Text className="mb-4">{bio}</Text>

      {/* "Upload your own images" */}
      <Text className="text-base font-semibold mb-2">
        Upload your own images:
      </Text>
      <ImageUploadPhotos />
    </ScrollView>
  );
};

export default TripDetailPage;
