import { useContext, useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import ThemedView from "../../../components/ThemedView";
import SuccessModal from "../../../components/SuccessModal";
import { Colors } from "../../../constants/Colors";
import { ThemeContext } from "../../../context/ThemeContext";
import { getRewardById } from "../../../constants/rewards";
import { useProgress } from "../../../context/ProgressContext";

export default function RewardConfirm() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useContext(ThemeContext);
  const colorTheme = Colors[theme] || Colors.light;
  const { totalPoints, isRedeemed, redeemReward } = useProgress();
  const reward = getRewardById(id);
  const [done, setDone] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");

  // Guard: opened without a valid reward id
  if (!reward) {
    return (
      <ThemedView safe={true} style={styles.container}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colorTheme.uiBackground,
              borderColor: colorTheme.border,
            },
          ]}
        >
          <Text style={[styles.name, { color: colorTheme.title }]}>
            Reward not found
          </Text>
        </View>
      </ThemedView>
    );
  }

  const alreadyRedeemed = isRedeemed(reward.id);
  const balanceAfter = totalPoints - reward.cost;
  const affordable = balanceAfter >= 0;

  const handleConfirm = () => {
    if (redeemReward(reward)) {
      // Generate a local voucher code (mock — a real backend would issue this)
      const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
      setVoucherCode(`EGX-${reward.id}-${rand}`);
      setDone(true);
    }
  };

  return (
    <ThemedView safe={true} style={styles.container}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colorTheme.uiBackground,
            borderColor: colorTheme.border,
          },
        ]}
      >
        {/* Header: type badge + cost */}
        <View style={styles.topRow}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{reward.type}</Text>
          </View>
          <Text style={styles.cost}>⭐ {reward.cost} pts</Text>
        </View>

        {/* Reward name + sponsor */}
        <Text style={[styles.name, { color: colorTheme.title }]}>
          {reward.name}
        </Text>
        {reward.sponsor && (
          <Text style={[styles.sponsor, { color: colorTheme.text }]}>
            by {reward.sponsor}
          </Text>
        )}

        {/* Description */}
        {reward.description && (
          <Text style={[styles.description, { color: colorTheme.text }]}>
            {reward.description}
          </Text>
        )}

        <View
          style={[styles.divider, { backgroundColor: colorTheme.border }]}
        />

        {/* Balance breakdown: before → after */}
        <Text style={[styles.sectionTitle, { color: colorTheme.title }]}>
          Points Summary
        </Text>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colorTheme.text }]}>
            Current balance
          </Text>
          <Text style={[styles.summaryValue, { color: colorTheme.title }]}>
            ⭐ {totalPoints}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colorTheme.text }]}>
            Reward cost
          </Text>
          <Text style={[styles.summaryValue, { color: Colors.warning }]}>
            − {reward.cost}
          </Text>
        </View>
        <View
          style={[
            styles.summaryRow,
            styles.summaryTotal,
            { borderTopColor: colorTheme.border },
          ]}
        >
          <Text
            style={[
              styles.summaryLabel,
              { color: colorTheme.title, fontWeight: "700" },
            ]}
          >
            Balance after
          </Text>
          <Text
            style={[
              styles.summaryValue,
              {
                color: affordable ? Colors.success : Colors.warning,
                fontWeight: "800",
              },
            ]}
          >
            ⭐ {balanceAfter}
          </Text>
        </View>

        <View
          style={[styles.divider, { backgroundColor: colorTheme.border }]}
        />

        {/* Confirm / status */}
        {alreadyRedeemed ? (
          <Text style={[styles.statusText, { color: Colors.success }]}>
            ✓ You already redeemed this reward
          </Text>
        ) : !affordable ? (
          <Text style={[styles.statusText, { color: Colors.warning }]}>
            Not enough points for this reward
          </Text>
        ) : (
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmButtonText}>Confirm Redemption</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Success popup */}
      <SuccessModal
        visible={done}
        onRequestClose={() => setDone(false)}
        title="Reward Redeemed!"
      >
        <Text style={[styles.successSub, { color: colorTheme.text }]}>
          {reward.name}
        </Text>

        {/* Voucher card with the code */}
        <View style={[styles.voucher, { borderColor: colorTheme.border }]}>
          <Text style={[styles.voucherLabel, { color: colorTheme.text }]}>
            YOUR VOUCHER CODE
          </Text>
          <Text style={[styles.voucherCode, { color: colorTheme.title }]}>
            {voucherCode}
          </Text>
        </View>

        {/* Mock delivery note */}
        <Text style={[styles.voucherNote, { color: colorTheme.text }]}>
          📧 A copy has been sent to your email
        </Text>

        <Text style={styles.successBalance}>
          New balance: ⭐ {balanceAfter} pts
        </Text>

        {/* Share — clickable, no-op for now */}
        <TouchableOpacity
          style={[styles.shareButton, { borderColor: Colors.primary }]}
          activeOpacity={0.7}
          onPress={() => {
            // TODO: wire up native Share sheet / voucher download later
          }}
        >
          <Text style={[styles.shareButtonText, { color: Colors.primary }]}>
            Share Voucher
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.successButton}
          activeOpacity={0.8}
          onPress={() => {
            setDone(false);
            router.replace("/reward");
          }}
        >
          <Text style={styles.successButtonText}>Back to Rewards</Text>
        </TouchableOpacity>
      </SuccessModal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  card: {
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  typeBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  cost: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.accent,
  },
  name: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  sponsor: {
    fontSize: 13,
    fontStyle: "italic",
    opacity: 0.8,
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    lineHeight: 21,
  },
  divider: {
    height: 1,
    marginVertical: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 15,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  summaryTotal: {
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 2,
  },
  statusText: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  // Success popup body (shell provided by SuccessModal)
  successSub: {
    fontSize: 14,
    marginBottom: 4,
  },
  // Voucher
  voucher: {
    alignSelf: "stretch",
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 14,
    marginBottom: 12,
  },
  voucherLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 6,
    opacity: 0.8,
  },
  voucherCode: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 2,
  },
  voucherNote: {
    fontSize: 13,
    marginBottom: 14,
  },
  successBalance: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.accent,
    marginBottom: 22,
  },
  shareButton: {
    alignSelf: "stretch",
    borderWidth: 1.5,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  shareButtonText: {
    fontSize: 15,
    fontWeight: "700",
  },
  successButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 14,
    alignSelf: "stretch",
    alignItems: "center",
  },
  successButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
