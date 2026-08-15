import { router as arcgisRouter } from "expo-arcgis";

export class TripRouteError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "TripRouteError";
    this.code = code;
  }
}
export const normalizeDestinationStatus = (raw) => {
  if (!raw) return raw;
  const match = raw.match(/\$(\w+)@/);
  if (!match) return raw; // already a clean string — pass through unchanged
  const className = match[1]; // e.g. "NotReached", "Reached", "Approaching"
  return className.charAt(0).toLowerCase() + className.slice(1); // -> "notReached", "reached", "approaching"
};

export const isValidCoordinate = (latitude, longitude) =>
  Number.isFinite(latitude) &&
  Number.isFinite(longitude) &&
  latitude >= -90 &&
  latitude <= 90 &&
  longitude >= -180 &&
  longitude <= 180 &&
  !(latitude === 0 && longitude === 0);

export const normalizeTripStops = (stops) => {
  const orderedStops = [...(stops || [])].sort(
    (a, b) => Number(a.visitOrder) - Number(b.visitOrder),
  );

  if (orderedStops.length < 2) {
    throw new TripRouteError(
      "INSUFFICIENT_STOPS",
      "Add at least two destinations to view a trip route.",
    );
  }

  return orderedStops.map((stop, index) => {
    const latitude = Number(stop.latitude || stop.coords.latitude);
    const longitude = Number(stop.longitude || stop.coords.longitude);
    if (!isValidCoordinate(latitude, longitude)) {
      throw new TripRouteError(
        "INVALID_COORDINATES",
        `${stop.name || `Stop ${index + 1}`} does not have valid map coordinates.`,
      );
    }

    return {
      sequence: index + 1,
      destinationId: stop.destinationId,
      name: stop.name || `Stop ${index + 1}`,
      latitude,
      longitude,
    };
  });
};

export const buildArcgisTripStops = (stops) =>
  stops.map((stop) => ({
    point: {
      type: "point",
      x: stop.longitude || stop.coords.longitude,
      y: stop.latitude || stop.coords.latitude,
      spatialReference: 4326,
    },
    name: stop.name,
  }));

export const solveTripRoute = async (stops, options = {}) => {
  const routeStops = buildArcgisTripStops(stops);
  const result = await arcgisRouter.solveRoute(routeStops, {
    travelMode: "Driving Time",
    returnRoutes: true,
    returnStops: false,
    returnDirections: false,
    findBestSequence: false,
    ...(options.routeServiceUrl
      ? { routeServiceUrl: options.routeServiceUrl }
      : {}),
  });

  const solvedRoute = result?.routes?.[0];
  if (!solvedRoute || !solvedRoute.geometry) {
    throw new TripRouteError(
      "NO_ROUTE",
      "The route service did not return a route for this trip.",
    );
  }

  return {
    stops,
    geometry: {
      type: "polyline",
      points: solvedRoute.geometry.points || [],
      parts: solvedRoute.geometry.parts || [],
      spatialReference: solvedRoute.geometry.spatialReference || 4326,
    },
    totalDistanceMeters: solvedRoute.totalLength,
    totalTravelTimeMinutes: solvedRoute.travelTime,
    calculatedAt: new Date().toISOString(),
  };
};

export const formatDistance = (meters) => {
  if (!Number.isFinite(meters)) return "-";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
};

export const formatDuration = (minutes) => {
  if (!Number.isFinite(minutes)) return "-";
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  return remainingMinutes
    ? `${hours} hr ${remainingMinutes} min`
    : `${hours} hr`;
};
