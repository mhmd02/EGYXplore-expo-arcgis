import { useContext, useState, useMemo } from "react";
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
import { useProgress } from "../../../context/ProgressContext";
import { useTabBarClearance } from "../../../constants/layout";
import { ContentContext } from "../../../context/ContentContext";
import CustomThemedLoader from "../../../components/CustomThemedLoader";
import { Ionicons } from "@expo/vector-icons";

export default function Missions() {
  const router = useRouter();
  const { theme } = useContext(ThemeContext);
  const [selectedType, setSelectedType] = useState("All");
  const {
    isCompleted,
    loading: progressLoading,
    error: progressError,
  } = useProgress();
  const {
    missions,
    error: missionsError,
    loading: missionsLoading,
  } = useContext(ContentContext);

  const error = missionsError || progressError;
  const loading = missionsLoading || progressLoading;

  const tabBarClearance = useTabBarClearance();
  const colorTheme = Colors[theme] || Colors.light;

  const missionTypes = useMemo(() => {
    if (loading || !missions) return [];
    const uniqueTypes = [...new Set(missions.map((m) => m.type))];
    return uniqueTypes;
  }, [missions, loading]);

  const visibleMissions = useMemo(() => {
    if (loading || !missions) return [];
    return (
      selectedType === "All"
        ? [...missions]
        : missions.filter((m) => m.type === selectedType)
    ).sort((a, b) => isCompleted(b.id) - isCompleted(a.id));
  }, [loading, missions, selectedType, isCompleted]);

  if (loading) {
    return (
      <ThemedView safe={true} style={[styles.container, styles.centered]}>
        <CustomThemedLoader />
        <ThemedText style={styles.statusText}>Loading missions...</ThemedText>
      </ThemedView>
    );
  }
  if (error) {
    return (
      <ThemedView safe={true} style={[styles.container, styles.centered]}>
        <ThemedText style={styles.statusText}>
          Something went wrong loading missions.
        </ThemedText>
        <Text style={styles.errorDetail}>{String(error)}</Text>
      </ThemedView>
    );
  }
  if (!missions || missions.length === 0) {
    return (
      <ThemedView safe={true} style={[styles.container, styles.centered]}>
        <ThemedText style={styles.statusText}>
          No missions available right now.
        </ThemedText>
      </ThemedView>
    );
  }
  return (
    <ThemedView
      safe={true}
      style={[styles.container, { paddingBottom: tabBarClearance }]}
    >
      <ThemedView style={styles.missionHeader}>
        <ThemedText title={true} style={styles.header}>
          Missions
        </ThemedText>
      </ThemedView>
      {/* Mission type filter chips */}
      <FilterChips
        options={["All", ...missionTypes]}
        selected={selectedType}
        onSelect={setSelectedType}
        style={styles.typeRow}
        contentContainerStyle={{ paddingLeft: 16 }}
      />

      {/* Mission cards */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {visibleMissions.map((mission) => {
          const done = isCompleted(mission.id);
          return (
            <TouchableOpacity
              onPress={() => router.push(`/mission/${mission.id}`)}
              key={mission.id}
              disabled={done}
            >
              <Card key={mission.id} style={styles.card} variant="pharaonic">
                <View style={styles.cardInfo}>
                  <Text style={[styles.cardName, { color: colorTheme.title }]}>
                    {mission.title}
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
            </TouchableOpacity>
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
  missionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
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
    paddingHorizontal: 16,
  },
  typeRow: {
    marginTop: 16,
    marginBottom: 16,
  },
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
    color: Colors.accent,
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
    backgroundColor: "rgba(16, 185, 129, 0.12)",
  },
  doneBadgeText: {
    color: Colors.success,
    fontWeight: "700",
  },
});
