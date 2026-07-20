export const ARCGIS_API_KEY = process.env.EXPO_PUBLIC_ARCGIS_API_KEY;
export const ARCGIS_LICENSE_KEY = process.env.EXPO_PUBLIC_ARCGIS_LICENSE_KEY;
export const FEATURE_LAYERS = {
  metroStations:
    "https://services3.arcgis.com/glwvcRdHitExpUoJ/arcgis/rest/services/metro_stations/FeatureServer/0",
  metroLines:
    "https://services3.arcgis.com/glwvcRdHitExpUoJ/arcgis/rest/services/metro_lines/FeatureServer/0",
};

export const MAP_CENTER = {
  latitude: 30.0444,
  longitude: 31.2357,
  zoom: 11,
};
