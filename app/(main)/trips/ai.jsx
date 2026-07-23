import {
  Alert,
  Keyboard,
  StyleSheet,
  Touchable,
  TouchableWithoutFeedback,
  View,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useContext, useState } from "react";

import { ThemeContext } from "../../../context/ThemeContext";
import { Colors } from "../../../constants/Colors";
import { takePhoto, pickImageFromGallery } from "../../../constants/pickImages";
import { useRecordAndUploadAudio } from "../../../constants/useRecordAndUploadAudio";
import ThemedTextInput from "../../../components/ThemedTextInput";
import ThemedView from "../../../components/ThemedView";
import CustomChoose from "../../../components/CustomChoose";

export default function Chat() {
  const { theme, setTheme } = useContext(ThemeContext);
  const colorTheme = Colors[theme] ?? Colors.light;
  const [profileImage, setProfileImage] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [text, setText] = useState(null);
  const { isRecording, toggleRecording } = useRecordAndUploadAudio(
    handleRecordingComplete,
  );
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

  async function handleRecordingComplete(uri) {
    try {
      const filename = uri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename);
      const ext = match ? match[1] : "m4a";
      const mimeType = ext === "m4a" ? "audio/x-m4a" : `audio/${ext}`;

      const formData = new FormData();
      formData.append("audio", {
        uri: uri,
        name: filename,
        type: mimeType,
      });

      console.log("Sending file to AI Agent...", filename);

      // --- SEND TO AI API ---
      // const response = await fetch("https://your-api.com/analyze", {
      //   method: "POST",
      //   body: formData,
      // });
      // const result = await response.json();
      // console.log("AI Response:", result);
    } catch (uploadError) {
      console.error("Upload failed:", uploadError);
      Alert.alert(
        "Upload Failed",
        "Could not send the voice message to the server.",
      );
    }
  }
  const handleAddDocument = () => {
    setAlertVisible((prev) => !prev);
  };
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ThemedView style={styles.container}>
        <View style={styles.inputContainer}>
          <ThemedTextInput
            placeholder="Ask"
            style={styles.askInput}
            placeholderTextColor="#919ca9"
            multiline={true}
            value={text}
            onChangeText={setText}
          />

          <TouchableOpacity
            style={[styles.micButtonWrapper, { right: text ? 36 : 12 }]}
            onPress={toggleRecording}
          >
            <Ionicons
              name="mic"
              size={22}
              style={{
                color: isRecording
                  ? "#ef4444"
                  : theme === "dark"
                    ? "white"
                    : "#919ca9",
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.arrowUpButtonWrapper}>
            <Ionicons
              name={text && "arrow-up-circle"}
              size={22}
              style={{ color: Colors.primary }}
            />
          </TouchableOpacity>
          {text && (
            <TouchableOpacity
              style={styles.crossButtonWrapper}
              onPress={() => setText(null)}
            >
              <Ionicons
                name="close-circle"
                size={22}
                style={{ color: theme === "dark" ? "white" : "#9ca3af" }}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.addButtonWrapper}
            onPress={handleAddDocument}
          >
            <Ionicons
              name={alertVisible ? "close" : "add"}
              size={22}
              style={{ color: theme === "dark" ? "white" : "#919ca9" }}
            />
          </TouchableOpacity>
          <CustomChoose
            visible={alertVisible}
            onTakePhoto={handleTakePhoto}
            onChooseGallery={handleChooseGallery}
            colorTheme={colorTheme}
            onClose={() => setAlertVisible(false)}
          />
        </View>
      </ThemedView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  inputContainer: {
    position: "relative", // Allows us to pin the icon cleanly inside this box
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  askInput: {
    flex: 1,
    borderRadius: 25, // Creates a perfectly pill-shaped modern chat input
    paddingLeft: 70, // Clears space for the left add icon
    paddingRight: 70, // Clears space for the right cross icon
    borderWidth: 1,
    fontSize: 16,
  },
  addButtonWrapper: {
    position: "absolute",
    left: 12,
    bottom: 12,
    zIndex: 10,
    padding: 4,
  },
  crossButtonWrapper: {
    position: "absolute",
    left: 36,
    bottom: 12,
    zIndex: 10,
    padding: 4,
  },
  micButtonWrapper: {
    position: "absolute",
    bottom: 12,
    zIndex: 10,
    padding: 4,
  },
  arrowUpButtonWrapper: {
    position: "absolute",
    right: 12,
    bottom: 12,
    zIndex: 10,
    padding: 4,
  },
});
