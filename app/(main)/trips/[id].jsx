import { Image, Text, View, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";

import { ThemeContext } from "../../../context/ThemeContext";
import { useUser } from "../../../context/UserContext";
import { getDestinationDetails } from "../../../api/contentApi";
import { Colors } from "../../../constants/Colors";

import ThemedText from "../../../components/ThemedText";
import ThemedView from "../../../components/ThemedView";
import ThemedCard from "../../../components/ThemedCard";
import CustomThemedLoader from "../../../components/CustomThemedLoader";
import { useTabBarClearance } from "../../../constants/layout";

export default function TripDetail() {
  const [destinationDetails, setDestinationDetails] = useState(null);
  const [error, setError] = useState(null);
  const { token } = useUser();
  const { id } = useLocalSearchParams();

  const tabBarClearance = useTabBarClearance();
  const { theme } = useContext(ThemeContext);
  const colorTheme = Colors[theme] ?? Colors.light;

  useEffect(() => {
    async function loadDestination() {
      try {
        const data = await getDestinationDetails(token, id);
        setDestinationDetails(data);
        console.log("RAW IMAGE:", JSON.stringify(data.image));
      } catch (err) {
        setError(err.message);
      }
    }
    if (token && id) loadDestination();
  }, [id, token]);

  if (error) {
    return (
      <ThemedView safe={true} style={[styles.container, styles.centered]}>
        <ThemedText style={styles.statusText}>
          Something went wrong loading destinations.
        </ThemedText>
        <Text style={styles.errorDetail}>{String(error)}</Text>
      </ThemedView>
    );
  }

  if (!destinationDetails || !token || !id) {
    return (
      <ThemedView safe={true} style={[styles.container, styles.centered]}>
        <CustomThemedLoader />
      </ThemedView>
    );
  }

  function proxiedImageUrl(url) {
    if (!url) return null;
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}`;
  }

  return (
    <ThemedView safe={true} style={[styles.container, { paddingTop: 0 }]}>
      <ScrollView
        style={[
          styles.container,
          {
            backgroundColor: colorTheme.background,
          },
        ]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabBarClearance },
        ]}
      >
        {/* Hero Image with Robust Error & Null Handling */}
        <View style={styles.imageContainer}>
          {destinationDetails.image && destinationDetails.image !== "null" ? (
            <Image
              source={{ uri: proxiedImageUrl(destinationDetails.image) }}
              style={styles.image}
              onError={(e) =>
                console.log("IMAGE LOAD ERROR:", e.nativeEvent.error)
              }
            />
          ) : (
            <View style={[styles.image, styles.fallbackImage]}>
              <Ionicons
                name="image-outline"
                size={40}
                color={colorTheme.text ?? "#888"}
              />
              <ThemedText style={styles.fallbackText}>
                No Image Available
              </ThemedText>
            </View>
          )}

          {destinationDetails.status && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusTextBadge}>
                {destinationDetails.status}
              </Text>
            </View>
          )}
        </View>

        {/* Header Info */}
        <View style={styles.headerSection}>
          <ThemedText title={true} style={styles.title}>
            {destinationDetails.name}
          </ThemedText>

          <View style={styles.locationRow}>
            <Ionicons
              name="location-outline"
              size={18}
              color={Colors.primary ?? "#D4AF37"}
            />
            <ThemedText style={styles.cityText}>
              {destinationDetails.city}
            </ThemedText>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={16} color="#D4AF37" />
              <ThemedText style={styles.statText}>
                {destinationDetails.rating} / 5
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <Ionicons
                name="people-outline"
                size={16}
                color={Colors.primary ?? "#D4AF37"}
              />
              <ThemedText style={styles.statText}>
                {destinationDetails.visitors} Visitors
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Quick Info Cards */}
        <View style={styles.cardContainer}>
          <ThemedCard style={styles.card}>
            <Ionicons
              name="time-outline"
              size={24}
              color="#D4AF37"
              style={styles.cardIcon}
            />
            <ThemedText style={styles.cardValue}>
              {destinationDetails.openHour || "Not specified"}
            </ThemedText>
            <ThemedText style={styles.cardLabel}>Opening Hours</ThemedText>
          </ThemedCard>

          <ThemedCard style={styles.card}>
            <Ionicons
              name="ticket-outline"
              size={24}
              color="#D4AF37"
              style={styles.cardIcon}
            />
            <ThemedText style={styles.cardValue}>
              {destinationDetails.ticketPrice
                ? `${destinationDetails.ticketPrice} EGP`
                : "Free"}
            </ThemedText>
            <ThemedText style={styles.cardLabel}>Entry Fee</ThemedText>
          </ThemedCard>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <ThemedText title={true} style={styles.sectionTitle}>
            About
          </ThemedText>
          <ThemedText style={styles.description}>
            {destinationDetails.description || "No description provided."}
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    textAlign: "center",
  },
  errorDetail: {
    fontSize: 13,
    color: Colors.danger ?? "#DC2626",
    marginTop: 6,
    textAlign: "center",
  },
  imageContainer: {
    position: "relative",
    marginBottom: 20,
  },
  image: {
    width: "100%",
    height: 280,
    resizeMode: "cover",
    borderRadius: 24,
  },
  fallbackImage: {
    backgroundColor: "rgba(0,0,0,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  fallbackText: {
    marginTop: 8,
    opacity: 0.6,
  },
  statusBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#0285c7c7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusTextBadge: {
    color: Colors.accent,
    fontWeight: "700",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  headerSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  cityText: {
    fontSize: 16,
    opacity: 0.8,
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statText: {
    fontSize: 14,
    fontWeight: "600",
  },
  cardContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 24,
  },
  card: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
  },
  cardIcon: {
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 4,
    textAlign: "center",
  },
  cardLabel: {
    fontSize: 12,
    opacity: 0.6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    opacity: 0.85,
  },
});
