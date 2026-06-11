import { createFileRoute } from "@tanstack/react-router";
import { HeartPulse, Phone, MapPin, Sparkles } from "lucide-react";

export const Route = createFileRoute("/app/healthcare")({
  component: Healthcare,
});

const items = [
  { title: "Get your e-card", desc: "Your Austrian health insurance card.", tag: "Essential" },
  { title: "Find a GP (Hausarzt)", desc: "Doctors accepting new patients near 1100.", tag: "Nearby" },
  { title: "Emergency: 144", desc: "Ambulance · free from any phone.", tag: "Urgent" },
  { title: "Pediatricians for children", desc: "Recommended for ages 0–14.", tag: "Family" },
];

function Healthcare() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Healthcare</h1>
        <p className="mt-1 text-muted-foreground">Doctors, e-card, hospitals and emergencies.</p>
      </header>
      <div className="rounded-3xl border bg-card p-6 shadow-soft" style={{ backgroundImage: "var(--gradient-hero)" }}>
        <div className="flex items-center gap-2 text-xs font-semibold text-primary"><Sparkles className="h-4 w-4" /> AI tip</div>
        <p className="mt-2 font-medium">As an EU citizen registered in Vienna, you qualify for ÖGK insurance. Once your AMS registration is complete, your e-card is issued automatically.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((i) => (
          <div key={i.title} className="rounded-3xl border bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-accent-soft text-accent"><HeartPulse className="h-5 w-5" /></div>
              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">{i.tag}</span>
            </div>
            <div className="mt-4 font-semibold">{i.title}</div>
            <div className="text-xs text-muted-foreground">{i.desc}</div>
            <div className="mt-4 flex gap-2 text-xs">
              <button className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 font-semibold text-primary-foreground"><MapPin className="h-3 w-3" /> Map</button>
              <button className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 font-semibold"><Phone className="h-3 w-3" /> Call</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
