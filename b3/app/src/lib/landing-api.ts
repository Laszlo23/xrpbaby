type WaitlistPayload = {
  email: string;
  name?: string;
  role?: string;
  source?: string;
};

export async function joinLandingWaitlist(payload: WaitlistPayload): Promise<void> {
  const res = await fetch("/api/platform/waitlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("waitlist_failed");
  }
}

export async function trackLandingEvent(
  event: string,
  section: string,
  meta: Record<string, unknown> = {},
): Promise<void> {
  try {
    await fetch("/api/platform/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, section, meta }),
    });
  } catch {
    // silent — analytics must not block UX
  }
}
