// screens/map/MapPage.tsx

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import Mapbox, { Camera } from "@rnmapbox/maps";
import * as Location from "expo-location";

// קומפוננטות פנימיות
import CenterOnMeButton from "./components/CenterOnMeButton";
import TripMarker from "./components/TripMarker";
import TripPopup from "./components/TripPopup";
import CategoryBar from "./components/CategoryBar"; // כפתורי קטגוריות וכו'.

/** מבנה קבוצה (Group) מהשרת */
export interface Group {
  _id: string;
  name: string;
  trip: string; // מזהה הטיול
  max_members: number;
  membersCount: number;
  leaderName: string;
  // שדות נוספים שיש בשרת (optional)
  // ...
}

/** מבנה טיול (Trip) מהשרת */
export interface Trip {
  _id: string;
  name: string;
  description?: string;
  location: {
    address: string;
    coordinates: [number, number];
  };
  // main_image מתאר אובייקט בעל url:
  main_image?: {
    url: string;
    [key: string]: any;
  };
  images?: Array<{ url: string; [key: string]: any }>;
  groups?: Group[]; // נכניס ידנית אחרי מיזוג
}

/** פרמטרים אפשריים לפילטר */
interface TripFilter {
  city?: string;
  category?: string;
  // אפשר להרחיב
}

/** טיפוס ה־props ל־MapPage */
type MapPageProps = {
  navigation: any;
  route: any;
};

