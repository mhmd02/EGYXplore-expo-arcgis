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
  Image,
  ScrollView,
} from "react-native";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useContext, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemeContext } from "../../../context/ThemeContext";
import { Colors } from "../../../constants/Colors";
import {
  takePhoto,
  pickImageFromGalleryMultiple,
} from "../../../constants/pickImages";
import { useRecordAndUploadAudio } from "../../../constants/useRecordAndUploadAudio";
import {
  sendChatMessage,
  getHistory,
  getHistorySession,
} from "../../../api/aiApi";
import { useEffect } from "react";
import ThemedText from "../../../components/ThemedText";
import ThemedTextInput from "../../../components/ThemedTextInput";
import ThemedView from "../../../components/ThemedView";
import CustomChoose from "../../../components/CustomChoose";
import VoiceNotePlayer from "../../../components/Playback";

// --- Module-Level Session Memory ---
// These variables live in memory as long as the app is running.
// If the user navigates away and the screen unmounts, the chat is preserved here.
// When the app is fully closed, this memory is wiped clean.
let activeSessionMessages = [];
let activeSessionId = null;

export default function Chat() {
  const { theme, setTheme } = useContext(ThemeContext);
  const colorTheme = Colors[theme] ?? Colors.light;
  const insets = useSafeAreaInsets();
  const tabBarPadding = 60 + (insets.bottom > 0 ? insets.bottom : 16);
  const [alertVisible, setAlertVisible] = useState(false);
  const [images, setImages] = useState([]);
  const [text, setText] = useState("");
  const [audioUri, setAudioUri] = useState(null);

  // Initialize state from our module-level memory
  const [messages, setMessages] = useState(activeSessionMessages);
  const [chatSessionId, setChatSessionId] = useState(activeSessionId);
  const [sending, setSending] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historySessions, setHistorySessions] = useState([]);
  const listRef = useRef(null);

  // Sync state changes back to the module-level memory so it survives unmounting
  useEffect(() => {
    activeSessionMessages = messages;
    activeSessionId = chatSessionId;
  }, [messages, chatSessionId]);

  const { isRecording, toggleRecording } = useRecordAndUploadAudio(
    handleRecordingComplete,
  );

  useEffect(() => {
    if (showHistory) {
      loadHistoryList();
    }
  }, [showHistory]);

  async function loadHistoryList() {
    try {
      const sessions = await getHistory();
      if (sessions && sessions.length > 0) {
        sessions.sort(
          (a, b) => new Date(b.updatedDate || 0) - new Date(a.updatedDate || 0),
        );
        setHistorySessions(sessions);
      }
    } catch (e) {
      console.warn("Could not load chat history list:", e);
    }
  }

  async function loadSpecificSession(sessionId) {
    try {
      const sessionData = await getHistorySession(sessionId);
      if (sessionData && sessionData.messages) {
        setMessages(sessionData.messages);
        setChatSessionId(sessionData.id);
        setShowHistory(false);
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
      }
    } catch (e) {
      Alert.alert("Error", "Could not load this conversation.");
    }
  }

  function startNewChat() {
    setMessages([]);
    setChatSessionId(null);
    setShowHistory(false);
  }

  const handleTakePhoto = async () => {
    const uri = await takePhoto();
    if (uri) setImages((prevImages) => [...prevImages, uri]);
    setAlertVisible(false);
  };

  const handleChooseGallery = async () => {
    const results = await pickImageFromGalleryMultiple();
    if (results) {
      if (Array.isArray(results)) {
        setImages((prevImages) => [...prevImages, ...results]);
      } else {
        setImages((prevImages) => [...prevImages, results]);
      }
    }
    setAlertVisible(false);
  };

  async function handleRecordingComplete(uri) {
    if (uri) {
      setAudioUri(uri);
    }
  }

  const handleAddDocument = () => {
    setAlertVisible((prev) => !prev);
  };

  // Mirrors the testing plan's onSend: append the user turn, call the backend
  // with the PRIOR history (excluding the new message), then append the reply.
  async function onSend() {
    const trimmed = (text ?? "").trim();
    if ((!trimmed && images.length === 0 && !audioUri) || sending) return;

    Keyboard.dismiss();
    // Before sending — strip images/audio from history
    const history = messages
      .slice(-16)
      .map(({ role, content }) => ({ role, content })); // prior turns, before this message
    const currentImages = [...images];
    const currentAudio = audioUri;

    const userMsg = {
      role: "user",
      content: trimmed,
      images: currentImages,
      audio: currentAudio,
    };

    const next = [...messages, userMsg];
    setMessages(next);
    setText("");
    setImages([]);
    setAudioUri(null);
    setSending(true);

    try {
      const data = await sendChatMessage(
        trimmed,
        history,
        currentImages,
        currentAudio,
        chatSessionId,
      );
      setMessages([
        ...next,
        { role: "assistant", content: data.reply, images: data.photoUrls },
      ]);
      if (data.chatSessionId) {
        setChatSessionId(data.chatSessionId);
      }
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
          {/* Render Attached Images */}
          {item.images && item.images.length > 0 && (
            <View style={styles.bubbleImagesGrid}>
              {item.images.map((imgUri, idx) => {
                const cleanUrl = imgUri.startsWith("//")
                  ? imgUri.replace("//", "")
                  : imgUri.replace("https://", "");
                const proxiedUri = `https://wsrv.nl/?url=${encodeURIComponent(cleanUrl)}`;

                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      import("react-native").then(({ Linking }) =>
                        Linking.openURL(proxiedUri),
                      );
                    }}
                  >
                    <Image
                      source={{ uri: proxiedUri }}
                      style={[styles.bubbleImage]}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Render Audio Indicator */}
          {item.audio && (
            <View style={styles.bubbleAudioRow}>
              <VoiceNotePlayer uri={item.audio} colorTheme={colorTheme} />
            </View>
          )}
          {/* Text Content */}
          {item.content ? (
            <ThemedText style={{ color: isUser ? "#fff" : colorTheme.text }}>
              {item.content}
            </ThemedText>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={[styles.container, { paddingBottom: tabBarPadding }]}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setShowHistory(!showHistory)}
              style={{ paddingRight: 10 }}
            >
              <Ionicons
                name={showHistory ? "chatbubbles-outline" : "time-outline"}
                size={26}
                color={colorTheme.title}
              />
            </TouchableOpacity>
          ),
        }}
      />

      {showHistory ? (
        <View style={{ flex: 1, paddingTop: 10 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderColor: colorTheme.border,
            }}
          >
            <ThemedText style={{ fontSize: 20, fontWeight: "bold" }}>
              Chat History
            </ThemedText>
          </View>
          <FlatList
            data={historySessions}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ padding: 16, gap: 12 }}
            ListEmptyComponent={
              <ThemedText
                style={{ opacity: 0.6, textAlign: "center", marginTop: 40 }}
              >
                No chat history found.
              </ThemedText>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{
                  padding: 16,
                  borderRadius: 12,
                  backgroundColor: colorTheme.uiBackground,
                  borderWidth: 1,
                  borderColor: colorTheme.border,
                }}
                onPress={() => loadSpecificSession(item.id)}
              >
                <ThemedText style={{ fontSize: 16, fontWeight: "600" }}>
                  {item.title || `Chat Session #${item.id}`}
                </ThemedText>
                <ThemedText
                  style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}
                >
                  {item.updatedDate
                    ? new Date(item.updatedDate).toLocaleDateString()
                    : "Previous Chat"}
                </ThemedText>
              </TouchableOpacity>
            )}
          />
          <View
            style={{
              padding: 16,
              borderTopWidth: 1,
              borderColor: colorTheme.border,
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: Colors.primary,
                padding: 16,
                borderRadius: 12,
                alignItems: "center",
              }}
              onPress={startNewChat}
            >
              <ThemedText
                style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
              >
                Start New Chat
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
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

          {/* Modern AI Chat Input Bar */}
          <View
            style={[
              styles.inputBoxContainer,
              {
                backgroundColor: colorTheme.uiBackground,
                borderColor: colorTheme.border,
              },
            ]}
          >
            {/* 1. Image Previews nested top row */}
            {(images.length > 0 || audioUri) && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.mediaPreviewList}
              >
                {audioUri && (
                  <View style={styles.audioBadge}>
                    <Ionicons name="mic" size={16} color={Colors.primary} />
                    <ThemedText style={styles.audioBadgeText}>
                      Voice note
                    </ThemedText>
                    <TouchableOpacity onPress={() => setAudioUri(null)}>
                      <Ionicons name="close-circle" size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                )}
                {images.map((uri, index) => (
                  <View key={index} style={styles.imagePreviewWrapper}>
                    <Image source={{ uri: uri }} style={styles.previewImage} />
                    <TouchableOpacity
                      style={styles.removeImageBadge}
                      onPress={() =>
                        setImages((prev) => prev.filter((_, i) => i !== index))
                      }
                    >
                      <Ionicons name="close-circle" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            {/* 2. Text Input Area */}
            <ThemedTextInput
              placeholder="Ask..."
              style={styles.askInput}
              placeholderTextColor="#919ca9"
              multiline={true}
              value={text}
              onChangeText={setText}
            />

            {/* 3. Bottom Action Bar */}
            <View style={styles.inputActionsRow}>
              {/* Left Action: Add Attachment */}
              <TouchableOpacity
                style={styles.actionIconButton}
                onPress={handleAddDocument}
              >
                <Ionicons
                  name={alertVisible ? "close" : "add"}
                  size={24}
                  style={{ color: theme === "dark" ? "white" : "#6b7280" }}
                />
              </TouchableOpacity>

              {/* Right Actions: Clear Text, Mic & Send Button */}
              <View style={styles.rightActionsRow}>
                {text.length > 0 && (
                  <TouchableOpacity
                    style={styles.actionIconButton}
                    onPress={() => setText("")}
                  >
                    <Ionicons
                      name="close-circle"
                      size={20}
                      style={{
                        color: theme === "dark" ? "#9ca3af" : "#919ca9",
                      }}
                    />
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.actionIconButton}
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
                          : "#6b7280",
                    }}
                  />
                </TouchableOpacity>

                {(text.trim().length > 0 || images.length > 0 || audioUri) && (
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={onSend}
                    disabled={sending}
                  >
                    <Ionicons
                      name="arrow-up-circle"
                      size={28}
                      style={{ color: Colors.primary }}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <CustomChoose
              visible={alertVisible}
              onTakePhoto={handleTakePhoto}
              onChooseGallery={handleChooseGallery}
              colorTheme={colorTheme}
              onClose={() => setAlertVisible(false)}
              style={{ paddingTop: 420 }}
            />
          </View>
        </KeyboardAvoidingView>
      )}
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
  inputBoxContainer: {
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    marginBottom: 12,
    width: "100%",
  },
  mediaPreviewList: {
    flexDirection: "row",
    paddingBottom: 8,
    gap: 10,
  },
  imagePreviewWrapper: {
    position: "relative",
    marginTop: 4,
    marginRight: 4,
  },
  previewImage: {
    width: 58,
    height: 58,
    borderRadius: 12,
    backgroundColor: "#e5e7eb",
  },
  askInput: {
    fontSize: 16,
    minHeight: 36,
    maxHeight: 120,
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderWidth: 0, // Removes inner borders if component had any
  },
  inputActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  rightActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionIconButton: {
    padding: 4,
  },
  sendButton: {
    padding: 2,
  },
  removeImageBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    zIndex: 10,
  },
  audioBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.05)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 6,
  },
  audioBadgeText: {
    fontSize: 12,
  },
  bubbleImagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 6,
  },
  bubbleImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  bubbleAudioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
});
