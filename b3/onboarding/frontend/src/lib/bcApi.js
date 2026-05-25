import axios from "axios";
import { PLATFORM_API } from "./platform";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

const platformApi = axios.create({
  baseURL: PLATFORM_API,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

export const fetchEcosystem = async () => {
  const { data } = await api.get("/ecosystem");
  return data;
};

export const joinWaitlist = async (payload) => {
  try {
    const { data } = await platformApi.post("/waitlist", payload);
    return data;
  } catch {
    const { data } = await api.post("/waitlist", payload);
    return data;
  }
};

export const fetchStats = async () => {
  const { data } = await api.get("/stats");
  return data;
};

export const trackEvent = async (event, section, meta = {}) => {
  try {
    await platformApi.post("/analytics", { event, section, meta });
  } catch {
    try {
      await api.post("/analytics", { event, section, meta });
    } catch {
      // silent
    }
  }
};
