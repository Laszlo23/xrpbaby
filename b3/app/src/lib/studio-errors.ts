/** Map studio API / server-fn errors to user-facing copy. */
export function formatStudioError(error: string | undefined): string {
  if (!error) return "Something went wrong. Try again.";
  if (error.includes("Connect your wallet")) return error;
  if (error.includes("Session expired")) return error;
  if (error.includes("Set your intent") || error.includes("Finish onboarding")) return error;
  switch (error) {
    case "no_database":
      return "Database is not available. Run migrations (prisma migrate deploy) and ensure Postgres is up.";
    case "missing_token":
    case "invalid_token":
      return "Sign-in expired. Refresh the page or reconnect your wallet.";
    case "project_limit":
      return "You reached the project limit (10). Delete an old project or export one first.";
    case "create_failed":
      return "Could not create the project. If this is a fresh install, apply the studio database migration.";
    case "wallet_required":
      return "Connect your wallet to continue.";
    default:
      return error.length > 120 ? `${error.slice(0, 120)}…` : error;
  }
}
