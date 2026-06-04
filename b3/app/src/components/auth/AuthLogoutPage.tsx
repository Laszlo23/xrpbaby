import { usePrivy } from "@privy-io/react-auth";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { logoutMemberSession } from "@bc/culture-auth";
import { Route } from "@/routes/auth/logout";

/** Auth hub: Privy logout + optional server ack, then redirect. */
export function AuthLogoutPage() {
  const { ready, authenticated, logout, getAccessToken } = usePrivy();
  const navigate = useNavigate();
  const { returnUrl } = Route.useSearch();
  const started = useRef(false);

  useEffect(() => {
    if (!ready || started.current) return;
    started.current = true;

    void (async () => {
      try {
        if (authenticated) {
          const token = await getAccessToken();
          if (token) {
            await logoutMemberSession({ accessToken: token });
          }
          await logout();
        }
      } finally {
        if (returnUrl) {
          window.location.href = returnUrl;
        } else {
          void navigate({ to: "/wallet" });
        }
      }
    })();
  }, [ready, authenticated, logout, getAccessToken, returnUrl, navigate]);

  return (
    <main className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-sm text-zinc-400">Signing out…</p>
    </main>
  );
}
