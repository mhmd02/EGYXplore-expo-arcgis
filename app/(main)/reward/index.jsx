import { useContext, useState } from "react";
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
import { REWARD_TYPES, REWARDS } from "../../../constants/rewards";
import { useProgress } from "../../../context/ProgressContext";
import { useTabBarClearance } from "../../../constants/layout";

export default function Rewards() {
  const { theme } = useContext(ThemeContext);
  const colorTheme = Colors[theme] || Colors.light;
  const router = useRouter();
  const { totalPoints, isRedeemed } = useProgress();
  const [selectedType, setSelectedType] = useState("All");
  const tabBarClearance = useTabBarClearance();

  const visibleRewards = (
    selectedType === "All"
      ? [...REWARDS]
      : REWARDS.filter((r) => r.type === selectedType)
  ).sort((a, b) => {
    // Redeemed rewards float to the top
    return isRedeemed(b.id) - isRedeemed(a.id);
  });

  return (
    <ThemedView safe={true} style={styles.container}>
      <ThemedText title={true} style={styles.header}>
        Rewards
      </ThemedText>
      <View style={styles.topRow}>
        <FilterChips
          options={REWARD_TYPES}
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
          const affordable = totalPoints >= reward.cost;
          return (
            <Card key={reward.id} style={styles.card}>
              <View style={styles.cardInfo}>
                <Text style={[styles.cardName, { color: colorTheme.title }]}>
                  {reward.name}
                </Text>
                {reward.sponsor && (
                  <Text
                    style={[styles.cardSponsor, { color: colorTheme.text }]}
                  >
                    by {reward.sponsor}
                  </Text>
                )}
                <Text style={styles.cardCost}>⭐ {reward.cost} pts</Text>
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
