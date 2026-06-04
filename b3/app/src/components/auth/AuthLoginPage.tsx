import { usePrivy } from "@privy-io/react-auth";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { Route } from "@/routes/auth/login";

/** Auth hub: Privy login then redirect back to satellite app. */
export function AuthLoginPage() {
  const { ready, authenticated, login } = usePrivy();
  const navigate = useNavigate();
  const { returnUrl } = Route.useSearch();
  const started = useRef(false);

  useEffect(() => {
    if (!ready) return;

    if (authenticated) {
      if (returnUrl) {
        window.location.href = returnUrl;
      } else {
        void navigate({ to: "/wallet" });
      }
      return;
    }

    if (started.current) return;
    started.current = true;
    void login();
  }, [ready, authenticated, login, returnUrl, navigate]);

  return (
    <main className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-sm text-zinc-400">Signing in to your Culture wallet…</p>
    </main>
  );
}
