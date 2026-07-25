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
  const styles = useMemo(() => createStyles(colorTheme), [colorTheme]);

  if (!data) return null;

  const Id = layerInfo;

  if (Id === "destination") {
    const name = data.Name || "Selected Feature";
    const city = data.City || "Unknown City";
    const category = data.Category || "General";
    const rating = data.Rating;
    const ticketPrice =
      data.TicketPrice === 0 ? "Free Entry" : `${data.TicketPrice} EGP`;

    return (
      <View style={styles.overlay}>
        <View style={styles.popupContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close-circle" color="#94A3B8" size={28} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>{name}</Text>
            {rating ? (
              <View style={styles.ratingBadge}>
                <Ionicons name="star" color="#F59E0B" size={14} />
                <Text style={styles.ratingText}>{rating}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.divider} />

          <View style={styles.infoList}>
            <View style={styles.infoRow}>
              <View style={styles.iconBox}>
                <Ionicons name="location-outline" size={18} color="#3B82F6" />
              </View>
              <Text style={styles.infoText}>{city}</Text>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.iconBox}>
                <Ionicons name="pricetag-outline" size={18} color="#8B5CF6" />
              </View>
              <Text style={styles.infoText}>{category}</Text>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.iconBox}>
                <Ionicons name="ticket-outline" size={18} color="#10B981" />
              </View>
              <Text style={styles.infoText}>{ticketPrice}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }
  
  if (Id === "branches") {
    const name = data.Name || "Selected Branch";
    const address = data.Address || "Unknown Address";
    const phone = data.ContactNumber || "No Phone Provided";

    return (
      <View style={styles.overlay}>
        <View style={styles.popupContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close-circle" color="#94A3B8" size={28} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>{name}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoList}>
            <View style={styles.infoRow}>
              <View style={styles.iconBox}>
                <Ionicons name="map-outline" size={18} color="#F97316" />
              </View>
              <Text style={styles.infoText}>{address}</Text>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.iconBox}>
                <Ionicons name="call-outline" size={18} color="#14B8A6" />
              </View>
              <Text style={styles.infoText}>{phone}</Text>
            </View>
          </View>
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
      padding: 20,
      justifyContent: "flex-end",
    },
    popupContainer: {
      backgroundColor: colorTheme.background,
      borderRadius: 24,
      padding: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 10,
      marginBottom: 30,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 16,
      paddingRight: 32, // make room for close button
    },
    title: {
      color: colorTheme.title,
      fontSize: 22,
      fontWeight: "800",
      flex: 1,
      marginRight: 12,
    },
    ratingBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#FEF3C7",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginTop: 2,
    },
    ratingText: {
      color: "#B45309",
      fontWeight: "bold",
      fontSize: 14,
      marginLeft: 4,
    },
    divider: {
      height: 1,
      backgroundColor: "rgba(150,150,150,0.2)",
      marginBottom: 16,
    },
    infoList: {
      flexDirection: "column",
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    iconBox: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: "rgba(150,150,150,0.1)",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 14,
    },
    infoText: {
      color: colorTheme.text,
      fontSize: 15,
      fontWeight: "500",
      flex: 1,
    },
    closeButton: {
      position: "absolute",
      top: 16,
      right: 16,
      zIndex: 10,
    },
  });
