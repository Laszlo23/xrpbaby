import { createFileRoute } from "@tanstack/react-router";
import { Brain, Lock } from "lucide-react";

export const Route = createFileRoute("/app/profile")({
  component: Profile,
});

const fields = [
  { label: "Name", value: "Laszlo Kovács" },
  { label: "Preferred language", value: "English / Arabic" },
  { label: "Nationality", value: "Hungarian" },
  { label: "Residence status", value: "EU citizen" },
  { label: "Family members", value: "Spouse + 2 children" },
  { label: "Current city", value: "Vienna, 1100" },
  { label: "Employment", value: "Unemployed (seeking)" },
];

function Profile() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="mt-1 text-muted-foreground">The assistant uses this to personalize answers.</p>
      </header>

      <div className="rounded-3xl border bg-card p-6 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-accent text-accent-foreground text-2xl font-bold">L</div>
          <div>
            <div className="text-lg font-bold">Laszlo Kovács</div>
            <div className="text-xs text-muted-foreground">Guest profile · stored on your device</div>
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.label} className="rounded-2xl border bg-card p-4">
              <div className="text-xs text-muted-foreground">{f.label}</div>
              <div className="mt-1 font-semibold">{f.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border bg-card p-6 shadow-soft" style={{ backgroundImage: "var(--gradient-hero)" }}>
        <div className="flex items-center gap-2 text-xs font-semibold text-primary"><Brain className="h-4 w-4" /> AI memory</div>
        <ul className="mt-3 space-y-2 text-sm">
          <li>• Laszlo lives in Vienna (1100 Favoriten)</li>
          <li>• Has two children (ages 6 and 9)</li>
          <li>• Currently unemployed — receiving AMS</li>
          <li>• Speaks English and Arabic</li>
        </ul>
      </div>

      <div className="rounded-3xl border-2 border-dashed bg-card p-6 shadow-soft">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground"><Lock className="h-4 w-4" /> Coming soon</div>
        <h3 className="mt-2 text-lg font-bold">🔒 Secure Digital Identity</h3>
        <p className="mt-1 text-sm text-muted-foreground">Store verified hashes for residence permits, contracts, certificates, and government letters. You always own your data.</p>
      </div>
    </div>
  );
}
