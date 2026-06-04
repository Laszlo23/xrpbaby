import type { ArtworkSlug } from "@/modules/art/lib/contracts";
import artworkIsland from "@/assets/art/artwork-horizon.jpg";
import artworkNicotine from "@/assets/art/artwork-storm.jpg";

export type ArtworkData = {
  id: ArtworkSlug;
  edition: string;
  artist: {
    name: string;
    origin: string;
    note: string;
  };
  title: string;
  titleDe?: string;
  year: string;
  medium: string;
  dimensions: string;
  valueEur: number;
  supply: number;
  priceEur: number;
  sold: number;
  image: string;
  mood: "still" | "volatile";
  tagline: string;
  opening: string;
  story: string[];
  whyItMatters: string;
  momentBefore: string;
  pullQuote: string;
  ritual: string;
  notEveryone: string;
};

export const artworks: ArtworkData[] = [
  {
    id: "horizon",
    edition: "01",
    artist: {
      name: "Eduard Angeli",
      origin: "Vienna",
      note: "Angeli paints silence the way others paint sound — architecture dissolved into atmosphere, memory held at the edge of a horizon that may never arrive.",
    },
    title: "Die Insel Santo Spirito und ein Licht",
    year: "2022",
    medium: "Pastel auf Leinwand",
    dimensions: "150 × 150 cm",
    valueEur: 45_000,
    supply: 1000,
    priceEur: 45,
    sold: 0,
    image: artworkIsland,
    mood: "still",
    tagline: "Alone at dawn — somewhere between memory and the sea.",
    opening:
      "Before the world decides to speak, there is this: an island, a light, and a silence so complete it feels architectural — as if the air itself were holding its breath.",
    story: [
      "Santo Spirito floats in a haze that is not picturesque distance but psychological distance — the kind you measure when you wake before anyone else and the room still carries yesterday.",
      "Pastel on linen gives the surface a powdery tenderness, as if the painting could be lifted away by a single honest wind. Forms are present, yet they refuse to dominate. They wait.",
      "One light — neither theatrical nor sentimental — holds the composition the way a sustained note holds silence. You step closer. The horizon does not sharpen. It deepens.",
      "You are not viewing a landscape. You are standing inside a threshold — alone at dawn, between what was and what has not yet been named.",
    ],
    whyItMatters:
      "In an age of noise, Angeli offers the rarest luxury: stillness you can inhabit. This work does not perform for a room — it recalibrates it.",
    momentBefore:
      "Before ownership, there is only presence. A square metre of linen holding an island, a light, and the quiet conviction that beauty need not announce itself to be absolute.",
    pullQuote: "Stand here long enough and the horizon stops being a line. It becomes a question.",
    ritual:
      "This is a raffle for the physical painting. One thousand tickets at €45 — one ticket wins the canvas when the edition sells out. Verifiable randomness, public winner, insured delivery of the real work.",
    notEveryone:
      "You are entering a raffle, not buying the painting outright. One winner receives Santo Spirito on their wall. Every other ticket holder stays in the onchain record of a cultural moment that happened in public.",
  },
  {
    id: "storm",
    edition: "02",
    artist: {
      name: "Hubert Scheibl",
      origin: "Austria",
      note: "Scheibl does not depict emotion — he enacts it. Layer upon layer until the canvas becomes weather, nerve, and aftermath.",
    },
    title: "Nicotine on Silverscreen",
    year: "2019/2020",
    medium: "Oil on canvas",
    dimensions: "195 × 140 cm",
    valueEur: 70_000,
    supply: 1000,
    priceEur: 70,
    sold: 0,
    image: artworkNicotine,
    mood: "volatile",
    tagline: "Weather, memory, smoke — colliding on a surface that will not stay still.",
    opening:
      "Some paintings hang on walls. This one arrives — a front moving in, the last frame of a film you are not ready to leave, nicotine and silver light still burning in the air.",
    story: [
      "Oil moves differently here. It drags, smears, lifts and falls in ridges that catch light like fractured glass. Scheibl works the surface until it behaves less like an image and more like a body under pressure.",
      "Nicotine on Silverscreen is not a title but an atmosphere — cinema’s silvered flicker, the chemical calm after intensity, the colour left behind when something burned beautifully.",
      "You cannot view it from a safe distance. It pulls at the periphery of vision. Violet into ash, ember into void — as if the canvas were still deciding what it wanted to become when the artist finally stepped away.",
      "There is violence in it — not the cheap kind, but the violence of feeling too much and surviving. Of memory that will not settle. Of beauty that refuses to be polite.",
    ],
    whyItMatters:
      "Scheibl occupies a rare territory between abstraction and raw human charge. Museum-scale, unapologetic — it does not ask for approval, only your full attention.",
    momentBefore:
      "Before the final ticket, the painting exists in suspension — insured, climate-controlled, alive with a tension only a crowd can complete.",
    pullQuote: "You feel it before you understand it. That is how you know it is real.",
    ritual:
      "This is a raffle for the physical painting. One thousand tickets at €70 — one winner takes Nicotine on Silverscreen home when the last ticket sells. One draw. One canvas. Fully documented on Base.",
    notEveryone:
      "Most tickets will not win the artwork — that is how a raffle works. What every participant shares is proof they entered: timestamped, public, and tied to a museum-scale work that only one wall will hold.",
  },
];

export const editionManifesto = {
  headline: "Edition 01",
  subhead:
    "Two museum-scale paintings. Two onchain raffles. One verifiable winner takes the canvas.",
  vault:
    "Each work is a raffle: buy a ticket for a chance to win the physical painting. When all 1,000 tickets sell, randomness picks one holder — insured shipping to the winner's wall.",
};

export const interludes = [
  {
    id: "thousand",
    kicker: "One thousand tickets. One winner. One painting.",
    body: "Each edition is an onchain raffle for a real canvas. Buy a ticket for your chance to win the physical artwork. When the edition sells out, verifiable randomness names the winner — everyone else keeps their ticket as proof they entered.",
  },
  {
    id: "doors",
    kicker: "Culture should not live behind closed doors.",
    body: "For decades, the finest works were acquired in rooms most people never entered. Building Culture opens the door — without diminishing the art, the artist, or the seriousness of ownership.",
  },
  {
    id: "ritual",
    kicker: "A transparent raffle — not a backroom sale.",
    body: "Every ticket is an entry to win the physical work. Every sale is public. The draw is immutable. The winner is verifiable. The painting ships to one address. This is how you run a raffle when you want the whole world to watch.",
  },
];

/** Map slug → display title for activity feed and UI */
export const artworkTitles: Record<ArtworkSlug, string> = {
  horizon: artworks[0].title,
  storm: artworks[1].title,
};
