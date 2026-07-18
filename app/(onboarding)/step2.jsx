import React, { useContext, useMemo, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import ThemedView from "../../components/ThemedView";
import ThemedText from "../../components/ThemedText";
import { Colors } from "../../constants/Colors";
import { ThemeContext } from "../../context/ThemeContext";

import { takePhoto, pickImageFromGallery } from "../../constants/pickImages";
import CustomAlert from "../../components/CustomAlert";
import { useUser } from "../../context/UserContext";

export default function Step2() {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);

  const { theme } = useContext(ThemeContext);

  const { updateUser } = useUser();

  const colorTheme = Colors[theme] || Colors.light;
  const styles = useMemo(() => createStyles(colorTheme), [colorTheme]);

  const handleTakePhoto = async () => {
    const uri = await takePhoto();
    if (uri) setProfileImage(uri);
    setAlertVisible(false);
  };

  const handleChooseGallery = async () => {
    const uri = await pickImageFromGallery();
    if (uri) setProfileImage(uri);
    setAlertVisible(false);
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
      <View style={styles.buttonRowContainer}>
        <TouchableOpacity
          style={styles.linkButtonAlternative}
          onPress={() => router.back()}
        >
          <Text style={{ color: colorTheme.text, fontWeight: "500" }}>
            Back
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => {
            updateUser({ avatar: profileImage });
            router.replace("/explore");
          }}
        >
          <Text style={{ color: "#FFF", fontWeight: "bold" }}>Finish</Text>
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
    linkButtonAlternative: { paddingVertical: 14, paddingHorizontal: 20 },
  });
