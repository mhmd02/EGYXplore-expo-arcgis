import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import * as signalR from "@microsoft/signalr";
import { HUB_BASE_URL } from "../api/api";

export function useNotificationHub(token, handlers) {
  const connectionRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${HUB_BASE_URL}/notificationHub`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .build();

    // Register one listener per event name
    Object.entries(handlers).forEach(([eventName, handler]) => {
      connection.on(eventName, handler);
    });

    connection.onreconnected(() => {
      handlers.onReconnected?.();
    });

    connection
      .start()
      .catch((err) => console.log("SignalR connection failed:", err));

    connectionRef.current = connection;

    const sub = AppState.addEventListener("change", (state) => {
      if (
        state === "active" &&
        connection.state === signalR.HubConnectionState.Disconnected
      ) {
        connection
          .start()
          .catch((err) => console.log("SignalR reconnect failed:", err));
      }
    });

    return () => {
      sub.remove();
      connection.stop();
    };
  }, [token]);
}
