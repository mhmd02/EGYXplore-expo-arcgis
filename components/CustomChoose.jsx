import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
export default function CustomChoose({
  visible,
  onClose,
  onTakePhoto,
  onChooseGallery,
  colorTheme,
}) {
  const isDark =
    colorTheme.background === "#000" || colorTheme.background === "#121212"; // Adjust based on your actual theme constants
  const menuBgColor = isDark ? "#1E1F22" : "#FFFFFF";
  const textColor = isDark ? "#E3E3E3" : "#1F1F1F";
  const iconColor = isDark ? "#C4C7C5" : "#444746";
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          {/* Prevent taps inside the menu from closing the modal */}
          <TouchableWithoutFeedback>
            <View
              style={[styles.menuContainer, { backgroundColor: menuBgColor }]}
            >
              {/* Option 1: Take Photo */}
              <TouchableOpacity style={styles.menuItem} onPress={onTakePhoto}>
                <Ionicons
                  name="camera-outline"
                  size={22}
                  color={iconColor}
                  style={styles.icon}
                />
                <Text style={[styles.menuText, { color: textColor }]}>
                  Take Photo
                </Text>
              </TouchableOpacity>

              {/* Option 2: Choose from Gallery */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={onChooseGallery}
              >
                <Ionicons
                  name="image-outline"
                  size={22}
                  color={iconColor}
                  style={styles.icon}
                />
                <Text style={[styles.menuText, { color: textColor }]}>
                  Choose from Gallery
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    // 1. Anchors the menu layout to the top of the screen
    justifyContent: "flex-start",
    alignItems: "flex-start",

    // 2. Aligns horizontally directly under your "+" button
    // (16px screen padding + 12px button absolute left = 28px)
    paddingLeft: 28,

    // 3. Pushes the menu down so it sits perfectly under your input bar.
    // Adjust this value up or down depending on your device's Status Bar height!
    paddingTop: 200,
  },
  menuContainer: {
    width: 240, // Matches the compact width of the reference menu
    borderRadius: 20, // The heavily rounded corners from the screenshot
    paddingVertical: 12,

    // Shadows to give it that "floating" elevation effect
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8, // For Android shadow
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  icon: {
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
