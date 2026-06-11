"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { api } from "@ankommen/api-client";

const steps = [
  { key: "preferredLang", q: "What language do you prefer?", options: [{ v: "en", l: "English" }, { v: "de", l: "German" }, { v: "ar", l: "Arabic" }, { v: "tr", l: "Turkish" }, { v: "uk", l: "Ukrainian" }] },
  { key: "city", q: "Where in Austria are you?", options: [{ v: "Wien", l: "Vienna" }, { v: "Graz", l: "Graz" }, { v: "Linz", l: "Linz" }, { v: "Salzburg", l: "Salzburg" }, { v: "Other", l: "Other" }] },
  { key: "residenceStatus", q: "Your residence status?", options: [{ v: "permanent", l: "Permanent resident" }, { v: "temporary", l: "Temporary permit" }, { v: "asylum", l: "Asylum seeker" }, { v: "tourist", l: "Tourist / short stay" }, { v: "eu", l: "EU citizen" }] },
  { key: "workStatus", q: "Work situation?", options: [{ v: "employed", l: "Employed" }, { v: "looking", l: "Looking for work" }, { v: "unemployed", l: "Unemployed" }, { v: "student", l: "Student" }] },
  { key: "housingStatus", q: "Housing situation?", options: [{ v: "has_home", l: "I have a home" }, { v: "looking", l: "Looking for housing" }, { v: "temporary", l: "Temporary / hostel" }] },
  { key: "hasChildren", q: "Do you have children?", options: [{ v: "false", l: "No" }, { v: "true", l: "Yes" }] },
  { key: "mainGoal", q: "What do you need most help with?", options: [{ v: "housing", l: "Finding housing" }, { v: "benefits", l: "Financial support" }, { v: "documents", l: "Understanding letters" }, { v: "jobs", l: "Finding work" }, { v: "integration", l: "General integration" }] },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const router = useRouter();

  const select = async (key: string, value: string) => {
    const parsed = key === "hasChildren" ? value === "true" : value;
    const next = { ...answers, [key]: parsed };
    setAnswers(next as Record<string, string>);
    if (step + 1 < steps.length) {
      setStep(step + 1);
    } else {
      await api.submitOnboarding(next);
      router.push("/app");
    }
  };

  const s = steps[step];
  if (!s) return null;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-4">
      <div className="text-xs font-semibold text-primary">Welcome to Ankommen AI · Step {step + 1}/{steps.length}</div>
      <h1 className="mt-2 text-3xl font-bold">{s.q}</h1>
      <div className="mt-8 grid gap-3">
        {s.options.map((o) => (
          <button key={o.v} onClick={() => select(s.key, o.v)} className="rounded-2xl border bg-card p-4 text-left font-medium shadow-soft hover:border-primary">{o.l}</button>
        ))}
      </div>
      <button onClick={() => setStep((s) => Math.min(s + 1, steps.length - 1))} className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground">Skip for now <ArrowRight className="h-4 w-4" /></button>
    </div>
  );
}
