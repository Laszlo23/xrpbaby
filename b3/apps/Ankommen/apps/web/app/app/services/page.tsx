"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Phone, Clock, Globe, Navigation, Loader2 } from "lucide-react";
import { api } from "@ankommen/api-client";

const categories = ["government", "ams", "healthcare", "social", "education", "legal"];

export default function ServicesPage() {
  const [active, setActive] = useState("government");

  const { data: offices, isLoading } = useQuery({
    queryKey: ["offices", active],
    queryFn: () => api.getOffices({ category: active }) as Promise<Array<{
      id: string; name: string; address: string; city: string; phone?: string; website?: string;
      openingHours?: Record<string, string>; description?: string; category?: { name: string };
    }>>,
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Nearby Services</h1>
        <p className="mt-1 text-muted-foreground">Find help centers, offices, and support near you.</p>
      </header>

      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button key={c} onClick={() => setActive(c)} className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition ${active === c ? "bg-primary text-primary-foreground shadow-soft" : "border bg-card text-muted-foreground hover:border-primary"}`}>{c}</button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-3">
          {isLoading && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
          {(offices ?? []).map((p) => (
            <div key={p.id} className="rounded-3xl border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {p.address}, {p.city}</div>
                </div>
                <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">{p.category?.name ?? active}</span>
              </div>
              {p.phone && <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="h-3.5 w-3.5" /> {p.phone}</div>}
              {p.description && <div className="mt-3 rounded-2xl bg-secondary/60 p-3 text-xs text-muted-foreground"><span className="font-semibold text-foreground">AI: </span>{p.description}</div>}
              <div className="mt-3 flex gap-2">
                {p.website && <a href={p.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold"><Globe className="h-3 w-3" /> Website</a>}
                <button className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"><Navigation className="h-3 w-3" /> Directions</button>
              </div>
            </div>
          ))}
        </div>
        <div className="sticky top-24 h-[600px] overflow-hidden rounded-3xl border bg-card shadow-soft">
          <iframe title="Vienna map" src="https://www.openstreetmap.org/export/embed.html?bbox=16.32,48.18,16.42,48.23&layer=mapnik" className="h-full w-full" />
        </div>
      </div>
    </div>
  );
}
