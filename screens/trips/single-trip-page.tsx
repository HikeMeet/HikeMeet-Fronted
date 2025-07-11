// TripDetailPage.tsx
import { useState, useEffect } from "react";
import React from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Pressable,
} from "react-native";
import Constants from "expo-constants";
import { styled } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import ProfileImage from "../../components/profile-image";
import { Trip } from "../../interfaces/trip-interface";
import { useAuth } from "../../contexts/auth-context";
import TripImagesUploader from "./component/trip-image-gallery";
import MapDirectionButton from "../../components/get-direction";
import ShareTripModal from "./component/share-trip-to-post-modal";
import TripStarRating from "./component/starts-rating";
import ReportPopup from "../admin-settings/components/report-popup";
import ReportIcon from "../../assets/report.svg";

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
    params: { tripId: string; fromCreate?: boolean };
  };
  navigation: any;
};

const TripDetailPage: React.FC<TripDetailProps> = ({ route, navigation }) => {
  // States for trip details
  const [tripName, setTripName] = useState<string>("");
  const [tripData, setTripData] = useState<Trip>();
  // const [rating, setRating] = useState<number>(0);
  const [avgRating, setAvgRating] = useState<number>(0);

  const [locationText, setLocationText] = useState<string>("");
  // Use trip coordinates from backend, not the user's location.
  const [coordinates, setCoordinates] = useState<[number, number]>([0, 0]);
  const [tags, setTags] = useState<string[]>([]);
  const [bio, setBio] = useState<string>("");
  // State to control ScrollView scrolling
  const [scrollEnabled, setScrollEnabled] = useState<boolean>(true);
  const { tripId, fromCreate = false } = route.params;
  const { mongoId, mongoUser, fetchMongoUser } = useAuth(); // current user's mongoId
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [reportPopupVisible, setReportPopupVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const nameLengthCrop = 22;
  // Fetch trip data from the backend using the tripId parameter.
  useEffect(() => {
    const fetchTripData = async () => {
      try {
        const endpoint = `${process.env.EXPO_LOCAL_SERVER}/api/trips/${tripId}`;
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
        setAvgRating(data.avg_rating ?? 0);
      } catch (error) {
        console.error("Error fetching trip data:", error);
        Alert.alert("Error", "Failed to load trip data.");
      }
    };

    if (tripId) {
      fetchTripData();
    }
  }, [tripId]);

  useEffect(() => {
    if (mongoUser?.favorite_trips) {
      setIsFavorite(mongoUser.favorite_trips.includes(tripId));
    }
  }, [mongoUser, tripId]);
  const toggleFavorite = async () => {
    // 1) build the new array
    const newFavs = isFavorite
      ? mongoUser!.favorite_trips.filter((id) => id !== tripId)
      : [...mongoUser!.favorite_trips, tripId];

    try {
      // 2) call your update endpoint (use PATCH if that's what your router expects)
      const res = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/user/${mongoId}/update`,
        {
          method: "POST", // ← switch to PATCH if needed
          headers: {
            "Content-Type": "application/json",
            // 'Authorization': `Bearer ${yourJwtToken}`,  // include if your API uses auth headers
          },
          body: JSON.stringify({ favorite_trips: newFavs }),
        }
      );

      const body = await res.json();

      // 3) bail on a non-OK status
      if (!res.ok) {
        throw new Error(body.error || `Status ${res.status}`);
      }

      // 4) update context and local state
      fetchMongoUser(mongoId!); // or body.user if your API wraps it
      setIsFavorite((prev) => !prev);
    } catch (err: any) {
      console.error("❌ toggleFavorite failed:", err);
      Alert.alert("Error", err.message || "Could not update favorites");
    }
  };

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

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        scrollEnabled={scrollEnabled}
        style={{ flex: 1, backgroundColor: "white" }}
        contentContainerStyle={{
          paddingBottom: 40,
          paddingHorizontal: 16,
          paddingTop: 8,
        }}
      >
        {/* Header: image, title, rating, and action icons */}
        <View className="flex-row items-center justify-between py-2">
          {/* Left side: image + title + rating */}
          <View className="flex-row items-center flex-1">
            {tripData?.main_image && (
              <ProfileImage
                initialImage={tripData.main_image}
                size={60}
                id={tripId}
                uploadType="trip"
                editable={mongoId === tripData.createdBy}
              />
            )}
            {/* ensure title+rating are left-aligned */}
            <View className="ml-2 items-start">
              <Pressable onPress={() => setExpanded((prev) => !prev)}>
                <Text
                  className="text-lg font-bold"
                  // unlimited lines when expanded, else clamp to 1
                  numberOfLines={expanded ? undefined : 1}
                  ellipsizeMode="tail"
                >
                  {expanded && tripName.length > nameLengthCrop
                    ? // insert newline after every nameLengthCrop chars
                      tripName.replace(
                        new RegExp(`(.{${nameLengthCrop}})`, "g"),
                        "$1-\n"
                      )
                    : tripName.length > nameLengthCrop
                      ? `${tripName.substring(0, nameLengthCrop)}…`
                      : tripName}
                </Text>
              </Pressable>
              {tripData && (
                <TripStarRating
                  tripId={tripId}
                  avgRating={tripData.avg_rating ?? 0}
                  totalRatings={tripData.ratings?.length ?? 0}
                  yourRating={
                    tripData.ratings?.find((r) => r.user === mongoUser!._id)
                      ?.value ?? 0
                  }
                />
              )}
            </View>
          </View>

          {/* Right side: report + icons */}
          {/* Right side: report + heart + share */}
          <View className="flex-col ml-2 items-end space-y-2">
            <TouchableOpacity onPress={() => setReportPopupVisible(true)}>
              <ReportIcon width={20} height={20} />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleFavorite}>
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={24}
                color={isFavorite ? "red" : "gray"}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowShareModal(true)}>
              <Ionicons name="share-social" size={24} color="gray" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Location */}
        <Text style={{ marginBottom: 8 }}>Address: {locationText}</Text>

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
          <MapDirectionButton
            latitude={coordinates[1]}
            longitude={coordinates[0]}
          />
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
        {tripData && (
          <TripImagesUploader
            tripId={tripId}
            // enabled={mongoId === tripData.createdBy}
            initialImages={tripData.images ?? []}
            onImagesUpdated={(imgs) =>
              setTripData((prevTripData) => {
                if (!prevTripData) return { images: imgs } as any;
                return { ...prevTripData, images: imgs };
              })
            }
          />
        )}
        {/* Back to Trips Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Tabs", { screen: "Trips" })}
          className="mt-4 bg-blue-600 px-4 py-3 rounded-lg items-center"
        >
          <Text className="text-white font-semibold">Back to Trips</Text>
        </TouchableOpacity>
      </ScrollView>
      <ReportPopup
        visible={reportPopupVisible}
        onClose={() => setReportPopupVisible(false)}
        targetId={tripId}
        targetType="trip"
      />

      {tripData && (
        <ShareTripModal
          visible={showShareModal}
          onClose={() => setShowShareModal(false)}
          navigation={navigation}
          trip={tripData}
        />
      )}
    </SafeAreaView>
  );
};

export default TripDetailPage;
