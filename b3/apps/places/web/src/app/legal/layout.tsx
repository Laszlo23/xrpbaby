import { LegalSubnav } from "@/components/LegalSubnav";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-4xl pb-16">
      <div className="flex flex-col gap-8 md:flex-row md:gap-12">
        <aside className="shrink-0 md:w-44">
          <LegalSubnav />
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
