import React, { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";
import { useTabBarClearance } from "../constants/layout";
import { formatDistance, formatDuration } from "../services/tripRouteService";

export default function TripRoutePanel({
  trip,
  route,
  loading,
  error,
  colorTheme,
  onRetry,
  onExit,
  onStartNavigation,
  isNavigating,
}) {
  const [expanded, setExpanded] = useState(false);
  const tabBarClearance = useTabBarClearance();
  const panelStyle = {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: tabBarClearance + 8,
    padding: 14,
    borderRadius: 18,
    backgroundColor: colorTheme.uiBackground,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 30,
  };

  if (loading) {
    return (
      <View style={panelStyle}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={{ color: colorTheme.text, fontWeight: "600" }}>
            Calculating trip route...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={panelStyle}>
        <Text
          style={{ color: Colors.warning, fontWeight: "600", marginBottom: 10 }}
        >
          {error}
        </Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            onPress={onRetry}
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 10,
              backgroundColor: Colors.primary,
            }}
          >
            <Text
              style={{ color: "#fff", textAlign: "center", fontWeight: "700" }}
            >
              Retry
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onExit}
            style={{
              padding: 10,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: colorTheme.border,
            }}
          >
            <Text style={{ color: colorTheme.text, fontWeight: "700" }}>
              Exit
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!route) return null;

  return (
    <View style={panelStyle}>
      <TouchableOpacity
        onPress={() => setExpanded((value) => !value)}
        style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ color: colorTheme.text, fontWeight: "800" }}>
            {formatDistance(route.totalDistanceMeters)}
          </Text>
          <Text style={{ color: colorTheme.text, fontWeight: "800" }}>
            {formatDuration(route.totalTravelTimeMinutes)}
          </Text>
          <Text style={{ color: colorTheme.text, fontWeight: "800" }}>
            {route.stops.length} stops
          </Text>
        </View>
        <Ionicons
          name={expanded ? "chevron-down" : "chevron-up"}
          size={18}
          color={colorTheme.placeholder}
        />
      </TouchableOpacity>
      {expanded && (
        <View style={{ marginTop: 12, gap: 8 }}>
          <Text style={{ color: colorTheme.title, fontWeight: "800" }}>
            {trip?.title}
          </Text>
          {route.stops.map((stop) => (
            <View
              key={stop.sequence}
              style={{ flexDirection: "row", gap: 8, alignItems: "center" }}
            >
              <Text
                style={{ color: Colors.primary, fontWeight: "800", width: 20 }}
              >
                {stop.sequence}.
              </Text>
              <Text style={{ color: colorTheme.text, flex: 1 }}>
                {stop.name === "Stop 1" ? "Start" : stop.name}
              </Text>
            </View>
          ))}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            {!isNavigating && (
              <TouchableOpacity
                onPress={onStartNavigation}
                style={{
                  marginTop: 4,
                  padding: 10,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <Text
                    style={{
                      color: colorTheme.text,
                      fontWeight: "700",
                    }}
                  >
                    Start
                  </Text>
                  <Ionicons
                    name="arrow-up-outline"
                    size={16}
                    color={colorTheme.text}
                  />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
}
