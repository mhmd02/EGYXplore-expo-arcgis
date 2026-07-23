import {
  Alert,
  Keyboard,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useContext, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemeContext } from "../../../context/ThemeContext";
import ThemedTextInput from "../../../components/ThemedTextInput";
import ThemedText from "../../../components/ThemedText";
import ThemedView from "../../../components/ThemedView";
import { Colors } from "../../../constants/Colors";
import { takePhoto, pickImageFromGallery } from "../../../constants/pickImages";
import { useRecordAndUploadAudio } from "../../../constants/useRecordAndUploadAudio";
import CustomChoose from "../../../components/CustomChoose";
import { sendChatMessage } from "../../../constants/api";

export default function Chat() {
  const { theme, setTheme } = useContext(ThemeContext);
  const colorTheme = Colors[theme] ?? Colors.light;
  const insets = useSafeAreaInsets();
  const tabBarPadding = 60 + (insets.bottom > 0 ? insets.bottom : 16);
  const [profileImage, setProfileImage] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [text, setText] = useState("");

  // The full conversation. Each item is { role: "user" | "assistant", content }.
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

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
    // Voice upload stays stubbed until the expo-audio migration lands.
    console.log("Recording complete (not yet wired to AI):", uri);
  }

  const handleAddDocument = () => {
    setAlertVisible((prev) => !prev);
  };

  // Mirrors the testing plan's onSend: append the user turn, call the backend
  // with the PRIOR history (excluding the new message), then append the reply.
  async function onSend() {
    const trimmed = (text ?? "").trim();
    if (!trimmed || sending) return;

    Keyboard.dismiss();
    const history = messages.slice(-16); // prior turns, before this message
    const next = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setText("");
    setSending(true);

    try {
      const data = await sendChatMessage(trimmed, history);
      setMessages([...next, { role: "assistant", content: data.reply }]);
      if (data.tripSaved) {
        // A trip was created/updated — data.tripPlanId / data.tripPlanTitle
        // are available here to navigate to a details screen later.
        Alert.alert("Trip saved", data.tripPlanTitle || "Your trip was saved.");
      }
    } catch (e) {
      setMessages([
        ...next,
        { role: "assistant", content: e.message || "Something went wrong." },
      ]);
    } finally {
      setSending(false);
      requestAnimationFrame(() =>
        listRef.current?.scrollToEnd({ animated: true }),
      );
    }
  }

  const renderMessage = ({ item }) => {
    const isUser = item.role === "user";
    return (
      <View
        style={[
          styles.bubbleRow,
          { justifyContent: isUser ? "flex-end" : "flex-start" },
        ]}
      >
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: isUser
                ? Colors.primary
                : colorTheme.uiBackground,
              borderColor: colorTheme.border,
              borderTopRightRadius: isUser ? 4 : 16,
              borderTopLeftRadius: isUser ? 16 : 4,
            },
          ]}
        >
          <ThemedText style={{ color: isUser ? "#fff" : colorTheme.text }}>
            {item.content}
          </ThemedText>
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={[styles.container, { paddingBottom: tabBarPadding }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={90}
      >
        {messages.length === 0 ? (
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.empty}>
              <Ionicons
                name="sparkles-outline"
                size={40}
                color={colorTheme.placeholder}
              />
              <ThemedText style={styles.emptyText}>
                Ask me about Egyptian history, places, or to plan a trip.
              </ThemedText>
            </View>
          </TouchableWithoutFeedback>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(_, i) => i.toString()}
            renderItem={renderMessage}
            contentContainerStyle={styles.list}
            onContentSizeChange={() =>
              listRef.current?.scrollToEnd({ animated: true })
            }
            keyboardShouldPersistTaps="handled"
          />
        )}

        {sending && (
          <View style={styles.thinkingRow}>
            <ActivityIndicator size="small" color={colorTheme.text} />
            <ThemedText style={styles.thinkingText}>Thinking…</ThemedText>
          </View>
        )}

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

          {text ? (
            <TouchableOpacity
              style={styles.arrowUpButtonWrapper}
              onPress={onSend}
              disabled={!text.trim() || sending}
            >
              <Ionicons
                name="arrow-up-circle"
                size={22}
                style={{ color: Colors.primary }}
              />
            </TouchableOpacity>
          ) : null}

          {text ? (
            <TouchableOpacity
              style={styles.crossButtonWrapper}
              onPress={() => setText("")}
            >
              <Ionicons
                name="close-circle"
                size={22}
                style={{ color: theme === "dark" ? "white" : "#9ca3af" }}
              />
            </TouchableOpacity>
          ) : null}

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
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 0, // overridden dynamically via style prop below
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 15,
    opacity: 0.7,
  },
  list: {
    paddingVertical: 12,
    gap: 8,
  },
  bubbleRow: {
    flexDirection: "row",
    width: "100%",
  },
  bubble: {
    maxWidth: "80%",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  thinkingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  thinkingText: {
    fontSize: 13,
    opacity: 0.7,
  },
  inputContainer: {
    position: "relative", // Allows us to pin the icon cleanly inside this box
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 12,
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
