import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Phone, Clock, Globe, Navigation } from "lucide-react";

export const Route = createFileRoute("/app/services")({
  component: Services,
});

const categories = ["Government", "AMS", "Hospitals", "Schools", "Lawyers", "NGOs", "German courses", "Food banks", "Shelters"];

const places = [
  { name: "MA35 — Immigration Office", cat: "Government", addr: "Dresdner Straße 93, 1200 Wien", hours: "Mon–Fri 7:30–15:30", phone: "+43 1 4000-35", advice: "Handles your residence registration." },
  { name: "AMS Wien Esteplatz", cat: "AMS", addr: "Esteplatz 2, 1030 Wien", hours: "Mon–Thu 7:30–15:30", phone: "+43 50 904 940", advice: "Job seeking and unemployment benefits." },
  { name: "AKH — Vienna General Hospital", cat: "Hospitals", addr: "Währinger Gürtel 18-20, 1090 Wien", hours: "24/7 Emergency", phone: "+43 1 40400", advice: "Largest hospital in Vienna." },
  { name: "Caritas Wien — Newcomer Support", cat: "NGOs", addr: "Albrechtskreithgasse 19-21, 1160 Wien", hours: "Mon–Fri 9:00–16:00", phone: "+43 1 488 31", advice: "Free advice for newcomers." },
  { name: "VHS Wien — German Courses", cat: "German courses", addr: "Multiple locations", hours: "Mon–Sat", phone: "+43 1 893 00 83", advice: "A1–C2 affordable German classes." },
];

function Services() {
  const [active, setActive] = useState("Government");
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Nearby Services</h1>
        <p className="mt-1 text-muted-foreground">Find help centers, offices, and support near you.</p>
      </header>

      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              active === c ? "bg-primary text-primary-foreground shadow-soft" : "border bg-card text-muted-foreground hover:border-primary"
            }`}
          >{c}</button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-3">
          {places.map((p) => (
            <div key={p.name} className="rounded-3xl border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {p.addr}</div>
                </div>
                <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">{p.cat}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {p.hours}</div>
                <div className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {p.phone}</div>
              </div>
              <div className="mt-3 rounded-2xl bg-secondary/60 p-3 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">AI: </span>{p.advice}
              </div>
              <div className="mt-3 flex gap-2">
                <button className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"><Navigation className="h-3 w-3" /> Directions</button>
                <button className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold"><Globe className="h-3 w-3" /> Website</button>
              </div>
            </div>
          ))}
        </div>
        <div className="sticky top-24 h-[600px] overflow-hidden rounded-3xl border bg-card shadow-soft">
          <iframe
            title="Vienna map"
            src="https://www.openstreetmap.org/export/embed.html?bbox=16.32,48.18,16.42,48.23&layer=mapnik"
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  );
}
