export const ARCGIS_API_KEY = process.env.EXPO_PUBLIC_ARCGIS_API_KEY;
export const ARCGIS_LICENSE_KEY = process.env.EXPO_PUBLIC_ARCGIS_LICENSE_KEY;
export const ARCGIS_ROUTE_SERVICE_URL =
  process.env.EXPO_PUBLIC_ARCGIS_ROUTE_SERVICE_URL;
export const DESTINATIONS_PORTAL_ID =
  process.env.EXPO_PUBLIC_ARCGIS_DESTINATIONS_PORTAL_ID;
export const FEATURE_LAYERS = {
  destination: process.env.EXPO_PUBLIC_ARCGIS_DESTINATIONS_URL,
  branches: process.env.EXPO_PUBLIC_ARCGIS_BRANCHES_URL,
  utilities: process.env.EXPO_PUBLIC_ARCGIS_UTILITIES_URL,
};
export const LAYER_FIELDS = {
  destination: "English_Name", // <- replace with actual field name from metadata
  branches: "Name", // <- replace with actual field name from metadata
  utilities: "Name",
};
export const MAP_CENTER = {
  latitude: 30.0444,
  longitude: 31.2357,
  zoom: 11,
};
