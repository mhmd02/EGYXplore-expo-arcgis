import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const HOTLINES = [
  { icon: "shield-outline", label: "Police", number: "122" },
  { icon: "medkit-outline", label: "Ambulance", number: "123" },
  { icon: "flame-outline", label: "Fire", number: "180" },
  { icon: "business-outline", label: "Tourism Police", number: "126" },
];

export default function HelpModal({ visible, onClose, colorTheme }) {
  const isDark = colorTheme.background === "#101521";
  const cardBg = isDark ? "#1E293B" : "#FFFFFF";
  const textColor = isDark ? "#F8FAFC" : "#0F172A";
  const subColor = isDark ? "#CBD5E1" : "#334155";
  const iconColor = isDark ? "#64748B" : "#94A3B8";
  const borderColor = isDark ? "#334155" : "#E2E8F0";
  const numberColor = "#0284C7"; // always primary blue

  return (
    <Modal
      transparent
      animationType="fade"
      statusBarTranslucent
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={[styles.card, { backgroundColor: cardBg }]}>
              {/* HEADER ROW */}
              <View style={styles.headerRow}>
                <Ionicons name="help-circle" size={24} color="#0284C7" />
                <Text style={[styles.title, { color: textColor }]}>
                  Help & Support
                </Text>
              </View>

              {/* DIVIDER */}
              <View
                style={[styles.divider, { backgroundColor: borderColor }]}
              />

              {/* CONTACT US ROW */}
              <TouchableOpacity
                style={styles.contactRow}
                onPress={() => Linking.openURL("mailto:support@egyxplore.com")}
              >
                <Ionicons name="mail-outline" size={20} color="#0284C7" />
                <View style={styles.contactTextWrap}>
                  <Text style={[styles.contactLabel, { color: textColor }]}>
                    Contact Us
                  </Text>
                  <Text style={[styles.contactSub, { color: subColor }]}>
                    support@egyxplore.com
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={iconColor} />
              </TouchableOpacity>

              {/* DIVIDER */}
              <View
                style={[styles.divider, { borderBottomColor: borderColor }]}
              />

              {/* SECTION LABEL */}
              <Text style={[styles.sectionLabel, { color: subColor }]}>
                Egypt Emergency Hotlines
              </Text>

              {/* HOTLINE ROWS */}
              {HOTLINES.map((hotline, index) => (
                <TouchableOpacity
                  key={hotline.number}
                  style={[
                    styles.hotlineRow,
                    index === HOTLINES.length - 1 && styles.lastHotlineRow,
                  ]}
                  onPress={() => Linking.openURL(`tel:${hotline.number}`)}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconContainer}>
                    <Ionicons name={hotline.icon} size={20} color={iconColor} />
                  </View>
                  <Text style={[styles.hotlineLabel, { color: textColor }]}>
                    {hotline.label}
                  </Text>
                  <Text style={[styles.hotlineNumber, { color: numberColor }]}>
                    {hotline.number}
                  </Text>
                </TouchableOpacity>
              ))}
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
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  contactTextWrap: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  contactSub: {
    fontSize: 13,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  hotlineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  lastHotlineRow: {
    marginBottom: 0,
  },
  iconContainer: {
    width: 24,
    alignItems: "flex-start",
  },
  hotlineLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  hotlineNumber: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 1,
  },
});
