"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@ankommen/api-client";

export default function ProfilePage() {
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => api.getMe() as Promise<{ profile?: Record<string, unknown>; email?: string }> });
  const profile = me?.profile ?? {};

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">My Profile</h1>
      <div className="rounded-3xl border bg-card p-6 shadow-soft space-y-4">
        {[
          ["Email", me?.email ?? "Guest"],
          ["City", String(profile.city ?? "Not set")],
          ["Nationality", String(profile.nationality ?? "Not set")],
          ["Residence status", String(profile.residenceStatus ?? "Not set")],
          ["Main goal", String(profile.mainGoal ?? "Not set")],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between border-b pb-3 last:border-0">
            <span className="text-muted-foreground">{k}</span>
            <span className="font-medium">{v}</span>
          </div>
        ))}
      </div>
      <div className="rounded-3xl border bg-accent-soft/30 p-4 text-sm">
        <strong>AI memory:</strong> Ankommen remembers your situation to give better answers. Disable in Settings.
      </div>
    </div>
  );
}
