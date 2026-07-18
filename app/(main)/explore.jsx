import { useContext, useRef, useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Keyboard,
  Linking,
  Platform,
  AppState,
  Alert,
} from "react-native";
import { MapSettings, Map, MapView, FeatureLayer } from "expo-arcgis";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";

import ThemedView from "../../components/ThemedView";
import ThemedTextInput from "../../components/ThemedTextInput";
import { ThemeContext } from "../../context/ThemeContext";
import { Colors } from "../../constants/Colors";
import CustomPopup from "../../components/CustomPopup.jsx";

import {
  ARCGIS_API_KEY,
  ARCGIS_LICENSE_KEY,
  FEATURE_LAYERS,
  MAP_CENTER,
} from "../../config/arcgis.js";

// Renderers ported from the old WebView getEsriMaps()
const metroStationsRenderer = {
  type: "simple",
  symbol: {
    type: "simple-marker",
    size: 6,
    color: "blue",
    outline: { width: 0.5, color: "black" },
  },
};

const metroLinesRenderer = {
  type: "simple",
  symbol: {
    type: "simple-line",
    width: 2,
    color: "green",
  },
};

// The native `identify` returns the layer's title (layerName), while CustomPopup
// keys off the old WebView layer ids ("metropoints" / "metrolines"). Map between them.
const layerNameToId = (layerName = "") => {
  const name = layerName.toLowerCase();
  if (name.includes("line")) return "metrolines";
  if (name.includes("station")) return "metropoints";
  return null;
};

