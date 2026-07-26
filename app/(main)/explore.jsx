import { useContext, useRef, useState, useEffect, useMemo } from "react";
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
  ActivityIndicator,
  ScrollView,
} from "react-native";
import {
  MapSettings,
  Map,
  MapView,
  FeatureLayer,
  GraphicsOverlay,
  Graphic,
  geocoder,
  geometryEngine,
} from "expo-arcgis";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";

import ThemedView from "../../components/ThemedView";
import ThemedTextInput from "../../components/ThemedTextInput";
import CustomPopup from "../../components/CustomPopup.jsx";
import { ThemeContext } from "../../context/ThemeContext";
import { Colors } from "../../constants/Colors";
import {
  ARCGIS_API_KEY,
  ARCGIS_LICENSE_KEY,
  FEATURE_LAYERS,
  MAP_CENTER,
} from "../../config/arcgis.js";

// Dynamic renderers are generated inside the component based on ThemeContext.
// Marker dropped on the map for a geocoded search result (a one-off graphic,
// not part of a data layer). A red diamond keeps it distinct from the blue
// station markers and green metro lines.
const searchMarkerSymbol = {
  type: "simple-marker",
  style: "circle",
  size: 14,
  color: "red",
  outline: { width: 1, color: "white" },
};

// The native `identify` returns the layer's title (layerName), while CustomPopup
// keys off the old WebView layer ids. Map between them.
const layerNameToId = (layerName = "") => {
  const name = layerName.toLowerCase();
  if (name.includes("destination")) return "destination";
  if (name.includes("branch")) return "branches";
  return null;
};

const highlightPointSymbol = {
  type: "simple-marker",
  style: "circle",
  size: 20,
  color: "#00a6ff59",
};

const highlightLineSymbol = {
  type: "simple-line",
  width: 5,
  color: "#00f2ff59",
};

