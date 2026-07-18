export const Colors = {
  // --- Brand & Status Colors (Shared across both modes) ---
  primary: "#0284C7", // "Ocean Blue" - Trustworthy, vibrant, perfect for travel
  accent: "#F59E0B", // "Warm Sun" - Great for star ratings, special offers, or highlights
  warning: "#EF4444", // Standard intuitive red for errors/deletions
  success: "#10B981", // Standard intuitive green for successful bookings

  // --- Light Theme ---
  light: {
    background: "#F8FAFC", // Very subtle off-white/gray so white photo cards pop
    uiBackground: "#FFFFFF", // Pure white for cards, inputs, and modals
    navBackground: "#FFFFFF", // Pure white for bottom tabs and headers

    title: "#0F172A", // Deep slate/navy for strong, readable headings
    text: "#334155", // Softer dark gray for highly readable body text
    placeholder: "#919ca9",
    iconColor: "#94A3B8", // Subtle gray for unselected navigation icons
    iconColorFocused: "#0284C7", // Pops with your primary brand color when active

    border: "#E2E8F0", // Very soft border line to separate list items
  },

  // --- Dark Theme ---
  dark: {
    background: "#101521", // Deep "Night Sky" slate (looks much more premium than pure black)
    uiBackground: "#1E293B", // Slightly elevated slate for cards and search inputs
    navBackground: "#1E293B", // Matches the UI background for a seamless bottom tab bar

    title: "#F8FAFC", // Crisp white for headings
    text: "#CBD5E1", // Soft light gray for comfortable night reading (prevents eye strain)
    placeholder: "#919ca9",
    iconColor: "#64748B", // Dimmed gray for unselected dark mode icons
    iconColorFocused: "#38BDF8", // A lighter, glowing "Sky Blue" that stands out better on dark backgrounds

    border: "#334155", // Subtle dark divider line
  },
};
