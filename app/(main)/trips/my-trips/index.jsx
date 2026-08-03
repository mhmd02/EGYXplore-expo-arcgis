import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCallback, useContext, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Colors } from "../../../../constants/Colors";
import { ThemeContext } from "../../../../context/ThemeContext";
import { useTripDraft } from "../../../../context/TripDraftContext";
import ThemedView from "../../../../components/ThemedView";
import ThemedText from "../../../../components/ThemedText";
import ThemedButton from "../../../../components/ThemedButton";
import Card from "../../../../components/Card";
import CustomThemedLoader from "../../../../components/CustomThemedLoader";
import Spacer from "../../../../components/Spacer";
import { useTabBarClearance } from "../../../../constants/layout";

const formatRange = (start, end) => {
  const from = new Date(start);
  const to = new Date(end);
  const options = { month: "short", day: "numeric" };
  const sameYear = from.getFullYear() === to.getFullYear();
  return `${from.toLocaleDateString(undefined, options)} – ${to.toLocaleDateString(
    undefined,
    sameYear ? options : { ...options, year: "numeric" },
  )}${sameYear ? `, ${to.getFullYear()}` : ""}`;
};

const statusColor = (status) => {
  if (status === "Completed") return Colors.success;
  if (status === "Draft") return Colors.accent;
  return Colors.primary;
};

export default function MyTrips() {
  const router = useRouter();
  const { theme } = useContext(ThemeContext);
  const colorTheme = Colors[theme] ?? Colors.light;
  const styles = useMemo(() => createStyles(colorTheme), [colorTheme]);
  const tabBarClearance = useTabBarClearance();

  const { savedTrips, loading, error, refreshTrips } = useTripDraft();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshTrips();
    } catch (err) {
      console.log(err);
    } finally {
      setRefreshing(false);
    }
  }, [refreshTrips]);

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <CustomThemedLoader />
        <ThemedText style={styles.statusText}>Loading your trips...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ThemedText style={styles.statusText}>
          Something went wrong loading your trips.
        </ThemedText>
        <Text style={styles.errorDetail}>{String(error)}</Text>
        <Spacer height={16} />
        <ThemedButton onPress={onRefresh}>
          <Text style={styles.primaryButtonText}>Try again</Text>
        </ThemedButton>
      </ThemedView>
    );
  }

  if (!savedTrips || savedTrips.length === 0) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <Ionicons name="albums-outline" size={48} color={colorTheme.placeholder} />
        <Spacer height={12} />
        <ThemedText title={true} style={styles.emptyTitle}>
          No trips yet
        </ThemedText>
        <ThemedText style={styles.emptyBody}>
          Add destinations to your itinerary and save your first trip.
        </ThemedText>
        <Spacer height={16} />
        <ThemedButton onPress={() => router.replace("/trips")}>
          <Text style={styles.primaryButtonText}>Browse destinations</Text>
        </ThemedButton>
      </ThemedView>
    );
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => router.push(`/trips/my-trips/${item.id}`)}
      activeOpacity={0.85}
    >
      <Card style={styles.card} variant="pharaonic">
        <View style={styles.cardHeader}>
          <ThemedText style={styles.title} title={true} numberOfLines={1}>
            {item.title}
          </ThemedText>
          <View
            style={[
              styles.statusContainer,
              { borderColor: statusColor(item.status) },
            ]}
          >
            <Text style={[styles.badgeText, { color: statusColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Ionicons
            name="calendar-outline"
            size={14}
            color={colorTheme.placeholder}
          />
          <ThemedText style={styles.metaText}>
            {formatRange(item.startDate, item.endDate)}
          </ThemedText>
        </View>

        <View style={styles.metaRow}>
          <Ionicons
            name="location-outline"
            size={14}
            color={colorTheme.placeholder}
          />
          <ThemedText style={styles.metaText}>
            {item.stopCount} {item.stopCount === 1 ? "stop" : "stops"}
          </ThemedText>
          {item.companions != null && (
            <>
              <Ionicons
                name="people-outline"
                size={14}
                color={colorTheme.placeholder}
                style={{ marginLeft: 10 }}
              />
              <ThemedText style={styles.metaText}>
                {item.companions}
              </ThemedText>
            </>
          )}
          {item.budget != null && (
            <>
              <Ionicons
                name="wallet-outline"
                size={14}
                color={colorTheme.placeholder}
                style={{ marginLeft: 10 }}
              />
              <ThemedText style={styles.metaText}>{item.budget}</ThemedText>
            </>
          )}
        </View>

        <View style={styles.cardFooter}>
          <ThemedText style={styles.detailsLink}>View details</ThemedText>
          <Ionicons name="arrow-forward" size={16} color={Colors.accent} />
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={savedTrips}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: tabBarClearance },
        ]}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
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
    list: {
      paddingTop: 16,
      paddingHorizontal: 16,
    },
    card: {
      marginBottom: 12,
      padding: 16,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      marginBottom: 10,
    },
    title: {
      flex: 1,
      fontSize: 18,
      fontWeight: "800",
      color: "#D4AF37",
      letterSpacing: 0.3,
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
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 6,
    },
    metaText: {
      fontSize: 13,
    },
    cardFooter: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 6,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: "rgba(212, 175, 55, 0.2)",
    },
    detailsLink: {
      color: Colors.accent,
      fontWeight: "600",
      fontSize: 13,
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
      marginTop: 6,
      textAlign: "center",
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "800",
    },
    emptyBody: {
      fontSize: 14,
      textAlign: "center",
      marginTop: 6,
      lineHeight: 20,
    },
    primaryButtonText: {
      color: "#f2f2f2",
      textAlign: "center",
      fontWeight: "700",
    },
  });
