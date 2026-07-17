import { useSafeAreaInsets } from "react-native-safe-area-context";

// The floating tab bar (see app/(main)/_layout.jsx) sits `bottom` above the
// screen edge and is ~60px tall. Content lists must clear that footprint so
// the last item isn't hidden behind it. Centralized here so both the tab bar
// and the lists derive their spacing from one source.
export const TAB_BAR_HEIGHT = 60;
export const TAB_BAR_BOTTOM_FALLBACK = 16;

// How much bottom space a scrollable list needs to clear the floating tab bar.
export function useTabBarClearance() {
  const insets = useSafeAreaInsets();
  const bottom = insets.bottom > 0 ? insets.bottom : TAB_BAR_BOTTOM_FALLBACK;
  return bottom + TAB_BAR_HEIGHT;
}
