import { useMemo } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";

export default function GovernorateFilterSheet({
  visible,
  onClose,
  governorates,
  selectedGovernorates,
  onChange,
  colorTheme,
}) {
  const styles = useMemo(() => createStyles(colorTheme), [colorTheme]);
  const allSelected =
    governorates.length > 0 &&
    selectedGovernorates.length === governorates.length;
  const noneSelected = selectedGovernorates.length === 0;

  const toggle = (gov) => {
    onChange(
      selectedGovernorates.includes(gov)
        ? selectedGovernorates.filter((g) => g !== gov)
        : [...selectedGovernorates, gov],
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.header}>
            <Text style={styles.title}>Governorates</Text>
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={20} color={colorTheme.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.quickActions}>
            <TouchableOpacity
              onPress={() => onChange(governorates)}
              disabled={allSelected}
            >
              <Text
                style={[
                  styles.quickActionText,
                  allSelected && styles.quickActionTextDisabled,
                ]}
              >
                Select all
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onChange([])}
              disabled={noneSelected}
            >
              <Text
                style={[
                  styles.quickActionText,
                  noneSelected && styles.quickActionTextDisabled,
                ]}
              >
                Clear all
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={governorates}
            keyExtractor={(item) => item}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item }) => {
              const active = selectedGovernorates.includes(item);
              return (
                <TouchableOpacity
                  style={styles.row}
                  onPress={() => toggle(item)}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: active }}
                >
                  <Text style={styles.rowText} numberOfLines={1}>
                    {item}
                  </Text>
                  <Ionicons
                    name={active ? "checkbox" : "square-outline"}
                    size={20}
                    color={active ? Colors.primary : colorTheme.text}
                  />
                </TouchableOpacity>
              );
            }}
            style={styles.list}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Loading governorates...</Text>
            }
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const createStyles = (colorTheme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: colorTheme.uiBackground,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      borderWidth: 1,
      borderColor: colorTheme.border,
      borderBottomWidth: 0,
      maxHeight: "70%",
      paddingTop: 16,
      paddingHorizontal: 18,
      paddingBottom: 36,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    title: {
      fontSize: 16,
      fontWeight: "700",
      color: colorTheme.title,
    },
    quickActions: {
      flexDirection: "row",
      gap: 20,
      marginBottom: 8,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: colorTheme.border,
    },
    quickActionText: {
      color: Colors.primary,
      fontSize: 13,
      fontWeight: "600",
    },
    quickActionTextDisabled: {
      opacity: 0.4,
    },
    list: {
      flexGrow: 0,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
    },
    rowText: {
      color: colorTheme.text,
      fontSize: 14,
      flexShrink: 1,
      marginRight: 12,
    },
    separator: {
      height: 1,
      backgroundColor: colorTheme.border,
    },
    emptyText: {
      color: colorTheme.text,
      fontSize: 13,
      textAlign: "center",
      paddingVertical: 16,
      opacity: 0.6,
    },
    doneButton: {
      marginTop: 14,
      backgroundColor: Colors.primary,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: "center",
    },
    doneButtonText: {
      color: "#fff",
      fontWeight: "700",
      fontSize: 14,
    },
  });