export default function MapPage({ navigation }: MapPageProps) {
  const [trips, setTrips] = useState<Trip[]>([]); // רשימת הטיולים
  const [groups, setGroups] = useState<Group[]>([]); // רשימת הקבוצות
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  // מצב תצוגה: מפה / רשימה
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  // מצב יום / לילה
  const [isNightMode, setIsNightMode] = useState<boolean>(false);

  // חיפוש לפי עיר וקטגוריה
  const [city, setCity] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  // רפרנס למצלמה (Mapbox)
  const cameraRef = useRef<Camera>(null);

  // טעינה ראשונית
  useEffect(() => {
    fetchAllData({});
  }, []);

  /**
   * פונקציה שמושכת גם trips וגם groups, ואז ממזגת אותם לפי trip._id === group.trip
   */
  async function fetchAllData(filter: TripFilter) {
    setLoading(true);
    try {
      await fetchTrips(filter);
      await fetchGroups();
      mergeTripsAndGroups();
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  /** שליפת טיולים מהשרת */
  async function fetchTrips(filter: TripFilter) {
    let url = `${process.env.EXPO_LOCAL_SERVER}/api/trips/all`;
    const params = new URLSearchParams();

    // אם יש city (חיפוש לפי עיר)
    if (filter.city && filter.city.trim()) {
      params.append("city", filter.city.trim());
    }
    // אם יש category
    if (filter.category && filter.category.trim()) {
      params.append("category", filter.category.trim());
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error("Failed to fetch trips");
    }
    const data: Trip[] = await resp.json();

    // נוודא שלכל טיול קיימת groups: []
    const fixedTrips = data.map((t) => ({
      ...t,
      groups: t.groups || [],
    }));

    console.log("Fetched trips: ", fixedTrips);
    setTrips(fixedTrips);
  }

  /** שליפת כל הקבוצות (למיזוג ידני) */
  async function fetchGroups() {
    const resp = await fetch(`${process.env.EXPO_LOCAL_SERVER}/api/group/list`);
    if (!resp.ok) {
      throw new Error("Failed to fetch groups");
    }
    const data: Group[] = await resp.json();
    console.log("Fetched groups:", data);
    setGroups(data);
  }

  /** מיזוג - לכל Trip מכניסים groups הרלוונטיות */
  function mergeTripsAndGroups() {
    setTrips((prevTrips) =>
      prevTrips.map((trip) => {
        // מוצאים את כל הקבוצות ש- group.trip === trip._id
        const relevantGroups = groups.filter((g) => g.trip === trip._id);

        return {
          ...trip,
          groups: relevantGroups,
        };
      })
    );
  }

  /** החלפת מצב מפה / רשימה */
  function toggleViewMode() {
    setViewMode((prev) => (prev === "map" ? "list" : "map"));
  }

  /** החלפת מצב יום / לילה */
  function toggleNightMode() {
    setIsNightMode((prev) => !prev);
  }

  /** לחיצה על "Search city" */
  async function handleSearchCity() {
    await fetchAllData({ city, category: categoryFilter });
  }

  /** בחירת קטגוריה (Gas, Parking, Food וכו') */
  async function handleCategorySelect(cat: string) {
    setCategoryFilter(cat);
    await fetchAllData({ city, category: cat });
  }

  /** לחיצה על מרקר => פותח את ה-popup של הטיול */
  function onMarkerPress(trip: Trip) {
    setSelectedTrip(trip);
  }

  /** מרכז מפה על מיקום המשתמש */
  async function handleCenterOnMe() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      cameraRef.current?.setCamera({
        centerCoordinate: [loc.coords.longitude, loc.coords.latitude],
        zoomLevel: 13,
        animationDuration: 1000,
      });
    } catch (err) {
      console.error("Error centering on user location:", err);
      Alert.alert("Error", "Could not center on your location.");
    }
  }

  /** הצטרפות לקבוצה ישירות מה-popup */
  async function handleJoinGroup(groupId: string) {
    try {
      const resp = await fetch(
        `${process.env.EXPO_LOCAL_SERVER}/api/group/${groupId}/join`,
        { method: "POST" }
      );
      if (!resp.ok) {
        throw new Error("Failed to join group");
      }
      Alert.alert("Success", "You have joined this group!");
      // ריענון
      await fetchAllData({ city, category: categoryFilter });
      setSelectedTrip(null); // סוגרים popup
    } catch (err) {
      console.error("Error joining group:", err);
      Alert.alert("Error", "Could not join group.");
    }
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* תפריט עליון: חיפוש, מפה/רשימה, יום/לילה */}
      <View className="bg-white p-3 shadow-sm">
        <View className="flex-row items-center space-x-2">
          {/* שדה חיפוש עיר */}
          <TextInput
            placeholder="Search city..."
            value={city}
            onChangeText={setCity}
            className="flex-1 bg-gray-200 px-3 py-2 rounded"
          />
          <TouchableOpacity
            onPress={handleSearchCity}
            className="bg-blue-600 px-3 py-2 rounded"
          >
            <Text className="text-white font-semibold">Search</Text>
          </TouchableOpacity>

          {/* כפתור תצוגה: map / list */}
          <TouchableOpacity
            onPress={toggleViewMode}
            className="bg-green-600 px-3 py-2 rounded"
          >
            <Text className="text-white font-semibold">
              {viewMode === "map" ? "List" : "Map"}
            </Text>
          </TouchableOpacity>

          {/* כפתור יום/לילה */}
          <TouchableOpacity
            onPress={toggleNightMode}
            className="bg-gray-700 px-3 py-2 rounded"
          >
            <Text className="text-white font-semibold">
              {isNightMode ? "Day" : "Night"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* בר קטגוריות */}
        <CategoryBar
          selectedCategory={categoryFilter}
          onSelectCategory={handleCategorySelect}
        />
      </View>

      {/* אם טוען => מציג ספינר, אחרת מפה או רשימה */}
      {loading ? (
        <ActivityIndicator size="large" color="#0D9488" className="mt-10" />
      ) : viewMode === "map" ? (
        <>
          <CenterOnMeButton onPress={handleCenterOnMe} />
          <Mapbox.MapView
            className="flex-1"
            styleURL={
              isNightMode ? Mapbox.StyleURL.Dark : Mapbox.StyleURL.Street
            }
          >
            <Camera
              ref={cameraRef}
              zoomLevel={15}
              pitch={60}
              centerCoordinate={[34.7818, 32.0853]}
            />

            <Mapbox.VectorSource
              id="composite"
              url="mapbox://mapbox.mapbox-streets-v8"
            >
              <Mapbox.FillExtrusionLayer
                id="3d-buildings"
                sourceLayerID="building"
                style={{
                  fillExtrusionColor: "#aaa",
                  fillExtrusionHeight: ["get", "height"],
                  fillExtrusionBase: ["get", "min_height"],
                  fillExtrusionOpacity: 0.6,
                }}
                filter={["==", "extrude", "true"]}
                minZoomLevel={15}
                maxZoomLevel={22}
              />
            </Mapbox.VectorSource>

            {trips.map((trip) => {
              const [lon, lat] = trip.location.coordinates;
              const hasAvailability = trip.groups?.some(
                (g) => g.membersCount < g.max_members
              );

              return (
                <TripMarker
                  key={trip._id}
                  trip={trip}
                  longitude={lon}
                  latitude={lat}
                  hasAvailability={hasAvailability}
                  onPressMarker={onMarkerPress}
                />
              );
            })}
          </Mapbox.MapView>
        </>
      ) : (
        // תצוגת רשימה
        <ScrollView className="flex-1 p-3">
          {trips.length === 0 ? (
            <Text className="text-center text-gray-500 mt-4">
              No trips found.
            </Text>
          ) : (
            trips.map((trip) => (
              <TouchableOpacity
                key={trip._id}
                onPress={() => setSelectedTrip(trip)}
                className="flex-row bg-white rounded-lg shadow mb-3 p-4"
              >
                {/* תמונה אם קיימת */}
                {trip.main_image?.url ? (
                  <Image
                    source={{ uri: trip.main_image.url }}
                    className="w-16 h-16 mr-3 rounded"
                    resizeMode="cover"
                  />
                ) : null}

                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-800">
                    {trip.name}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {trip.location.address}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">
                    {trip.groups?.length || 0} group(s)
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      {/* Popup כשהמשתמש בחר טיול */}
      {selectedTrip && (
        <TripPopup
          trip={selectedTrip}
          onClose={() => setSelectedTrip(null)}
          onGroupPress={(groupId, action) => {
            if (action === "join") {
              handleJoinGroup(groupId);
            } else {
              // מעבר למסך פרטי קבוצה
              navigation.navigate("GroupsStack", {
                screen: "GroupPage",
                params: { groupId },
              });
            }
          }}
          onAddGroup={() => {
            // עוברים למסך יצירת קבוצה עם פרטי trip
            navigation.navigate("GroupsStack", {
              screen: "CreateGroupPage",
              params: {
                preSelectedTrip: selectedTrip._id,
                preSelectedTripName: selectedTrip.name,
              },
            });
          }}
        />
      )}
    </View>
  );
}
