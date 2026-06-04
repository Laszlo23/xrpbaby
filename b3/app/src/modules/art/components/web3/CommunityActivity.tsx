import { useTicketActivity } from "@/modules/art/hooks/useTicketActivity";

const fallbackFeed = [
  { w: "0x7a…f3e1", a: "minted 4 tickets", art: "Quiet Horizon, II", t: "2m" },
  { w: "0x2b…9c04", a: "joined as Early Supporter", art: "", t: "6m" },
  { w: "marble.eth", a: "minted 1 ticket", art: "Tempest in Violet", t: "11m" },
  { w: "0xe4…a081", a: "minted 12 tickets", art: "Quiet Horizon, II", t: "19m" },
  { w: "siren.eth", a: "left a note on the wall", art: "", t: "24m" },
  { w: "0x5c…7711", a: "minted 2 tickets", art: "Tempest in Violet", t: "31m" },
];

export function CommunityActivity() {
  const { feed: onchainFeed, hasContract } = useTicketActivity();
  const feed =
    onchainFeed.length > 0
      ? onchainFeed.map((f) => ({ w: f.wallet, a: f.action, art: f.artwork, t: f.time }))
      : fallbackFeed;

  return (
    <>
      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-5 flex items-center gap-2">
        <span className="size-2 rounded-full bg-accent animate-pulse" />
        {hasContract && onchainFeed.length > 0 ? "Live on Base" : "Live activity"}
      </p>
      <ul className="space-y-4">
        {feed.map((f, i) => (
          <li
            key={i}
            className="flex justify-between gap-3 text-sm border-b hairline pb-3 last:border-0"
          >
            <div>
              <span className="font-mono text-foreground">{f.w}</span>
              <span className="text-muted-foreground"> {f.a}</span>
              {f.art && <span className="block text-xs italic text-primary mt-0.5">{f.art}</span>}
            </div>
            <span className="text-xs text-muted-foreground shrink-0">{f.t}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
