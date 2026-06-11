import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/settings")({
  component: Settings,
});

const rows = [
  { label: "Interface language", value: "English" },
  { label: "Notifications", value: "Email + Push" },
  { label: "Voice input", value: "Enabled" },
  { label: "AI memory", value: "On" },
  { label: "Account type", value: "Guest" },
];

function Settings() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-1 text-muted-foreground">Personalize how Ankommen AI works for you.</p>
      </header>
      <div className="divide-y rounded-3xl border bg-card shadow-soft">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between p-5">
            <div className="font-medium">{r.label}</div>
            <div className="text-sm text-muted-foreground">{r.value}</div>
          </div>
        ))}
      </div>
      <button className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Create account</button>
    </div>
  );
}
