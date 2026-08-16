import { useState } from "react";
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

/**
 * Compact, themed replacement for @react-native-picker/picker's dropdown.
 * The native Android dropdown renders through the OS's own popup menu with
 * fixed, non-stylable row heights — this instead opens a small themed Modal
 * with a tight FlatList, so row height/spacing/colors are fully controlled
 * here and match the app on both platforms.
 */
export default function CompactPicker({
  selectedValue,
  onValueChange,
  items,
  colorTheme,
  placeholder = "Select...",
}) {
  const [open, setOpen] = useState(false);
  const styles = createStyles(colorTheme);

  return (
    <>
      <TouchableOpacity
        style={styles.field}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.fieldText} numberOfLines={1}>
          {selectedValue || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={14} color={colorTheme.text} />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          {/* Inner Pressable with a no-op onPress absorbs taps so they
              don't bubble to the backdrop and close the sheet when the
              user is just interacting with the list itself. */}
          <Pressable style={styles.sheet} onPress={() => {}}>
            <FlatList
              data={items}
              keyExtractor={(item, index) => `${item}-${index}`}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              renderItem={({ item }) => {
                const active = item === selectedValue;
                return (
                  <TouchableOpacity
                    style={styles.row}
                    onPress={() => {
                      onValueChange(item);
                      setOpen(false);
                    }}
                  >
                    <Text
                      style={[styles.rowText, active && styles.rowTextActive]}
                      numberOfLines={1}
                    >
                      {item}
                    </Text>
                    {active && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={colorTheme.title}
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
              style={styles.list}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const createStyles = (colorTheme) =>
  StyleSheet.create({
    field: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 8,
      paddingHorizontal: 2,
    },
    fieldText: {
      color: colorTheme.title,
      fontSize: 14,
      fontWeight: "500",
      flex: 1,
      marginRight: 8,
    },
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    sheet: {
      width: "100%",
      maxWidth: 360,
      maxHeight: 320,
      backgroundColor: colorTheme.uiBackground,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colorTheme.border,
      overflow: "hidden",
    },
    list: {
      flexGrow: 0,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 10,
      paddingHorizontal: 16,
    },
    rowText: {
      color: colorTheme.text,
      fontSize: 14,
      flexShrink: 1,
    },
    rowTextActive: {
      color: colorTheme.title,
      fontWeight: "700",
    },
    separator: {
      height: 1,
      backgroundColor: colorTheme.border,
    },
  });
