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
import { useLocalSearchParams } from "expo-router";
import {
  MapSettings,
  Map,
  MapView,
  FeatureLayer,
  GraphicsOverlay,
  Graphic,
  geocoder,
  geometryEngine,
  router as routing,
} from "expo-arcgis";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Location from "expo-location";

import ThemedView from "../../components/ThemedView";
import ThemedTextInput from "../../components/ThemedTextInput";
import CustomPopup from "../../components/CustomPopup.jsx";
import { ThemeContext } from "../../context/ThemeContext";
import { useTripDraft } from "../../context/TripDraftContext";
import { Colors } from "../../constants/Colors";
import { getTripById } from "../../api/tripApi.js";
import {
  normalizeTripStops,
  solveTripRoute,
  TripRouteError,
} from "../../services/tripRouteService.js";
import TripRouteOverlay from "../../components/TripRouteOverlay.jsx";
import TripRoutePanel from "../../components/TripRoutePanel.jsx";
import {
  ARCGIS_API_KEY,
  ARCGIS_LICENSE_KEY,
  ARCGIS_ROUTE_SERVICE_URL,
  FEATURE_LAYERS,
  MAP_CENTER,
  DESTINATIONS_PORTAL_ID,
  LAYER_FIELDS,
} from "../../config/arcgis.js";
import { fa } from "zod/locales";
import { useUser } from "../../context/UserContext.jsx";

const searchMarkerSymbol = {
  type: "simple-marker",
  style: "circle",
  size: 14,
  color: "red",
  outline: { width: 1, color: "white" },
};

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

