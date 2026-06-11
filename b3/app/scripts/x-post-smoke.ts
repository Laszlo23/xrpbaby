#!/usr/bin/env tsx
import { loadAppEnv } from "./load-env";

loadAppEnv();

import { getTwitterUserClient } from "../src/server/x/twitter-client";
import { postMarketingTweet } from "../src/server/x/post-marketing-tweet";

async function main() {
  const client = getTwitterUserClient();
  console.log("client:", client ? "ok" : "missing");
  if (!client) process.exit(2);

  const textOnly = await postMarketingTweet(
    client,
    "Building Culture — campaign pipeline test (text only). Join → https://app.buildingcultureid.space/join",
  );
  console.log("textOnly:", JSON.stringify(textOnly));

  if (textOnly.ok) {
    const withImage = await postMarketingTweet(
      client,
      "Building Culture — image post test → https://app.buildingcultureid.space/join",
      { imagePath: "/social/bc-logo.webp" },
    );
    console.log("withImage:", JSON.stringify(withImage));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
