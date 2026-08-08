import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useContext, useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Colors } from "../../../constants/Colors";
import { ThemeContext } from "../../../context/ThemeContext";
import { ContentContext } from "../../../context/ContentContext";
import { useTripDraft } from "../../../context/TripDraftContext";
import { tripSchema } from "../../../schema/tripSchema";
import ThemedView from "../../../components/ThemedView";
import ThemedText from "../../../components/ThemedText";
import ThemedTextInput from "../../../components/ThemedTextInput";
import ThemedButton from "../../../components/ThemedButton";
import Card from "../../../components/Card";
import Spacer from "../../../components/Spacer";
import SuccessModal from "../../../components/SuccessModal";
import { useTabBarClearance } from "../../../constants/layout";

const formatDate = (date) =>
  date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const STOP_MOVE_DISTANCE = 76;

function DraggableStop({
  dest,
  index,
  total,
  colorTheme,
  styles,
  onMove,
  onRemove,
  onDragChange,
}) {
  const translateY = useRef(new Animated.Value(0)).current;
  const [dragging, setDragging] = useState(false);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dy) > 3,
        onPanResponderGrant: () => {
          setDragging(true);
          onDragChange(true);
          translateY.setOffset(0);
          translateY.setValue(0);
        },
        onPanResponderMove: (_, gesture) => {
          translateY.setValue(gesture.dy);
        },
        onPanResponderRelease: (_, gesture) => {
          const offset = Math.round(gesture.dy / STOP_MOVE_DISTANCE);
          const targetIndex = Math.max(0, Math.min(total - 1, index + offset));
          translateY.setValue(0);
          setDragging(false);
          onDragChange(false);
          onMove(index, targetIndex);
        },
        onPanResponderTerminate: () => {
          translateY.setValue(0);
          setDragging(false);
          onDragChange(false);
        },
      }),
    [index, onDragChange, onMove, total, translateY],
  );

  return (
    <Animated.View
      style={[
        styles.draggableStop,
        dragging && styles.draggingStop,
        { transform: [{ translateY }] },
      ]}
    >
      <Card style={styles.stopCard} variant="pharaonic">
        <View style={styles.stopRow}>
          <View style={styles.orderBadge}>
            <Text style={styles.orderBadgeText}>{index + 1}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.stopName} title={true}>
              {dest.name}
            </ThemedText>
            {dest.category ? (
              <ThemedText style={styles.stopMeta}>{dest.category}</ThemedText>
            ) : null}
          </View>
          <View style={styles.stopActions}>
            <View
              {...panResponder.panHandlers}
              style={[styles.dragHandle, dragging && styles.activeDragHandle]}
              accessibilityRole="adjustable"
              accessibilityLabel={`Drag ${dest.name} to reorder`}
              accessibilityActions={[
                { name: "increment", label: "Move later" },
                { name: "decrement", label: "Move earlier" },
              ]}
              onAccessibilityAction={(event) => {
                if (event.nativeEvent.actionName === "increment") {
                  onMove(index, Math.min(total - 1, index + 1));
                }
                if (event.nativeEvent.actionName === "decrement") {
                  onMove(index, Math.max(0, index - 1));
                }
              }}
            >
              <Ionicons
                name="reorder-three-outline"
                size={25}
                color={dragging ? Colors.primary : colorTheme.text}
              />
            </View>
            <TouchableOpacity
              onPress={() => onRemove(dest.id)}
              style={styles.removeButton}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${dest.name} from your trip`}
            >
              <Ionicons name="close" size={18} color={Colors.warning} />
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    </Animated.View>
  );
}

export default function CreateTrip() {
  const router = useRouter();
  const { theme } = useContext(ThemeContext);
  const colorTheme = Colors[theme] ?? Colors.light;
  const styles = useMemo(() => createStyles(colorTheme), [colorTheme]);
  const tabBarClearance = useTabBarClearance();

  const { destinations } = useContext(ContentContext);
  const {
    draftIds,
    draftCount,
    removeFromDraft,
    moveDraftItem,
    clearDraft,
    saveTrip,
  } = useTripDraft();

  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [savedTrip, setSavedTrip] = useState(null);
  const [activeSection, setActiveSection] = useState("details");
  const [isDraggingStop, setIsDraggingStop] = useState(false);
  // Which picker is open: "start", "end", or null. Android shows a dialog and
  // closes itself; iOS keeps an inline spinner until dismissed.
  const [openPicker, setOpenPicker] = useState(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(tripSchema),
    mode: "onTouched",
    defaultValues: {
      title: "",
      budget: "",
      companions: "",
      startDate: new Date(),
      endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    },
  });

  const startDate = watch("startDate");
  const endDate = watch("endDate");

  // The picks come from the already-loaded destinations list, in the order the
  // user added them — that order becomes Visit_Order on the server.
  const selectedDestinations = useMemo(() => {
    if (!destinations) return [];
    const byId = new Map(destinations.map((dest) => [dest.id, dest]));
    return draftIds
      .map((id) => byId.get(id))
      .filter(Boolean);
  }, [destinations, draftIds]);

  const onSubmit = async (data) => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const trip = await saveTrip(data);
      setSavedTrip(trip);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePickerChange = (field) => (event, selected) => {
    if (Platform.OS !== "ios") setOpenPicker(null);
    if (event.type === "dismissed" || !selected) return;

    setValue(field, selected, { shouldValidate: true, shouldTouch: true });
    // Keep the range coherent: dragging the start past the end pushes the end.
    if (field === "startDate" && selected > endDate) {
      setValue("endDate", selected, { shouldValidate: true });
    }
  };

  if (draftCount === 0 && !savedTrip) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <Ionicons
          name="map-outline"
          size={48}
          color={colorTheme.placeholder}
        />
        <Spacer height={12} />
        <ThemedText title={true} style={styles.emptyTitle}>
          No destinations yet
        </ThemedText>
        <ThemedText style={styles.emptyBody}>
          Add a few sanctuaries to your itinerary, then come back to plan the
          details.
        </ThemedText>
        <Spacer height={16} />
        <ThemedButton onPress={() => router.back()}>
          <Text style={styles.primaryButtonText}>Browse destinations</Text>
        </ThemedButton>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: tabBarClearance + 16 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          scrollEnabled={!isDraggingStop}
        >
          <View style={styles.sectionTabs}>
            <TouchableOpacity
              style={[
                styles.sectionTab,
                activeSection === "details" && styles.activeSectionTab,
              ]}
              onPress={() => setActiveSection("details")}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeSection === "details" }}
            >
              <Ionicons
                name="create-outline"
                size={17}
                color={
                  activeSection === "details"
                    ? Colors.primary
                    : colorTheme.placeholder
                }
              />
              <Text
                style={[
                  styles.sectionTabText,
                  activeSection === "details" && styles.activeSectionTabText,
                ]}
              >
                Trip details
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sectionTab,
                activeSection === "stops" && styles.activeSectionTab,
              ]}
              onPress={() => {
                setOpenPicker(null);
                setActiveSection("stops");
              }}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeSection === "stops" }}
            >
              <Ionicons
                name="map-outline"
                size={17}
                color={
                  activeSection === "stops"
                    ? Colors.primary
                    : colorTheme.placeholder
                }
              />
              <Text
                style={[
                  styles.sectionTabText,
                  activeSection === "stops" && styles.activeSectionTabText,
                ]}
              >
                Chosen ({draftCount})
              </Text>
            </TouchableOpacity>
          </View>

          {activeSection === "stops" && (
            <View>
              <View style={styles.itineraryHeader}>
                <ThemedText title={true} style={styles.sectionTitle}>
                  Your itinerary
                </ThemedText>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() =>
                    Alert.alert(
                      "Clear chosen destinations?",
                      "This removes every destination from your current trip.",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Clear all",
                          style: "destructive",
                          onPress: clearDraft,
                        },
                      ],
                    )
                  }
                  accessibilityRole="button"
                  accessibilityLabel="Clear all chosen destinations"
                >
                  <Ionicons name="trash-outline" size={14} color={Colors.warning} />
                  <Text style={styles.clearButtonText}>Clear all</Text>
                </TouchableOpacity>
              </View>
              <ThemedText style={styles.sectionHint}>
                {draftCount} {draftCount === 1 ? "destination" : "destinations"}, in
                visiting order. Drag the handle to reorder.
              </ThemedText>
              <Spacer height={12} />

              {selectedDestinations.map((dest, index) => (
                <DraggableStop
                  key={dest.id}
                  dest={dest}
                  index={index}
                  total={selectedDestinations.length}
                  colorTheme={colorTheme}
                  styles={styles}
                  onMove={moveDraftItem}
                  onRemove={removeFromDraft}
                  onDragChange={setIsDraggingStop}
                />
              ))}
            </View>
          )}

          {activeSection === "details" && (
            <View>
              <ThemedText title={true} style={styles.sectionTitle}>
                Trip details
              </ThemedText>
              <Spacer height={12} />

          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <ThemedTextInput
                style={styles.inputField}
                placeholder="Trip name"
                placeholderTextColor={colorTheme.placeholder}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
              />
            )}
          />
          {errors.title && (
            <Text style={styles.errorText}>{errors.title.message}</Text>
          )}

          <Controller
            control={control}
            name="budget"
            render={({ field: { onChange, onBlur, value } }) => (
              <ThemedTextInput
                style={styles.inputField}
                placeholder="Budget (optional)"
                keyboardType="numeric"
                placeholderTextColor={colorTheme.placeholder}
                value={String(value ?? "")}
                onBlur={onBlur}
                onChangeText={onChange}
              />
            )}
          />
          {errors.budget && (
            <Text style={styles.errorText}>{errors.budget.message}</Text>
          )}

          <Controller
            control={control}
            name="companions"
            render={({ field: { onChange, onBlur, value } }) => (
              <ThemedTextInput
                style={styles.inputField}
                placeholder="Companions (optional)"
                keyboardType="number-pad"
                placeholderTextColor={colorTheme.placeholder}
                value={String(value ?? "")}
                onBlur={onBlur}
                onChangeText={onChange}
              />
            )}
          />
          {errors.companions && (
            <Text style={styles.errorText}>{errors.companions.message}</Text>
          )}

          <View style={styles.dateRow}>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.fieldLabel}>From</ThemedText>
              <TouchableOpacity
                style={styles.dateField}
                onPress={() => setOpenPicker("start")}
                accessibilityRole="button"
                accessibilityLabel={`Start date, ${formatDate(startDate)}`}
              >
                <ThemedText style={styles.dateText}>
                  {formatDate(startDate)}
                </ThemedText>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={colorTheme.placeholder}
                />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.fieldLabel}>To</ThemedText>
              <TouchableOpacity
                style={styles.dateField}
                onPress={() => setOpenPicker("end")}
                accessibilityRole="button"
                accessibilityLabel={`End date, ${formatDate(endDate)}`}
              >
                <ThemedText style={styles.dateText}>
                  {formatDate(endDate)}
                </ThemedText>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={colorTheme.placeholder}
                />
              </TouchableOpacity>
            </View>
          </View>
          {errors.endDate && (
            <Text style={styles.errorText}>{errors.endDate.message}</Text>
          )}

          {openPicker === "start" && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={handlePickerChange("startDate")}
            />
          )}
          {openPicker === "end" && (
            <DateTimePicker
              value={endDate}
              mode="date"
              minimumDate={startDate}
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={handlePickerChange("endDate")}
            />
          )}
          {Platform.OS === "ios" && openPicker !== null && (
            <TouchableOpacity
              onPress={() => setOpenPicker(null)}
              style={styles.pickerDone}
            >
              <Text style={styles.pickerDoneText}>Done</Text>
            </TouchableOpacity>
          )}

          <Spacer height={8} />
            </View>
          )}

          {submitError && <Text style={styles.errorText}>{submitError}</Text>}

          <ThemedButton
            onPress={handleSubmit(onSubmit)}
            disabled={submitting}
            style={[styles.saveButton, submitting && styles.saveButtonDisabled]}
          >
            <Text style={styles.primaryButtonText}>
              {submitting ? "Saving..." : "Save Trip"}
            </Text>
          </ThemedButton>
        </ScrollView>
      </KeyboardAvoidingView>

      <SuccessModal
        visible={savedTrip !== null}
        onRequestClose={() => setSavedTrip(null)}
        emoji="🧭"
        title="Trip saved"
      >
        <ThemedText style={styles.modalBody}>
          {savedTrip?.title} is ready with {savedTrip?.stopCount}{" "}
          {savedTrip?.stopCount === 1 ? "stop" : "stops"}.
        </ThemedText>
        <Spacer height={16} />
        <ThemedButton
          style={styles.modalButton}
          onPress={() => {
            setSavedTrip(null);
            // replace, not push: the draft is empty now, so going "back" to this
            // review screen would only show the empty state.
            router.replace("/trips/my-trips");
          }}
        >
          <Text style={styles.primaryButtonText}>View my trips</Text>
        </ThemedButton>
      </SuccessModal>
    </ThemedView>
  );
}

const createStyles = (colorTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorTheme.background,
    },
    centered: {
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 40,
    },
    sectionTabs: {
      flexDirection: "row",
      gap: 8,
      padding: 5,
      marginBottom: 20,
      borderRadius: 16,
      backgroundColor: colorTheme.uiBackground,
      borderWidth: 1,
      borderColor: colorTheme.border,
    },
    sectionTab: {
      flex: 1,
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      paddingHorizontal: 10,
      borderRadius: 12,
    },
    activeSectionTab: {
      backgroundColor: "rgba(212, 175, 55, 0.14)",
      borderWidth: 1,
      borderColor: "rgba(212, 175, 55, 0.45)",
    },
    sectionTabText: {
      color: colorTheme.placeholder,
      fontSize: 13,
      fontWeight: "700",
    },
    activeSectionTabText: {
      color: Colors.primary,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "800",
      letterSpacing: 0.3,
    },
    itineraryHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    clearButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 10,
      backgroundColor: "rgba(239, 68, 68, 0.1)",
    },
    clearButtonText: {
      color: Colors.warning,
      fontSize: 12,
      fontWeight: "700",
    },
    sectionHint: {
      fontSize: 13,
      marginTop: 2,
    },
    stopCard: {
      padding: 14,
    },
    draggableStop: {
      marginBottom: 10,
      zIndex: 0,
    },
    draggingStop: {
      zIndex: 10,
      opacity: 0.94,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 12,
    },
    stopRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    orderBadge: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(212, 175, 55, 0.15)",
      borderWidth: 1,
      borderColor: "rgba(212, 175, 55, 0.4)",
    },
    orderBadgeText: {
      color: "#D4AF37",
      fontWeight: "800",
      fontSize: 13,
    },
    stopName: {
      fontSize: 16,
      fontWeight: "700",
      color: "#D4AF37",
    },
    stopMeta: {
      fontSize: 12,
      marginTop: 2,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    removeButton: {
      padding: 6,
      borderRadius: 12,
      backgroundColor: "rgba(239, 68, 68, 0.1)",
    },
    stopActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    dragHandle: {
      width: 38,
      height: 38,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(212, 175, 55, 0.12)",
    },
    activeDragHandle: {
      backgroundColor: "rgba(212, 175, 55, 0.28)",
    },
    inputField: {
      marginBottom: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colorTheme.border,
      paddingHorizontal: 16,
      backgroundColor: colorTheme.uiBackground,
    },
    fieldLabel: {
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.6,
      marginBottom: 6,
    },
    dateRow: {
      flexDirection: "row",
      gap: 12,
      marginTop: 4,
    },
    dateField: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colorTheme.border,
      backgroundColor: colorTheme.uiBackground,
      paddingHorizontal: 16,
      paddingVertical: 18,
    },
    dateText: {
      fontSize: 14,
      fontWeight: "600",
    },
    pickerDone: {
      alignSelf: "flex-end",
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    pickerDoneText: {
      color: Colors.primary,
      fontWeight: "700",
    },
    saveButton: {
      marginTop: 8,
      paddingVertical: 16,
      borderRadius: 12,
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    primaryButtonText: {
      color: "#f2f2f2",
      textAlign: "center",
      fontWeight: "700",
    },
    modalBody: {
      fontSize: 14,
      textAlign: "center",
    },
    modalButton: {
      alignSelf: "stretch",
      paddingVertical: 14,
      borderRadius: 12,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "800",
    },
    emptyBody: {
      fontSize: 14,
      textAlign: "center",
      marginTop: 6,
      lineHeight: 20,
    },
    errorText: {
      color: "#FF3B30",
      fontSize: 11,
      marginBottom: 8,
      marginLeft: 4,
    },
  });
