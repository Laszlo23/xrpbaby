/**
 * Server-only Strapi reads for homepage vault drops (API token).
 */
import type { Address } from "viem";
import type { ExperienceCategory, HomeDrop, WinnerMode } from "@/content/home-drops";

function strapiBase(): string | null {
  const b = process.env.STRAPI_URL?.trim() || process.env.VITE_STRAPI_URL?.trim();
  return b ? b.replace(/\/$/, "") : null;
}

function readToken(): string | null {
  return (
    process.env.STRAPI_API_TOKEN?.trim() ||
    process.env.STRAPI_API_READ_TOKEN?.trim() ||
    process.env.AGENT_STRAPI_API_TOKEN?.trim() ||
    null
  );
}

function rowAttrs(row: Record<string, unknown>): Record<string, unknown> {
  const a = row.attributes;
  if (a && typeof a === "object" && !Array.isArray(a)) return a as Record<string, unknown>;
  return row;
}

function pickStr(o: Record<string, unknown>, k: string): string | undefined {
  const v = o[k];
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

function pickInt(o: Record<string, unknown>, k: string, fallback: number): number {
  const v = o[k];
  if (typeof v === "number" && Number.isFinite(v)) return Math.floor(v);
  return fallback;
}

/** Returns parsed drops or null if Strapi unavailable / empty / error. */
export async function fetchVaultDropsFromStrapi(): Promise<HomeDrop[] | null> {
  const base = strapiBase();
  const token = readToken();
  if (!base || !token) return null;

  const u = new URL(`${base}/api/vault-drops`);
  u.searchParams.set("publicationState", "live");
  u.searchParams.set("sort", "sortOrder:asc");

  const res = await fetch(u.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;

  const json = (await res.json()) as { data?: unknown[] };
  const rows = Array.isArray(json.data) ? json.data : [];
  if (rows.length === 0) return null;

  const out: HomeDrop[] = [];
  for (const raw of rows) {
    if (!raw || typeof raw !== "object") continue;
    const o = rowAttrs(raw as Record<string, unknown>);
    const slug = pickStr(o, "slug");
    const title = pickStr(o, "title");
    const artist = pickStr(o, "artist");
    const assetValueLabel = pickStr(o, "assetValueLabel");
    const worthLabel = pickStr(o, "worthLabel");
    const winnerCopy = pickStr(o, "winnerCopy");
    const image = pickStr(o, "image");
    const endsRaw = pickStr(o, "endsAt");
    if (
      !slug ||
      !title ||
      !artist ||
      !assetValueLabel ||
      !worthLabel ||
      !winnerCopy ||
      !image ||
      !endsRaw
    ) {
      continue;
    }

    const winnerMode = (pickStr(o, "winnerMode") ?? "one") as WinnerMode;
    const rarity = (pickStr(o, "rarity") ?? "common") as HomeDrop["rarity"];
    const experienceCategory = pickStr(o, "experienceCategory") as ExperienceCategory | undefined;

    const ca = pickStr(o, "campaignAddress");
    let campaignAddress: Address | undefined;
    if (ca && /^0x[a-fA-F0-9]{40}$/.test(ca)) {
      campaignAddress = ca as Address;
    }

    const endsAt = new Date(endsRaw);
    if (Number.isNaN(endsAt.getTime())) continue;

    const drop: HomeDrop = {
      slug,
      title,
      artist,
      assetValueLabel,
      worthLabel,
      winnerMode: winnerMode === "limited" ? "limited" : "one",
      winnerCopy,
      image,
      story: pickStr(o, "story"),
      ticketsSold: pickInt(o, "ticketsSold", 0),
      totalTickets: pickInt(o, "totalTickets", 1000),
      endsAt,
      rarity: rarity === "rare" || rarity === "legendary" ? rarity : "common",
      campaignAddress,
      posterImage: pickStr(o, "posterImage"),
      filmstripVideo: pickStr(o, "filmstripVideo"),
      experienceCategory:
        experienceCategory === "art" || experienceCategory === "venue"
          ? experienceCategory
          : "stay",
    };
    out.push(drop);
  }

  return out.length > 0 ? out : null;
}
