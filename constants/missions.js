// Shared mission data — imported by the missions list and the quest detail page.
// Replace with real data / API later.
export const MISSION_TYPES = [
  "All",
  "Pharaonic",
  "Islamic",
  "Coptic",
  "Desert",
];

export const MISSIONS = [
  {
    id: "1",
    name: "Explore the Pyramids",
    points: 150,
    type: "Pharaonic",
    estimatedTime: "2h",
    objectives: [
      "Reach the Giza plateau",
      "Take a photo at the Great Pyramid",
      "Answer the quiz to complete",
    ],
    hint: "Head to the Giza plateau entrance near the Sphinx — tickets are sold at the main gate.",
  },
  {
    id: "2",
    name: "Visit Al-Azhar Mosque",
    points: 120,
    type: "Islamic",
    estimatedTime: "1h",
    objectives: [
      "Enter through the main courtyard",
      "Find the historic minarets",
      "Check in at the mosque",
    ],
    hint: "Al-Azhar is in Islamic Cairo, a short walk from Khan el-Khalili bazaar.",
  },
  {
    id: "3",
    name: "Tour the Hanging Church",
    points: 100,
    type: "Coptic",
    estimatedTime: "1h",
    objectives: [
      "Locate the church in Coptic Cairo",
      "Spot the wooden roof",
      "Check in to complete",
    ],
    hint: "Look for it above the gatehouse of the old Babylon Fortress in Coptic Cairo.",
  },
  {
    id: "4",
    name: "Safari in the White Desert",
    points: 200,
    type: "Desert",
    estimatedTime: "4h",
    objectives: [
      "Arrive at the White Desert",
      "Find the chalk rock formations",
      "Capture a sunset photo",
    ],
    hint: "The chalk formations are best reached with a 4x4 from Bahariya Oasis.",
  },
  {
    id: "5",
    name: "Discover Karnak Temple",
    points: 180,
    type: "Pharaonic",
    estimatedTime: "3h",
    objectives: [
      "Enter the temple complex",
      "Walk the Hypostyle Hall",
      "Answer the quiz to complete",
    ],
    hint: "Karnak is on the east bank of the Nile in Luxor, north of the main town.",
  },
  {
    id: "6",
    name: "Discover Karnak Temple",
    points: 180,
    type: "Pharaonic",
    estimatedTime: "3h",
    objectives: [
      "Enter the temple complex",
      "Walk the Hypostyle Hall",
      "Answer the quiz to complete",
    ],
    hint: "Karnak is on the east bank of the Nile in Luxor, north of the main town.",
  },
  {
    id: "7",
    name: "Discover Karnak Temple",
    points: 180,
    type: "Pharaonic",
    estimatedTime: "3h",
    objectives: [
      "Enter the temple complex",
      "Walk the Hypostyle Hall",
      "Answer the quiz to complete",
    ],
    hint: "Karnak is on the east bank of the Nile in Luxor, north of the main town.",
  },
];

// Small helper so pages don't repeat the lookup
export const getMissionById = (id) => MISSIONS.find((m) => m.id === id);
