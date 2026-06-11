import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, MapPin, Users, Train, Heart } from "lucide-react";

export const Route = createFileRoute("/app/housing")({
  component: Housing,
});

const listings = [
  { title: "Bright 2-room apartment", price: 820, district: "1100 Favoriten", rooms: 2, station: "5 min to U1", family: 92, img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800" },
  { title: "Family flat near park", price: 980, district: "1020 Leopoldstadt", rooms: 3, station: "3 min to U2", family: 96, img: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800" },
  { title: "Cozy studio", price: 540, district: "1160 Ottakring", rooms: 1, station: "8 min to U3", family: 70, img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800" },
  { title: "Modern 3-room loft", price: 1150, district: "1030 Landstraße", rooms: 3, station: "2 min to U3", family: 88, img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800" },
  { title: "Garden apartment", price: 890, district: "1210 Floridsdorf", rooms: 2, station: "6 min to U6", family: 90, img: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800" },
  { title: "Renovated flat", price: 720, district: "1150 Rudolfsheim", rooms: 2, station: "4 min to U3", family: 82, img: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800" },
];

function Housing() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Housing</h1>
        <p className="mt-1 text-muted-foreground">Find apartments and rooms suited to your family and budget.</p>
      </header>

      {/* AI assistant */}
      <div className="rounded-3xl border bg-card p-6 shadow-soft" style={{ backgroundImage: "var(--gradient-hero)" }}>
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-primary-foreground"><Sparkles className="h-5 w-5" /></div>
          <div>
            <div className="text-sm font-semibold">AI Housing Assistant</div>
            <div className="text-xs text-muted-foreground">"I have two children and €900 budget."</div>
          </div>
        </div>
        <input placeholder="Describe your situation…" className="mt-4 w-full rounded-2xl border bg-card px-4 py-3 text-sm outline-none focus:border-primary" />
      </div>

      {/* Filters */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Budget", value: "€0 – €1,000" },
          { label: "City", value: "Vienna" },
          { label: "Family size", value: "4 people" },
          { label: "Transport", value: "Near U-Bahn" },
          { label: "Accessibility", value: "Any" },
        ].map((f) => (
          <div key={f.label} className="rounded-2xl border bg-card p-3 shadow-soft">
            <div className="text-xs text-muted-foreground">{f.label}</div>
            <div className="text-sm font-semibold">{f.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((l) => (
          <div key={l.title} className="overflow-hidden rounded-3xl border bg-card shadow-soft transition hover:-translate-y-1 hover:shadow-glow">
            <div className="aspect-[4/3] overflow-hidden">
              <img src={l.img} alt={l.title} loading="lazy" className="h-full w-full object-cover" />
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{l.title}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {l.district}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold gradient-text">€{l.price}</div>
                  <div className="text-xs text-muted-foreground">per month</div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1"><Users className="h-3 w-3" /> {l.rooms} rooms</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1"><Train className="h-3 w-3" /> {l.station}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-success-soft text-success px-2.5 py-1"><Heart className="h-3 w-3" /> Family {l.family}%</span>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="flex-1 rounded-full bg-primary py-2 text-xs font-semibold text-primary-foreground">View details</button>
                <button className="rounded-full border px-3 py-2 text-xs font-semibold">Map</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
