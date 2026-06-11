import { createFileRoute } from "@tanstack/react-router";
import { Briefcase, MapPin, Euro } from "lucide-react";

export const Route = createFileRoute("/app/jobs")({
  component: Jobs,
});

const jobs = [
  { title: "Warehouse Assistant", company: "DM Drogerie", loc: "Wien 1210", pay: "€2,100", tag: "No German required" },
  { title: "Kitchen Help", company: "Rosenberger", loc: "Wien 1010", pay: "€1,950", tag: "Beginner-friendly" },
  { title: "Delivery Driver", company: "Lieferando", loc: "Vienna", pay: "€2,400", tag: "Flexible hours" },
  { title: "Cleaning Staff", company: "ISS Facility", loc: "Wien 1100", pay: "€1,850", tag: "Part-time" },
  { title: "Construction Helper", company: "Strabag", loc: "Wien 1030", pay: "€2,600", tag: "Hiring now" },
  { title: "Hotel Reception", company: "Motel One", loc: "Wien 1020", pay: "€2,250", tag: "English OK" },
];

function Jobs() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Jobs & AMS</h1>
        <p className="mt-1 text-muted-foreground">Roles matching your profile — AMS-friendly and beginner roles included.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((j) => (
          <div key={j.title} className="rounded-3xl border bg-card p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-glow">
            <div className="flex items-start justify-between">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-soft text-primary"><Briefcase className="h-5 w-5" /></div>
              <span className="rounded-full bg-success-soft px-2.5 py-1 text-xs font-medium text-success">{j.tag}</span>
            </div>
            <div className="mt-4 font-semibold">{j.title}</div>
            <div className="text-xs text-muted-foreground">{j.company}</div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {j.loc}</span>
              <span className="inline-flex items-center gap-1 font-semibold text-foreground"><Euro className="h-3 w-3" /> {j.pay}</span>
            </div>
            <button className="mt-4 w-full rounded-full bg-primary py-2 text-xs font-semibold text-primary-foreground">Apply with AI assist</button>
          </div>
        ))}
      </div>
    </div>
  );
}
