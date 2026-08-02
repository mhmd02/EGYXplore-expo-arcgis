import { useContext, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import ThemedView from "../../components/ThemedView";
import ThemedText from "../../components/ThemedText";
import { Colors } from "../../constants/Colors";
import { ThemeContext } from "../../context/ThemeContext";

import { useUser } from "../../context/UserContext";
import { UriContext } from "../../context/UriContext";
import CustomAlert from "../../components/CustomAlert";
import { uploadProfilePicture } from "../../api/profileApi";

export default function Step2() {
  const router = useRouter();

  const {
    profileImage,
    setProfileImage,
    alertVisible,
    setAlertVisible,
    handleTakePhoto,
    handleChooseGallery,
  } = useContext(UriContext);

  const { theme } = useContext(ThemeContext);

  const { token, updateUser } = useUser();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const colorTheme = Colors[theme] || Colors.light;
  const styles = useMemo(() => createStyles(colorTheme), [colorTheme]);

  const handleFinish = async () => {
    if (!profileImage) {
      router.replace("/explore");
      return;
    }

    setUploading(true);
    setUploadError(null);
    try {
      const result = await uploadProfilePicture(token, profileImage);
      await updateUser({ profilePictureUrl: result.profilePictureUrl });
      setProfileImage(null);
      router.replace("/explore");
    } catch (err) {
      setUploadError(err.message || "Could not upload profile picture.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <ThemedView style={styles.container} safe={true}>
      <Text style={styles.stepText}>STEP 2 OF 2</Text>

      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ThemedText
          title={true}
          style={[styles.heading, { textAlign: "center" }]}
        >
          Profile Picture
        </ThemedText>
        <Text
          style={[styles.subHeading, { textAlign: "center", marginBottom: 30 }]}
        >
          Feel free to skip this step.
        </Text>

        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={() => setAlertVisible(true)}
          disabled={uploading}
        >
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={{ fontSize: 40 }}>👤</Text>
              <Text style={styles.avatarPlaceholderText}>Upload Photo</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <CustomAlert
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
        onTakePhoto={handleTakePhoto}
        onChooseGallery={handleChooseGallery}
        colorTheme={colorTheme}
      />
      {uploadError && <Text style={styles.errorText}>{uploadError}</Text>}
      <View style={styles.buttonRowContainer}>
        <TouchableOpacity
          style={styles.linkButtonAlternative}
          onPress={() => router.back()}
          disabled={uploading}
        >
          <Text style={{ color: colorTheme.text, fontWeight: "500" }}>
            Back
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.linkButton, uploading && styles.disabledButton]}
          onPress={handleFinish}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={{ color: "#FFF", fontWeight: "bold" }}>Finish</Text>
          )}
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const createStyles = (colorTheme) =>
  StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 24 },
    stepText: {
      color: colorTheme.text,
      fontSize: 12,
      fontWeight: "bold",
      letterSpacing: 1,
      marginBottom: 4,
      marginTop: 20,
    },
    heading: {
      fontWeight: "bold",
      fontSize: 24,
      color: colorTheme.title,
      marginTop: 10,
    },
    subHeading: { color: colorTheme.text, fontSize: 14, marginTop: 4 },
    avatarContainer: {
      width: 160,
      height: 160,
      borderRadius: 80,
      borderWidth: 2,
      borderColor: colorTheme.border,
      borderStyle: "dashed",
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
      backgroundColor: colorTheme.uiBackground || "#f0f0f0",
    },
    avatarImage: { width: "100%", height: "100%" },
    avatarPlaceholder: { alignItems: "center" },
    avatarPlaceholderText: {
      fontSize: 12,
      color: colorTheme.text,
      marginTop: 8,
      fontWeight: "500",
    },
    buttonRowContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "auto",
      marginBottom: 30,
    },
    linkButton: {
      backgroundColor: "#007AFF",
      paddingVertical: 14,
      paddingHorizontal: 32,
      borderRadius: 25,
    },
    disabledButton: { opacity: 0.65 },
    linkButtonAlternative: { paddingVertical: 14, paddingHorizontal: 20 },
    errorText: {
      color: Colors.danger ?? "#DC2626",
      fontSize: 13,
      marginBottom: 12,
      textAlign: "center",
    },
  });
