import { createFileRoute } from "@tanstack/react-router";
import { Upload, FileText, Calendar, AlertCircle, Building2 } from "lucide-react";

export const Route = createFileRoute("/app/documents")({
  component: Documents,
});

function Documents() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Document Analysis</h1>
        <p className="mt-1 text-muted-foreground">Upload a letter and we'll explain it simply.</p>
      </header>

      <label className="block cursor-pointer rounded-3xl border-2 border-dashed border-border bg-card p-10 text-center shadow-soft hover:border-primary">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary">
          <Upload className="h-6 w-6" />
        </div>
        <div className="mt-4 font-semibold">Drag & drop a PDF or image</div>
        <div className="text-xs text-muted-foreground">or click to browse · PDF, JPG, PNG up to 10MB</div>
        <input type="file" className="hidden" />
      </label>

      {/* Sample analysis */}
      <div className="rounded-3xl border bg-card p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-accent-soft text-accent"><FileText className="h-5 w-5" /></div>
            <div>
              <div className="font-semibold">AMS_Aufforderung_2026.pdf</div>
              <div className="text-xs text-muted-foreground">Analyzed just now</div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-3 py-1 text-xs font-semibold text-warning-foreground">
            <AlertCircle className="h-3.5 w-3.5" /> Action Required
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Info icon={Calendar} label="Important date" value="28 June 2026" />
          <Info icon={Building2} label="Office" value="AMS Wien Esteplatz" />
          <Info icon={AlertCircle} label="Risk level" value="🟡 Action required" />
        </div>

        <div className="mt-6 rounded-2xl bg-secondary/60 p-5 text-sm leading-relaxed">
          <div className="font-semibold">Summary</div>
          <p className="mt-2 text-muted-foreground">
            AMS is asking you to submit additional documents to continue your benefits. You have 14 days to respond.
            Required: passport copy, residence permit, proof of address.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {["Generate Reply", "Translate", "Explain Simply", "Save to My Documents"].map((b) => (
            <button key={b} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">{b}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value }: any) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5" /> {label}</div>
      <div className="mt-1 font-semibold">{value}</div>
    </div>
  );
}
