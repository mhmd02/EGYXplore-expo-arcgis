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
import { trips } from "../../../constants/trips";
import { ThemeContext } from "../../../context/ThemeContext";
import { ContentContext } from "../../../context/ContentContext";
import ThemedView from "../../../components/ThemedView";
import ThemedText from "../../../components/ThemedText";
import Card from "../../../components/Card";
import ThemedButton from "../../../components/ThemedButton";
import CustomThemedLoader from "../../../components/CustomThemedLoader";
import FilterChips from "../../../components/FilterChips";
import { useTabBarClearance } from "../../../constants/layout";

export default function Trips() {
  const { theme, setTheme } = useContext(ThemeContext);
  const { destinations, loading, error } = useContext(ContentContext);
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [addedTripIds, setAddedTripIds] = useState([]);

  const tabBarClearance = useTabBarClearance();
  const colorTheme = Colors[theme] ?? Colors.light;

  const toggleAddTrip = (id) => {
    setAddedTripIds((prevIds) =>
      prevIds.includes(id)
        ? prevIds.filter((tripId) => tripId !== id)
        : [...prevIds, id],
    );
  };

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
        <ThemedText style={styles.statusText}>
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
        <ThemedText style={styles.statusText}>
          No destinations available right now.
        </ThemedText>
      </ThemedView>
    );
  }

  const renderItems = ({ item }) => {
    const isAdded = addedTripIds.includes(item.id);

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
            {item.description}
          </ThemedText>
        </View>
        <View style={styles.cardTopRow}>
          {item.rating && (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={13} color="#D4AF37" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          )}
          <ThemedView style={styles.statusContainer}>
            <ThemedText style={styles.statusText}>{item.status}</ThemedText>
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
            onPress={() => toggleAddTrip(item.id)}
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
          paddingBottom: tabBarClearance,
        },
      ]}
    >
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <ThemedText
            title={true}
            style={[styles.header, { transform: [{ translateY: -4 }] }]}
          >
            Sanctuaries
          </ThemedText>

          <View style={styles.iconButtonContainer}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="locate-outline" size={20} color="#fff" />
            </TouchableOpacity>

            {/* AI Icon */}
            <TouchableOpacity
              style={[styles.iconBtn, styles.aiBtn]}
              onPress={() => router.push("/trips/ai")}
            >
              <Ionicons name="eye-outline" size={20} color="#fff" />
              <Text style={[styles.iconBtnText, { color: "#fff" }]}>AI</Text>
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
          contentContainerStyle={styles.list}
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
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  centered: {
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
    paddingBottom: 5,
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
  statusText: {
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
    flexDirection: "row",
    gap: 4,
    padding: 12,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
  },
});
