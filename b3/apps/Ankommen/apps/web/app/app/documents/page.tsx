"use client";

import { useState, useRef } from "react";
import { Upload, FileText, Sparkles, Loader2 } from "lucide-react";
import { api } from "@ankommen/api-client";

export default function DocumentsPage() {
  const [uploading, setUploading] = useState(false);
  const [docs, setDocs] = useState<Array<{ id: string; fileName: string; analysis?: { summary: string } }>>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const res = await api.uploadDocument(file) as { document: { id: string; fileName: string }; analysis?: { summary: string } };
      setDocs((d) => [{ id: res.document.id, fileName: res.document.fileName, analysis: res.analysis }, ...d]);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Documents</h1>
        <p className="mt-1 text-muted-foreground">Upload official letters — we explain them in simple language.</p>
      </header>

      <div
        onClick={() => inputRef.current?.click()}
        className="cursor-pointer rounded-3xl border-2 border-dashed bg-card p-12 text-center shadow-soft transition hover:border-primary"
      >
        {uploading ? <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" /> : <Upload className="mx-auto h-10 w-10 text-muted-foreground" />}
        <p className="mt-4 font-semibold">{uploading ? "Analyzing…" : "Drop PDF or photo here"}</p>
        <p className="mt-1 text-sm text-muted-foreground">AMS letters, MA35 notices, rental contracts</p>
        <input ref={inputRef} type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
      </div>

      {docs.map((doc) => (
        <div key={doc.id} className="rounded-3xl border bg-card p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            <span className="font-semibold">{doc.fileName}</span>
          </div>
          {doc.analysis && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-success"><Sparkles className="h-3.5 w-3.5" /> Analysis</div>
              <p className="whitespace-pre-wrap text-sm">{doc.analysis.summary}</p>
            </div>
          )}
        </div>
      ))}

      <p className="text-xs text-muted-foreground">Document analysis is guidance only — not legal advice. Verify with the issuing office.</p>
    </div>
  );
}
