import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { useState, useRef, useEffect, useContext, useMemo } from "react";
import {
  MapSettings,
  Map,
  MapView,
  FeatureLayer,
  GraphicsOverlay,
  Graphic,
  geometryEngine,
} from "expo-arcgis";
import CompactPicker from "../../../components/CompactPicker";
import {
  ARCGIS_API_KEY,
  ARCGIS_LICENSE_KEY,
  FEATURE_LAYERS,
} from "../../../config/arcgis";
import { ThemeContext } from "../../../context/ThemeContext";
import ThemedView from "../../../components/ThemedView";
import { Colors } from "../../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";

const DEFAULT_VIEWPOINT = {
  latitude: 31.199231060060278,
  longitude: 29.90664341137817,
  scale: 2500,
};

export default function Indoor() {
  const { theme } = useContext(ThemeContext);
  const colorTheme = Colors[theme] ?? Colors.light;
  const styles = useMemo(() => createStyles(colorTheme), [colorTheme]);
  const screenWidth = Dimensions.get("screen").width;
  const basemap = theme === "dark" ? "arcGISDarkGray" : "arcGISLightGray";
  const mapViewRef = useRef(null);
  const [mapViewpoint, setMapViewpoint] = useState(DEFAULT_VIEWPOINT);
  const unitsLayerRef = useRef(null);
  const nameLayerRef = useRef(null);
  const [isRouteActive, setIsRouteActive] = useState(false);
  const [placesList, setPlacesList] = useState([]);
  const [selectedFrom, setSelectedFrom] = useState("");
  const [selectedTo, setSelectedTo] = useState("");
  const [routeGeometry, setRouteGeometry] = useState(null);
  const [isRouting, setIsRouting] = useState(false);
  const [routeDirections, setRouteDirections] = useState([]);

  const unitsRenderer = {
    type: "simple",
    symbol: {
      type: "simple-fill",
      color: [255, 0, 0, 0.33],
      outline: { color: [22, 249, 113, 1], width: 1 },
    },
  };

  const routeSymbol = {
    type: "simple-line",
    width: 5,
    color: "#00f2ff59",
  };

  const fetchFeatures = async () => {
    if (!nameLayerRef.current) {
      console.warn("⚠️ nameLayerRef.current is not ready yet.");
      return;
    }
    try {
      const features = await nameLayerRef.current.queryFeatures({
        whereClause: "1=1",
        outFields: ["UNIT_ID", "NAME_LONG", "LEVEL_ID"],
        returnGeometry: false,
      });

      if (features && features.length > 0) {
        const list = [];

        features.forEach((f, index) => {
          const attrs = f.attributes || f;
          const unitId =
            attrs["UNIT_ID"] || attrs["unit_id"] || attrs["Unit_ID"];
          const name =
            attrs["NAME_LONG"] ||
            attrs["name_long"] ||
            attrs["Name_Long"] ||
            `Unnamed Room ${index}`;
          const level =
            attrs["LEVEL_ID"] ||
            attrs["level_id"] ||
            attrs["Level_ID"] ||
            "Unknown Floor";

          if (unitId !== undefined && unitId !== null) {
            list.push({ label: `${name} (${level})`, value: unitId });
          }
        });

        list.sort((a, b) => a.label.localeCompare(b.label));
        setPlacesList(list);

        if (list.length > 0) {
          setSelectedFrom(list[0].value);
          setSelectedTo(list[0].value);
        }
      }
    } catch (error) {
      console.error("❌ Failed to query name layer:", error);
    }
  };
  const zoomToUnits = async () => {
    if (!unitsLayerRef.current) return;
    try {
      const extentResult = await unitsLayerRef.current.queryExtent({
        whereClause: "1=1",
      });
      const extent = extentResult?.extent;
      if (!extent) return;

      // Project the extent's center to geographic coords, since native SR is 32636
      const centerPoint = {
        type: "point",
        x: (extent.xmin + extent.xmax) / 2,
        y: (extent.ymin + extent.ymax) / 2,
        spatialReference: extent.spatialReference,
      };
      const projectedCenter = geometryEngine.project(centerPoint, 4326);

      setMapViewpoint({
        latitude: projectedCenter.y,
        longitude: projectedCenter.x,
        scale: 2000, // tune this — smaller = more zoomed in
      });
    } catch (error) {
      console.error("❌ Failed to zoom to units extent:", error);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      fetchFeatures();
      zoomToUnits();
    }, 2000);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    const t = setTimeout(() => fetchFeatures(), 2000);
    return () => clearTimeout(t);
  }, []);

  const handleRoutingAction = async () => {
    if (isRouteActive) {
      setRouteGeometry(null);
      setRouteDirections([]);
      setIsRouteActive(false);
      return;
    }
    const fromUnitId = selectedFrom;
    const toUnitId = selectedTo;

    if (!fromUnitId || !toUnitId || !unitsLayerRef.current) {
      Alert.alert("Error", "Layers are not ready yet.");
      return;
    }

    if (fromUnitId === toUnitId) {
      Alert.alert(
        "Same Location",
        "Please choose two different rooms to route between.",
      );
      return;
    }
    setIsRouting(true);
    setRouteGeometry(null);
    setRouteDirections([]);

    try {
      const fromQuery = await unitsLayerRef.current.queryFeatures({
        whereClause: `UNIT_ID = '${fromUnitId}'`,
        outFields: ["*"],
        returnGeometry: true,
        outSpatialReference: { wkid: 32636 },
      });
      const toQuery = await unitsLayerRef.current.queryFeatures({
        whereClause: `UNIT_ID = '${toUnitId}'`,
        outFields: ["*"],
        returnGeometry: true,
        outSpatialReference: { wkid: 32636 },
      });

      if (!fromQuery.length || !toQuery.length) {
        Alert.alert("Error", "Could not locate the selected rooms on the map.");
        setIsRouting(false);
        return;
      }

      const getCoordinates = (geom) => {
        if (!geom) return { x: null, y: null };
        if (geom.centroid?.x != null)
          return { x: geom.centroid.x, y: geom.centroid.y };
        if (geom.x != null && geom.y != null) return { x: geom.x, y: geom.y };
        if (geom.parts?.[0]?.length) {
          const ring = geom.parts[0];
          const n = ring.length;
          const sum = ring.reduce(
            (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
            { x: 0, y: 0 },
          );
          return { x: sum.x / n, y: sum.y / n };
        }
        return { x: null, y: null };
      };

      const projectedFrom = geometryEngine.project(
        fromQuery[0].geometry,
        32636,
      );
      const projectedTo = geometryEngine.project(toQuery[0].geometry, 32636);

      const startCoords = getCoordinates(projectedFrom);
      const endCoords = getCoordinates(projectedTo);

      if (!startCoords.x || !startCoords.y || !endCoords.x || !endCoords.y) {
        Alert.alert(
          "Error",
          "Could not extract valid coordinates from the selected rooms.",
        );
        setIsRouting(false);
        return;
      }

      const stops = `${startCoords.x},${startCoords.y};${endCoords.x},${endCoords.y}`;
      const locateSettings = JSON.stringify({
        default: {
          tolerance: 50,
          toleranceUnits: "esriMeters",
          sources: [{ name: "Transitions" }, { name: "Pathways" }],
        },
      });

      const routeUrl =
        `${FEATURE_LAYERS.Network}/solve?stops=${stops}` +
        `&returnRoutes=true&inSR=32636&outSR=4326&f=json` +
        `&locateSettings=${encodeURIComponent(locateSettings)}`;

      const response = await fetch(routeUrl);
      const data = await response.json();
      const cleanPaths = (paths) =>
        paths.map((path) => path.map(([x, y]) => [x, y]));

      if (
        data.routes &&
        data.routes.features.length > 0 &&
        data.routes.features[0].attributes.Total_WalkTime > 0
      ) {
        const paths = cleanPaths(data.routes.features[0].geometry.paths);
        setRouteGeometry(paths);

        const steps = (data.directions?.[0]?.features || [])
          .map((f) => f.attributes.text)
          .filter(Boolean);
        setRouteDirections(steps);

        setIsRouteActive(true);
      } else {
        Alert.alert(
          "No Route Found",
          "We couldn't find a walkable path between these two locations. They may not be connected in the indoor network.",
        );
      }
    } catch (error) {
      console.error("Routing Error:", error);
      Alert.alert(
        "Routing Error",
        "Something went wrong while calculating the route.",
      );
    } finally {
      setIsRouting(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.mapContainer}>
        <MapSettings
          config={{ apiKey: ARCGIS_API_KEY, license: ARCGIS_LICENSE_KEY }}
        >
          <Map basemap={basemap} viewpoint={mapViewpoint}>
            <MapView style={styles.map}>
              <GraphicsOverlay>
                {routeGeometry && (
                  <Graphic
                    geometry={{
                      type: "polyline",
                      paths: routeGeometry,
                      spatialReference: { wkid: 32636 },
                    }}
                    symbol={routeSymbol}
                  />
                )}
              </GraphicsOverlay>
            </MapView>
            <FeatureLayer
              ref={unitsLayerRef}
              url={`${FEATURE_LAYERS.GeoprocessingPane}/3`}
              renderer={unitsRenderer}
            />
            <FeatureLayer
              ref={nameLayerRef}
              url={`${FEATURE_LAYERS.GeoprocessingPane}/8`}
              visible={false}
            />
          </Map>
        </MapSettings>
      </View>

      <ThemedView
        safe={true}
        pointerEvents="box-none"
        style={[
          styles.popupContainer,
          {
            width: screenWidth - 40,
            backgroundColor: colorTheme.background, // Matches CustomPopup background
          },
        ]}
      >
        <View style={styles.infoRow}>
          <View style={styles.iconBox}>
            <Ionicons
              name="radio-button-on-outline"
              size={15}
              color="#3B82F6"
            />
          </View>
          <View style={styles.pickerWrapper}>
            <CompactPicker
              selectedValue={selectedFrom}
              onValueChange={(v) => {
                setSelectedFrom(v);
                setIsRouteActive(false);
                setRouteGeometry(null);
                setRouteDirections([]);
              }}
              items={placesList}
              colorTheme={colorTheme}
              placeholder="Starting point"
            />
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.iconBox}>
            <Ionicons name="location-outline" size={15} color="#EF4444" />
          </View>
          <View style={styles.pickerWrapper}>
            <CompactPicker
              selectedValue={selectedTo}
              onValueChange={(v) => {
                setSelectedTo(v);
                setIsRouteActive(false);
                setRouteGeometry(null);
                setRouteDirections([]);
              }}
              items={placesList}
              colorTheme={colorTheme}
              placeholder="Destination"
            />
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { opacity: isRouting ? 0.6 : 1 }]}
            onPress={handleRoutingAction}
            disabled={isRouting}
          >
            <Ionicons
              name={isRouteActive ? "stop-outline" : "navigate-outline"}
              size={15}
              color={isRouteActive ? "#EF4444" : colorTheme.text} // Matches CustomPopup text color logic
            />
            <Text
              style={[
                styles.actionText,
                { color: isRouteActive ? "#EF4444" : colorTheme.text },
              ]}
            >
              {isRouting
                ? "Calculating..."
                : isRouteActive
                  ? "Stop"
                  : "Navigate"}
            </Text>
          </TouchableOpacity>
        </View>

        {routeDirections.length > 0 && (
          <View style={styles.directionsBox}>
            {routeDirections.map((step, i) => (
              <Text
                key={i}
                style={[styles.directionText, { color: colorTheme.text }]}
              >
                {i + 1}. {step}
              </Text>
            ))}
          </View>
        )}
      </ThemedView>
    </View>
  );
}

