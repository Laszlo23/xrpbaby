"use client";

import { useState } from "react";

export default function AdminKnowledgePage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");

  const upload = async () => {
    const token = localStorage.getItem("ankommen_token");
    await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/admin/knowledge`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ title, content, url, isVerified: true }),
    });
    alert("Uploaded");
    setTitle("");
    setContent("");
  };

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">Knowledge Sources</h1>
      <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border p-3" />
      <input placeholder="URL" value={url} onChange={(e) => setUrl(e.target.value)} className="w-full rounded-xl border p-3" />
      <textarea placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} rows={8} className="w-full rounded-xl border p-3" />
      <button onClick={upload} className="rounded-full bg-primary px-6 py-2 text-primary-foreground font-semibold">Upload verified source</button>
    </div>
  );
}
