import { API_BASE_URL } from "./api";

export const createTripApi = async (token, payload) => {
  const response = await fetch(`${API_BASE_URL}/MobileTrip/CreateTrip`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.message || `Failed to save trip: ${response.status}`,
    );
  }
  return response.json();
};

export const getMyTrips = async (token) => {
  const response = await fetch(`${API_BASE_URL}/MobileTrip/MyTrips`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch your trips: ${response.status}`);
  }
  return response.json();
};

export const getTripById = async (token, tripId) => {
  const response = await fetch(`${API_BASE_URL}/MobileTrip/GetTripById`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ tripId }),
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.message || `Failed to fetch the trip: ${response.status}`,
    );
  }
  return response.json();
};

export const completeTripApi = async (token, tripId) => {
  const response = await fetch(`${API_BASE_URL}/MobileTrip/CompleteTrip`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ tripId }),
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.message || `Failed to complete trip: ${response.status}`,
    );
  }
  return response.json();
};

export const deleteTripApi = async (token, tripId) => {
  const response = await fetch(`${API_BASE_URL}/MobileTrip/DeleteTrip`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ tripId }),
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.message || `Failed to delete trip: ${response.status}`,
    );
  }
  return response.json();
};
