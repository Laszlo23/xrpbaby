"use client";

import { useState } from "react";
import { Home, AlertTriangle } from "lucide-react";

const listings = [
  { title: "Bright 2-room apartment", district: "1100 Wien", price: "€890", size: "52 m²", img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400" },
  { title: "Shared room in WG", district: "1090 Wien", price: "€450", size: "18 m²", img: "https://images.unsplash.com/photo-1560448204-e02f11c45781?w=400" },
  { title: "Studio near U-Bahn", district: "1030 Wien", price: "€720", size: "38 m²", img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400" },
];

export default function HousingPage() {
  const [query, setQuery] = useState("");
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Housing</h1>
        <p className="mt-1 text-muted-foreground">Understand rent, contracts, and avoid scams.</p>
      </header>
      <div className="rounded-3xl border bg-warning-soft/30 p-4 flex gap-3">
        <AlertTriangle className="h-5 w-5 text-warning-foreground flex-shrink-0" />
        <p className="text-sm">Never pay deposit before viewing. Be wary of prices far below market rate.</p>
      </div>
      <div className="rounded-3xl border bg-card p-4 shadow-soft">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Describe what you're looking for…" className="w-full border-0 bg-transparent outline-none" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((l) => (
          <div key={l.title} className="overflow-hidden rounded-3xl border bg-card shadow-soft">
            <div className="relative h-40 bg-secondary"><Home className="absolute inset-0 m-auto h-12 w-12 text-muted-foreground" /></div>
            <div className="p-5">
              <div className="font-semibold">{l.title}</div>
              <div className="text-sm text-muted-foreground">{l.district} · {l.size}</div>
              <div className="mt-2 text-lg font-bold text-primary">{l.price}/mo</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
