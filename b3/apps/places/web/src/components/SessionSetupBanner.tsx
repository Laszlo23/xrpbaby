import type { SiweVerifyResponse } from "@/lib/siwe-verify-types";

type Props = {
  verify: SiweVerifyResponse | null;
  className?: string;
};

export function SessionSetupBanner({ verify, className }: Props) {
  if (!verify || verify.sessionEstablished) return null;
  const err = verify.sessionError;
  if (!err) return null;

  return (
    <div
      className={`rounded-xl border border-amber-500/35 bg-amber-950/30 px-4 py-3 text-sm text-amber-100/95 ${className ?? ""}`}
    >
      <p className="font-medium text-amber-200">Session not active</p>
      {err === "missing_database" && (
        <p className="mt-1 text-xs leading-relaxed text-amber-200/80">
          Set <code className="text-zinc-200">DATABASE_URL</code> to Postgres on this machine (see Docker Compose{" "}
          <code className="text-zinc-200">postgres</code> with <code className="text-zinc-200">--profile db</code>) or any
          host, and <code className="text-zinc-200">SESSION_SECRET</code> (16+ random chars). Apply{" "}
          <code className="text-zinc-200">web/sql/schema.sql</code> then{" "}
          <code className="text-zinc-200">web/sql/community_schema.sql</code> (<code className="text-zinc-200">web/sql/README.md</code>
          ). Put both in repo-root <code className="text-zinc-200">.env</code> and recreate containers.
        </p>
      )}
      {err === "missing_session_secret" && (
        <p className="mt-1 text-xs leading-relaxed text-amber-200/80">
          Set <code className="text-zinc-200">SESSION_SECRET</code> (16+ random characters) in{" "}
          <code className="text-zinc-200">web/.env.local</code> (dev) or repo-root <code className="text-zinc-200">.env</code> for Docker, then restart.
        </p>
      )}
    </div>
  );
}
