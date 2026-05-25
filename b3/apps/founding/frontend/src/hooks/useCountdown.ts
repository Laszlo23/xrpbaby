import { useEffect, useState } from "react";
import { api } from "@/src/api/client";

export type CountdownState = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  launched: boolean;
  target: Date | null;
};

export function useCountdown(): CountdownState {
  const [target, setTarget] = useState<Date | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    api
      .countdown()
      .then((res) => setTarget(new Date(res.target_utc)))
      .catch(() => setTarget(new Date("2026-05-30T12:00:00Z")));
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  if (!target) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, launched: false, target: null };
  }
  const diff = Math.max(0, target.getTime() - Date.now());
  const total = Math.floor(diff / 1000);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ = tick;
  return { days, hours, minutes, seconds, launched: total === 0, target };
}
