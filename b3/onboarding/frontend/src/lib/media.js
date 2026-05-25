const asset = (path) => `${process.env.PUBLIC_URL || ""}${path}`;

export const MEDIA = {
  heroBefore: asset("/old.png"),
  heroAfter: asset("/newoverlay.png"),
  problem: asset("/old.png"),
  impact: asset("/building1.png"),
  building1: asset("/building1.png"),
  investor: asset("/investors.png"),
  logo: asset("/bs_trans.png"),
};

import { JOIN_URL } from "./platform";

export const ECOSYSTEM_EXTERNAL_CTA = JOIN_URL;

export const INVESTOR_DECK_PDF =
  "https://buildingculture.4everbucket.com/buildingculture_english_team.pdf";

export const TOKENIZED_REAL_ESTATE_REPORT_PDF =
  "https://buildingculture.4everbucket.com/tokenized_re_report_FINAL.pdf";

export const SOCIAL = {
  telegram: "https://t.me/+4zFH7-2tyW0yOTBk",
  discord: "https://discord.gg/geUpHt3eSb",
  x: "https://x.com/buildingcultu3",
};
