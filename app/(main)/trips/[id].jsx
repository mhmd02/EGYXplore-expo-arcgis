import {
  Image,
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  Linking,
  useWindowDimensions,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";

import { ThemeContext } from "../../../context/ThemeContext";
import { useUser } from "../../../context/UserContext";
import { useTripDraft } from "../../../context/TripDraftContext";
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
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [failedImageUrls, setFailedImageUrls] = useState(() => new Set());
  const { token } = useUser();
  const { isInDraft, toggleDraft, draftCount } = useTripDraft();
  const { id } = useLocalSearchParams();
  const destinationId = Array.isArray(id) ? id[0] : id;
  const { width: windowWidth } = useWindowDimensions();
  const galleryWidth = Math.max(windowWidth - 32, 1);

  const tabBarClearance = useTabBarClearance();
  const { theme } = useContext(ThemeContext);
  const colorTheme = Colors[theme] ?? Colors.light;

  useEffect(() => {
    let isActive = true;

    async function loadDestination() {
      try {
        const numericId = Number(destinationId);

        if (!Number.isInteger(numericId) || numericId <= 0) {
          throw new Error("Invalid destination ID.");
        }

        const data = await getDestinationDetails(token, numericId);
        if (isActive) setDestinationDetails(data);
      } catch (err) {
        if (isActive) {
          setError(err instanceof Error ? err.message : String(err));
        }
      }
    }

    if (!token) {
      setError("Please sign in to view destination details.");
    } else if (destinationId) {
      setError(null);
      setDestinationDetails(null);
      setActiveImageIndex(0);
      setFailedImageUrls(new Set());
      loadDestination();
    } else {
      setError("Destination ID is missing.");
    }

    return () => {
      isActive = false;
    };
  }, [destinationId, token]);

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

  if (!destinationDetails) {
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

  const imageUrls = [
    ...new Set(
      (Array.isArray(destinationDetails.images)
        ? destinationDetails.images
        : []
      )
        .filter((url) => typeof url === "string")
        .map((url) => url.trim())
        .filter((url) => url && !/^(null|n\/a)$/i.test(url)),
    ),
  ];
  const rawBookingUrl = destinationDetails.bookingUrl?.trim();
  const hasBookingUrl = rawBookingUrl && !/^(null|n\/a)$/i.test(rawBookingUrl);
  const bookingUrl = hasBookingUrl
    ? /^https?:\/\//i.test(rawBookingUrl)
      ? rawBookingUrl
      : `https://${rawBookingUrl}`
    : null;
  const openingHours =
    destinationDetails.openAt != null && destinationDetails.closeAt != null
      ? `${destinationDetails.openAt} - ${destinationDetails.closeAt}`
      : "Not specified";
  const entryPrice =
    destinationDetails.foreignPrice ?? destinationDetails.ticketPrice;
  const destinationIsInDraft = isInDraft(destinationDetails.id);

  async function openBookingUrl() {
    if (!bookingUrl) return;

    try {
      await Linking.openURL(bookingUrl);
    } catch {
      Alert.alert(
        "Cannot open link",
        "The booking URL is invalid or unavailable.",
      );
    }
  }

  function markImageAsFailed(url) {
    setFailedImageUrls((currentUrls) => {
      const nextUrls = new Set(currentUrls);
      nextUrls.add(url);
      return nextUrls;
    });
  }

  function renderImage({ item, index }) {
    if (failedImageUrls.has(item)) {
      return (
        <View
          style={[styles.image, styles.fallbackImage, { width: galleryWidth }]}
        >
          <Ionicons
            name="image-outline"
            size={40}
            color={colorTheme.text ?? "#888"}
          />
          <ThemedText style={styles.fallbackText}>Image unavailable</ThemedText>
        </View>
      );
    }

    return (
      <Image
        source={{ uri: proxiedImageUrl(item) }}
        style={[styles.image, { width: galleryWidth }]}
        onError={() => markImageAsFailed(item)}
        accessibilityLabel={`${destinationDetails.name} photo ${index + 1}`}
      />
    );
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
        {/* Destination photo gallery */}
        <View style={styles.imageContainer}>
          {imageUrls.length > 0 ? (
            <FlatList
              key={galleryWidth}
              data={imageUrls}
              horizontal
              pagingEnabled
              bounces={false}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(url) => url}
              renderItem={renderImage}
              getItemLayout={(_, index) => ({
                length: galleryWidth,
                offset: galleryWidth * index,
                index,
              })}
              onMomentumScrollEnd={(event) => {
                const nextIndex = Math.round(
                  event.nativeEvent.contentOffset.x / galleryWidth,
                );
                setActiveImageIndex(nextIndex);
              }}
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

          {imageUrls.length > 1 && (
            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>
                {activeImageIndex + 1} / {imageUrls.length}
              </Text>
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

          <TouchableOpacity
            style={[
              styles.itineraryButton,
              destinationIsInDraft && styles.itineraryButtonAdded,
            ]}
            onPress={() => toggleDraft(destinationDetails.id)}
            accessibilityRole="button"
            accessibilityLabel={`${destinationIsInDraft ? "Remove" : "Add"} ${destinationDetails.name} ${destinationIsInDraft ? "from" : "to"} itinerary`}
          >
            <Ionicons
              name={
                destinationIsInDraft ? "checkmark-circle" : "add-circle-outline"
              }
              size={20}
              color={destinationIsInDraft ? Colors.success : Colors.primary}
            />
            <ThemedText style={styles.itineraryButtonText}>
              {destinationIsInDraft ? "Added to Itinerary" : "Add to Itinerary"}
            </ThemedText>
            {draftCount > 0 && (
              <Text style={styles.itineraryCount}>{draftCount}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={16} color="#D4AF37" />
              <ThemedText style={styles.statText}>
                {destinationDetails.rating != null
                  ? `${destinationDetails.rating} / 5`
                  : "Not rated"}
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
            {bookingUrl && (
              <TouchableOpacity
                style={styles.statItem}
                onPress={openBookingUrl}
                accessibilityRole="link"
                accessibilityLabel={`Book tickets for ${destinationDetails.name}`}
              >
                <Ionicons
                  name="open-outline"
                  size={16}
                  color="#D4AF37"
                />
                <ThemedText title={true} style={styles.booking}>
                  Booking Link
                </ThemedText>
              </TouchableOpacity>
            )}
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
            <ThemedText style={styles.cardValue}>{openingHours}</ThemedText>
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
              {entryPrice != null && entryPrice > 0
                ? `${entryPrice} EGP`
                : entryPrice === 0
                  ? "Free"
                  : "Not specified"}
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
    borderRadius: 24,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 280,
    resizeMode: "cover",
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
  imageCounter: {
    position: "absolute",
    right: 14,
    bottom: 14,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
  },
  imageCounterText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
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
    flexWrap: "wrap",
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
  itineraryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  itineraryButtonAdded: {
    borderColor: Colors.success,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  itineraryButtonText: {
    fontWeight: "700",
  },
  itineraryCount: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  booking: {
    fontSize: 14,
    fontWeight: "600",
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    opacity: 0.85,
  },
});