const sanitizeSearchTerm = (input) => {
  if (!input) return "";
  return input.replace(/'/g, "''");
};

const createLabelConfig = (field, colorTheme) => [
  {
    expression: `IIF($view.scale <= 15000, $feature.${field}, '')`,
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
];

export default function Explore() {
  const [hasLocationPermission, setHasLocationPermission] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
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
  const [mapStatus, setMapStatus] = useState("loading");
  const [mapError, setMapError] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [showBranches, setShowBranches] = useState(true);
  const [searchRoute, setSearchRoute] = useState(null);
  const [statusRoute, setStatusRoute] = useState(null);
  const { theme, setTheme } = useContext(ThemeContext);
  const colorTheme = Colors[theme] ?? Colors.light;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { mode, tripId } = useLocalSearchParams();
  const { token } = useUser();
  const { isInDraft, toggleDraft, draftIds, draftCount } = useTripDraft();
  const isTripRouteMode = mode === "saved-trip" && Boolean(tripId);
  const tripRouteRequest = useRef(0);
  const [tripRoute, setTripRoute] = useState(null);
  const [tripRouteInfo, setTripRouteInfo] = useState(null);
  const [tripRouteLoading, setTripRouteLoading] = useState(false);
  const [tripRouteError, setTripRouteError] = useState(null);
  const basemap = theme === "dark" ? "arcGISDarkGray" : "arcGISLightGray";
  const mapConfigurationMissing =
    !ARCGIS_API_KEY ||
    !ARCGIS_LICENSE_KEY ||
    (!FEATURE_LAYERS.destination && !FEATURE_LAYERS.branches);

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

  const destinationLabelConfig = useMemo(
    () => createLabelConfig(LAYER_FIELDS.destination, colorTheme),
    [colorTheme],
  );
  const branchLabelConfig = useMemo(
    () => createLabelConfig(LAYER_FIELDS.branches, colorTheme),
    [colorTheme.mapLabelText, colorTheme.mapLabelHalo],
  );

  const checkLocationStatus = async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    const currentStatus = status === "granted" && servicesEnabled;
    setHasLocationPermission(currentStatus);
  };

  const loadTripRoute = async () => {
    const requestId = ++tripRouteRequest.current;
    const numericTripId = Number(tripId);
    if (!token || !Number.isInteger(numericTripId) || numericTripId <= 0) {
      setTripRouteError("This trip could not be loaded.");
      return;
    }

    setTripRouteLoading(true);
    setTripRouteError(null);
    try {
      const trip = await getTripById(token, numericTripId);
      const stops = normalizeTripStops([currentLocation, ...trip.stops]);
      const route = await solveTripRoute(stops, {
        routeServiceUrl: ARCGIS_ROUTE_SERVICE_URL,
      });
      if (requestId !== tripRouteRequest.current) return;
      setTripRouteInfo(trip);
      setTripRoute(route);
      const latitudes = stops.map((stop) => stop.latitude);
      const longitudes = stops.map((stop) => stop.longitude);
      const latitudeSpan = Math.max(...latitudes) - Math.min(...latitudes);
      const longitudeSpan = Math.max(...longitudes) - Math.min(...longitudes);
      const largestSpan = Math.max(latitudeSpan, longitudeSpan);
      setMapViewpoint({
        latitude: (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
        longitude: (Math.min(...longitudes) + Math.max(...longitudes)) / 2,
        scale: Math.max(25000, Math.min(2500000, largestSpan * 3000000)),
      });
    } catch (error) {
      if (requestId !== tripRouteRequest.current) return;
      setTripRoute(null);
      setTripRouteError(
        error instanceof TripRouteError
          ? error.message
          : "Unable to calculate this trip route.",
      );
    } finally {
      if (requestId === tripRouteRequest.current) setTripRouteLoading(false);
    }
  };

  const exitTripRoute = () => {
    tripRouteRequest.current += 1;
    router.replace("/explore");
  };

  useEffect(() => {
    if (!isTripRouteMode) {
      setTripRoute(null);
      setTripRouteInfo(null);
      setTripRouteError(null);
      return;
    }

    let active = true;
    loadTripRoute().finally(() => {
      if (!active) return;
    });
    return () => {
      active = false;
      tripRouteRequest.current += 1;
    };
  }, [isTripRouteMode, token, tripId]);

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

  const isSearchingRef = useRef(false);
  useEffect(() => {
    isSearchingRef.current = isSearching;
  }, [isSearching]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (isSearchingRef.current) return;
      if (searchQuery.trim().length > 1 && showSuggestions) {
        const term = sanitizeSearchTerm(searchQuery.trim().toLowerCase());
        let localSuggestions = [];
        try {
          if (destLayerRef.current) {
            const destWhere = `LOWER(${LAYER_FIELDS.destination}) LIKE '%${term}%'`;
            const destRes = await destLayerRef.current.queryFeatures({
              whereClause: destWhere,
            });
            if (destRes)
              localSuggestions.push(
                ...destRes.map((f) => ({
                  name: f.attributes[LAYER_FIELDS.destination],
                  type: "landmark",
                })),
              );
          }
          if (branchesLayerRef.current) {
            const branchWhere = `LOWER(${LAYER_FIELDS.branches}) LIKE '%${term}%'`;
            const branchRes = await branchesLayerRef.current.queryFeatures({
              whereClause: branchWhere,
            });
            if (branchRes)
              localSuggestions.push(
                ...branchRes.map((f) => ({
                  name: f.attributes[LAYER_FIELDS.branches],
                  type: "branch",
                })),
              );
          }
          if (localSuggestions.length === 0) {
            const globalResults = await geocoder.suggest(searchQuery.trim());
            if (globalResults && globalResults.length > 0) {
              localSuggestions.push(
                ...globalResults.map((item) => ({
                  name: item.label,
                  type: "geocoder",
                })),
              );
            }
          }
          // Remove duplicates based on name
          const unique = Array.from(
            new Set(localSuggestions.map((a) => a.name)),
          ).map((name) => localSuggestions.find((a) => a.name === name));

          setSuggestions(unique.slice(0, 5)); // limit to top 5 results
        } catch (e) {
          console.warn("Suggestion error:", e);
        }
      } else if (searchQuery.trim().length <= 1) {
        setSuggestions([]);
        if (showSuggestions) setShowSuggestions(false);
      }
    }, 300); // 300ms debounce to prevent spamming the database

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    let subscriber = null;
    let isCancelled = false;

    const startTracking = async () => {
      if (hasLocationPermission && !isTripRouteMode) {
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
  }, [hasLocationPermission, isTripRouteMode]);

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

  const handleRouting = async (destinationPoint) => {
    if (!currentLocation?.coords || !destinationPoint) {
      setSearchRoute(null);
      setStatusRoute(null);
      return;
    }
    setRouteLoading(true);
    setStatusRoute(null);
    try {
      const stops = [
        {
          point: {
            type: "point",
            x: currentLocation.coords.longitude,
            y: currentLocation.coords.latitude,
          },
          name: "My Location",
        },
        {
          point: {
            type: "point",
            x: destinationPoint.longitude,
            y: destinationPoint.latitude,
          },
          name: "Destination",
        },
      ];
      const { routes } = await routing.solveRoute(stops);
      const route = routes[0];
      if (route?.geometry) {
        setSearchRoute(route.geometry);
        setStatusRoute(
          `${(route.totalLength / 1000).toFixed(1)} km · ${Math.round(route.travelTime)} min`,
        );
      } else {
        setSearchRoute(null);
        setStatusRoute("No route found");
      }
    } catch (e) {
      console.warn("Routing error:", e);
      setSearchRoute(null);
      setStatusRoute("Couldn't calculate a route");
    } finally {
      setRouteLoading(false);
    }
  };

  const clearMapSelection = () => {
    setSelectedFeature(null);
    setClickLocation(null);
    setSearchPoint(null);
    setLayerInfo(null);
    setHighlightGraphic(null);
    setSearchRoute(null);
    setStatusRoute(null);
    setRouteLoading(false);
  };

  const handleSearch = async (overrideQuery = null, preferredType = null) => {
    Keyboard.dismiss(); // Hides the keyboard
    const queryToUse =
      typeof overrideQuery === "string" ? overrideQuery : searchQuery;

    if (!queryToUse.trim()) return;
    if (isSearching) return; // Guard against double-submits while a search is in flight
    setIsSearching(true);
    setShowSuggestions(false); // Hide dropdown on search

    try {
      const term = sanitizeSearchTerm(queryToUse.trim().toLowerCase());
      const destWhere = `LOWER(${LAYER_FIELDS.destination}) LIKE '%${term}%'`;
      const branchWhere = `LOWER(${LAYER_FIELDS.branches}) LIKE '%${term}%'`;
      // 1. Search local Destinations first
      if (
        destLayerRef.current &&
        preferredType !== "branch" &&
        preferredType !== "geocoder"
      ) {
        const destResults = await destLayerRef.current.queryFeatures({
          whereClause: destWhere,
        });
        if (destResults && destResults.length > 1 && !preferredType) {
          const matches = Array.from(
            new Map(
              destResults.map((feature) => [
                feature.attributes[LAYER_FIELDS.destination],
                {
                  name: feature.attributes[LAYER_FIELDS.destination],
                  type: "landmark",
                },
              ]),
            ).values(),
          ).slice(0, 5);
          setSuggestions(matches);
          setShowSuggestions(true);
          return;
        }
        if (destResults && destResults.length > 0) {
          const feature = destResults[0];
          const pt = feature.geometry;
          if (pt) {
            // Project native Web Mercator coordinates to WGS84 (Lat/Lon)
            const projectedPt = geometryEngine.project(pt, 4326);
            if (projectedPt) {
              const lat = projectedPt.y;
              const lon = projectedPt.x;
              clearMapSelection();
              setMapViewpoint({ latitude: lat, longitude: lon, scale: 15000 });
              setSearchPoint({ latitude: lat, longitude: lon });
              setClickLocation({ latitude: lat, longitude: lon });
              setSelectedFeature(feature.attributes);
              setLayerInfo("destination");
              setShowLandmarks(true); // Automatically unhide the layer if it was off!
              return;
            }
          }
        }
      }

      // 2. Search local Branches next
      if (
        branchesLayerRef.current &&
        preferredType !== "landmark" &&
        preferredType !== "geocoder"
      ) {
        const branchResults = await branchesLayerRef.current.queryFeatures({
          whereClause: branchWhere,
        });
        if (branchResults && branchResults.length > 1 && !preferredType) {
          const matches = Array.from(
            new Map(
              branchResults.map((feature) => [
                feature.attributes[LAYER_FIELDS.branches],
                {
                  name: feature.attributes[LAYER_FIELDS.branches],
                  type: "branch",
                },
              ]),
            ).values(),
          ).slice(0, 5);
          setSuggestions(matches);
          setShowSuggestions(true);
          return;
        }
        if (branchResults && branchResults.length > 0) {
          const feature = branchResults[0];
          const pt = feature.geometry;
          if (pt) {
            // Project native Web Mercator coordinates to WGS84 (Lat/Lon)
            const projectedPt = geometryEngine.project(pt, 4326);
            if (projectedPt) {
              const lat = projectedPt.y;
              const lon = projectedPt.x;
              clearMapSelection();
              setMapViewpoint({ latitude: lat, longitude: lon, scale: 15000 });
              setSearchPoint({ latitude: lat, longitude: lon });
              setClickLocation({ latitude: lat, longitude: lon });
              setSelectedFeature(feature.attributes);
              setLayerInfo("branches");
              setShowBranches(true); // Automatically unhide the layer if it was off!
              return;
            }
          }
        }
      }

      // 3. Fallback to Global ArcGIS Geocoder
      // This sends "Cairo", for example, to the ArcGIS servers
      const results = await geocoder.geocode(queryToUse, {
        resultAttributeNames: ["*"],
      });
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
        clearMapSelection();
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
        const attrs = bestMatch.attributes || {};
        setSelectedFeature({
          Name: bestMatch.label,
          Description: attrs.LongLabel || "",
        });
        setLayerInfo("geocoder");
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
        setSearchRoute(null);
        setStatusRoute(null);
        setRouteLoading(false);

        const feature = hit.features[0];
        setSelectedFeature(feature.attributes);
        setClickLocation({
          latitude: mapPoint.latitude,
          longitude: mapPoint.longitude,
        });
        setMapViewpoint({
          // Offset south so the tapped feature isn't hidden behind the popup,
          // which docks near the bottom of the screen.
          latitude: mapPoint.latitude,
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
        clearMapSelection();
      }
    } catch (e) {
      console.warn("Identify error:", e);
    }
  };

  return (
    <>
      <ThemedView safe={true} style={styles.explore}>
        {!isTripRouteMode && hasLocationPermission === false && (
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
              {!isTripRouteMode && FEATURE_LAYERS.destination && (
                <FeatureLayer
                  ref={destLayerRef}
                  visible={showLandmarks}
                  url={FEATURE_LAYERS.destination}
                  renderer={destinationRenderer}
                  labelsEnabled={true}
                  labels={destinationLabelConfig}
                />
              )}
              {!isTripRouteMode && FEATURE_LAYERS.branches && (
                <FeatureLayer
                  ref={branchesLayerRef}
                  visible={showBranches}
                  url={FEATURE_LAYERS.branches}
                  renderer={branchesRenderer}
                  labelsEnabled={true}
                  labels={branchLabelConfig}
                />
              )}
              <MapView
                ref={mapViewRef}
                style={styles.map}
                viewpoint={mapViewpoint}
                onTap={isTripRouteMode ? undefined : handleMapTap}
                onMapLoaded={() => {
                  setMapStatus("ready");
                  setMapError(null);
                }}
                onMapLoadError={(event) => {
                  setMapStatus("error");
                  setMapError(
                    event.nativeEvent?.message ||
                      "The map could not be loaded.",
                  );
                }}
                locationDisplay={
                  hasLocationPermission
                    ? { showLocation: true, autoPanMode: "off" }
                    : undefined
                }
              >
                {isTripRouteMode && <TripRouteOverlay route={tripRoute} />}
                {!isTripRouteMode && searchPoint && (
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
                {!isTripRouteMode && highlightGraphic && (
                  <GraphicsOverlay>
                    <Graphic
                      geometry={highlightGraphic.geometry}
                      symbol={highlightGraphic.symbol}
                    />
                  </GraphicsOverlay>
                )}
                {!isTripRouteMode && searchRoute && (
                  <GraphicsOverlay>
                    <Graphic
                      geometry={searchRoute}
                      symbol={{
                        type: "simple-line",
                        color: "lightblue",
                        width: 4,
                      }}
                    ></Graphic>
                  </GraphicsOverlay>
                )}
              </MapView>
            </Map>
          </MapSettings>
          {!isTripRouteMode && selectedFeature && clickLocation && (
            <CustomPopup
              data={selectedFeature}
              location={clickLocation}
              layerInfo={layerInfo}
              onClose={() => {
                clearMapSelection();
              }}
              onNavigate={(featureData) => {
                const destinationId = Number(featureData?.Id);

                if (!Number.isInteger(destinationId) || destinationId <= 0) {
                  Alert.alert(
                    "Destination unavailable",
                    "Details are unavailable for this destination.",
                  );
                  return;
                }

                clearMapSelection();
                router.navigate(`/trips/${destinationId}`);
              }}
              onToggleDraft={(featureData) => {
                const destinationId = Number(featureData?.Id);
                if (!Number.isInteger(destinationId) || destinationId <= 0) {
                  Alert.alert(
                    "Destination unavailable",
                    "This destination cannot be added to an itinerary.",
                  );
                  return;
                }
                toggleDraft(destinationId);
              }}
              isInDraft={(featureData) => isInDraft(Number(featureData?.Id))}
              draftStopNumber={
                selectedFeature
                  ? draftIds.indexOf(Number(selectedFeature?.Id)) + 1
                  : 0
              }
              draftCount={draftCount}
              colorTheme={colorTheme}
              onPressNavigate={(featureData) => {
                if (clickLocation) handleRouting(clickLocation);
              }}
              routeLoading={routeLoading}
              statusRoute={statusRoute}
              onClearRoute={() => {
                setSearchRoute(null);
                setStatusRoute(null);
                setRouteLoading(false);
              }}
            />
          )}
          {mapStatus === "loading" && !mapConfigurationMissing && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={colorTheme.primary} />
            </View>
          )}
          {mapStatus === "error" && (
            <View
              style={[
                styles.mapStatusCard,
                { backgroundColor: colorTheme.uiBackground },
              ]}
            >
              <Ionicons
                name="warning-outline"
                size={20}
                color={Colors.warning}
              />
              <Text style={[styles.mapStatusText, { color: colorTheme.text }]}>
                {mapError || "Map data is unavailable."}
              </Text>
            </View>
          )}
          {mapStatus !== "error" && mapConfigurationMissing && (
            <View
              style={[
                styles.mapStatusCard,
                { backgroundColor: colorTheme.uiBackground },
              ]}
            >
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={Colors.primary}
              />
              <Text style={[styles.mapStatusText, { color: colorTheme.text }]}>
                Map layers are not configured. Check your ArcGIS environment
                settings.
              </Text>
            </View>
          )}
        </View>
        {isTripRouteMode && (
          <TripRoutePanel
            trip={tripRouteInfo}
            route={tripRoute}
            loading={tripRouteLoading}
            error={tripRouteError}
            colorTheme={colorTheme}
            onRetry={loadTripRoute}
            onExit={exitTripRoute}
          />
        )}
        {!isTripRouteMode && (
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
                  onChangeText={(text) => {
                    setSearchQuery(text);
                    if (text.trim().length > 0) setShowSuggestions(true);
                  }}
                  onFocus={() => {
                    if (searchQuery.trim().length > 0) setShowSuggestions(true);
                  }}
                  returnKeyType="search"
                  onSubmitEditing={() => handleSearch(searchQuery)}
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
                        clearMapSelection();
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
                      onPress={() => {
                        handleSearch(searchQuery);
                        searchRef.current.focus();
                      }}
                    >
                      <Ionicons name="search" size={20} color="#64748B" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Suggestions Dropdown OR Filter Pills */}
              {showSuggestions && suggestions.length > 0 ? (
                <View
                  style={[
                    styles.suggestionsDropdown,
                    {
                      backgroundColor: colorTheme.uiBackground,
                      borderColor: colorTheme.border,
                    },
                  ]}
                >
                  {suggestions.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.suggestionItem,
                        index < suggestions.length - 1 && {
                          borderBottomColor: colorTheme.border,
                          borderBottomWidth: StyleSheet.hairlineWidth,
                        },
                      ]}
                      onPress={() => {
                        setSearchQuery(item.name);
                        setShowSuggestions(false);
                        handleSearch(item.name, item.type);
                      }}
                    >
                      <Ionicons
                        name="location-outline"
                        size={20}
                        color={colorTheme.title}
                        style={{ marginRight: 10 }}
                      />
                      <Text
                        style={{
                          flex: 1,
                          fontSize: 15,
                          fontWeight: "500",
                          color: colorTheme.text,
                        }}
                      >
                        {item.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          opacity: 0.5,
                          color: colorTheme.text,
                        }}
                      >
                        {item.type === "landmark"
                          ? "Landmark"
                          : item.type === "geocoder"
                            ? ""
                            : "Branch"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
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
                      Branches
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              )}
            </View>
          </TouchableWithoutFeedback>
        )}
        {isTripRouteMode && (
          <TouchableOpacity
            style={[
              styles.routeBackButton,
              {
                top: insets.top + 10,
                backgroundColor: colorTheme.uiBackground,
              },
            ]}
            onPress={exitTripRoute}
            accessibilityRole="button"
            accessibilityLabel="Exit trip route"
          >
            <Ionicons name="arrow-back" size={20} color={colorTheme.title} />
            <Text style={[styles.routeBackText, { color: colorTheme.text }]}>
              Trip Route
            </Text>
          </TouchableOpacity>
        )}
        {!isTripRouteMode && (
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
            <Ionicons name="locate" size={18} color={colorTheme.title} />
          </TouchableOpacity>
        )}
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
  mapStatusCard: {
    position: "absolute",
    top: 116,
    left: 16,
    right: 16,
    zIndex: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  loaderContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
    elevation: 100,
  },
  mapStatusText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
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
    height: 44,
    paddingVertical: 0,
    paddingLeft: 16,
    borderRadius: 50,
    paddingRight: 70,
  },
  suggestionsDropdown: {
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  filterContainer: {
    marginTop: 10,
  },
  filterContent: {
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    backgroundColor: "#EF4444",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 20,

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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  routeBackButton: {
    position: "absolute",
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  routeBackText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
