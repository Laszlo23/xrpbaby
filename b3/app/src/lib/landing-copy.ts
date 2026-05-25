export const PROBLEM_STATS = [
  { label: "Empty Buildings", value: "60M+", note: "vacant homes across Europe alone" },
  { label: "Declining Villages", value: "1 in 3", note: "rural communities are shrinking" },
  { label: "Rising Costs", value: "+87%", note: "housing prices since 2015" },
  { label: "Lack of Ownership", value: "<25%", note: "of young adults own a home" },
  { label: "Financing Barriers", value: "8 of 10", note: "blocked by traditional banks" },
] as const;

export const IMPACT_STORIES = [
  {
    title: "Community Spaces",
    location: "Vienna, AT",
    desc: "Reactivating dormant ground floors into shared workshops, kitchens and gathering rooms.",
    metric: "12 spaces",
  },
  {
    title: "Housing Initiatives",
    location: "Lower Austria",
    desc: "Tokenized co-living pilots that make ownership accessible to a new generation.",
    metric: "47 homes",
  },
  {
    title: "Revitalized Properties",
    location: "Burgenland",
    desc: "Heritage buildings restored with community capital and local craft.",
    metric: "8 restorations",
  },
  {
    title: "Local Projects",
    location: "Pan-European",
    desc: "Cultural events, art residencies and small businesses funded by the network.",
    metric: "120+ events",
  },
] as const;

export const ROADMAP_SHIPPED = [
  "Building Culture Capital",
  "Building Culture App",
  "Building Culture Home",
  "Building Culture ID",
  "Building Culture Art",
  "WohnAI · AI Real Estate Agent",
  "Building Culture Game",
  "Building Culture MiniApp",
] as const;

export const ROADMAP_UPCOMING = [
  {
    title: "Tokenized Property Marketplace",
    note: "Onchain ownership of curated, real-world assets",
  },
  {
    title: "Community Funding Platform",
    note: "Communities raising capital from communities",
  },
  {
    title: "BCD Utility Launch",
    note: "Single currency for the entire ecosystem",
  },
  {
    title: "Global Building Culture Network",
    note: "City-by-city expansion of the movement",
  },
] as const;
