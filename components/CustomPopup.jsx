import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function CustomPopup({
  data,
  location,
  layerInfo,
  onClose,
  colorTheme,
}) {
  if (!data) return null;

  const styles = useMemo(() => createStyles(colorTheme), [colorTheme]);

  const Id = layerInfo;

  if (Id === "metropoints") {
    const name = data.Name || "Selected Feature";
    const status = data.status || "Active";
    const stationType = data.StationLev || null;
    const lineInfo = data.LineNumber ? `Line ${data.LineNumber}` : null;
    return (
      <View style={styles.overlay}>
        <View style={styles.popupContainer}>
          {/* Header containing basic attribute and geographic context */}
          <View style={styles.header}>
            <Text style={styles.title}>{name}</Text>
            {location && (
              <Text style={styles.coordinateText}>
                Lat: {location.latitude.toFixed(3)} | Lon:{" "}
                {location.longitude.toFixed(3)}
              </Text>
            )}
          </View>

          {/* Reporting Panel */}
          <View style={styles.reportingPanel}>
            <Text style={styles.panelTitle}>Asset Reporting</Text>
            <Text style={styles.panelText}>Status: {status}</Text>
            {lineInfo && <Text style={styles.panelText}>Line: {lineInfo}</Text>}
            {stationType && (
              <Text style={styles.panelText}>Type: {stationType}</Text>
            )}
          </View>

          {/* Filter Panel (Stacked underneath the reporting panel) */}
          <View style={styles.filterPanel}>
            <Text style={styles.panelTitle}>Filter Related Records</Text>
            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterButtonText}>View Historical Data</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" color="#EF4444" size={24} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  if (Id === "metrolines") {
    const name = data.Name || "Selected Feature";
    const lineNumber = data.metroNumbe || null;
    const lineArea = data.Shape__Length || null;
    return (
      <View style={styles.overlay}>
        <View style={styles.popupContainer}>
          {/* Header containing basic attribute and geographic context */}
          <View style={styles.header}>
            <Text style={styles.title}>{name}</Text>
            {location && (
              <Text style={styles.coordinateText}>
                Lat: {location.latitude.toFixed(3)} | Lon:{" "}
                {location.longitude.toFixed(3)}
              </Text>
            )}
          </View>

          {/* Reporting Panel */}
          <View style={styles.reportingPanel}>
            {lineArea && <Text style={styles.panelText}>Line: {lineArea}</Text>}
            {lineNumber && (
              <Text style={styles.panelText}>Type: {lineNumber}</Text>
            )}
          </View>

          {/* Filter Panel (Stacked underneath the reporting panel) */}
          <View style={styles.filterPanel}>
            <Text style={styles.panelTitle}>Filter Related Records</Text>
            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterButtonText}>View</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" color="#EF4444" size={24} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  return null;
}

const createStyles = (colorTheme) =>
  StyleSheet.create({
    overlay: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: 50,
      // paddingBottom: 0,
      justifyContent: "space-around",
    },
    popupContainer: {
      backgroundColor: colorTheme.background,
      borderRadius: 16,
      padding: 10,
      height: "auto",
      flexDirection: "column",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      elevation: 5,
      position: "relative",
      marginBottom: 50,
    },
    header: {
      marginBottom: 8,
      paddingRight: 32,
    },
    title: {
      color: colorTheme.title,
      fontSize: 20,
      fontWeight: "bold",
    },
    coordinateText: {
      color: "#888",
      fontSize: 12,
      marginTop: 4,
    },
    reportingPanel: {
      backgroundColor: colorTheme.uiBackground,
      padding: 8,
      borderRadius: 8,
      marginBottom: 12,
    },
    filterPanel: {
      backgroundColor: colorTheme.uiBackground,
      padding: 8,
      borderRadius: 8,
      marginBottom: 20,
    },
    panelTitle: {
      color: colorTheme.title,
      fontSize: 12,
      fontWeight: "600",
      textTransform: "uppercase",
      marginBottom: 8,
    },
    panelText: {
      color: colorTheme.text,
      fontSize: 14,
      marginBottom: 4,
    },
    filterButton: {
      backgroundColor: "#3b82f6",
      paddingVertical: 8,
      borderRadius: 6,
      alignItems: "center",
    },
    filterButtonText: {
      color: "#fff",
      fontWeight: "600",
    },
    closeButton: {
      position: "absolute",
      top: 16,
      right: 16,
      zIndex: 10,
    },
  });
