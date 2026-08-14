import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { LAYER_FIELDS } from "../config/arcgis";

export default function CustomPopup({
  data,
  location,
  layerInfo,
  onClose,
  onNavigate,
  onPressNavigate,
  onToggleDraft,
  isInDraft,
  draftStopNumber,
  draftCount,
  colorTheme,
  routeLoading,
  statusRoute,
  onClearRoute,
}) {
  const styles = useMemo(() => createStyles(colorTheme), [colorTheme]);
  const screenWidth = Dimensions.get("screen").width;
  if (!data) return null;

  const Id = layerInfo;

  if (Id === "destination") {
    const name = data[LAYER_FIELDS.destination] || "Selected Feature";
    const city = data.Governorate || "Unknown City";
    const category = data.Category || "General";
    const rating = data.Rating;
    const rawPrice = data.ForeignPrice ?? data.TicketPrice;
    const ticketPrice =
      rawPrice === 0 ? "Free" : rawPrice != null ? `${rawPrice} EGP` : "N/A";
    const addedToDraft = isInDraft?.(data) ?? false;

    return (
      <View style={styles.overlay}>
        <View style={[styles.popupContainer, { width: screenWidth - 40 }]}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" color={colorTheme.text} size={20} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>
              {name}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoList}>
            <View style={styles.infoRow}>
              <View style={styles.iconBox}>
                <Ionicons
                  name="location-outline"
                  size={15}
                  color={colorTheme.text}
                />
              </View>
              <Text style={styles.infoText}>{city}</Text>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.iconBox}>
                <Ionicons
                  name="pricetag-outline"
                  size={15}
                  color={colorTheme.text}
                />
              </View>
              <Text style={styles.infoText}>{category}</Text>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.iconBox}>
                <Ionicons
                  name="ticket-outline"
                  size={15}
                  color={colorTheme.text}
                />
              </View>
              <Text style={styles.infoText}>{ticketPrice}</Text>
            </View>
            {onToggleDraft && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => onToggleDraft(data)}
              >
                <Ionicons
                  name={addedToDraft ? "checkmark" : "add"}
                  size={16}
                  color={addedToDraft ? "#10B981" : colorTheme.text}
                />
                <Text
                  style={[
                    styles.actionText,
                    addedToDraft && { color: "#10B981" },
                  ]}
                >
                  {addedToDraft ? `Stop #${draftStopNumber}` : "Add"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.actionRow}>
            {onNavigate && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => onNavigate(data)}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={15}
                  color={colorTheme.text}
                />
                <Text style={styles.actionText}>Details</Text>
              </TouchableOpacity>
            )}

            {statusRoute ? (
              <View style={styles.destRow}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => onClearRoute?.()}
                >
                  <Text style={styles.actionText}>{statusRoute}</Text>
                  <Ionicons
                    name="close-outline"
                    size={16}
                    color={colorTheme.text}
                    style={{ marginLeft: 4 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                  <Text style={styles.actionText}>Start</Text>
                  <Ionicons
                    name="arrow-up-outline"
                    size={16}
                    color={colorTheme.text}
                    style={{ marginLeft: 4 }}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => onPressNavigate?.(data)}
              >
                <Ionicons
                  name="navigate-outline"
                  size={15}
                  color={colorTheme.text}
                />
                {routeLoading ? (
                  <ActivityIndicator />
                ) : (
                  <Text style={styles.actionText}>Navigate</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  }

  if (Id === "branches") {
    const name = data[LAYER_FIELDS.branches] || "Selected Branch";
    const address = data.Address || "Unknown Address";
    const phone = data.ContactNumber || "No Phone Provided";

    return (
      <View style={styles.branchesOverlay}>
        <View style={styles.branchesPopupContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" color={colorTheme.text} size={20} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>{name}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoList}>
            <View style={styles.infoRow}>
              <View style={styles.iconBox}>
                <Ionicons
                  name="map-outline"
                  size={15}
                  color={colorTheme.text}
                />
              </View>
              <Text style={styles.infoText}>{address}</Text>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.iconBox}>
                <Ionicons
                  name="call-outline"
                  size={15}
                  color={colorTheme.text}
                />
              </View>
              <Text style={styles.infoText}>{phone}</Text>
            </View>
          </View>
          <View style={styles.actionRow}>
            {statusRoute ? (
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  { flex: 1, justifyContent: "space-between" },
                ]}
                onPress={() => onClearRoute?.()}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.actionText}>{statusRoute}</Text>
                  <Ionicons
                    name="close-outline"
                    size={14}
                    color={colorTheme.text}
                    style={{ marginLeft: 4 }}
                  />
                </View>
                <TouchableOpacity style={styles.actionBtn}>
                  <Text style={{ color: colorTheme.text, marginLeft: 4 }}>
                    Start
                  </Text>
                  <Ionicons
                    name="arrow-up-outline"
                    size={16}
                    color={colorTheme.text}
                    style={{ marginLeft: 4 }}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => onPressNavigate?.(data)}
              >
                <Ionicons
                  name="navigate-outline"
                  size={15}
                  color={colorTheme.text}
                />
                {routeLoading ? (
                  <ActivityIndicator />
                ) : (
                  <Text style={styles.actionText}>Navigate</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  }

  if (Id === "geocoder") {
    return (
      <View style={styles.branchesOverlay}>
        <View style={styles.branchesPopupContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" color={colorTheme.text} size={20} />
          </TouchableOpacity>

          <Text style={styles.title}>{data.Name || "Selected place"}</Text>
          <View style={styles.divider} />

          <Text style={[styles.infoText, { marginBottom: 12 }]}>
            {data.Description}
          </Text>

          <View style={styles.actionRow}>
            {statusRoute ? (
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  { flex: 1, justifyContent: "space-between" },
                ]}
                onPress={() => onClearRoute?.()}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.actionText}>{statusRoute}</Text>
                  <Ionicons
                    name="close-outline"
                    size={14}
                    color={colorTheme.text}
                    style={{ marginLeft: 4 }}
                  />
                </View>
                <TouchableOpacity style={styles.actionBtn}>
                  <Text style={{ color: colorTheme.text, marginLeft: 4 }}>
                    Start
                  </Text>
                  <Ionicons
                    name="arrow-up-outline"
                    size={16}
                    color={colorTheme.text}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => onPressNavigate?.(data)}
              >
                <Ionicons
                  name="navigate-outline"
                  size={15}
                  color={colorTheme.text}
                />
                {routeLoading ? (
                  <ActivityIndicator />
                ) : (
                  <Text style={styles.actionText}>Navigate</Text>
                )}
              </TouchableOpacity>
            )}
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
      bottom: 40,
      justifyContent: "flex-end",
    },
    popupContainer: {
      backgroundColor: colorTheme.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "rgba(150,150,150,0.15)",
      padding: 16,
      marginBottom: 80,
      marginHorizontal: 20,
      right: -5,
      elevation: 0,
      shadowOpacity: 0,
    },
    branchesOverlay: {
      position: "absolute",
      bottom: 40,
      left: 10,
      right: 0,
      padding: 10,
      justifyContent: "flex-end",
    },
    branchesPopupContainer: {
      backgroundColor: colorTheme.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "rgba(150,150,150,0.15)",
      padding: 16,
      marginBottom: 70,
      marginHorizontal: 20,
      elevation: 0,
      right: -15,
      shadowOpacity: 0,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
      paddingRight: 24,
    },
    title: {
      color: colorTheme.title,
      fontSize: 16,
      fontWeight: "500",
      flex: 1,
      marginRight: 8,
    },
    ratingBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
    },
    ratingText: {
      color: colorTheme.text,
      fontWeight: "500",
      fontSize: 13,
    },
    divider: {
      height: 1,
      backgroundColor: "rgba(150,150,150,0.1)",
      marginBottom: 12,
    },
    infoList: {
      flexDirection: "column",
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    iconBox: {
      width: 20,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 8,
    },
    infoText: {
      color: colorTheme.text,
      fontSize: 13,
      fontWeight: "400",
      flex: 1,
    },
    closeButton: {
      position: "absolute",
      top: 14,
      right: 14,
      zIndex: 10,
    },
    actionRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: "rgba(150,150,150,0.1)",
      gap: 16,
    },
    actionBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    actionText: {
      color: colorTheme.text,
      fontSize: 13,
      fontWeight: "500",
    },
    destRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
  });
