/** Culture merch drop catalog — 4 limited-edition tees, 77 units each. */

export const MERCH_SIZES = ["S", "M", "L", "XL"] as const;
export type MerchSize = (typeof MERCH_SIZES)[number];

export type MerchDropCatalogEntry = {
  slug: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  description: string;
};

export const MERCH_DROPS: MerchDropCatalogEntry[] = [
  {
    slug: "bc-tshirt-1",
    title: "Building Culture Tee I",
    subtitle: "Genesis edition — wear the stack",
    imageUrl: "https://0xlaszlo.4everbucket.com/buildingculture/tshirt1.png",
    description:
      "Limited run tee with inside-label QR. Scan after delivery to claim your limited-merch credential and merch-holder access.",
  },
  {
    slug: "bc-tshirt-2",
    title: "Building Culture Tee II",
    subtitle: "Forest signal — early legend",
    imageUrl: "https://0xlaszlo.4everbucket.com/buildingculture/tshirt2.png",
    description:
      "Forest-green palette for founding builders. Physical shirt + onchain credential when you scan the label.",
  },
  {
    slug: "bc-tshirt-3",
    title: "Building Culture Tee III",
    subtitle: "Reactor heat — Culture Power",
    imageUrl: "https://0xlaszlo.4everbucket.com/buildingculture/tshirt3.png",
    description:
      "Reactor motif for power farmers. Each unit is numbered on the ladder — earlier buyers pay less.",
  },
  {
    slug: "bc-tshirt-4",
    title: "Building Culture Tee IV",
    subtitle: "Vault gold — closing edition",
    imageUrl: "https://0xlaszlo.4everbucket.com/buildingculture/tshirt4.png",
    description:
      "Final design in the launch quad. When all 77 sell, production batch funds automatically.",
  },
];

export function getMerchDrop(slug: string): MerchDropCatalogEntry | undefined {
  return MERCH_DROPS.find((d) => d.slug === slug);
}

export function isMerchSize(value: string): value is MerchSize {
  return (MERCH_SIZES as readonly string[]).includes(value);
}

export type MerchShippingBrief = {
  name: string;
  email: string;
  line1: string;
  city: string;
  postal: string;
  country: string;
};
