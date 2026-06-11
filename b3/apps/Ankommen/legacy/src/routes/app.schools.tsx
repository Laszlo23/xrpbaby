import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap, MapPin, Users } from "lucide-react";

export const Route = createFileRoute("/app/schools")({
  component: Schools,
});

const items = [
  { name: "Kindergarten Reumannplatz", type: "Kindergarten · 3–6 yrs", loc: "Wien 1100", note: "German + multilingual" },
  { name: "VS Quellenstraße", type: "Volksschule · 6–10 yrs", loc: "Wien 1100", note: "Free, public" },
  { name: "GTVS Selma-Lagerlöf", type: "Whole-day primary", loc: "Wien 1100", note: "After-school care" },
  { name: "NMS Pernerstorfergasse", type: "Mittelschule · 10–14 yrs", loc: "Wien 1100", note: "Newcomer support" },
];

function Schools() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Schools & Kindergarten</h1>
        <p className="mt-1 text-muted-foreground">Education in Austria is free and compulsory from age 6.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((i) => (
          <div key={i.name} className="rounded-3xl border bg-card p-5 shadow-soft">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-warning-soft text-warning-foreground"><GraduationCap className="h-5 w-5" /></div>
            <div className="mt-4 font-semibold">{i.name}</div>
            <div className="text-xs text-muted-foreground">{i.type}</div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1 text-muted-foreground"><MapPin className="h-3 w-3" /> {i.loc}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-1 font-semibold text-success"><Users className="h-3 w-3" /> {i.note}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
