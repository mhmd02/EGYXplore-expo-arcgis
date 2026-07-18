// MOCK profile data — shape mirrors the registration form + onboarding.
// Later this is replaced by a UserContext fed by:
//   register.jsx  → firstName, lastName, sex, country, phone, email
//   onboarding    → avatar (step2), interests + theme (step1)
export const USER = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  sex: "Male",
  country: "Egypt",
  phone: "+20 100 000 0000",
  avatar: null, // no image yet → falls back to initials
  interests: ["Pharaonic", "Islamic Heritage", "Local Food & Markets"],
};

// The full set of interests a user can pick (mirrors onboarding step1).
export const INTEREST_OPTIONS = [
  "Museums & Galleries",
  "Pharaonic",
  "Islamic Heritage",
  "Coptic History",
  "Desert & Oases",
  "Local Food & Markets",
  "Beaches & Marine Life",
];
