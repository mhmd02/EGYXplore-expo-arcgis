import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useContext, useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Colors } from "../../../../constants/Colors";
import { ThemeContext } from "../../../../context/ThemeContext";
import { useUser } from "../../../../context/UserContext";
import { useTripDraft } from "../../../../context/TripDraftContext";
import { ContentContext } from "../../../../context/ContentContext";
import {
  getTripById,
  updateTripDestinationsApi,
} from "../../../../api/tripApi";
import ThemedView from "../../../../components/ThemedView";
import ThemedText from "../../../../components/ThemedText";
import ThemedButton from "../../../../components/ThemedButton";
import Card from "../../../../components/Card";
import CustomThemedLoader from "../../../../components/CustomThemedLoader";
import Spacer from "../../../../components/Spacer";
import SuccessModal from "../../../../components/SuccessModal";
import { useTabBarClearance } from "../../../../constants/layout";

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const shortDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

export default function TripDetails() {
  const { tripId } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useContext(ThemeContext);
  const colorTheme = Colors[theme] ?? Colors.light;
  const styles = useMemo(() => createStyles(colorTheme), [colorTheme]);
  const tabBarClearance = useTabBarClearance();

  const { token } = useUser();
  const { completeTrip, deleteTrip, refreshTrips } = useTripDraft();
  const { destinations } = useContext(ContentContext);

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [completion, setCompletion] = useState(null);
  const [editingStops, setEditingStops] = useState(false);
  const [draftDestinationIds, setDraftDestinationIds] = useState([]);

  const numericTripId = Number(tripId);

  const editableStops = useMemo(() => {
    if (!trip) return [];

    return draftDestinationIds.map((destinationId, index) => {
      const existingStop = trip.stops?.find(
        (stop) => Number(stop.destinationId) === Number(destinationId),
      );
      if (existingStop) {
        return { ...existingStop, visitOrder: index + 1 };
      }

      const destination = destinations?.find(
        (item) => Number(item.id) === Number(destinationId),
      );
      return {
        stopId: `new-${destinationId}`,
        destinationId,
        name: destination?.name ?? "Selected destination",
        city: destination?.city ?? "",
        category: destination?.category,
        visitOrder: index + 1,
        arrivalDate: trip.startDate,
        departureDate: trip.endDate,
      };
    });
  }, [destinations, draftDestinationIds, trip]);

  const availableDestinations = (destinations ?? []).filter(
    (destination) =>
      !draftDestinationIds.some(
        (destinationId) => Number(destinationId) === Number(destination.id),
      ),
  );

  useEffect(() => {
    if (!token || !Number.isFinite(numericTripId)) return;

    let active = true;
    setLoading(true);
    setError(null);
    getTripById(token, numericTripId)
      .then((data) => {
        if (active) {
          setTrip(data);
          setDraftDestinationIds(
            (data.stops ?? []).map((stop) => stop.destinationId),
          );
        }
      })
      .catch((err) => {
        console.log(err);
        if (active) setError(err.message || "Failed to load the trip.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token, numericTripId]);

  const startEditingStops = () => {
    if (trip.status === "Completed") return;
    setActionError(null);
    setDraftDestinationIds(
      (trip.stops ?? []).map((stop) => stop.destinationId),
    );
    setEditingStops(true);
  };

  const cancelEditingStops = () => {
    setDraftDestinationIds(
      (trip.stops ?? []).map((stop) => stop.destinationId),
    );
    setActionError(null);
    setEditingStops(false);
  };

  const saveEditedStops = async () => {
    if (draftDestinationIds.length === 0) {
      setActionError("A trip must contain at least one destination.");
      return;
    }

    setActionError(null);
    setBusy(true);
    try {
      const updated = await updateTripDestinationsApi(
        token,
        numericTripId,
        draftDestinationIds,
      );
      setTrip(updated);
      await refreshTrips();
      setEditingStops(false);
    } catch (err) {
      setActionError(err.message || "Could not update the itinerary.");
    } finally {
      setBusy(false);
    }
  };

  const onComplete = async () => {
    setActionError(null);
    setBusy(true);
    try {
      const result = await completeTrip(numericTripId);
      setTrip((prev) =>
        prev ? { ...prev, status: result.status ?? "Completed" } : prev,
      );
      setCompletion(result);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      "Delete this trip?",
      "This removes the trip and its stops. It can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setActionError(null);
            setBusy(true);
            try {
              await deleteTrip(numericTripId);
              router.back();
            } catch (err) {
              setActionError(err.message);
              setBusy(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <CustomThemedLoader />
        <ThemedText style={styles.statusText}>Loading trip...</ThemedText>
      </ThemedView>
    );
  }

  if (error || !trip) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ThemedText style={styles.statusText}>
          We couldn't load this trip.
        </ThemedText>
        {error && <Text style={styles.errorDetail}>{String(error)}</Text>}
        <Spacer height={16} />
        <ThemedButton onPress={() => router.back()}>
          <Text style={styles.primaryButtonText}>Go back</Text>
        </ThemedButton>
      </ThemedView>
    );
  }

  const isCompleted = trip.status === "Completed";

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabBarClearance + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <ThemedText title={true} style={styles.header}>
            {trip.title}
          </ThemedText>
          <View
            style={[
              styles.statusContainer,
              { borderColor: isCompleted ? Colors.success : Colors.primary },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: isCompleted ? Colors.success : Colors.primary },
              ]}
            >
              {trip.status}
            </Text>
          </View>
        </View>

        <Card style={styles.summaryCard} variant="pharaonic">
          <View style={styles.summaryRow}>
            <Ionicons name="calendar-outline" size={16} color="#D4AF37" />
            <ThemedText style={styles.summaryText}>
              {formatDate(trip.startDate)} → {formatDate(trip.endDate)}
            </ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <Ionicons name="location-outline" size={16} color="#D4AF37" />
            <ThemedText style={styles.summaryText}>
              {trip.stopCount} {trip.stopCount === 1 ? "stop" : "stops"}
            </ThemedText>
          </View>
          {trip.budget != null && (
            <View style={styles.summaryRow}>
              <Ionicons name="wallet-outline" size={16} color="#D4AF37" />
              <ThemedText style={styles.summaryText}>
                Budget {trip.budget}
              </ThemedText>
            </View>
          )}
          {trip.companions != null && (
            <View style={styles.summaryRow}>
              <Ionicons name="people-outline" size={16} color="#D4AF37" />
              <ThemedText style={styles.summaryText}>
                {trip.companions}{" "}
                {trip.companions === 1 ? "traveller" : "travellers"}
              </ThemedText>
            </View>
          )}
        </Card>

        <Spacer height={20} />
        <ThemedText title={true} style={styles.sectionTitle}>
          Itinerary
        </ThemedText>
        {!isCompleted && (
          <View style={styles.editActions}>
            {editingStops ? (
              <>
                <TouchableOpacity
                  style={styles.secondaryAction}
                  onPress={cancelEditingStops}
                  disabled={busy}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel itinerary editing"
                >
                  <Ionicons name="close-outline" size={16} color={colorTheme.text} />
                  <Text style={[styles.secondaryActionText, { color: colorTheme.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.primaryAction}
                  onPress={saveEditedStops}
                  disabled={busy}
                  accessibilityRole="button"
                  accessibilityLabel="Save itinerary changes"
                >
                  <Ionicons name="checkmark-outline" size={16} color="#fff" />
                  <Text style={styles.primaryActionText}>{busy ? "Saving..." : "Save changes"}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.secondaryAction}
                onPress={startEditingStops}
                accessibilityRole="button"
                accessibilityLabel="Edit itinerary destinations"
              >
                <Ionicons name="create-outline" size={16} color={Colors.primary} />
                <Text style={styles.secondaryActionText}>Edit itinerary</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        <Spacer height={10} />

        {editingStops && (
          <View style={styles.addDestinationsSection}>
            <ThemedText style={styles.addDestinationsLabel}>
              Add destinations
            </ThemedText>
            <View style={styles.availableDestinations}>
              {availableDestinations.length > 0 ? (
                availableDestinations.map((destination) => (
                  <TouchableOpacity
                    key={destination.id}
                    style={styles.destinationOption}
                    onPress={() =>
                      setDraftDestinationIds((current) => [
                        ...current,
                        destination.id,
                      ])
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`Add ${destination.name} to itinerary`}
                  >
                    <Ionicons name="add" size={16} color={Colors.primary} />
                    <Text style={styles.destinationOptionText}>
                      {destination.name}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <ThemedText style={styles.noDestinationsText}>
                  All available destinations are already selected.
                </ThemedText>
              )}
            </View>
          </View>
        )}

        {editableStops.map((stop) => (
          <Card key={stop.stopId} style={styles.stopCard} variant="pharaonic">
            <View style={styles.stopRow}>
              <View style={styles.orderBadge}>
                <Text style={styles.orderBadgeText}>{stop.visitOrder}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.stopName} title={true}>
                  {stop.name}
                </ThemedText>
                <ThemedText style={styles.stopMeta}>
                  {[stop.city, stop.category].filter(Boolean).join(" · ")}
                </ThemedText>
                <ThemedText style={styles.stopDates}>
                  {shortDate(stop.arrivalDate)} – {shortDate(stop.departureDate)}
                </ThemedText>
              </View>
              {editingStops && (
                <TouchableOpacity
                  style={styles.removeStopButton}
                  onPress={() =>
                    setDraftDestinationIds((current) =>
                      current.filter(
                        (destinationId) =>
                          Number(destinationId) !== Number(stop.destinationId),
                      ),
                    )
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${stop.name} from itinerary`}
                >
                  <Ionicons name="trash-outline" size={18} color={Colors.warning} />
                </TouchableOpacity>
              )}
            </View>
          </Card>
        ))}

        <Spacer height={20} />
        {actionError && <Text style={styles.errorDetail}>{actionError}</Text>}

        {!isCompleted && (
          <ThemedButton
            onPress={onComplete}
            disabled={busy}
            style={[styles.completeButton, busy && styles.buttonDisabled]}
          >
            <Text style={styles.primaryButtonText}>
              {busy ? "Working..." : "Mark completed"}
            </Text>
          </ThemedButton>
        )}

        <ThemedButton
          onPress={confirmDelete}
          disabled={busy}
          style={[styles.deleteButton, busy && styles.buttonDisabled]}
        >
          <Text style={styles.deleteButtonText}>Delete trip</Text>
        </ThemedButton>
      </ScrollView>

      <SuccessModal
        visible={completion !== null}
        onRequestClose={() => setCompletion(null)}
        emoji="🏆"
        title="Trip completed"
      >
        <ThemedText style={styles.modalBody}>
          You earned +{completion?.xpAdded ?? 0} XP.
        </ThemedText>
        {completion?.newBadges?.length ? (
          <ThemedText style={styles.modalBody}>
            New badge: {completion.newBadges.map((b) => b.name).join(", ")}
          </ThemedText>
        ) : null}
        <Spacer height={16} />
        <ThemedButton
          style={styles.modalButton}
          onPress={() => setCompletion(null)}
        >
          <Text style={styles.primaryButtonText}>Nice</Text>
        </ThemedButton>
      </SuccessModal>
    </ThemedView>
  );
}

const createStyles = (colorTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorTheme.background,
    },
    centered: {
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 40,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      marginBottom: 14,
    },
    header: {
      flex: 1,
      fontSize: 24,
      fontWeight: "800",
    },
    statusContainer: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
      borderWidth: 1,
    },
    badgeText: {
      fontSize: 10,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    summaryCard: {
      padding: 16,
      gap: 10,
    },
    summaryRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    summaryText: {
      fontSize: 14,
      fontWeight: "600",
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "800",
      letterSpacing: 0.3,
    },
    editActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 8,
      marginTop: 10,
    },
    primaryAction: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: Colors.primary,
    },
    primaryActionText: {
      color: "#fff",
      fontSize: 12,
      fontWeight: "700",
    },
    secondaryAction: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: Colors.primary,
    },
    secondaryActionText: {
      color: Colors.primary,
      fontSize: 12,
      fontWeight: "700",
    },
    addDestinationsSection: {
      marginBottom: 12,
      padding: 12,
      borderRadius: 12,
      backgroundColor: colorTheme.uiBackground,
      borderWidth: 1,
      borderColor: colorTheme.border,
    },
    addDestinationsLabel: {
      fontSize: 13,
      fontWeight: "700",
      marginBottom: 8,
    },
    availableDestinations: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    destinationOption: {
      flexDirection: "row",
      alignItems: "center",
      maxWidth: "100%",
      paddingHorizontal: 9,
      paddingVertical: 7,
      borderRadius: 9,
      backgroundColor: "rgba(2, 132, 199, 0.1)",
    },
    destinationOptionText: {
      flexShrink: 1,
      color: Colors.primary,
      fontSize: 12,
      fontWeight: "600",
    },
    noDestinationsText: {
      fontSize: 12,
    },
    stopCard: {
      marginBottom: 10,
      padding: 14,
    },
    stopRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    orderBadge: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(212, 175, 55, 0.15)",
      borderWidth: 1,
      borderColor: "rgba(212, 175, 55, 0.4)",
    },
    orderBadgeText: {
      color: "#D4AF37",
      fontWeight: "800",
      fontSize: 13,
    },
    stopName: {
      fontSize: 16,
      fontWeight: "700",
      color: "#D4AF37",
    },
    stopMeta: {
      fontSize: 12,
      marginTop: 2,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    stopDates: {
      fontSize: 12,
      marginTop: 4,
    },
    removeStopButton: {
      padding: 8,
      borderRadius: 10,
      backgroundColor: "rgba(239, 68, 68, 0.1)",
    },
    completeButton: {
      paddingVertical: 16,
      borderRadius: 12,
      backgroundColor: Colors.success,
    },
    deleteButton: {
      paddingVertical: 16,
      borderRadius: 12,
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: Colors.warning,
    },
    deleteButtonText: {
      color: Colors.warning,
      textAlign: "center",
      fontWeight: "700",
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    primaryButtonText: {
      color: "#f2f2f2",
      textAlign: "center",
      fontWeight: "700",
    },
    statusText: {
      fontSize: 16,
      fontWeight: "600",
      marginTop: 12,
      textAlign: "center",
    },
    errorDetail: {
      fontSize: 13,
      color: Colors.warning,
      marginBottom: 10,
      textAlign: "center",
    },
    modalBody: {
      fontSize: 14,
      textAlign: "center",
    },
    modalButton: {
      alignSelf: "stretch",
      paddingVertical: 14,
      borderRadius: 12,
    },
  });
