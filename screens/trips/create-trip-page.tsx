import { useState, useEffect } from "react";
import React from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as Location from "expo-location";
import MapSearch from "../../components/map-search-creaete-trip";
// import ImageUploadPhotos from "../../components/insert-images-create-trip";
import { useAuth } from "../../contexts/auth-context";
import TagPicker from "./component/tag-lables";

const CreateTripPage: React.FC = ({ navigation, route }: any) => {
  const [tripName, setTripName] = useState<string>("");
  const [description, setDescription] = useState<string>(""); // New description field
  // State to hold the chosen trip coordinates from MapSearch.
  const [tripLocation, setTripLocation] = useState<string>("");
  const [tripCoordinates, setTripCoordinates] = useState<
    [number, number] | null
  >(route?.params?.selectedCoordinates || null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );

  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const { mongoId, userLocationState } = useAuth(); // current user's mongoId
  const fetchUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
      } else {
        const loc = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = loc.coords;
        setUserLocation([longitude, latitude]);
        setTripCoordinates([longitude, latitude]);
      }
    } catch (err) {
      console.warn("Location lookup failed:", err);
    }
  };

  useEffect(() => {
    fetchUserLocation();
  }, []);

  // Callback to update location info from MapSearch.
  // Updates both the address and the chosen coordinates.
  const handleLocationSelect = (coords: [number, number], address: string) => {
    setTripLocation(address);
    setTripCoordinates(coords);
  };

  // Callback from ImageUploadPhotos to get the list of image URLs.
  const handleImagesChange = (images: string[]) => {
    setUploadedImages(images);
  };

  // Toggle tag selection.
  const handleTagPress = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Function to send trip data to backend.
  const handleCreateTrip = async () => {
    if (!tripName || !tripLocation || !tripCoordinates) {
      Alert.alert("Please provide a trip name and choose a location.");
      return;
    }

    const tripData = {
      name: tripName,
      location: {
        address: tripLocation,
        coordinates: tripCoordinates, // Use the chosen coordinates
      },
      description, // Send description (can be empty)
      images: uploadedImages,
      tags: selectedTags,
      createdBy: mongoId,
    };

    try {
      const response = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/trips/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(tripData),
        }
      );
      if (response.ok) {
        const data = await response.json();
        Alert.alert(
          "Trip created successfully!",
          "",
          [
            {
              text: "OK",
              onPress: () => {
                navigation.navigate("TripPage", {
                  tripId: data._id,
                  fromCreate: true,
                });
              },
            },
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert("Failed to create trip.");
      }
    } catch (error) {
      console.error("Error creating trip:", error);
      Alert.alert("Error creating trip.");
    }
  };

  return (
    <ScrollView
      scrollEnabled={scrollEnabled}
      className="flex-1 bg-white p-5"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View className="p-4 mb-4 border-b border-gray-300 items-center">
        <Text className="text-3xl font-bold text-center">Create Trip</Text>
      </View>

      {/* Trip Name Input */}
      <TextInput
        className="w-full h-10 border border-gray-300 rounded mb-2 px-2"
        placeholder="Name"
        value={tripName}
        onChangeText={setTripName}
      />

      {/* Description Input */}
      <TextInput
        className="w-full h-20 border border-gray-300 rounded mb-2 px-2 py-2 text-left"
        placeholder="Description (optional)"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      {/* MapSearch Component (integrated search field and map) */}
      {route?.params?.selectedCoordinates ? (
        <MapSearch
          userLocation={userLocationState || userLocation!}
          onLocationSelect={handleLocationSelect}
          initialLocation={route.params.selectedCoordinates || tripCoordinates!}
          onMapTouchStart={() => setScrollEnabled(false)}
          onMapTouchEnd={() => setScrollEnabled(true)}
        />
      ) : (
        <MapSearch
          userLocation={userLocationState || userLocation!}
          onLocationSelect={handleLocationSelect}
          initialLocation={userLocationState || userLocation!}
          onMapTouchStart={() => setScrollEnabled(false)}
          onMapTouchEnd={() => setScrollEnabled(true)}
        />
      )}

      {/* Image Upload Photos Component */}
      {/* <ImageUploadPhotos onImagesChange={handleImagesChange} /> */}

      {/* Tags Section */}
      <Text className="text-base font-semibold my-2.5">Select Tags:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-col px-[10px]">
          <View className="flex-col">
            <TagPicker />
          </View>
        </View>
      </ScrollView>

      {/* Create Trip / Cancel Buttons */}
      <View className="flex-row justify-between mt-5">
        <TouchableOpacity
          onPress={handleCreateTrip}
          className="flex-1 bg-green-500 py-[10px] mr-[5px] rounded items-center"
        >
          <Text className="text-white font-semibold">Create Trip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="flex-1 bg-red-500 py-[10px] ml-[5px] rounded-[5px] items-center"
        >
          <Text className="text-white font-semibold">Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default CreateTripPage;
