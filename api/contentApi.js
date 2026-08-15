import { API_BASE_URL, checkDeletedUser } from "./api";

export const getMissions = async (token) => {
  const response = await fetch(`${API_BASE_URL}/MobileMission/AllMissions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  await checkDeletedUser(response);
  if (!response.ok) {
    throw new Error(`Failed to fetch missions: ${response.status}`);
  }
  return response.json();
};

export const getRewards = async (token) => {
  const response = await fetch(`${API_BASE_URL}/MobileReward/AllRewards`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  await checkDeletedUser(response);
  if (!response.ok) {
    throw new Error(`Failed to fetch rewards: ${response.status}`);
  }
  return response.json();
};

export const getDestinations = async (token) => {
  const response = await fetch(`${API_BASE_URL}/MobileDestination/AllDest`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  await checkDeletedUser(response);
  if (!response.ok) {
    throw new Error(`Failed to fetch destinations: ${response.status}`);
  }
  return response.json();
};

export const getDestinationDetails = async (token, destinationId) => {
  const response = await fetch(
    `${API_BASE_URL}/MobileDestination/GetDestinationById`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ destinationId }),
    },
  );
  await checkDeletedUser(response);
  if (!response.ok) {
    const rawText = await response.text();
    console.log("RAW ERROR BODY:", rawText); // ← temporary, check your Metro/dev console

    let errorBody = {};
    try {
      errorBody = JSON.parse(rawText);
    } catch {
      // not JSON — rawText itself is the useful info, already logged above
    }

    throw new Error(
      errorBody.message ||
        rawText ||
        `Failed to fetch a destination: ${response.status}`,
    );
  }

  return response.json();
};
