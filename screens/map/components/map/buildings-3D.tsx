import React from "react";
import Constants from "expo-constants";

let Mapbox = null;
if (Constants.appOwnership !== "expo") {
  Mapbox = require("@rnmapbox/maps").default;
}

const Buildings3D = () => {
  if (!Mapbox) {
    return null;
  }

  return (
    <Mapbox.VectorSource id="composite" url="mapbox://mapbox.mapbox-streets-v8">
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
  );
};

export default Buildings3D;
