"use client";

import { useEffect } from "react";

export function AuthInit() {
  useEffect(() => {
    void (async () => {
      const token = localStorage.getItem("ankommen_token");
      if (token) return;

      const { api } = await import("@ankommen/api-client");
      const deviceId = localStorage.getItem("ankommen_device_id") ?? undefined;
      await api.createGuest(deviceId).catch(console.error);
    })();
  }, []);

  return null;
}
