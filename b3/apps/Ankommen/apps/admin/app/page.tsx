"use client";

import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<{ users?: number; activeSubscriptions?: number; aiMessages?: number; documents?: number }>({});

  useEffect(() => {
    const token = localStorage.getItem("ankommen_token");
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/admin/stats`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setStats({ users: 0, activeSubscriptions: 0, aiMessages: 0, documents: 0 }));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-muted-foreground mt-2">Manage users, knowledge sources, and analytics.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Users", value: stats.users ?? "—" },
          { label: "Active subscriptions", value: stats.activeSubscriptions ?? "—" },
          { label: "AI messages", value: stats.aiMessages ?? "—" },
          { label: "Documents", value: stats.documents ?? "—" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border bg-card p-6 shadow-soft">
            <div className="text-sm text-muted-foreground">{s.label}</div>
            <div className="mt-2 text-3xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
