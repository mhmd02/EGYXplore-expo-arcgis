import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from "react-native";
import { useContext, useState, useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "../../../constants/Colors";
import { ThemeContext } from "../../../context/ThemeContext";
import { ContentContext } from "../../../context/ContentContext";
import { useTripDraft } from "../../../context/TripDraftContext";
import ThemedView from "../../../components/ThemedView";
import ThemedText from "../../../components/ThemedText";
import Card from "../../../components/Card";
import CustomThemedLoader from "../../../components/CustomThemedLoader";
import FilterChips from "../../../components/FilterChips";
import { useTabBarClearance } from "../../../constants/layout";

export default function Trips() {
  const { theme, setTheme } = useContext(ThemeContext);
  const { destinations, loading, error } = useContext(ContentContext);
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { isInDraft, toggleDraft, draftCount } = useTripDraft();

  const tabBarClearance = useTabBarClearance();
  const colorTheme = Colors[theme] ?? Colors.light;

  const destinationsTypes = useMemo(() => {
    if (loading || !destinations) return [];
    const uniqueTypes = [...new Set(destinations.map((dest) => dest.category))];
    return uniqueTypes;
  }, [destinations, loading]);

  const visibleTrips = useMemo(() => {
    if (loading || !destinations) return [];
    return selectedCategory === "All"
      ? [...destinations]
      : destinations.filter((dest) => dest.category === selectedCategory);
  }, [loading, destinations, selectedCategory]);

  if (loading) {
    return (
      <ThemedView safe={true} style={[styles.container, styles.centered]}>
        <CustomThemedLoader />
        <ThemedText style={styles.loadingText}>
          Loading destinations...
        </ThemedText>
      </ThemedView>
    );
  }
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
  if (!destinations || destinations.length === 0) {
    return (
      <ThemedView safe={true} style={[styles.container, styles.centered]}>
        <ThemedText style={styles.badgeText}>
          No destinations available right now.
        </ThemedText>
      </ThemedView>
    );
  }

  const renderItems = ({ item }) => {
    const isAdded = isInDraft(item.id);

    return (
      <Card style={styles.card} key={item.id} variant="pharaonic">
        {/* Top Header Row: Category Badge & Rating Badge */}
        <ThemedText style={styles.title} title={true}>
          {item.name}
        </ThemedText>

        {/* Title */}

        {/* Authentic Papyrus-styled Description Box */}
        <View
          style={[
            styles.descriptionBox,
            {
              backgroundColor:
                theme === "dark"
                  ? "rgba(212, 175, 55, 0.05)"
                  : "rgba(245, 239, 230, 0.6)",
            },
          ]}
        >
          <ThemedText
            style={[styles.description, { color: colorTheme.text }]}
            numberOfLines={3}
          >
            {item.description || "No description provided."}
          </ThemedText>
        </View>
        <View style={styles.cardTopRow}>
          {item.rating != null && (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={13} color="#D4AF37" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          )}
          <ThemedView style={styles.statusContainer}>
            <ThemedText style={styles.badgeText}>{item.status}</ThemedText>
          </ThemedView>
        </View>
        {/* Card Footer: Explore Link & Action Button in Flow Layout */}
        <View style={styles.cardFooter}>
          <TouchableOpacity
            onPress={() => router.push(`/trips/${item.id}`)}
            style={styles.detailsButton}
          >
            <ThemedText style={{ color: Colors.accent, fontWeight: "600" }}>
              Explore
            </ThemedText>
            <Ionicons
              name="arrow-forward"
              size={16}
              color={Colors.accent}
              style={{ transform: [{ translateY: 1 }] }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              isAdded ? styles.done : styles.addIcon,
            ]}
            onPress={() => toggleDraft(item.id)}
          >
            <Text
              style={{
                color: isAdded ? Colors.success : "white",
                fontWeight: "700",
                fontSize: 13,
              }}
            >
              {isAdded ? "✓ Added" : "Add to Itinerary"}
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <ThemedView
      safe={true}
      style={[
        styles.container,
        {
          backgroundColor: colorTheme.background,
        },
      ]}
    >
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <ThemedText
            title={true}
            style={[styles.header, { transform: [{ translateY: -4 }] }]}
          >
            Trips
          </ThemedText>

          <View style={styles.iconButtonContainer}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => router.push("/trips/create")}
              accessibilityRole="button"
              accessibilityLabel="Create trip"
            >
              <Ionicons
                name="briefcase-outline"
                size={24}
                color={colorTheme.title}
              />
              {draftCount > 0 && (
                <View style={styles.draftCountBadge}>
                  <Text style={styles.draftCountText}>{draftCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Saved trips */}
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => router.push("/trips/my-trips")}
              accessibilityRole="button"
              accessibilityLabel="My saved trips"
            >
              <Ionicons
                name="albums-outline"
                size={24}
                color={colorTheme.title}
              />
            </TouchableOpacity>

            {/* AI Icon */}
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => router.push("/trips/ai")}
            >
              <Ionicons name="eye-outline" size={24} color={colorTheme.title} />
              <Text style={[styles.iconBtnText, { color: colorTheme.title }]}>
                AI
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <FilterChips
          options={["All", ...destinationsTypes]}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
          style={styles.typeRow}
          contentContainerStyle={{ paddingLeft: 16, paddingRight: 16 }}
        />
        <FlatList
          data={visibleTrips}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: tabBarClearance },
          ]}
          renderItem={renderItems}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    textAlign: "center",
  },
  errorDetail: {
    fontSize: 13,
    color: Colors.warning ?? "#DC2626",
    marginTop: 6,
    textAlign: "center",
  },
  header: {
    fontSize: 32,
    fontWeight: "800",
    marginTop: 10,
    marginBottom: 8,
  },
  list: {
    paddingBottom: 75,
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#D4AF37", // Pharaonic Gold Border
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignContent: "center",
    marginBottom: 8,
  },
  title: {
    fontWeight: "800",
    fontSize: 20,
    color: "#D4AF37", // Deep Royal Gold
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#D4AF37",
  },
  statusContainer: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(2, 132, 199, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  descriptionBox: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: "#D4AF37",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: "italic",
  },
  typeRow: {
    flexGrow: 0,
    minHeight: 35,
    marginTop: 16,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "rgba(212, 175, 55, 0.2)",
    paddingTop: 12,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  addIcon: {
    backgroundColor: Colors.primary,
  },
  done: {
    borderColor: Colors.success,
    borderWidth: 1,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 10,
  },
  iconButtonContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  iconBtn: {
    position: "relative",
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },
  draftCountBadge: {
    position: "absolute",
    top: -4,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    backgroundColor: Colors.danger ?? "#DC2626",
  },
  draftCountText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 10,
  },
});
