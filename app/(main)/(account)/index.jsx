import { useContext, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  Text,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../../../context/ThemeContext";
import { useProgress } from "../../../context/ProgressContext";
import { useUser } from "../../../context/UserContext";
import { Colors } from "../../../constants/Colors";
import ThemedView from "../../../components/ThemedView";
import ThemedText from "../../../components/ThemedText";
import HelpModal from "../../../components/HelpModal";

export default function Account() {
  const { theme } = useContext(ThemeContext);
  const colorTheme = Colors[theme] ?? Colors.light;
  const styles = useMemo(() => createStyles(colorTheme), [colorTheme]);
  const router = useRouter();
  const { totalPoints, redeemedIds } = useProgress();
  const { user, updateUser, logout } = useUser();
  const [helpVisible, setHelpVisible] = useState(false);

  if (!user) {
    return null; // or a loading spinner, or redirect — see note below
  }

  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const initials =
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <ThemedView safe={true} style={styles.container}>
      {/* Top bar: title + settings gear */}
      <View style={styles.topBar}>
        <ThemedText title={true} style={styles.screenTitle}>
          My Account
        </ThemedText>
        <View style={styles.topBarIcons}>
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => setHelpVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.helpButtonText}>Help</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/settings")}
            style={styles.gearButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name="settings-outline"
              size={22}
              color={colorTheme.title}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header card: avatar + name + email + points */}
        <View style={styles.headerCard}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <ThemedText style={styles.avatarInitials}>{initials}</ThemedText>
            </View>
          )}
          <ThemedText title={true} style={styles.name}>
            {fullName}
          </ThemedText>
          <ThemedText style={styles.email}>{user.email}</ThemedText>

          {/* Points earned across missions (from ProgressContext) */}
          <View style={styles.pointsPill}>
            <ThemedText style={styles.pointsText}>
              ⭐ {totalPoints} pts
            </ThemedText>
          </View>
        </View>

        {/* Link to the full, editable personal info */}
        <TouchableOpacity
          style={styles.linkRow}
          activeOpacity={0.7}
          onPress={() => router.push("/personal-info")}
        >
          <Ionicons
            name="person-outline"
            size={20}
            color={colorTheme.iconColor}
            style={styles.linkIcon}
          />
          <View style={styles.linkTextWrap}>
            <ThemedText style={styles.linkTitle}>
              Personal Information
            </ThemedText>
            <ThemedText style={styles.linkSub}>
              View and edit your details
            </ThemedText>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colorTheme.iconColor}
          />
        </TouchableOpacity>

        {/* My Rewards link */}
        <TouchableOpacity
          style={[styles.linkRow, styles.linkSpacing]}
          activeOpacity={0.7}
          onPress={() => router.push("/reward")}
        >
          <Ionicons
            name="gift-outline"
            size={20}
            color={colorTheme.iconColor}
            style={styles.linkIcon}
          />
          <View style={styles.linkTextWrap}>
            <ThemedText style={styles.linkTitle}>My Rewards</ThemedText>
            <ThemedText style={styles.linkSub}>
              {redeemedIds.length > 0
                ? `${redeemedIds.length} redeemed`
                : "Browse and redeem rewards"}
            </ThemedText>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colorTheme.iconColor}
          />
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.linkRow, styles.logoutRow]}
          activeOpacity={0.7}
          onPress={() =>
            Alert.alert("Log out", "Are you sure you want to log out?", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Log out",
                style: "destructive",
                onPress: () => {
                  logout();
                  router.replace("/");
                },
              },
            ])
          }
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color={Colors.warning}
            style={styles.linkIcon}
          />
          <ThemedText style={styles.logoutText}>Log Out</ThemedText>
        </TouchableOpacity>
      </ScrollView>

      <HelpModal
        visible={helpVisible}
        onClose={() => setHelpVisible(false)}
        colorTheme={colorTheme}
      />
    </ThemedView>
  );
}

const createStyles = (colorTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorTheme.background,
    },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 4,
    },
    topBarIcons: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    helpButton: {
      paddingHorizontal: 14,
      paddingVertical: 5,
      borderRadius: 20,
      backgroundColor: "#0284C7",
    },
    helpButtonText: {
      color: "#fff",
      fontSize: 13,
      fontWeight: "700",
    },
    screenTitle: {
      fontSize: 28,
      fontWeight: "800",
    },
    gearButton: {
      padding: 6,
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 40,
    },
    // Header card
    headerCard: {
      alignItems: "center",
      backgroundColor: colorTheme.uiBackground,
      borderRadius: 20,
      paddingVertical: 24,
      paddingHorizontal: 20,
      borderWidth: 1,
      borderColor: colorTheme.border,
      marginBottom: 20,
    },
    avatar: {
      width: 88,
      height: 88,
      borderRadius: 44,
      marginBottom: 12,
    },
    avatarFallback: {
      width: 88,
      height: 88,
      borderRadius: 44,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors.primary,
      marginBottom: 12,
    },
    avatarInitials: {
      color: "#fff",
      fontSize: 30,
      fontWeight: "800",
    },
    name: {
      fontSize: 20,
      fontWeight: "800",
      marginBottom: 2,
    },
    email: {
      fontSize: 14,
      opacity: 0.7,
      marginBottom: 14,
    },
    pointsPill: {
      borderWidth: 1.5,
      borderColor: Colors.accent,
      borderRadius: 20,
      paddingVertical: 6,
      paddingHorizontal: 16,
    },
    pointsText: {
      color: Colors.accent,
      fontWeight: "700",
    },
    // Link row
    linkRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colorTheme.uiBackground,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colorTheme.border,
      padding: 16,
    },
    linkIcon: {
      marginRight: 12,
    },
    linkTextWrap: {
      flex: 1,
    },
    linkTitle: {
      fontSize: 15,
      fontWeight: "700",
    },
    linkSub: {
      fontSize: 13,
      opacity: 0.7,
      marginTop: 2,
    },
    linkSpacing: {
      marginTop: 12,
    },
    logoutRow: {
      marginTop: 12,
      justifyContent: "center",
      borderColor: colorTheme.border,
    },
    logoutText: {
      fontSize: 15,
      fontWeight: "700",
      color: Colors.warning,
    },
  });
