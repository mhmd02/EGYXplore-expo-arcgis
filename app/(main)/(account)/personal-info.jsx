import { useContext, useMemo, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import { ThemeContext } from "../../../context/ThemeContext";
import { useUser } from "../../../context/UserContext";
import { Colors } from "../../../constants/Colors";
import { INTEREST_OPTIONS } from "../../../constants/user";
import ThemedView from "../../../components/ThemedView";
import ThemedText from "../../../components/ThemedText";
import ThemedTextInput from "../../../components/ThemedTextInput";
import ThemedButton from "../../../components/ThemedButton";

// Fields that map 1:1 to the registration form
const FIELDS = [
  { key: "firstName", label: "First name" },
  { key: "lastName", label: "Last name" },
  { key: "country", label: "Country" },
  { key: "phone", label: "Phone", keyboardType: "phone-pad" },
  { key: "email", label: "Email", keyboardType: "email-address" },
];

export default function PersonalInfo() {
  const { theme } = useContext(ThemeContext);
  const colorTheme = Colors[theme] ?? Colors.light;
  const styles = useMemo(() => createStyles(colorTheme), [colorTheme]);

  const { user, updateUser } = useUser();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(user);

  // Fix #4: Keep form in sync if the global user object updates
  // (e.g., from an API call) when not currently editing
  useEffect(() => {
    if (!editing) {
      setForm(user);
    }
  }, [user, editing]);

  const setField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleInterest = (interest) =>
    setForm((prev) => ({
      ...prev,
      interests: prev.interests?.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...(prev.interests || []), interest],
    }));

  const handleToggleEdit = () => {
    if (editing) {
      // Fix #3: User clicked "Cancel". Revert the form back to the saved user state.
      setForm(user);
    }
    setEditing((prev) => !prev);
  };

  const handleSave = () => {
    updateUser(form);
    setEditing(false);
    Keyboard.dismiss();
  };

  return (
    <ThemedView safe={true} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Fix #1 & #2: Removed TouchableWithoutFeedback */}

        {/* Edit / cancel toggle */}
        <View style={styles.headerRow}>
          <ThemedText style={styles.sectionTitle}>Details</ThemedText>
          <TouchableOpacity onPress={handleToggleEdit} activeOpacity={0.7}>
            <ThemedText style={styles.editToggle}>
              {editing ? "Cancel" : "Edit"}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Fields */}
        <View style={styles.card}>
          {FIELDS.map((field, index) => (
            <View
              key={field.key}
              style={[
                styles.fieldBlock,
                index < FIELDS.length - 1 && styles.fieldDivider,
              ]}
            >
              <ThemedText style={styles.fieldLabel}>{field.label}</ThemedText>
              {editing ? (
                <ThemedTextInput
                  style={styles.input}
                  value={form[field.key]}
                  onChangeText={(t) => setField(field.key, t)}
                  keyboardType={field.keyboardType}
                  placeholder={field.label}
                  placeholderTextColor={colorTheme.placeholder}
                  editable={
                    field.key === "phone" || field.key === "email"
                      ? false
                      : true
                  }
                />
              ) : (
                <ThemedText style={styles.fieldValue}>
                  {form[field.key] || "—"}
                </ThemedText>
              )}
            </View>
          ))}
        </View>

        {/* Interests */}
        <ThemedText style={styles.sectionTitle}>Interests</ThemedText>
        <View style={styles.interestWrap}>
          {(editing ? INTEREST_OPTIONS : form.interests || []).map(
            (interest) => {
              const selected = form.interests?.includes(interest);
              return (
                <TouchableOpacity
                  key={interest}
                  disabled={!editing}
                  activeOpacity={0.7}
                  onPress={() => toggleInterest(interest)}
                  style={[
                    styles.interestChip,
                    {
                      backgroundColor: selected
                        ? Colors.primary
                        : colorTheme.uiBackground,
                      borderColor: selected
                        ? Colors.primary
                        : colorTheme.border,
                    },
                  ]}
                >
                  <ThemedText
                    style={[styles.interestText, selected && { color: "#fff" }]}
                  >
                    {interest}
                  </ThemedText>
                </TouchableOpacity>
              );
            },
          )}
        </View>

        {/* Save appears only in edit mode */}
        {editing && (
          <ThemedButton style={styles.saveButton} onPress={handleSave}>
            <ThemedText style={styles.saveText}>Save Changes</ThemedText>
          </ThemedButton>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const createStyles = (colorTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorTheme.background,
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 40,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
    },
    editToggle: {
      fontSize: 15,
      fontWeight: "700",
      color: Colors.primary,
    },
    card: {
      backgroundColor: colorTheme.uiBackground,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colorTheme.border,
      paddingHorizontal: 16,
      marginBottom: 24,
    },
    fieldBlock: {
      paddingVertical: 14,
    },
    fieldDivider: {
      borderBottomWidth: 1,
      borderBottomColor: colorTheme.border,
    },
    fieldLabel: {
      fontSize: 13,
      opacity: 0.6,
      marginBottom: 6,
    },
    fieldValue: {
      fontSize: 16,
      fontWeight: "600",
    },
    input: {
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colorTheme.border,
    },
    // Interests
    interestWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 24,
    },
    interestChip: {
      borderWidth: 1,
      borderRadius: 20,
      paddingVertical: 8,
      paddingHorizontal: 14,
    },
    interestText: {
      fontSize: 13,
      fontWeight: "600",
    },
    saveButton: {
      alignItems: "center",
      marginBottom: 40,
      zIndex: 10,
    },
    saveText: {
      color: "#fff",
      fontWeight: "700",
      textAlign: "center",
    },
  });
