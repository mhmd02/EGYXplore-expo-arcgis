import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useContext, useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Colors } from "../../../../constants/Colors";
import { ThemeContext } from "../../../../context/ThemeContext";
import { useUser } from "../../../../context/UserContext";
import { useTripDraft } from "../../../../context/TripDraftContext";
import { getTripById } from "../../../../api/tripApi";
import ThemedView from "../../../../components/ThemedView";
import ThemedText from "../../../../components/ThemedText";
import ThemedButton from "../../../../components/ThemedButton";
import Card from "../../../../components/Card";
import CustomThemedLoader from "../../../../components/CustomThemedLoader";
import Spacer from "../../../../components/Spacer";
import SuccessModal from "../../../../components/SuccessModal";

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

  const { token } = useUser();
  const { completeTrip, deleteTrip } = useTripDraft();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [completion, setCompletion] = useState(null);

  const numericTripId = Number(tripId);

  useEffect(() => {
    if (!token || !Number.isFinite(numericTripId)) return;

    let active = true;
    setLoading(true);
    setError(null);
    getTripById(token, numericTripId)
      .then((data) => {
        if (active) setTrip(data);
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
        contentContainerStyle={styles.scrollContent}
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
        <Spacer height={10} />

        {trip.stops?.map((stop) => (
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
