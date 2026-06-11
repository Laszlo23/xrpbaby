import { HeartPulse, Phone } from "lucide-react";

const cards = [
  { title: "ÖGK — Health Insurance", body: "Register for e-card and find a Hausarzt (GP).", phone: "1450" },
  { title: "Emergency", body: "Ambulance 144 · EU emergency 112 · Doctor on call 141", phone: "144" },
  { title: "Find a Doctor", body: "Search by district and language at praxisplan.at", phone: null },
  { title: "Pharmacy (Apotheke)", body: "Green cross signs. Night pharmacies rotate.", phone: null },
];

export default function HealthcarePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Healthcare</h1>
        <p className="mt-1 text-muted-foreground">Insurance, doctors, and emergencies in Austria.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <div key={c.title} className="rounded-3xl border bg-card p-6 shadow-soft">
            <HeartPulse className="h-8 w-8 text-accent" />
            <h2 className="mt-4 font-semibold">{c.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{c.body}</p>
            {c.phone && <div className="mt-4 flex items-center gap-2 text-primary font-semibold"><Phone className="h-4 w-4" /> {c.phone}</div>}
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Not medical advice. Call 144 in emergencies.</p>
    </div>
  );
}
