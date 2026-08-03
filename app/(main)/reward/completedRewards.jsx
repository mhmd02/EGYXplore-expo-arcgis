import { useContext, useMemo } from "react";
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
import { Colors } from "../../../constants/Colors";
import { ThemeContext } from "../../../context/ThemeContext";
import { useProgress } from "../../../context/ProgressContext";
import { useTabBarClearance } from "../../../constants/layout";
import { ContentContext } from "../../../context/ContentContext";
import CustomThemedLoader from "../../../components/CustomThemedLoader";
import { Ionicons } from "@expo/vector-icons";

export default function CompletedRewards() {
  const router = useRouter();
  const { theme } = useContext(ThemeContext);
  const {
    redemptions,
    loading: progressLoading,
    error: progressError,
  } = useProgress();
  const {
    rewards,
    error: rewardsError,
    loading: rewardsLoading,
  } = useContext(ContentContext);

  const error = rewardsError || progressError;
  const loading = rewardsLoading || progressLoading;

  const tabBarClearance = useTabBarClearance();
  const colorTheme = Colors[theme] || Colors.light;

  const completedRewards = useMemo(() => {
    if (loading || !rewards) return [];
    return redemptions
      .map((redemption) => {
        const reward = rewards.find((r) => r.id === redemption.rewardId);
        return reward
          ? {
              ...reward,
              code: redemption.code,
            }
          : null;
      })
      .filter(Boolean);
  }, [rewards, redemptions, loading]);

  if (loading) {
    return (
      <ThemedView safe={true} style={[styles.container, styles.centered]}>
        <CustomThemedLoader />
        <ThemedText style={styles.statusText}>
          Loading completed rewards...
        </ThemedText>
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
  if (completedRewards.length === 0) {
    return (
      <ThemedView safe={true} style={[styles.container, styles.centered]}>
        <ThemedText style={styles.statusText}>
          You haven't redeemed any rewards yet.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView safe={true} style={styles.container}>
      <ScrollView
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: tabBarClearance },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {completedRewards.map((reward) => (
          <Card key={reward.id} style={styles.card} variant="pharaonic">
            <View style={styles.cardInfo}>
              <Text style={[styles.cardName, { color: colorTheme.title }]}>
                {reward.title}
              </Text>
              <Text style={[styles.cardSponser, { color: colorTheme.title }]}>
                {reward.desc}
              </Text>
            </View>
            <View style={styles.doneBadge}>
              <Text style={styles.doneBadgeText}>{reward.code}</Text>
            </View>
          </Card>
        ))}
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
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
  },
  back: {
    width: 32,
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
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: 12,
    paddingBottom: 12,
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
  cardPoints: {
    fontSize: 13,
    color: Colors.accent,
    fontWeight: "600",
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
