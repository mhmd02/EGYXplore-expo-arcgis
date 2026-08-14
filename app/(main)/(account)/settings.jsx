import { useContext, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { ThemeContext } from "../../../context/ThemeContext";
import { SettingsContext } from "../../../context/SettingsContext";
import { ContentContext } from "../../../context/ContentContext";
import { Colors } from "../../../constants/Colors";
import ThemedView from "../../../components/ThemedView";
import ThemedText from "../../../components/ThemedText";
import ThemedTextInput from "../../../components/ThemedTextInput";

export default function Settings() {
  const { theme, setTheme } = useContext(ThemeContext);
  const colorTheme = Colors[theme] ?? Colors.light;
  const styles = useMemo(() => createStyles(colorTheme), [colorTheme]);
  const {
    allowMissionsNotifications,
    setAllowMissionsNotifications,
    allowRewardsNotifications,
    setAllowRewardsNotifications,
  } = useContext(ContentContext);
  // Local settings state (in-memory for now — no persistence yet)
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.sectionTitle}>Appearance</ThemedText>
      <View style={styles.card}>
        <View style={styles.segmentRow}>
          {["light", "dark"].map((mode) => {
            const active = theme === mode;
            return (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.segment,
                  {
                    backgroundColor: active
                      ? Colors.primary
                      : colorTheme.background,
                    borderColor: active ? Colors.primary : colorTheme.border,
                  },
                ]}
                onPress={() => setTheme(mode)}
              >
                <ThemedText
                  style={[
                    styles.segmentText,
                    active && styles.segmentTextActive,
                  ]}
                >
                  {mode === "light" ? "☀️ Light" : "🌙 Dark"}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      {/* Notifications */}
      <ThemedText style={styles.sectionTitle}>Notifications</ThemedText>
      <View style={styles.card}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleTextWrap}>
            <ThemedText style={styles.toggleTitle}>Mission alerts</ThemedText>
            <ThemedText style={styles.toggleSub}>
              New missions and progress reminders
            </ThemedText>
          </View>
          <Switch
            value={allowMissionsNotifications}
            onValueChange={setAllowMissionsNotifications}
            trackColor={{ true: Colors.primary, false: colorTheme.border }}
            thumbColor="#fff"
          />
        </View>

        <View style={[styles.toggleRow, styles.rowDivider]}>
          <View style={styles.toggleTextWrap}>
            <ThemedText style={styles.toggleTitle}>Reward alerts</ThemedText>
            <ThemedText style={styles.toggleSub}>
              New rewards and redemption updates
            </ThemedText>
          </View>
          <Switch
            value={allowRewardsNotifications}
            onValueChange={setAllowRewardsNotifications}
            trackColor={{ true: Colors.primary, false: colorTheme.border }}
            thumbColor="#fff"
          />
        </View>
      </View>
    </ThemedView>
  );
}

const createStyles = (colorTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorTheme.background,
      paddingHorizontal: 15,
    },
    scrollContent: {
      padding: 20,
      paddingVertical: 0,
      paddingBottom: 80,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "700",
      opacity: 0.7,
      marginBottom: 8,
      marginTop: 16,
    },
    card: {
      backgroundColor: colorTheme.uiBackground,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colorTheme.border,
      padding: 16,
    },
    // Segmented selector (language / currency)
    segmentRow: {
      flexDirection: "row",
      gap: 8,
    },
    segment: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: "center",
    },
    segmentText: {
      fontWeight: "600",
    },
    segmentTextActive: {
      color: "#fff",
    },
    // Toggle rows
    toggleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    rowDivider: {
      borderTopWidth: 1,
      borderTopColor: colorTheme.border,
      marginTop: 12,
      paddingTop: 12,
    },
    toggleTextWrap: {
      flex: 1,
      marginRight: 12,
    },
    toggleTitle: {
      fontSize: 15,
      fontWeight: "600",
    },
    toggleSub: {
      fontSize: 12,
      opacity: 0.7,
      marginTop: 2,
    },
    // Emergency contact inputs
    inputLabel: {
      fontSize: 13,
      fontWeight: "600",
      opacity: 0.8,
      marginBottom: 6,
    },
    inputLabelSpacing: {
      marginTop: 14,
    },
    input: {
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colorTheme.border,
    },
    // Save
    saveButton: {
      backgroundColor: Colors.primary,
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: "center",
      marginTop: 24,
      marginBottom: 40,
      zIndex: 10,
    },
    saveButtonText: {
      color: "#fff",
      fontSize: 15,
      fontWeight: "700",
    },
  });
