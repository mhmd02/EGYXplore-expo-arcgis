export const ARCGIS_API_KEY = process.env.EXPO_PUBLIC_ARCGIS_API_KEY;
export const ARCGIS_LICENSE_KEY = process.env.EXPO_PUBLIC_ARCGIS_LICENSE_KEY;
export const FEATURE_LAYERS = {
  metroStations: process.env.EXPO_PUBLIC_ARCGIS_METRO_STATIONS_URL,
  metroLines: process.env.EXPO_PUBLIC_ARCGIS_METRO_LINES_URL,
};

export const MAP_CENTER = {
  latitude: 30.0444,
  longitude: 31.2357,
  zoom: 11,
};
