// import React, { useState, useEffect, useRef } from "react";
// import {
//   ScrollView,
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
// } from "react-native";
// import Mapbox from "@rnmapbox/maps";
// import * as Location from "expo-location";
// import { styled } from "nativewind";

// // Styled Mapbox components.
// const StyledMapView = styled(Mapbox.MapView);
// const StyledCamera = styled(Mapbox.Camera);

// const TRIP_TAGS = [
//   "Water",
//   "Ropes",
//   "Ladders",
//   "Lab",
//   "Camping",
//   "Hiking",
//   "Snow",
//   "Mountains",
//   "Desert",
//   "Beach",
//   "Kayaking",
//   "Rafting",
//   "Road Trip",
//   "City Tour",
//   "Museum",
// ];

// // MapboxSearch component using Mapbox Geocoding API.
// const MapboxSearch = ({
//   onSelect,
// }: {
//   onSelect: (coords: [number, number], address: string) => void;
// }) => {
//   const [query, setQuery] = useState("");
//   const [results, setResults] = useState<any[]>([]);

//   const searchMapbox = async (text: string) => {
//     setQuery(text);
//     if (text.length < 3) {
//       setResults([]);
//       return;
//     }
//     try {
//       const response = await fetch(
//         `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
//           text
//         )}.json?access_token=${process.env.MAPBOX_TOKEN_PUBLIC}&autocomplete=true`
//       );
//       const data = await response.json();
//       setResults(data.features);
//     } catch (error) {
//       console.error("Error fetching Mapbox results:", error);
//     }
//   };

//   return (
//     <View style={{ padding: 10 }}>
//       <TextInput
//         placeholder="Search for a location"
//         value={query}
//         onChangeText={searchMapbox}
//         style={{
//           padding: 10,
//           borderColor: "gray",
//           borderWidth: 1,
//           borderRadius: 5,
//           marginBottom: 10,
//         }}
//       />
//       {results.map((item) => (
//         <TouchableOpacity
//           key={item.id}
//           onPress={() => {
//             const [longitude, latitude] = item.geometry.coordinates;
//             onSelect([longitude, latitude], item.place_name);
//             setQuery(item.place_name);
//             setResults([]);
//           }}
//           style={{
//             padding: 10,
//             borderBottomWidth: 1,
//             borderColor: "#ccc",
//           }}
//         >
//           <Text>{item.place_name}</Text>
//         </TouchableOpacity>
//       ))}
//     </View>
//   );
// };

// const CreateTripPage: React.FC = () => {
//   const [tripName, setTripName] = useState<string>("");
//   const [tripLocation, setTripLocation] = useState<string>("");
//   const [selectedTags, setSelectedTags] = useState<string[]>([]);
//   const [userLocation, setUserLocation] = useState<[number, number] | null>(
//     null
//   );
//   const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(
//     null
//   );
//   const [scrollEnabled, setScrollEnabled] = useState(true);
//   const cameraRef = useRef<Mapbox.Camera>(null);

//   // Get user permission and current location.
//   useEffect(() => {
//     (async () => {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") {
//         console.log("Permission to access location was denied");
//         return;
//       }
//       const loc = await Location.getCurrentPositionAsync({});
//       const { latitude, longitude } = loc.coords;
//       setUserLocation([longitude, latitude]);
//     })();
//   }, []);

//   // Handler for tapping on the map.
//   const handleMapPress = async (e: any) => {
//     const { geometry } = e;
//     const [longitude, latitude] = geometry.coordinates;
//     console.log("Map pressed at:", latitude, longitude);
//     setSelectedCoords([longitude, latitude]);

//     // Update camera to center on tapped location.
//     if (cameraRef.current) {
//       cameraRef.current.flyTo([longitude, latitude], 1000);
//     }

//     try {
//       // Reverse geocode for a human-readable address.
//       const addresses = await Location.reverseGeocodeAsync({
//         latitude,
//         longitude,
//       });
//       if (addresses.length > 0) {
//         const address = addresses[0];
//         const addressStr = `${address.name || ""} ${address.street || ""} ${
//           address.city || ""
//         } ${address.region || ""} ${address.country || ""}`.trim();
//         setTripLocation(
//           addressStr || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
//         );
//       } else {
//         setTripLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
//       }
//     } catch (error) {
//       console.error("Reverse geocode error:", error);
//       setTripLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
//     }
//   };

//   // Handler when a location is selected from search results.
//   const handleLocationSelect = (coords: [number, number], address: string) => {
//     setSelectedCoords(coords);
//     setTripLocation(address);
//     if (cameraRef.current) {
//       cameraRef.current.flyTo(coords, 1000);
//     }
//   };

