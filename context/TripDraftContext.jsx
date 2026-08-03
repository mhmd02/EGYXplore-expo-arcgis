import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "./UserContext";
import {
  createTripApi,
  getMyTrips,
  completeTripApi,
  deleteTripApi,
} from "../api/tripApi";

const TripDraftContext = createContext(null);

// The in-progress trip lives on the device: tapping "Add to Itinerary" should be
// instant, so nothing is sent to the server until the user saves. Keyed per user
// so one account's draft never shows up under another on a shared device.
const draftKey = (userId) => `trip-draft:${userId ?? "anonymous"}`;

export default function TripDraftProvider({ children }) {
  const { token, user, isLoading: userLoading } = useUser();
  const [draftIds, setDraftIds] = useState([]);
  const [savedTrips, setSavedTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Guards the persist effect so an empty initial state can't overwrite a
  // stored draft before hydration has finished.
  const hydratedFor = useRef(null);

  const userId = user?.id ?? null;

  // Hydrate the draft whenever the signed-in user changes.
  useEffect(() => {
    if (userLoading) return;

    if (!token) {
      hydratedFor.current = null;
      setDraftIds([]);
      setSavedTrips([]);
      setError(null);
      setLoading(false);
      return;
    }

    let active = true;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(draftKey(userId));
        if (!active) return;
        const parsed = stored ? JSON.parse(stored) : [];
        setDraftIds(Array.isArray(parsed) ? parsed : []);
      } catch (err) {
        console.log("Failed to restore trip draft:", err);
        if (active) setDraftIds([]);
      } finally {
        if (active) hydratedFor.current = userId;
      }
    })();

    return () => {
      active = false;
    };
  }, [token, userId, userLoading]);

  // Persist on every change, but only once this user's draft is hydrated.
  useEffect(() => {
    if (hydratedFor.current !== userId) return;
    AsyncStorage.setItem(draftKey(userId), JSON.stringify(draftIds)).catch(
      (err) => console.log("Failed to persist trip draft:", err),
    );
  }, [draftIds, userId]);

  const refreshTrips = useCallback(async () => {
    if (!token) {
      setSavedTrips([]);
      return;
    }
    const data = await getMyTrips(token);
    setSavedTrips(Array.isArray(data) ? data : []);
  }, [token]);

  useEffect(() => {
    if (userLoading) return;
    if (!token) return;

    setLoading(true);
    setError(null);
    refreshTrips()
      .catch((err) => {
        console.log(err);
        setError(err.message || "Failed to load your trips.");
      })
      .finally(() => setLoading(false));
  }, [token, userLoading, refreshTrips]);

  const isInDraft = (destinationId) => draftIds.includes(destinationId);

  const toggleDraft = (destinationId) => {
    setDraftIds((prev) =>
      prev.includes(destinationId)
        ? prev.filter((id) => id !== destinationId)
        : [...prev, destinationId],
    );
  };

  const removeFromDraft = (destinationId) => {
    setDraftIds((prev) => prev.filter((id) => id !== destinationId));
  };

  const moveDraftItem = (fromIndex, toIndex) => {
    setDraftIds((prev) => {
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= prev.length ||
        toIndex >= prev.length ||
        fromIndex === toIndex
      ) {
        return prev;
      }

      const reordered = [...prev];
      const [movedId] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, movedId);
      return reordered;
    });
  };

  const clearDraft = () => setDraftIds([]);

  // Sends the draft as one trip. The draft is only cleared once the server has
  // accepted it, so a failed save (offline, validation) keeps the user's picks.
  const saveTrip = async (form) => {
    const payload = {
      title: form.title,
      startDate: toApiDate(form.startDate),
      endDate: toApiDate(form.endDate),
      budget: form.budget ?? null,
      companions: form.companions ?? null,
      destinationIds: draftIds,
    };

    const created = await createTripApi(token, payload);
    setSavedTrips((prev) => [created, ...prev]);
    clearDraft();
    return created;
  };

  const completeTrip = async (tripId) => {
    const result = await completeTripApi(token, tripId);
    setSavedTrips((prev) =>
      prev.map((trip) =>
        trip.id === tripId
          ? { ...trip, status: result.status ?? "Completed" }
          : trip,
      ),
    );
    return result;
  };

  const deleteTrip = async (tripId) => {
    const result = await deleteTripApi(token, tripId);
    setSavedTrips((prev) => prev.filter((trip) => trip.id !== tripId));
    return result;
  };

  return (
    <TripDraftContext.Provider
      value={{
        draftIds,
        draftCount: draftIds.length,
        isInDraft,
        toggleDraft,
        removeFromDraft,
        moveDraftItem,
        clearDraft,
        savedTrips,
        refreshTrips,
        saveTrip,
        completeTrip,
        deleteTrip,
        loading,
        error,
      }}
    >
      {children}
    </TripDraftContext.Provider>
  );
}

// Send a bare calendar day: the server stores these as timestamps without a
// time zone, so an ISO string with a UTC offset can shift the date.
function toApiDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function useTripDraft() {
  const context = useContext(TripDraftContext);
  if (!context) {
    throw new Error("useTripDraft must be used inside a TripDraftProvider");
  }
  return context;
}
