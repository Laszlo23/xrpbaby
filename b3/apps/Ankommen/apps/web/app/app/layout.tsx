"use client";

import { AppShell } from "@ankommen/ui/app-shell";
import { useQuery } from "@tanstack/react-query";
import { api } from "@ankommen/api-client";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: () => api.getMe() as Promise<{ name?: string; isGuest?: boolean }>,
    retry: 1,
  });

  const name = me?.name ?? "Guest";
  const initial = name.charAt(0).toUpperCase();

  return (
    <AppShell userName={name} userInitial={initial} isGuest={me?.isGuest ?? true}>
      {children}
    </AppShell>
  );
}