const createStyles = (colorTheme) =>
  StyleSheet.create({
    mainContainer: { flex: 1 },
    mapContainer: { flex: 1 },
    map: { flex: 1 },
    popupContainer: {
      position: "absolute",
      top: 60, // Placed at the top
      alignSelf: "center",
      borderRadius: 8, // Matches CustomPopup
      borderWidth: 1, // Matches CustomPopup
      borderColor: "rgba(150,150,150,0.15)", // Matches CustomPopup
      padding: 16,
      elevation: 0, // Matches CustomPopup flat look
      shadowOpacity: 0,
      zIndex: 999,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8, // Matches CustomPopup infoRow
    },
    iconBox: {
      width: 20, // Matches CustomPopup iconBox
      justifyContent: "center",
      alignItems: "center",
      marginRight: 8,
    },
    pickerWrapper: {
      flex: 1,
    },
    actionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      marginTop: 8,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: "rgba(150,150,150,0.1)", // Matches CustomPopup divider
      gap: 16,
    },
    actionBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4, // Matches CustomPopup
    },
    actionText: {
      fontSize: 13, // Matches CustomPopup
      fontWeight: "500", // Matches CustomPopup
    },
    directionsBox: {
      marginTop: 4,
      maxHeight: 120,
    },
    directionText: {
      fontSize: 13,
      marginVertical: 2,
    },
  });
