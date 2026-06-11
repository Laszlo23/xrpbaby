export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-3xl px-6 py-16 prose prose-neutral">{children}</div>;
}
