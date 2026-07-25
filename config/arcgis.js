export const ARCGIS_API_KEY = process.env.EXPO_PUBLIC_ARCGIS_API_KEY;
export const ARCGIS_LICENSE_KEY = process.env.EXPO_PUBLIC_ARCGIS_LICENSE_KEY;
export const FEATURE_LAYERS = {
  destination: process.env.EXPO_PUBLIC_ARCGIS_DESTINATION_URL,
  branches: process.env.EXPO_PUBLIC_ARCGIS_BRANCHES_URL,
};

export const MAP_CENTER = {
  latitude: 30.0444,
  longitude: 31.2357,
  zoom: 11,
};
