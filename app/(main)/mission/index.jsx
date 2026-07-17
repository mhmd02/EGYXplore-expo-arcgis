import { useContext, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import ThemedView from "../../../components/ThemedView";
import ThemedText from "../../../components/ThemedText";
import Card from "../../../components/Card";
import FilterChips from "../../../components/FilterChips";
import { Colors } from "../../../constants/Colors";
import { ThemeContext } from "../../../context/ThemeContext";
import { MISSION_TYPES, MISSIONS } from "../../../constants/missions";
import { useProgress } from "../../../context/ProgressContext";
import { useTabBarClearance } from "../../../constants/layout";

export default function Missions() {
  const router = useRouter();
  const { theme } = useContext(ThemeContext);
  const colorTheme = Colors[theme] || Colors.light;
  const { isCompleted } = useProgress();
  const [selectedType, setSelectedType] = useState("All");
  const tabBarClearance = useTabBarClearance();
  const visibleMissions = (
    selectedType === "All"
      ? [...MISSIONS]
      : MISSIONS.filter((m) => m.type === selectedType)
  ).sort((a, b) => {
    // Completed missions sink to the bottom
    return isCompleted(a.id) - isCompleted(b.id);
  });

  return (
    <ThemedView safe={true} style={styles.container}>
      <ThemedText title={true} style={styles.header}>
        Missions
      </ThemedText>
      {/* Mission type filter chips */}
      <FilterChips
        options={MISSION_TYPES}
        selected={selectedType}
        onSelect={setSelectedType}
        style={styles.typeRow}
        contentContainerStyle={{ paddingLeft: 16 }}
      />

      {/* Mission cards */}
      <ScrollView
        style={[styles.list, { marginBottom: tabBarClearance }]}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {visibleMissions.map((mission) => {
          const done = isCompleted(mission.id);
          return (
            <Card key={mission.id} style={styles.card}>
              <View style={styles.cardInfo}>
                <Text style={[styles.cardName, { color: colorTheme.title }]}>
                  {mission.name}
                </Text>
                <Text style={styles.cardPoints}>⭐ {mission.points} pts</Text>
              </View>

              {done ? (
                <View style={styles.doneBadge}>
                  <Text style={styles.doneBadgeText}>✓ Done</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.goButton}
                  onPress={() => router.push(`/mission/${mission.id}`)}
                >
                  <Text style={styles.goButtonText}>Go</Text>
                </TouchableOpacity>
              )}
            </Card>
          );
        })}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontSize: 32, // Slightly larger for a nice header look
    fontWeight: "800",
    marginTop: 10, // Pushes it down from the top edge so it doesn't clip
    marginBottom: 8,
    paddingHorizontal: 16, // Aligns it with the start of the cards
  },
  // Filter chips row (chip visuals live in FilterChips)
  typeRow: {
    marginTop: 16,
    marginBottom: 16,
  },
  // Card list
  list: {
    flex: 1,
  },
  listContent: {
    gap: 12,
    paddingBottom: 24,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
  },
  cardInfo: {
    flex: 1,
    marginRight: 12,
  },
  cardName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  cardPoints: {
    fontSize: 13,
    color: Colors.accent, // warm "sun" gold — great for star/points
    fontWeight: "600",
  },
  goButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  goButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  doneBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.success,
    backgroundColor: "rgba(16, 185, 129, 0.12)", // translucent success
  },
  doneBadgeText: {
    color: Colors.success,
    fontWeight: "700",
  },
});
