// Shared reward data — imported by the rewards list.
// Rewards are redeemed by spending points earned from missions.
// Each reward is provided by a sponsor (shown on the card).
// Replace with real data / API later.
export const REWARD_TYPES = ["All", "Discounts", "Experiences", "Souvenirs"];

export const REWARDS = [
  {
    id: "1",
    name: "10% Off Museum Ticket",
    cost: 100,
    type: "Discounts",
    sponsor: "Egyptian Museum",
    description: "Get 10% off any national museum entry ticket.",
  },
  {
    id: "2",
    name: "Free Nile Felucca Ride",
    cost: 250,
    type: "Experiences",
    sponsor: "Nile Cruises Co.",
    description: "A 30-minute traditional sailboat ride on the Nile.",
  },
  {
    id: "3",
    name: "Papyrus Souvenir",
    cost: 150,
    type: "Souvenirs",
    sponsor: "Cairo Papyrus Institute",
    description: "A hand-painted papyrus scroll from a local artisan.",
  },
  {
    id: "4",
    name: "Guided Old Cairo Tour",
    cost: 400,
    type: "Experiences",
    sponsor: "Heritage Tours Egypt",
    description: "A half-day guided walking tour through Islamic Cairo.",
  },
  {
    id: "5",
    name: "20% Off Bazaar Purchase",
    cost: 200,
    type: "Discounts",
    sponsor: "Khan el-Khalili Bazaar",
    description: "Save 20% at participating Khan el-Khalili shops.",
  },
  {
    id: "6",
    name: "20% Off Bazaar Purchase",
    cost: 200,
    type: "Discounts",
    sponsor: "Khan el-Khalili Bazaar",
    description: "Save 20% at participating Khan el-Khalili shops.",
  },
  {
    id: "7",
    name: "20% Off Bazaar Purchase",
    cost: 200,
    type: "Discounts",
    sponsor: "Khan el-Khalili Bazaar",
    description: "Save 20% at participating Khan el-Khalili shops.",
  },
];

// Small helper so pages don't repeat the lookup
export const getRewardById = (id) => REWARDS.find((r) => r.id === id);
