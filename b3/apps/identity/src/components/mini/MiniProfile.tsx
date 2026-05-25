"use client";

import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useMiniApp } from "@/providers/MiniAppProvider";
import { profileUrl } from "@/lib/seo/site";
import { Button } from "@/components/ui/button";

type ProfileResponse = {
  profile: {
    fid: number;
    username: string;
    displayName: string;
    pfpUrl: string;
  } | null;
  identities: Array<{ fullName: string; tokenId: string }>;
};

export function MiniProfile() {
  const { quickAuthFetch } = useMiniApp();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ProfileResponse | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await quickAuthFetch("/api/mini/profile");
      if (res.ok) setData((await res.json()) as ProfileResponse);
    } finally {
      setLoading(false);
    }
  }, [quickAuthFetch]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const fcUser = data?.profile;
  const identities = data?.identities ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Your profile</h1>

      {fcUser && (
        <div className="flex items-center gap-3 rounded-xl border border-border/60 p-4">
          {fcUser.pfpUrl ? (
            <img
              src={fcUser.pfpUrl}
              alt=""
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <div className="h-14 w-14 rounded-full bg-muted" />
          )}
          <div>
            <p className="font-semibold">{fcUser.displayName}</p>
            <p className="text-sm text-muted-foreground">@{fcUser.username}</p>
          </div>
        </div>
      )}

      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Onchain identities
        </p>
        {identities.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No minted identity yet.{" "}
            <Link to="/mint" className="text-primary underline">
              Mint one
            </Link>
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {identities.map((id) => (
              <li key={id.fullName}>
                <a
                  href={profileUrl(id.fullName)}
                  className="block rounded-lg border border-border/60 px-3 py-2 text-sm font-medium hover:border-primary/40"
                >
                  {id.fullName}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {identities.length === 0 && (
        <Button asChild>
          <Link to="/mint">Mint identity</Link>
        </Button>
      )}
    </div>
  );
}
