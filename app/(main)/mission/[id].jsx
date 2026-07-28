import { useContext, useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import ThemedView from "../../../components/ThemedView";
import CustomThemedLoader from "../../../components/CustomThemedLoader";
import SuccessModal from "../../../components/SuccessModal";
import { Colors } from "../../../constants/Colors";
import { ThemeContext } from "../../../context/ThemeContext";
import { useProgress } from "../../../context/ProgressContext";
import { ContentContext } from "../../../context/ContentContext";
import { takePhoto } from "../../../constants/pickImages";

export default function MissionDetail() {
  // Which mission opened this page (passed from the missions list)
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useContext(ThemeContext);
  const colorTheme = Colors[theme] || Colors.light;
  const { missions, setMissions, loading } = useContext(ContentContext);
  const mission = missions.find((m) => String(m.id) === String(id));
  const { completeMission } = useProgress();
  const [images, setImages] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await completeMission(mission.id);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  const handleTakePhoto = async () => {
    const uri = await takePhoto();
    if (uri) {
      setImages((prevImages) => [...prevImages, uri]);
      setCompleted(true);
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
              <TouchableOpacity
                style={[
                  styles.photoButton,
                  completed && styles.photoButtonDone,
                ]}
                onPress={handleTakePhoto}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={completed ? "checkmark-circle" : "camera-outline"}
                  size={18}
                  color={completed ? Colors.success : Colors.primary}
                  disabled={submitted}
                />
                <Text
                  style={[
                    styles.photoButtonText,
                    completed && { color: Colors.success },
                  ]}
                >
                  {completed ? "Photo Added" : "Take Photo"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {!saved && (
            <TouchableOpacity
              style={[
                styles.submitButton,
                !completed && { backgroundColor: colorTheme.border },
              ]}
              onPress={() => {
                handleSubmit();
                setSaved((prev) => !prev);
              }}
              disabled={!completed || submitting}
              activeOpacity={0.8}
            >
              <Text style={styles.submitButtonText}>
                {submitting
                  ? "Saving..."
                  : completed
                    ? "Complete Mission"
                    : "Finish all objectives"}
              </Text>
            </TouchableOpacity>
          )}

          {submitError && (
            <Text style={[styles.errorDetail, { marginTop: 10 }]}>
              {submitError}
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
  },
  card: {
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    // Soft lift so the quest card floats above the background
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
  hintText: {
    marginTop: 16,
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 20,
  },
  // Small button with transparency
  hintButton: {
    alignSelf: "flex-start",
    marginTop: 18,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: "rgba(2, 132, 199, 0.12)", // translucent primary
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
    color: "#fff",
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
});