export default function Explore() {
  const [hasLocationPermission, setHasLocationPermission] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchPoint, setSearchPoint] = useState(null);
  const searchRef = useRef();
  const mapViewRef = useRef(null);
  const destLayerRef = useRef(null);
  const branchesLayerRef = useRef(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [clickLocation, setClickLocation] = useState(null);
  const [layerInfo, setLayerInfo] = useState(null);
  const [highlightGraphic, setHighlightGraphic] = useState(null);
  const [mapViewpoint, setMapViewpoint] = useState(null);

  // Filter states
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [showBranches, setShowBranches] = useState(true);

  const { theme, setTheme } = useContext(ThemeContext);
  const colorTheme = Colors[theme] ?? Colors.light;
  const insets = useSafeAreaInsets();

  const basemap = theme === "dark" ? "arcGISDarkGray" : "arcGISLightGray";

  // Dynamic renderers connected to ThemeContext, wrapped in useMemo for optimal performance
  const destinationRenderer = useMemo(
    () => ({
      type: "simple",
      symbol: {
        type: "simple-marker",
        style: "circle",
        size: 18,
        color: `${colorTheme.mapDestination}E6`, // 90% Opacity
        outline: { color: "#FFFFFF", width: 3 },
      },
    }),
    [colorTheme.mapDestination],
  );

  const branchesRenderer = useMemo(
    () => ({
      type: "simple",
      symbol: {
        type: "simple-marker",
        style: "circle",
        size: 16,
        color: `${colorTheme.mapBranch}E6`, // 90% Opacity
        outline: { color: "#FFFFFF", width: 2.5 },
      },
    }),
    [colorTheme.mapBranch],
  );

  const labelConfig = useMemo(
    () => [
      {
        expression: "IIF($view.scale <= 15000, $feature.Name, '')",
        useArcade: true,
        symbol: {
          type: "text",
          color: colorTheme.mapLabelText,
          size: 10,
          haloColor: colorTheme.mapLabelHalo,
          haloWidth: 1.5,
          verticalAlignment: "baseline",
          fontFamily: "sans-serif-medium",
        },
      },
    ],
    [colorTheme.mapLabelText, colorTheme.mapLabelHalo],
  );

  const checkLocationStatus = async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    const currentStatus = status === "granted" && servicesEnabled;
    setHasLocationPermission(currentStatus);
  };

  useEffect(() => {
    checkLocationStatus();

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        checkLocationStatus();
      }
    });
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    let subscriber = null;
    let isCancelled = false;

    const startTracking = async () => {
      if (hasLocationPermission) {
        const sub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Highest,
            timeInterval: 10000,
            distanceInterval: 3,
          },
          (newLocation) => {
            setCurrentLocation(newLocation);
          },
        );

        // If the component unmounted while we were waiting for the promise,
        // kill the subscription immediately to prevent a background leak.
        if (isCancelled) {
          sub.remove();
        } else {
          subscriber = sub;
        }
      }
    };
    startTracking();

    return () => {
      isCancelled = true;
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

  const handleSearch = async () => {
    Keyboard.dismiss(); // Hides the keyboard
    if (!searchQuery.trim()) return;
    if (isSearching) return; // Guard against double-submits while a search is in flight
    setIsSearching(true);

    try {
      const term = searchQuery.trim().toLowerCase();
      const whereClause = `LOWER(Name) LIKE '%${term}%'`;

      // 1. Search local Destinations first
      if (destLayerRef.current) {
        const destResults = await destLayerRef.current.queryFeatures({
          whereClause,
        });
        if (destResults && destResults.length > 0) {
          const feature = destResults[0];
          const pt = feature.geometry;
          if (pt) {
            // Project native Web Mercator coordinates to WGS84 (Lat/Lon)
            const projectedPt = geometryEngine.project(pt, 4326);
            if (projectedPt) {
              const lat = projectedPt.y;
              const lon = projectedPt.x;
              setMapViewpoint({ latitude: lat, longitude: lon, scale: 15000 });
              setSearchPoint({ latitude: lat, longitude: lon });
              setClickLocation({ latitude: lat, longitude: lon });
              setSelectedFeature(feature.attributes);
              setLayerInfo("destination");
              setShowLandmarks(true); // Automatically unhide the layer if it was off!
              setIsSearching(false);
              return;
            }
          }
        }
      }

      // 2. Search local Branches next
      if (branchesLayerRef.current) {
        const branchResults = await branchesLayerRef.current.queryFeatures({
          whereClause,
        });
        if (branchResults && branchResults.length > 0) {
          const feature = branchResults[0];
          const pt = feature.geometry;
          if (pt) {
            // Project native Web Mercator coordinates to WGS84 (Lat/Lon)
            const projectedPt = geometryEngine.project(pt, 4326);
            if (projectedPt) {
              const lat = projectedPt.y;
              const lon = projectedPt.x;
              setMapViewpoint({ latitude: lat, longitude: lon, scale: 15000 });
              setSearchPoint({ latitude: lat, longitude: lon });
              setClickLocation({ latitude: lat, longitude: lon });
              setSelectedFeature(feature.attributes);
              setLayerInfo("branches");
              setShowBranches(true); // Automatically unhide the layer if it was off!
              setIsSearching(false);
              return;
            }
          }
        }
      }

      // 3. Fallback to Global ArcGIS Geocoder
      // This sends "Cairo", for example, to the ArcGIS servers
      const results = await geocoder.geocode(searchQuery);
      if (!results || results.length === 0) {
        Alert.alert(
          "No Results",
          "Could not find any place matching your search.",
        );
        setIsSearching(false);
        return;
      }
      const bestMatch = results[0];

      const pt = bestMatch.location;
      if (pt) {
        // Extract the exact coordinates
        const lat = pt.y || pt.latitude;
        const lon = pt.x || pt.longitude;
        if (lat && lon) {
          // 1. Move the map camera (from Step 2)
          setMapViewpoint({
            latitude: lat,
            longitude: lon,
            scale: 50000, // Zoom level (smaller number = closer)
          });
          // 2. Drop a marker on the map at the searched place
          setSearchPoint({ latitude: lat, longitude: lon });
        }
        // 3. Open the popup at that location
        setClickLocation({ latitude: lat, longitude: lon });
        setSelectedFeature({ Name: bestMatch.label }); // Shows the place name in the popup
        setLayerInfo(null); // It's a general place, not a metro station
      }
    } catch (err) {
      console.warn("Search Error:", err);
      Alert.alert("Error", "Something went wrong while searching");
    } finally {
      setIsSearching(false);
    }
  };

  const handleGoToMyLocation = () => {
    // Check if we have successfully fetched the coordinates
    if (currentLocation && currentLocation.coords) {
      const jitter = Math.random() * 0.0000001;
      setMapViewpoint({
        latitude: currentLocation.coords.latitude + jitter,
        longitude: currentLocation.coords.longitude + jitter,
        scale: 15000, // Zoom in fairly close to the user
      });
    } else if (!hasLocationPermission) {
      Alert.alert(
        "Permission Needed",
        "Please enable location access to use this feature.",
      );
    } else {
      Alert.alert(
        "Locating...",
        "Still waiting for a GPS signal. Please try again in a moment.",
      );
    }
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
        setMapViewpoint({
          // Offset south so the tapped feature isn't hidden behind the popup,
          // which docks near the bottom of the screen.
          latitude: mapPoint.latitude - 0.005,
          longitude: mapPoint.longitude,
          scale: 15000,
        });
        setLayerInfo(layerNameToId(hit.layerName));
        if (feature.geometry) {
          const geomType = feature.geometry.type;
          const normalizedGeometry = feature.geometry;

          setHighlightGraphic({
            geometry: normalizedGeometry,
            symbol:
              geomType === "point" ? highlightPointSymbol : highlightLineSymbol,
          });
        }
      } else {
        // Tapped empty space -> clear selection (DESELECT_ALL).
        setSelectedFeature(null);
        setClickLocation(null);
        setLayerInfo(null);
        setSearchPoint(null);
        setHighlightGraphic(null);
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
          <View
            style={[
              styles.requestBar,
              { top: insets.top, backgroundColor: "red" },
            ]}
          >
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
              style={{ flex: 1 }}
              initialViewpoint={{
                latitude: MAP_CENTER.latitude,
                longitude: MAP_CENTER.longitude,
                scale: 250000,
              }}
            >
              {FEATURE_LAYERS.destination && (
                <FeatureLayer
                  ref={destLayerRef}
                  visible={showLandmarks}
                  url={FEATURE_LAYERS.destination}
                  renderer={destinationRenderer}
                  labelsEnabled={true}
                  labels={labelConfig}
                />
              )}
              {FEATURE_LAYERS.branches && (
                <FeatureLayer
                  ref={branchesLayerRef}
                  visible={showBranches}
                  url={FEATURE_LAYERS.branches}
                  renderer={branchesRenderer}
                  labelsEnabled={true}
                  labels={labelConfig}
                />
              )}
              <MapView
                ref={mapViewRef}
                style={styles.map}
                viewpoint={mapViewpoint}
                onTap={handleMapTap}
                locationDisplay={
                  hasLocationPermission
                    ? { showLocation: true, autoPanMode: "off" }
                    : undefined
                }
              >
                {searchPoint && (
                  <GraphicsOverlay>
                    <Graphic
                      geometry={{
                        type: "point",
                        x: searchPoint.longitude,
                        y: searchPoint.latitude,
                      }}
                      symbol={searchMarkerSymbol}
                    />
                  </GraphicsOverlay>
                )}
                {highlightGraphic && (
                  <GraphicsOverlay>
                    <Graphic
                      geometry={highlightGraphic.geometry}
                      symbol={highlightGraphic.symbol}
                    />
                  </GraphicsOverlay>
                )}
              </MapView>
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
                setSearchPoint(null);
                setHighlightGraphic(null);
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
                returnKeyType="search"
                onSubmitEditing={handleSearch}
                style={[
                  styles.inputStyle,
                  { borderColor: colorTheme.border, borderWidth: 2 },
                ]}
                ref={searchRef}
                placeholderTextColor={colorTheme.placeholder}
              />
              <View style={styles.iconContainer}>
                {searchQuery.length > 0 && !isSearching && (
                  <TouchableOpacity
                    onPress={() => {
                      setSearchQuery("");
                      setSearchPoint(null);
                      setSelectedFeature(null);
                      setClickLocation(null);
                    }}
                    style={styles.iconButton}
                  >
                    <Ionicons name="close-circle" size={20} color="#94A3B8" />
                  </TouchableOpacity>
                )}
                {isSearching ? (
                  <View style={styles.iconButton}>
                    <ActivityIndicator size="small" color={Colors.primary} />
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={handleSearch}
                  >
                    <Ionicons name="search" size={20} color="#64748B" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Filter Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterContainer}
              contentContainerStyle={styles.filterContent}
            >
              <TouchableOpacity
                style={[
                  styles.filterPill,
                  showLandmarks && styles.filterPillActive,
                  showLandmarks && {
                    backgroundColor: colorTheme.mapDestination,
                  },
                ]}
                onPress={() => setShowLandmarks(!showLandmarks)}
              >
                <Text
                  style={[
                    styles.filterText,
                    showLandmarks && { color: colorTheme.mapText },
                  ]}
                >
                  Landmarks
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterPill,
                  showBranches && styles.filterPillActive,
                  showBranches && { backgroundColor: colorTheme.mapBranch },
                ]}
                onPress={() => setShowBranches(!showBranches)}
              >
                <Text
                  style={[
                    styles.filterText,
                    showBranches && { color: colorTheme.mapText },
                  ]}
                >
                  Near me "Branches"
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
        {/* My Location Button - Floating at the bottom right */}
        <TouchableOpacity
          style={[
            styles.myLocationButton,
            {
              bottom: insets.bottom + 80,
              backgroundColor: colorTheme.uiBackground,
            },
          ]}
          onPress={handleGoToMyLocation}
        >
          <Ionicons name="locate" size={24} color={colorTheme.title} />
        </TouchableOpacity>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  explore: {
    flex: 1,
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
  filterContainer: {
    marginTop: 10,
  },
  filterContent: {
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#E2E8F0",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  filterPillActive: {
    borderColor: "#FFFFFF",
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  iconContainer: {
    position: "absolute",
    right: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 4,
    marginLeft: 6,
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
  myLocationButton: {
    position: "absolute",
    right: 16,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 15,
    // Smooth shadow for the floating effect
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
});
