import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import Constants from "expo-constants";

let Mapbox = null;
if (Constants.appOwnership !== "expo") {
  Mapbox = require("@rnmapbox/maps").default;
}
type Place = {
  place_id: string;
  name: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
};

const ShoppingMalls = () => {
  const [malls, setMalls] = useState<Place[]>([]);

  useEffect(() => {
    const fetchShoppingMalls = async () => {
      const location = "32.0853,34.7818"; // Tel Aviv
      const radius = 1; // 1 k"m
      const type = "shopping_mall";
      const apiKey = process.env.GOOGLEMAP_API_KEKY;

      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=${type}&key=${apiKey}`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("response:", data);

        if (data.results) {
          setMalls(data.results);
        }
      } catch (error) {
        console.error("Error fetching shopping malls:", error);
      }
    };

    if (Mapbox) {
      fetchShoppingMalls();
    }
  }, []);

  if (!Mapbox) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
        }}
      >
        <Text style={{ textAlign: "center", color: "#666" }}>
          Mapbox is not available in Expo Go.
        </Text>
      </View>
    );
  }

  return (
    <>
      {malls.map((mall) => (
        <Mapbox.PointAnnotation
          key={mall.place_id}
          id={mall.place_id}
          coordinate={[mall.geometry.location.lng, mall.geometry.location.lat]}
        >
          <View
            style={{
              backgroundColor: "red",
              padding: 4,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "white",
            }}
          >
            <Text style={{ color: "white", fontSize: 10, fontWeight: "bold" }}>
              {mall.name}
            </Text>
          </View>
        </Mapbox.PointAnnotation>
      ))}
    </>
  );
};

export default ShoppingMalls;
