import { useContext, useState, useMemo } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import ThemedView from "../../../components/ThemedView";
import ThemedText from "../../../components/ThemedText";
import Card from "../../../components/Card";
import FilterChips from "../../../components/FilterChips";
import { useRouter } from "expo-router";
import { Colors } from "../../../constants/Colors";
import { ThemeContext } from "../../../context/ThemeContext";
import { useProgress } from "../../../context/ProgressContext";
import { useTabBarClearance } from "../../../constants/layout";
import { ContentContext } from "../../../context/ContentContext";
import CustomThemedLoader from "../../../components/CustomThemedLoader";

export default function Rewards() {
  const { theme } = useContext(ThemeContext);
  const colorTheme = Colors[theme] || Colors.light;
  const router = useRouter();
  const { totalPoints, isRedeemed } = useProgress();
  const [selectedType, setSelectedType] = useState("All");
  const tabBarClearance = useTabBarClearance();
  const { rewards, loading, error } = useContext(ContentContext);

  const rewardTypes = useMemo(() => {
    if (loading || !rewards) return [];
    const uniqueTypes = [...new Set(rewards.map((r) => r.type))];
    return uniqueTypes;
  }, [rewards, loading]);

  const visibleRewards = useMemo(() => {
    if (loading || !rewards) return [];
    return (
      selectedType === "All"
        ? [...rewards]
        : rewards.filter((r) => r.type === selectedType)
    ).sort((a, b) => {
      // Redeemed rewards float to the top
      return isRedeemed(b.id) - isRedeemed(a.id);
    });
  });

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
          Something went wrong loading rewards.
        </ThemedText>
        <Text style={styles.errorDetail}>{String(error)}</Text>
      </ThemedView>
    );
  }
  if (!rewards || rewards.length === 0) {
    return (
      <ThemedView safe={true} style={[styles.container, styles.centered]}>
        <ThemedText style={styles.statusText}>
          No rewards available right now.
        </ThemedText>
      </ThemedView>
    );
  }
  return (
    <ThemedView safe={true} style={styles.container}>
      <ThemedText title={true} style={styles.header}>
        Rewards
      </ThemedText>
      <View style={styles.topRow}>
        <FilterChips
          options={["All", ...rewardTypes]}
          selected={selectedType}
          onSelect={setSelectedType}
          style={styles.typeRow}
          contentContainerStyle={{ paddingLeft: 16 }}
        />

        <View
          style={[
            styles.balanceCircle,
            {
              backgroundColor: colorTheme.uiBackground,
              borderColor: Colors.accent,
            },
          ]}
        >
          <Text style={styles.balanceValue}>⭐ {totalPoints}</Text>
          <Text style={[styles.balancePts, { color: colorTheme.text }]}>
            pts
          </Text>
        </View>
      </View>

      {/* Reward cards */}
      <ScrollView
        style={[styles.list, { marginBottom: tabBarClearance }]}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {visibleRewards.map((reward) => {
          const redeemed = isRedeemed(reward.id);
          const affordable = totalPoints >= reward.points;
          return (
            <Card key={reward.id} style={styles.card}>
              <View style={styles.cardInfo}>
                <Text style={[styles.cardName, { color: colorTheme.title }]}>
                  {reward.title}
                </Text>
                {reward.desc && (
                  <Text
                    style={[styles.cardSponsor, { color: colorTheme.text }]}
                  >
                    {reward.desc}
                  </Text>
                )}
                <Text style={styles.cardCost}>⭐ {reward.points} pts</Text>
              </View>

              {redeemed ? (
                <View style={styles.redeemedBadge}>
                  <Text style={styles.redeemedBadgeText}>✓ Redeemed</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.redeemButton,
                    !affordable && { backgroundColor: colorTheme.border },
                  ]}
                  disabled={!affordable}
                  onPress={() => router.push(`/reward/${reward.id}`)}
                >
                  <Text style={styles.redeemButtonText}>
                    {affordable ? "Redeem" : "Locked"}
                  </Text>
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
    color: Colors.danger ?? "#DC2626",
    marginTop: 6,
    textAlign: "center",
  },
  header: {
    fontSize: 32, // Slightly larger for a nice header look
    fontWeight: "800",
    marginTop: 10, // Pushes it down from the top edge so it doesn't clip
    marginBottom: 8, // Pushes it down from the top edge so it doesn't clip
    paddingHorizontal: 16, // Aligns it with the start of the cards
  },
  // Points balance header
  // Circular points badge (right of the filter row)
  balanceCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    // Soft lift
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  balancePts: {
    fontSize: 11,
    fontWeight: "600",
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.accent, // warm "sun" gold for points
  },
  // Filter chips + badge on one row
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    marginRight: 16,
  },
  // Type filter chips share (chip visuals live in FilterChips)
  typeRow: {
    marginRight: 12,
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
  cardSponsor: {
    fontSize: 12,
    fontStyle: "italic",
    opacity: 0.8,
    marginBottom: 4,
  },
  cardCost: {
    fontSize: 13,
    color: Colors.accent, // warm "sun" gold — matches the points theme
    fontWeight: "600",
  },
  redeemButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  redeemButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  redeemedBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.success,
    backgroundColor: "rgba(16, 185, 129, 0.12)", // translucent success
  },
  redeemedBadgeText: {
    color: Colors.success,
    fontWeight: "700",
  },
});
