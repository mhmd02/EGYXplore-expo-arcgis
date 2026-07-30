import { Modal, View, Text, StyleSheet } from "react-native";
import { useContext } from "react";
import { Colors } from "../constants/Colors";
import { ThemeContext } from "../context/ThemeContext";

// Shared success popup shell used by mission + reward detail pages.
// Owns the backdrop, themed card, emoji and title; each screen passes its
// own body/actions as children.
export default function SuccessModal({
  visible,
  onRequestClose,
  emoji = "🎉",
  title,
  children,
}) {
  const { theme } = useContext(ThemeContext);
  const colorTheme = Colors[theme] || Colors.light;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onRequestClose}
      statusBarTranslucent={true}
    >
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: colorTheme.uiBackground }]}>
          <Text style={styles.emoji}>{emoji}</Text>
          <Text style={[styles.title, { color: colorTheme.title }]}>{title}</Text>
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  emoji: {
    fontSize: 44,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 6,
  },
});
