import { useContext, useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import ThemedView from "../../../components/ThemedView";
import CustomThemedLoader from "../../../components/CustomThemedLoader";
import SuccessModal from "../../../components/SuccessModal";
import { Colors } from "../../../constants/Colors";
import { ThemeContext } from "../../../context/ThemeContext";
import { useProgress } from "../../../context/ProgressContext";
import { ContentContext } from "../../../context/ContentContext";
import { useMissionPhotos } from "../../../constants/useMissionPhotos";

export default function MissionDetail() {
  // Which mission opened this page (passed from the missions list)
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useContext(ThemeContext);
  const colorTheme = Colors[theme] || Colors.light;
  const { missions, setMissions, loading } = useContext(ContentContext);
  const mission = missions.find((m) => String(m.id) === String(id));
  const { completeMission } = useProgress();

  const MIN_PHOTOS_REQUIRED = 3;
  const {
    images,
    verifying,
    completed,
    error: photoError,
    canVerify,
    addPhoto,
    retakePhoto,
    verifyPhotos,
    verificationPayload,
    verificationToken,
  } = useMissionPhotos(mission?.id, MIN_PHOTOS_REQUIRED);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await completeMission(mission.id, verificationPayload, verificationToken);
      setSubmitted(true);
      setSaved(true);
    } catch (err) {
      console.error(err);
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ThemedView safe={true} style={styles.container}>
        <CustomThemedLoader />
      </ThemedView>
    );
  }
  // Guard: opened without a valid mission id
  if (!mission) {
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
            Mission not found
          </Text>
        </View>
      </ThemedView>
    );
  }

  return (
    <>
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
          <View style={styles.topRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{mission.type}</Text>
            </View>
            <Text style={styles.points}>⭐ {mission.points} pts</Text>
          </View>

          <Text style={[styles.name, { color: colorTheme.title }]}>
            {mission.title}
          </Text>

          <View style={styles.metaRow}>
            <Text style={[styles.metaText, { color: colorTheme.text }]}>
              {mission.desc}
            </Text>
          </View>

          <View
            style={[styles.divider, { backgroundColor: colorTheme.border }]}
          />
          {!saved && (
            <View>
              {!canVerify && (
                <TouchableOpacity
                  style={styles.photoButton}
                  onPress={addPhoto}
                  activeOpacity={0.7}
                  disabled={submitted || verifying || canVerify}
                >
                  <Ionicons
                    name="camera-outline"
                    size={18}
                    color={Colors.primary}
                  />
                  <Text style={styles.photoButtonText}>
                    {images.length === 0
                      ? "Take Photo"
                      : `Add Photo (${images.length})`}
                  </Text>
                </TouchableOpacity>
              )}

              {images.length > 0 && (
                <View style={styles.thumbRow}>
                  {images.map((img, index) => (
                    <View key={img.uri} style={styles.thumbWrapper}>
                      <Image
                        source={{ uri: img.uri }}
                        style={styles.thumbImage}
                      />
                      {img.status === "pass" && (
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color={Colors.success}
                          style={styles.thumbBadge}
                        />
                      )}
                      {img.status === "fail" && (
                        <TouchableOpacity
                          style={styles.thumbBadge}
                          onPress={() => retakePhoto(index)}
                        >
                          <Ionicons
                            name="close-circle"
                            size={18}
                            color={Colors.danger ?? "#DC2626"}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {canVerify && !completed && (
                <TouchableOpacity
                  style={[
                    styles.hintButton,
                    {
                      alignSelf: "stretch",
                      alignItems: "center",
                      marginBottom: 16,
                    },
                  ]}
                  onPress={verifyPhotos}
                  activeOpacity={0.7}
                  disabled={verifying}
                >
                  <Text style={styles.hintButtonText}>
                    {verifying ? "Verifying..." : "Verify Photos"}
                  </Text>
                </TouchableOpacity>
              )}
              {!saved && (
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    !completed && { backgroundColor: colorTheme.border },
                  ]}
                  onPress={handleSubmit}
                  disabled={!completed || submitting}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.submitButtonText,
                      { color: completed ? "#FFFFFF" : "#9CA3AF" },
                    ]}
                  >
                    {submitting
                      ? "Saving..."
                      : completed
                        ? "Completed Mission"
                        : "Pending Verification"}
                  </Text>
                </TouchableOpacity>
              )}

              {images.length < MIN_PHOTOS_REQUIRED && (
                <View
                  style={[
                    styles.hintPill,
                    {
                      borderColor: colorTheme.border,
                      backgroundColor: `${Colors.primary}1F`,
                    },
                  ]}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={14}
                    color={Colors.primary}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[styles.hintPillText, { color: Colors.primary }]}
                  >
                    {`${images.length}/${MIN_PHOTOS_REQUIRED} photos — ${MIN_PHOTOS_REQUIRED - images.length} more to go`}
                  </Text>
                </View>
              )}
            </View>
          )}
          {saved && (
            <View style={styles.finishedContainer}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={Colors.success}
              />
              <Text style={styles.finishedText}>Mission Completed!</Text>
            </View>
          )}
          {submitError && (
            <Text style={[styles.errorDetail, { marginTop: 10 }]}>
              {submitError}
            </Text>
          )}
          {photoError && (
            <Text style={[styles.errorDetail, { marginTop: 10 }]}>
              {photoError}
            </Text>
          )}
        </View>

        {/* Success popup */}
        <SuccessModal
          visible={submitted}
          onRequestClose={() => setSubmitted(false)}
          title="Mission Complete!"
        >
          <Text style={styles.successPoints}>
            You earned ⭐ {mission.points} pts
          </Text>

          <TouchableOpacity
            style={styles.successButton}
            activeOpacity={0.8}
            onPress={() => {
              setSubmitted(false);
              router.replace("/mission");
            }}
          >
            <Text style={styles.successButtonText}>Back to Missions</Text>
          </TouchableOpacity>

          {/* Secondary nudge: spend the points you just earned */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setSubmitted(false);
              router.replace("/reward");
            }}
          >
            <Text style={[styles.successLink, { color: Colors.primary }]}>
              View Rewards →
            </Text>
          </TouchableOpacity>
        </SuccessModal>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "100%",
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    // Soft lift so the quest card floats above the background
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 75,
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
  points: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.accent, // warm "sun" gold for points
  },
  name: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontSize: 14,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginVertical: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  objectiveRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  objectiveIcon: {
    marginRight: 10,
  },
  objectiveText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
  },
  objectiveTextDone: {
    color: "#999",
    textDecorationLine: "line-through",
  },
  hintPill: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  hintPillText: {
    fontSize: 12,
    fontWeight: "600",
  },
  hintButtonText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  // Success popup body (shell provided by SuccessModal)
  successPoints: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.accent, // warm "sun" gold
    marginBottom: 22,
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
  successLink: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 14,
  },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: "transparent",
    marginBottom: 16,
  },
  photoButtonDone: {
    borderColor: Colors.success,
    backgroundColor: "rgba(34, 197, 94, 0.1)", // Light translucent green
  },
  photoButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary,
    marginLeft: 8, // Space between the Ionicons and the text
  },
  errorDetail: {
    fontSize: 13,
    color: Colors.danger ?? "#DC2626",
    marginTop: 6,
    textAlign: "center",
  },
  finishedContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.success,
    backgroundColor: "rgba(34, 197, 94, 0.12)", // matching translucent success tone
  },
  finishedText: {
    color: Colors.success,
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  hintButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}1F`,
  },
  thumbRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  thumbWrapper: {
    position: "relative",
  },
  thumbImage: {
    width: 64,
    height: 64,
    borderRadius: 10,
  },
  thumbBadge: {
    position: "absolute",
    top: -6,
    right: -6,
  },
});
