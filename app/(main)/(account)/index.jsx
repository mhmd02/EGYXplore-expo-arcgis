import { useContext, useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  Text,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../../../context/ThemeContext";
import { useProgress } from "../../../context/ProgressContext";
import { useUser } from "../../../context/UserContext";
import { Colors } from "../../../constants/Colors";
import ThemedView from "../../../components/ThemedView";
import ThemedText from "../../../components/ThemedText";
import HelpModal from "../../../components/HelpModal";
import { uploadProfilePicture } from "../../../api/profileApi";

export default function Account() {
  const { theme } = useContext(ThemeContext);
  const colorTheme = Colors[theme] ?? Colors.light;
  const styles = useMemo(() => createStyles(colorTheme), [colorTheme]);
  const router = useRouter();
  const { totalPoints, redemptions, completedIds } = useProgress();
  const { user, token, logout, updateUser } = useUser();
  const [helpVisible, setHelpVisible] = useState(false);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Mock data for gamification to match website profile
  const level = user?.level || 5;
  const levelLabel = user?.levelLabel || "Explorer";
  const currentXP = user?.currentXP || 1250;
  const nextLevelXP = user?.nextLevelXP || 2000;
  const progressPercent = Math.min((currentXP / nextLevelXP) * 100, 100);

  const placesVisited = user?.placesVisited || 12;
  const missionsCompleted = completedIds?.length || 0;
  const badgesEarned = user?.badgesEarned || 4;
  const loginStreak = user?.loginStreak || 5;
  const featuredBadge = user?.featuredBadge || "Pharaoh's Blessing";

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [user?.profilePictureUrl]);

  if (!user) {
    return null; // or a loading spinner, or redirect — see note below
  }

  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const initials =
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();

  const handlePickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Denied",
          "You need to grant photo library permissions to change your avatar.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const localUri = result.assets[0].uri;
        setAvatarLoadFailed(false);
        setUploadingAvatar(true);

        try {
          // Upload the image to the backend so it persists across sessions
          const uploadResult = await uploadProfilePicture(token, localUri);
          // Update local context with the server-returned URL (not the local URI)
          await updateUser({ profilePictureUrl: uploadResult.profilePictureUrl });
        } catch (uploadError) {
          console.error("Error uploading profile picture:", uploadError);
          Alert.alert(
            "Upload Failed",
            uploadError.message || "Could not upload profile picture. Please try again.",
          );
        } finally {
          setUploadingAvatar(false);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Could not pick an image. Please try again.");
    }
  };

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
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePickImage}
            style={styles.avatarContainer}
            disabled={uploadingAvatar}
          >
            {user.profilePictureUrl && !avatarLoadFailed ? (
              <Image
                source={{ uri: user.profilePictureUrl }}
                style={styles.avatar}
                onError={() => setAvatarLoadFailed(true)}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <ThemedText style={styles.avatarInitials}>
                  {initials}
                </ThemedText>
              </View>
            )}
            {uploadingAvatar ? (
              <View style={styles.avatarUploadingOverlay}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            ) : (
              <View style={styles.editAvatarBadge}>
                <Ionicons name="camera" size={14} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
          <ThemedText title={true} style={styles.name}>
            {fullName}
          </ThemedText>
          <ThemedText style={styles.email}>{user.email}</ThemedText>

          {/* Level and XP Progress (Added to match Website) */}
          <View style={styles.levelContainer}>
            <View style={styles.levelHeader}>
              <ThemedText style={styles.levelText}>
                Level {level} — {levelLabel}
              </ThemedText>
              <ThemedText style={styles.xpText}>
                {currentXP} / {nextLevelXP} XP
              </ThemedText>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progressPercent}%` },
                ]}
              />
            </View>
          </View>

          {/* Points earned across missions (from ProgressContext) */}
          <View style={styles.pointsPill}>
            <ThemedText style={styles.pointsText}>
              ⭐ {totalPoints} pts
            </ThemedText>
          </View>
        </View>

        {/* Journey Stats Grid (Added to match Website) */}
        <ThemedText style={styles.sectionTitle}>Your Journey</ThemedText>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="location" size={24} color={Colors.primary} />
            <ThemedText style={styles.statNumber}>{placesVisited}</ThemedText>
            <ThemedText style={styles.statLabel}>Places Visited</ThemedText>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="gift" size={24} color={Colors.accent} />
            <ThemedText style={styles.statNumber}>
              {redemptions.length}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Rewards Redeemed</ThemedText>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={24} color={"#D4AF37"} />
            <ThemedText style={styles.statNumber}>
              {missionsCompleted}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Missions</ThemedText>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="medal" size={24} color={Colors.primary} />
            <ThemedText style={styles.statNumber}>{badgesEarned}</ThemedText>
            <ThemedText style={styles.statLabel}>Badges</ThemedText>
          </View>
        </View>

        {/* Achievements / Streaks Section (Added to match Website) */}
        <ThemedText style={styles.sectionTitle}>Achievements</ThemedText>
        <View style={styles.achievementsCard}>
          <View style={styles.achievementRow}>
            <View style={styles.achievementBadge}>
              <Ionicons name="flame" size={20} color="#E8A045" />
            </View>
            <View style={styles.achievementInfo}>
              <ThemedText style={styles.achievementTitle}>
                {loginStreak}-Day Streak
              </ThemedText>
              <ThemedText style={styles.achievementSub}>Keep it up!</ThemedText>
            </View>
          </View>
          <View style={[styles.achievementRow, { marginTop: 12 }]}>
            <View
              style={[
                styles.achievementBadge,
                { backgroundColor: "rgba(212, 175, 55, 0.15)" },
              ]}
            >
              <Ionicons name="star" size={20} color="#D4AF37" />
            </View>
            <View style={styles.achievementInfo}>
              <ThemedText style={styles.achievementTitle}>
                Featured: {featuredBadge}
              </ThemedText>
              <ThemedText style={styles.achievementSub}>
                Your most prized badge
              </ThemedText>
            </View>
          </View>
        </View>

        <ThemedText style={[styles.sectionTitle, { marginTop: 8 }]}>
          Settings & Info
        </ThemedText>

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
          onPress={() => router.push("/reward/completedRewards")}
        >
          <Ionicons
            name="gift-outline"
            size={20}
            color={colorTheme.iconColor}
            style={styles.linkIcon}
          />
          <View style={styles.linkTextWrap}>
            <ThemedText style={styles.linkTitle}>My Vouchers</ThemedText>
            <ThemedText style={styles.linkSub}>
              {redemptions.length > 0
                ? `${redemptions.length} redeemed`
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
      paddingBottom: 60,
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
    avatarContainer: {
      position: "relative",
      marginBottom: 12,
    },
    avatar: {
      width: 88,
      height: 88,
      borderRadius: 44,
    },
    avatarFallback: {
      width: 88,
      height: 88,
      borderRadius: 44,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors.primary,
    },
    editAvatarBadge: {
      position: "absolute",
      bottom: 0,
      right: 0,
      backgroundColor: Colors.primary,
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: colorTheme.uiBackground,
    },
    avatarUploadingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: 44,
      backgroundColor: "rgba(0, 0, 0, 0.45)",
      alignItems: "center",
      justifyContent: "center",
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
      marginBottom: 16,
    },
    levelContainer: {
      width: "100%",
      paddingHorizontal: 10,
      marginBottom: 16,
    },
    levelHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 6,
    },
    levelText: {
      fontSize: 14,
      fontWeight: "700",
      color: colorTheme.title,
    },
    xpText: {
      fontSize: 12,
      fontWeight: "600",
      color: Colors.primary,
    },
    progressBarBg: {
      height: 8,
      backgroundColor: "rgba(0,0,0,0.1)",
      borderRadius: 4,
      overflow: "hidden",
    },
    progressBarFill: {
      height: "100%",
      backgroundColor: Colors.primary,
      borderRadius: 4,
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
    // Sections
    sectionTitle: {
      fontSize: 18,
      fontWeight: "800",
      marginTop: 10,
      marginBottom: 12,
      marginLeft: 4,
    },
    // Stats Grid
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    statCard: {
      width: "48%",
      backgroundColor: colorTheme.uiBackground,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colorTheme.border,
      padding: 16,
      alignItems: "center",
      marginBottom: 12,
    },
    statNumber: {
      fontSize: 20,
      fontWeight: "800",
      marginTop: 8,
      marginBottom: 2,
    },
    statLabel: {
      fontSize: 12,
      opacity: 0.7,
    },
    // Achievements
    achievementsCard: {
      backgroundColor: colorTheme.uiBackground,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colorTheme.border,
      padding: 16,
      marginBottom: 24,
    },
    achievementRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    achievementBadge: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "rgba(232, 160, 69, 0.15)",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    achievementInfo: {
      flex: 1,
    },
    achievementTitle: {
      fontSize: 15,
      fontWeight: "700",
      marginBottom: 2,
    },
    achievementSub: {
      fontSize: 13,
      opacity: 0.7,
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