export default function Explore() {
  const [hasLocationPermission, setHasLocationPermission] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef();
  const mapViewRef = useRef(null);

  const [selectedFeature, setSelectedFeature] = useState(null);
  const [clickLocation, setClickLocation] = useState(null);
  const [layerInfo, setLayerInfo] = useState(null);

  const { theme, setTheme } = useContext(ThemeContext);
  const colorTheme = Colors[theme] ?? Colors.light;
  const insets = useSafeAreaInsets();

  const basemap = theme === "dark" ? "arcGISDarkGray" : "arcGISLightGray";

  const checkLocationStatus = async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    const currentStatus = status === "granted" && servicesEnabled;
    setHasLocationPermission(currentStatus);
  };

  useEffect(() => {
    checkLocationStatus();

    const intervalId = setInterval(() => {
      checkLocationStatus();
    }, 2000);

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        checkLocationStatus();
      }
    });
    return () => {
      clearInterval(intervalId);
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    let subscriber = null;

    const startTracking = async () => {
      if (hasLocationPermission) {
        subscriber = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Highest,
            timeInterval: 10000,
            distanceInterval: 3,
          },
          (newLocation) => {
            setLocationHistory((prevHistory) => [...prevHistory, newLocation]);
          },
        );
      }
    };
    startTracking();

    return () => {
      if (subscriber) {
        subscriber.remove();
      }
    };
  }, [hasLocationPermission]);

  const requestPermission = async () => {
    const servicesEnabled = await Location.hasServicesEnabledAsync();

    if (!servicesEnabled) {
      if (Platform.OS === "android") {
        try {
          await Location.enableNetworkProviderAsync();
        } catch (e) {
          Alert.alert("Permission Denied", "Please turn on the GPS system.");
          console.log("User refused to turn on system GPS toogle");
        }
      }
      await checkLocationStatus();
      return;
    }

    const response = await Location.requestForegroundPermissionsAsync();
    if (response.status === "granted") {
      setHasLocationPermission(true);
    } else {
      setHasLocationPermission(false);
      if (!response.canAskAgain) {
        Linking.openSettings();
      }
    }
  };

  const handleSearch = () => {
    if (searchRef.current) searchRef.current.focus();
  };

  // Native replacement for the WebView click/hitTest + postMessage flow.
  const handleMapTap = async (event) => {
    // Any tap dismisses the keyboard (was the "map-tapped" message).
    Keyboard.dismiss();

    try {
      if (!mapViewRef.current) return;

      const { screenPoint, mapPoint } = event.nativeEvent;
      const results = await mapViewRef.current.identify(screenPoint, {
        tolerance: 12,
        maxResults: 1,
      });

      // Find the first layer result that has a feature (FEATURE_SELECTED).
      const hit = (results || []).find(
        (r) => r.features && r.features.length > 0,
      );

      if (hit) {
        const feature = hit.features[0];
        setSelectedFeature(feature.attributes);
        setClickLocation({
          latitude: mapPoint.latitude,
          longitude: mapPoint.longitude,
        });
        setLayerInfo(layerNameToId(hit.layerName));
      } else {
        // Tapped empty space -> clear selection (DESELECT_ALL).
        setSelectedFeature(null);
        setClickLocation(null);
        setLayerInfo(null);
      }
    } catch (e) {
      console.warn("Identify error:", e);
    }
  };

  return (
    <>
      <ThemedView safe={true} style={styles.explore}>
        {/* Permission Request Bar - Floating at the absolute top */}
        {hasLocationPermission === false && (
          <View style={[styles.requestBar, { top: insets.top }]}>
            <Text style={styles.requestText}>
              Location access needed to explore.
            </Text>
            <TouchableOpacity
              onPress={requestPermission}
              style={styles.requestButton}
            >
              <Text style={{ color: "white", fontWeight: "600" }}>Allow</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* The map fills the container entirely underneath */}
        <View style={styles.mapContainer}>
          <MapSettings
            config={{ apiKey: ARCGIS_API_KEY, license: ARCGIS_LICENSE_KEY }}
          >
            <Map
              basemap={basemap}
              initialViewpoint={{
                latitude: MAP_CENTER.latitude,
                longitude: MAP_CENTER.longitude,
                scale: 250000,
              }}
            >
              <FeatureLayer
                url={FEATURE_LAYERS.metroLines}
                renderer={metroLinesRenderer}
              />
              <FeatureLayer
                url={FEATURE_LAYERS.metroStations}
                renderer={metroStationsRenderer}
              />
              <MapView
                ref={mapViewRef}
                style={styles.map}
                onTap={handleMapTap}
              />
            </Map>
          </MapSettings>
          {selectedFeature && clickLocation && (
            <CustomPopup
              data={selectedFeature}
              location={clickLocation}
              layerInfo={layerInfo}
              onClose={() => {
                setSelectedFeature(null);
                setClickLocation(null);
              }}
              colorTheme={colorTheme}
            />
          )}
        </View>

        {/* Floating Search Container - Cleanly positioned below the request bar */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View
            style={[
              styles.searchContainer,
              {
                top:
                  hasLocationPermission === false
                    ? insets.top + 65
                    : insets.top + 10,
              },
            ]}
          >
            <View style={styles.inputWrapper}>
              <ThemedTextInput
                placeholder="Search"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={[
                  styles.inputStyle,
                  { borderColor: colorTheme.border, borderWidth: 2 },
                ]}
                ref={searchRef}
                placeholderTextColor={colorTheme.placeholder}
              />
              <View style={styles.iconContainer}>
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchQuery("")}
                    style={styles.iconButton}
                  >
                    <Ionicons name="close-circle" size={20} color="#94A3B8" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={handleSearch}
                >
                  <Ionicons name="search" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  explore: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  mapContainer: {
    flex: 1,
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
  searchContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  inputStyle: {
    flex: 1,
    borderRadius: 50,
    paddingRight: 70,
  },
  iconContainer: {
    position: "absolute",
    right: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 4,
    marginLeft: 4,
  },
  requestBar: {
    position: "absolute",
    left: 16,
    right: 16,
    backgroundColor: "#EF4444", // Modern warning crimson
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 50, // Capsule design matching the search bar
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 20, // Sits safely above the map layers

    // Smooth Shadowing
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  requestText: {
    color: "white",
    fontWeight: "600",
    fontSize: 13,
  },
  requestButton: {
    backgroundColor: "rgba(0,0,0,0.25)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
});
