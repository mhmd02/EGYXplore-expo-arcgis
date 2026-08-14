import React from "react";
import { Graphic, GraphicsOverlay } from "expo-arcgis";

const routeSymbol = {
  type: "simple-line",
  style: "solid",
  width: 5,
  color: "#2563EB",
};

const markerSymbols = {
  first: {
    type: "simple-marker",
    style: "circle",
    size: 18,
    color: "#16A34A",
    outline: { color: "#FFFFFF", width: 3 },
  },
  middle: {
    type: "simple-marker",
    style: "diamond",
    size: 16,
    color: "#D97706",
    outline: { color: "#FFFFFF", width: 2.5 },
  },
  last: {
    type: "simple-marker",
    style: "circle",
    size: 18,
    color: "#DC2626",
    outline: { color: "#FFFFFF", width: 3 },
  },
};

export default function TripRouteOverlay({ route }) {
  if (!route) return null;
  const geometry = route.geometry;
  const lineGraphics = [];

  if (geometry.parts?.length) {
    geometry.parts.forEach((part, index) => {
      lineGraphics.push(
        <Graphic
          key={`trip-route-part-${index}`}
          geometry={{
            type: "polyline",
            points: part,
            spatialReference: geometry.spatialReference || 4326,
          }}
          symbol={routeSymbol}
        />,
      );
    });
  } else if (geometry.points?.length) {
    lineGraphics.push(
      <Graphic
        key="trip-route-line"
        geometry={{
          type: "polyline",
          points: geometry.points,
          spatialReference: geometry.spatialReference || 4326,
        }}
        symbol={routeSymbol}
      />,
    );
  }

  return (
    <GraphicsOverlay>
      {lineGraphics}
      {route.stops.map((stop, index) => (
        <Graphic
          key={`trip-stop-${stop.sequence}`}
          geometry={{
            type: "point",
            x: stop.longitude,
            y: stop.latitude,
            spatialReference: 4326,
          }}
          symbol={
            index === 0
              ? markerSymbols.first
              : index === route.stops.length - 1
                ? markerSymbols.last
                : markerSymbols.middle
          }
        />
      ))}
    </GraphicsOverlay>
  );
}
