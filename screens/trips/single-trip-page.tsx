// TripDetailPage.tsx
import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import Constants from "expo-constants";
import { styled } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import ImageUploadPhotos from "../../components/insert-images-create-trip";
import ProfileImage from "../../components/profile-image";
import { Trip } from "../../interfaces/trip-interface";
import { useAuth } from "../../contexts/auth-context";

// Determine if native Mapbox code is available (i.e. not running in Expo Go)
const MapboxAvailable = Constants.appOwnership !== "expo";

let Mapbox: any;
let StyledMapView: any;
let StyledCamera: any;

if (MapboxAvailable) {
  // Import and configure Mapbox if available
  Mapbox = require("@rnmapbox/maps").default;
  StyledMapView = styled(Mapbox.MapView as any);
  StyledCamera = styled(Mapbox.Camera as any);
} else {
  // Fallback components for when Mapbox is unavailable (Expo Go)
  StyledMapView = (props: any) => (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f0f0",
      }}
    >
      <Text style={{ fontSize: 14, color: "#666" }}>
        Map is not available in Expo Go.
      </Text>
    </View>
  );
  StyledCamera = () => null;
}

type TripDetailProps = {
  route: {
    params: { tripId: string; fromCreate?: boolean; isArchived?: boolean };
  };
  navigation: any;
};

const TripDetailPage: React.FC<TripDetailProps> = ({ route, navigation }) => {
  // States for trip details
  const [tripName, setTripName] = useState<string>("");
  const [tripData, setTripData] = useState<Trip>();
  const [rating, setRating] = useState<number>(0);
  const [locationText, setLocationText] = useState<string>("");
  // Use trip coordinates from backend, not the user's location.
  const [coordinates, setCoordinates] = useState<[number, number]>([0, 0]);
  const [tags, setTags] = useState<string[]>([]);
  const [bio, setBio] = useState<string>("");
  // State to control ScrollView scrolling
  const [scrollEnabled, setScrollEnabled] = useState<boolean>(true);
  const { tripId, fromCreate = false, isArchived = false } = route.params;
  const { mongoId } = useAuth(); // current user's mongoId

  // Fetch trip data from the backend using the tripId parameter.
  useEffect(() => {
    const fetchTripData = async () => {
      try {
        console.log("Trip ID:", tripId);
        const endpoint = isArchived
          ? `${process.env.EXPO_LOCAL_SERVER}/api/trips/archive/${tripId}`
          : `${process.env.EXPO_LOCAL_SERVER}/api/trips/${tripId}`;
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error("Failed to fetch trip data");
        }
        const data = await response.json();
        setTripData(data);
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

    if (tripId) {
      fetchTripData();
    }
  }, [tripId, isArchived]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e: any) => {
      if (fromCreate) {
        // Prevent the default behavior of leaving the screen
        e.preventDefault();
        // Navigate to the Trips page instead
        navigation.navigate("Tabs", { screen: "Trips" });
      }
      // Otherwise, let the default behavior happen
    });

    return unsubscribe;
  }, [navigation, fromCreate]);

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
    return <View style={{ flexDirection: "row" }}>{stars}</View>;
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
    <ScrollView
      scrollEnabled={scrollEnabled}
      style={{ flex: 1, backgroundColor: "white", padding: 16 }}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View className="flex-row items-center p-4">
        {tripData && tripData.main_image && (
          <ProfileImage
            initialImageUrl={tripData.main_image.url}
            size={60}
            id={tripId}
            uploadType="trip"
            editable={mongoId === tripData.createdBy} // Only editable if the current user is the creator
          />
        )}
        <View className="ml-2">
          {/* Title */}
          <Text className="text-lg font-bold">{tripName}</Text>
          {/* Star Rating */}
          <View className="flex-row items-center mb-4">
            {renderStars()}
            <Text className="ml-1 text-sm">{rating.toFixed(1)}</Text>
          </View>
        </View>
      </View>

      {/* Location */}
      <Text style={{ marginBottom: 8 }}>{locationText}</Text>

      {/* Map snippet showing the trip's location */}
      <View
        style={{
          width: "100%",
          height: 192,
          backgroundColor: "#e5e5e5",
          marginBottom: 8,
          position: "relative",
        }}
        onTouchStart={() => setScrollEnabled(false)}
        onTouchEnd={() => setScrollEnabled(true)}
        onTouchCancel={() => setScrollEnabled(true)}
      >
        <StyledMapView style={{ flex: 1 }} onPress={() => {}}>
          <StyledCamera centerCoordinate={coordinates} zoomLevel={12} />
        </StyledMapView>
        <TouchableOpacity
          style={{
            position: "absolute",
            bottom: 8,
            right: 8,
            backgroundColor: "#2563eb",
            padding: 8,
            borderRadius: 4,
            alignItems: "center",
          }}
          onPress={handleGetDirection}
        >
          <Text style={{ color: "white", fontSize: 10 }}>Get Direction</Text>
        </TouchableOpacity>
      </View>

      {/* Tags */}
      <View className="flex-row flex-wrap mb-4">
        {tags.map((tag, index) => (
          <View
            key={index}
            className="border border-blue-500 rounded-[20px] px-3 py-1 mr-2 mb-2"
          >
            <Text className="text-blue-500 text-sm">{tag}</Text>
          </View>
        ))}
      </View>

      {/* Description */}
      <Text className="font-bold mb-1">Description:</Text>
      <Text className="mb-4">{bio ? bio : "No description provided."}</Text>

      {/* "Upload your own images" */}
      <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
        Upload your own images:
      </Text>
      <ImageUploadPhotos />

      {/* Back to Trips Button */}
      <TouchableOpacity
        onPress={() => navigation.navigate("Tabs", { screen: "Trips" })}
        className="mt-4 bg-blue-600 px-4 py-3 rounded-lg items-center"
      >
        <Text className="text-white font-semibold">Back to Trips</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default TripDetailPage;
