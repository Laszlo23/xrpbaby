import { Briefcase } from "lucide-react";

const jobs = [
  { title: "Warehouse Assistant", company: "Logistics GmbH", location: "1100 Wien", type: "Full-time" },
  { title: "Kitchen Helper", company: "Restaurant Group", location: "1010 Wien", type: "Part-time" },
  { title: "Office Admin (German B1+)", company: "Tech Startup", location: "1020 Wien", type: "Full-time" },
];

export default function JobsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Jobs & AMS</h1>
        <p className="mt-1 text-muted-foreground">Register with AMS and find work in Austria.</p>
      </header>
      <div className="rounded-3xl border bg-accent-soft/30 p-6">
        <h2 className="font-semibold">AMS Registration</h2>
        <p className="mt-2 text-sm text-muted-foreground">If unemployed, register within 5 days. Bring passport, Meldezettel, and work permit if required.</p>
      </div>
      <div className="space-y-3">
        {jobs.map((j) => (
          <div key={j.title} className="flex items-center justify-between rounded-3xl border bg-card p-5 shadow-soft">
            <div className="flex gap-4">
              <Briefcase className="h-8 w-8 text-primary" />
              <div>
                <div className="font-semibold">{j.title}</div>
                <div className="text-sm text-muted-foreground">{j.company} · {j.location}</div>
              </div>
            </div>
            <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">{j.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
