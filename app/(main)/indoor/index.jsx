import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
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

// Centered precisely on your project area in Alexandria
const DEFAULT_VIEWPOINT = {
  latitude: 31.199231060060278,
  longitude: 29.90664341137817,
  scale: 2500, // Zoomed in close enough to see indoor features clearly
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

  const networkRenderer = {
    type: "simple",
    symbol: {
      type: "simple-line",
      color: "#FF00FF", // Bright Magenta / Neon Pink
      width: 6, // Extra thick for testing
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
  const networkRef = useRef(null);
  const { theme } = useContext(ThemeContext);
  const colorTheme = Colors[theme] ?? Colors.light;
  const styles = useMemo(() => createStyles(colorTheme), [colorTheme]);
  const screenWidth = Dimensions.get("screen").width;

  const basemap = theme === "dark" ? "arcGISDarkGray" : "arcGISLightGray";

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
    const checkNetworkLayer = async () => {
      // Wait a couple seconds for the map and layers to initialize
      setTimeout(async () => {
        if (networkRef.current) {
          try {
            const count = await networkRef.current.queryFeatureCount({
              whereClause: "1=1",
            });
            console.log(
              `✅ Network Layer Loaded! Total features found: ${count}`,
            );
          } catch (err) {
            console.error("❌ Network Layer failed to load or query:", err);
          }
        } else {
          console.log("⚠️ networkRef is not attached yet.");
        }
      }, 3000);
    };

    checkNetworkLayer();
  }, []);

  // Only fetch feature names for pickers on load; let viewpoint stay stable
  useEffect(() => {
    const t = setTimeout(() => {
      fetchFeatures();
    }, 1000);
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
              visible={false}
            />
            <FeatureLayer
              ref={nameLayerRef}
              url={`${FEATURE_LAYERS.GeoprocessingPane}/8`}
              visible={false}
            />
            <FeatureLayer
              ref={networkRef}
              url={`${FEATURE_LAYERS.Network}`}
              visible={true}
              renderer={networkRenderer}
            />

            <MapView
              style={styles.map}
              viewpoint={DEFAULT_VIEWPOINT}
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

const createStyles = (theme) =>
  StyleSheet.create({
    mainContainer: { flex: 1 },
    mapContainer: { flex: 1 },
    map: { flex: 1 },
    mapStatusCard: {
      position: "absolute",
      top: 50,
      alignSelf: "center",
      padding: 10,
      borderRadius: 8,
      flexDirection: "row",
      alignItems: "center",
      elevation: 4,
    },
    mapStatusText: { marginLeft: 8, fontSize: 14 },
    popupContainer: {
      position: "absolute",
      bottom: 30,
      alignSelf: "center",
      borderRadius: 16,
      borderWidth: 1,
      padding: 16,
      elevation: 6,
    },
    infoRow: { flexDirection: "row", alignItems: "center", marginVertical: 4 },
    iconBox: {
      width: 24,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 8,
    },
    pickerWrapper: {
      flex: 1,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    label: { fontSize: 12, fontWeight: "600", marginBottom: 2 },
    divider: { height: 1, marginVertical: 8 },
    actionRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 10,
      paddingTop: 10,
      borderTopWidth: 1,
    },
    actionBtn: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
    },
    actionText: { marginLeft: 6, fontWeight: "600", fontSize: 14 },
  });
