export type TgTab = "home" | "play" | "rank";

const TABS: { id: TgTab; label: string; icon: string }[] = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "play", label: "Play", icon: "🎮" },
  { id: "rank", label: "Rank", icon: "🏆" },
];

export function TgTabBar({ active, onChange }: { active: TgTab; onChange: (t: TgTab) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-800 bg-[#0c0d12]/95 backdrop-blur">
      <div className="mx-auto flex max-w-lg justify-around px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg py-2 text-xs ${
              active === tab.id ? "text-[#C5FF41]" : "text-zinc-500"
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
