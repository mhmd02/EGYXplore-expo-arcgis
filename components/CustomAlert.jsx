import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function CustomAlert({
  visible,
  onClose,
  onTakePhoto,
  onChooseGallery,
  colorTheme,
}) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      {/* 1. Backdrop (The dark transparent background) */}
      <View style={styles.backdrop}>
        {/* 2. The Alert Box (You can style this however you want!) */}
        <View
          style={[styles.alertBox, { backgroundColor: colorTheme.background }]}
        >
          <Text style={[styles.title, { color: colorTheme.text }]}>
            Profile Picture
          </Text>
          <Text style={styles.subTitle}>
            Select how you want to add your photo
          </Text>

          {/* 3. Custom Styled Buttons */}
          <TouchableOpacity style={styles.button} onPress={onTakePhoto}>
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={onChooseGallery}>
            <Text style={styles.buttonText}>Choose from Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={{ color: "red" }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)", // Darkens the screen behind the alert
    justifyContent: "center",
    alignItems: "center",
  },
  alertBox: {
    width: "80%",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  subTitle: { color: "#666", marginBottom: 20, textAlign: "center" },
  button: {
    width: "100%",
    padding: 12,
    alignItems: "center",
    marginVertical: 5,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  buttonText: { fontWeight: "600" },
  cancelButton: { backgroundColor: "transparent", marginTop: 10 },
});
