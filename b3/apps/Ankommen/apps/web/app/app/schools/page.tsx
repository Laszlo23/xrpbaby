import { GraduationCap } from "lucide-react";

export default function SchoolsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Schools & Kindergarten</h1>
        <p className="mt-1 text-muted-foreground">Register children and understand the education system.</p>
      </header>
      {[
        { title: "Kindergarten (ages 3–6)", body: "Apply early — spots are limited. Municipal spots are subsidized." },
        { title: "Primary school (Volksschule)", body: "Register at your district school office with Meldezettel and birth certificate." },
        { title: "Familienbeihilfe", body: "Child benefit — apply via FinanzOnline or tax office." },
      ].map((s) => (
        <div key={s.title} className="rounded-3xl border bg-card p-6 shadow-soft">
          <GraduationCap className="h-8 w-8 text-warning-foreground" />
          <h2 className="mt-4 font-semibold">{s.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
        </div>
      ))}
    </div>
  );
}
