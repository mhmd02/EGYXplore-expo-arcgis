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
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";

import ThemedView from "../../components/ThemedView";
import ThemedTextInput from "../../components/ThemedTextInput";
import { ThemeContext } from "../../context/ThemeContext";
import { Colors } from "../../constants/Colors";
import CustomPopup from "../../components/CustomPopup.jsx";

import { API, metroLayer, metroLinesLayer } from "../../assets/js/config.js";
import { getLeafletMapHtml, getEsriMaps } from "../../assets/html/basemap.js";

export default function Explore() {
  const [hasLocationPermission, setHasLocationPermission] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef();

  const [selectedFeature, setSelectedFeature] = useState(null);
  const [clickLocation, setClickLocation] = useState(null);
  const [layerInfo, setLayerInfo] = useState(null);

  const { theme, setTheme } = useContext(ThemeContext);
  const colorTheme = Colors[theme] ?? Colors.light;
  const insets = useSafeAreaInsets();

  const mapHtml = getEsriMaps(theme, API, metroLayer, metroLinesLayer);

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
  const handleWebViewMessage = (event) => {
    if (event.nativeEvent.data === "map-tapped") {
      Keyboard.dismiss();
      return;
    }

    try {
      const data = JSON.parse(event.nativeEvent.data);

      switch (data.type) {
        case "FEATURE_SELECTED":
          setSelectedFeature(data.payload.attributes);
          setClickLocation(data.location);
          setLayerInfo(data.payload.layerId);
          break;
        case "DESELECT_ALL":
          setSelectedFeature(null);
          setClickLocation(null);
          break;
        default:
          break;
      }
    } catch (e) {
      console.warn("Error parsing WebView message:", e);
      Alert.alert("Somehting went wrong", "Please contact you api provider.");
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
          <WebView
            originWhitelist={["*"]}
            source={{ html: mapHtml }}
            style={styles.map}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onMessage={handleWebViewMessage}
          />
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
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
  searchContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 15,
  },
  inputStyle: {
    borderRadius: 50,
    overflow: "hidden",
    paddingRight: 80,
  },
  /* Added wrappers to float elements without modifying your style object dimensions */
  inputWrapper: {
    position: "relative",
    justifyContent: "center",
    width: "100%",
  },
  iconContainer: {
    position: "absolute",
    right: 16, // Kept deep inside your 25px border radius boundary
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
