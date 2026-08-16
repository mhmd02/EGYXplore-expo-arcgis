import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useState, useRef, useEffect, useContext, useMemo } from "react";
import { MapSettings, Map, MapView, FeatureLayer } from "expo-arcgis";
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
  scale: 100000,
};

export default function Indoor() {
  const polygonsRenderer = {
    type: "simple",
    symbol: {
      type: "simple-fill",
      color: "#ff000055",
      outline: { color: "#16f971", width: 1 },
    },
  };

  const [mapStatus, setMapStatus] = useState("loading");
  const [mapError, setMapError] = useState(null);
  const [fromPlace, setFromPlace] = useState([]);
  const [toPlace, setToPlace] = useState([]);
  const [selectedFrom, setSelectedFrom] = useState("");
  const [selectedTo, setSelectedTo] = useState("");

  const nameLayerRef = useRef(null);
  const layerRef = useRef(null);
  const { theme } = useContext(ThemeContext);
  const colorTheme = Colors[theme] ?? Colors.light;
  const styles = useMemo(() => createStyles(colorTheme), [colorTheme]);
  const screenWidth = Dimensions.get("screen").width;

  const basemap = theme === "dark" ? "arcGISDarkGray" : "arcGISLightGray";

  const [mapViewpoint, setMapViewpoint] = useState(DEFAULT_VIEWPOINT);

  const fetchFeatures = async () => {
    if (!nameLayerRef.current) return;
    try {
      const features = await nameLayerRef.current.queryFeatures({
        whereClause: "1=1",
        outFields: ["NAME_LONG"],
        returnGeometry: false,
      });

      if (!features || features.length === 0) return;
      const longNames = features
        .map((f) => f.attributes["NAME_LONG"])
        .filter(Boolean);

      setFromPlace(longNames);
      setToPlace(longNames);

      if (longNames.length > 0) {
        setSelectedFrom(longNames[0]);
        setSelectedTo(longNames[0]);
      }
    } catch (error) {
      console.error("Failed to query hidden layer features:", error);
    }
  };

  useEffect(() => {
    const fitToLayer = async () => {
      try {
        const extent = await layerRef.current?.queryExtent({
          whereClause: "1=1",
        });
        if (extent) {
          setMapViewpoint({
            latitude: (extent.yMin + extent.yMax) / 2,
            longitude: (extent.xMin + extent.xMax) / 2,
            scale: 2000,
          });
        }
        await fetchFeatures();
      } catch (e) {
        console.warn("queryExtent failed:", e);
      }
    };
    const t = setTimeout(fitToLayer, 1000);
    return () => clearTimeout(t);
  }, []);

  const handleRoutingAction = () => {
    console.log(`Routing from: ${selectedFrom} to: ${selectedTo}`);
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.mapContainer}>
        <MapSettings
          config={{ apiKey: ARCGIS_API_KEY, license: ARCGIS_LICENSE_KEY }}
        >
          <Map
            basemap={basemap}
            style={{ flex: 1 }}
            initialViewpoint={DEFAULT_VIEWPOINT}
          >
            <FeatureLayer
              ref={layerRef}
              url={`${FEATURE_LAYERS.GeoprocessingPane}/3`}
              renderer={polygonsRenderer}
            />
            <FeatureLayer
              ref={nameLayerRef}
              url={`${FEATURE_LAYERS.GeoprocessingPane}/8`}
              visible={false}
            />
            <MapView
              style={styles.map}
              viewpoint={mapViewpoint}
              onMapLoaded={() => {
                setMapStatus("ready");
                setMapError(null);
              }}
              onMapLoadError={(e) => {
                setMapStatus("error");
                setMapError(
                  e.nativeEvent?.message || "The map could not be loaded.",
                );
              }}
            />
          </Map>
        </MapSettings>

        {mapStatus === "loading" && (
          <View
            style={[
              styles.mapStatusCard,
              { backgroundColor: colorTheme.uiBackground },
            ]}
          >
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        )}
        {mapStatus === "error" && (
          <View
            style={[
              styles.mapStatusCard,
              { backgroundColor: colorTheme.uiBackground },
            ]}
          >
            <Ionicons name="warning-outline" size={18} color={Colors.warning} />
            <Text style={[styles.mapStatusText, { color: colorTheme.text }]}>
              {mapError || "Map data is unavailable."}
            </Text>
          </View>
        )}
      </View>

      <ThemedView
        safe={true}
        style={[
          styles.popupContainer,
          {
            width: screenWidth - 40,
            backgroundColor: colorTheme.uiBackground,
            borderColor: colorTheme.border,
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
          <View
            style={[
              styles.pickerWrapper,
              { backgroundColor: colorTheme.background },
            ]}
          >
            <Text style={[styles.label, { color: colorTheme.text }]}>From</Text>
            <CompactPicker
              selectedValue={selectedFrom}
              onValueChange={setSelectedFrom}
              items={fromPlace}
              colorTheme={colorTheme}
              placeholder="Select starting point"
            />
          </View>
        </View>

        <View
          style={[styles.divider, { backgroundColor: colorTheme.border }]}
        />

        <View style={styles.infoRow}>
          <View style={styles.iconBox}>
            <Ionicons name="location-outline" size={15} color="#EF4444" />
          </View>
          <View
            style={[
              styles.pickerWrapper,
              { backgroundColor: colorTheme.background },
            ]}
          >
            <Text style={[styles.label, { color: colorTheme.text }]}>To</Text>
            <CompactPicker
              selectedValue={selectedTo}
              onValueChange={setSelectedTo}
              items={toPlace}
              colorTheme={colorTheme}
              placeholder="Select destination"
            />
          </View>
        </View>

        <View style={[styles.actionRow, { borderTopColor: colorTheme.border }]}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: `${Colors.primary}1A` },
            ]}
            onPress={handleRoutingAction}
          >
            <Ionicons
              name="navigate-outline"
              size={15}
              color={Colors.primary}
            />
            <Text style={[styles.actionText, { color: Colors.primary }]}>
              Go
            </Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </View>
  );
}

const createStyles = (colorTheme) =>
  StyleSheet.create({
    mainContainer: {
      flex: 1,
      overflow: "hidden",
    },
    mapContainer: {
      ...StyleSheet.absoluteFill,
    },
    map: {
      flex: 1,
    },
    mapStatusCard: {
      position: "absolute",
      top: Platform.OS === "ios" ? 130 : 100,
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
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
    mapStatusText: {
      fontSize: 12,
      fontWeight: "600",
      flexShrink: 1,
    },
    popupContainer: {
      position: "absolute",
      top: Platform.OS === "ios" ? 60 : 40,
      alignSelf: "center",
      borderRadius: 12,
      borderWidth: 1,
      padding: 14,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
    },
    iconBox: {
      width: 20,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 8,
    },
    pickerWrapper: {
      flex: 1,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingTop: 2,
      justifyContent: "center",
    },
    label: {
      fontSize: 10,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: -6,
    },
    divider: {
      height: 1,
      marginVertical: 6,
    },
    actionRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      marginTop: 6,
      paddingTop: 10,
      borderTopWidth: 1,
    },
    actionBtn: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      gap: 6,
    },
    actionText: {
      fontSize: 13,
      fontWeight: "700",
    },
  });
