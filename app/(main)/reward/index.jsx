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
  const [selectedType, setSelectedType] = useState("All");
  const router = useRouter();
  const { theme } = useContext(ThemeContext);
  const {
    rewards,
    loading: rewardsLoading,
    error: rewardsError,
  } = useContext(ContentContext);
  const {
    totalPoints,
    isRedeemed,
    redeemedIds,
    redeemReward,
    error: progressError,
    loading: progressLoading,
  } = useProgress();
  const error = rewardsError || progressError;
  const loading = rewardsLoading || progressLoading;

  const tabBarClearance = useTabBarClearance();
  const colorTheme = Colors[theme] || Colors.light;

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
      return isRedeemed(b.id) - isRedeemed(a.id);
    });
  }, [rewards, loading, selectedType, redeemedIds]);

  if (loading) {
    return (
      <ThemedView safe={true} style={[styles.container, styles.centered]}>
        <CustomThemedLoader />
        <ThemedText style={styles.statusText}>Loading rewards...</ThemedText>
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
    <ThemedView
      safe={true}
      style={[styles.container, { paddingBottom: tabBarClearance }]}
    >
      <View style={styles.headerRow}>
        <ThemedText title={true} style={styles.header}>
          Rewards
        </ThemedText>

        <View
          style={[
            styles.balanceCircle,
            {
              backgroundColor: colorTheme.uiBackground,
              borderColor: Colors.accent,
              shadowColor: Colors.accent, // A subtle colored shadow for aesthetics
            },
          ]}
        >
          <Text style={styles.balanceValue}>{totalPoints}</Text>
          <Text style={[styles.balancePts, { color: colorTheme.text }]}>
            PTS
          </Text>
        </View>
      </View>

      <FilterChips
        options={["All", ...rewardTypes]}
        selected={selectedType}
        onSelect={setSelectedType}
        style={styles.typeRow}
        contentContainerStyle={{ paddingLeft: 16 }}
      />

      {/* Reward cards */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {visibleRewards.map((reward) => {
          const redeemed = isRedeemed(reward.id);
          const affordable = totalPoints >= reward.points;
          return (
            <TouchableOpacity
              onPress={() => router.push(`/reward/${reward.id}`)}
              disabled={!affordable || redeemed}
              key={reward.id}
            >
              <Card key={reward.id} style={styles.card} variant="pharaonic">
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 32, // Slightly larger for a nice header look
    fontWeight: "800",
    marginTop: 10, // Pushes it down from the top edge so it doesn't clip
    marginBottom: 8, // Pushes it down from the top edge so it doesn't clip
  },
  // Points balance header
  // Circular points badge (right of the filter row)
  balanceCircle: {
    width: 64, // Scaled down slightly for better proportions
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    // Lift and glow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.accent,
    lineHeight: 22,
  },
  balancePts: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    opacity: 0.7,
  },
  // Type filter chips share (chip visuals live in FilterChips)
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
