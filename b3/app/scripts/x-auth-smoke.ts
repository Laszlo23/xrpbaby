#!/usr/bin/env tsx
import { loadAppEnv } from "./load-env";

loadAppEnv();

import { getTwitterUserClient } from "../src/server/x/twitter-client";
import { readOfficialXOAuthEnv } from "../src/server/x/x-env";

async function main() {
  const creds = readOfficialXOAuthEnv();
  console.log("oauth configured:", Boolean(creds));

  const client = getTwitterUserClient();
  if (!client) {
    console.log("no client");
    process.exit(2);
  }

  try {
    const me = await client.v2.me({ "user.fields": ["username", "name"] });
    console.log("me:", JSON.stringify(me.data));
  } catch (e) {
    const err = e as { code?: number; data?: unknown; message?: string };
    console.log("me error:", err.code, err.message, JSON.stringify(err.data ?? null));
  }

  try {
    const res = await client.v2.tweet("BC campaign smoke — please ignore if you see this.");
    console.log("tweet ok:", res.data.id);
  } catch (e) {
    const err = e as { code?: number; data?: unknown; message?: string };
    console.log("tweet error:", err.code, err.message, JSON.stringify(err.data ?? null));
  }
}

main().catch(console.error);
