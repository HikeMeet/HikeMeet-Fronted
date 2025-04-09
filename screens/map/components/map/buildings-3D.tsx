import React from "react";
import Mapbox from "@rnmapbox/maps";

export default function Buildings3D() {
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
        minZoomLevel={20}
        maxZoomLevel={20}
      />
    </Mapbox.VectorSource>
  );
}