//   // Toggle tag selection.
//   const handleTagPress = (tag: string) => {
//     if (selectedTags.includes(tag)) {
//       setSelectedTags(selectedTags.filter((t) => t !== tag));
//     } else {
//       setSelectedTags([...selectedTags, tag]);
//     }
//   };

//   // Recenter to user location.
//   const handleRecenter = () => {
//     if (userLocation && cameraRef.current) {
//       cameraRef.current.flyTo(userLocation, 1000);
//     }
//   };

//   // Split tags into two rows.
//   const row1 = TRIP_TAGS.filter((_, i) => i % 2 === 0);
//   const row2 = TRIP_TAGS.filter((_, i) => i % 2 !== 0);

//   return (
//     <ScrollView
//       scrollEnabled={scrollEnabled}
//       className="flex-1 bg-white p-5"
//       contentContainerStyle={{ paddingBottom: 40 }}
//     >
//       {/* Name and Location Inputs */}
//       <TextInput
//         className="w-full h-10 border border-gray-300 rounded mb-2 px-2"
//         placeholder="Name"
//         value={tripName}
//         onChangeText={setTripName}
//       />
//       <TextInput
//         className="w-full h-10 border border-gray-300 rounded mb-2 px-2"
//         placeholder="Location"
//         value={tripLocation}
//         onChangeText={setTripLocation}
//       />

//       {/* Mapbox Search Component */}
//       <MapboxSearch onSelect={handleLocationSelect} />

//       {/* Map View with tap and recenter functionality */}
//       <View
//         className="h-72 w-72 self-center mb-2 relative"
//         onTouchStart={() => setScrollEnabled(false)}
//         onTouchEnd={() => setScrollEnabled(true)}
//         onTouchCancel={() => setScrollEnabled(true)}
//       >
//         <StyledMapView className="flex-1" onPress={handleMapPress}>
//           {(selectedCoords || userLocation) && (
//             <StyledCamera
//               ref={cameraRef}
//               centerCoordinate={selectedCoords || userLocation!}
//               zoomLevel={14}
//             />
//           )}
//           {selectedCoords && (
//             <Mapbox.PointAnnotation id="selected" coordinate={selectedCoords}>
//               <View className="bg-red-500 p-2 rounded-full">
//                 <Text className="text-white">Selected</Text>
//               </View>
//             </Mapbox.PointAnnotation>
//           )}
//         </StyledMapView>
//         <TouchableOpacity
//           onPress={handleRecenter}
//           className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow"
//         >
//           <Text className="text-black text-xs">My Location</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Image Upload Placeholder */}
//       <View className="w-full h-16 bg-gray-200 justify-center items-center my-2">
//         <Text className="text-gray-500">[ Upload Images Placeholder ]</Text>
//       </View>

//       {/* Tags Section */}
//       <Text className="text-base font-semibold my-2">Select Tags:</Text>
//       <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//         <View className="flex-col px-2">
//           <View className="flex-row mb-2">
//             {row1.map((tag) => {
//               const isSelected = selectedTags.includes(tag);
//               return (
//                 <TouchableOpacity
//                   key={tag}
//                   onPress={() => handleTagPress(tag)}
//                   className={`flex-row items-center mr-2 p-1 border border-gray-400 rounded ${
//                     isSelected ? "bg-blue-500" : "bg-white"
//                   }`}
//                 >
//                   <Text className="text-sm">{tag}</Text>
//                 </TouchableOpacity>
//               );
//             })}
//           </View>
//           <View className="flex-row">
//             {row2.map((tag) => {
//               const isSelected = selectedTags.includes(tag);
//               return (
//                 <TouchableOpacity
//                   key={tag}
//                   onPress={() => handleTagPress(tag)}
//                   className={`flex-row items-center mr-2 p-1 border border-gray-400 rounded ${
//                     isSelected ? "bg-blue-500" : "bg-white"
//                   }`}
//                 >
//                   <Text className="text-sm">{tag}</Text>
//                 </TouchableOpacity>
//               );
//             })}
//           </View>
//         </View>
//       </ScrollView>

//       {/* Create Trip / Cancel Buttons */}
//       <View className="flex-row justify-between mt-5">
//         <TouchableOpacity className="flex-1 bg-green-500 py-3 mr-2 rounded items-center">
//           <Text className="text-white font-semibold">Create Trip</Text>
//         </TouchableOpacity>
//         <TouchableOpacity className="flex-1 bg-red-500 py-3 ml-2 rounded items-center">
//           <Text className="text-white font-semibold">Cancel</Text>
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );
// };

// export default CreateTripPage;
