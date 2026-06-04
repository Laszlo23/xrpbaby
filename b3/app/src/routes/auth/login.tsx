import { createFileRoute, redirect } from "@tanstack/react-router";
import { AuthLoginPage } from "@/components/auth/AuthLoginPage";

export const Route = createFileRoute("/auth/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    returnUrl: typeof search.returnUrl === "string" ? search.returnUrl : undefined,
  }),
  beforeLoad: ({ search }) => {
    if (search.returnUrl && !isAllowedReturnUrl(search.returnUrl)) {
      throw redirect({ to: "/wallet" });
    }
  },
  component: AuthLoginPage,
});

function isAllowedReturnUrl(returnUrl: string): boolean {
  try {
    const target = new URL(returnUrl);
    if (target.protocol !== "https:" && target.protocol !== "http:") return false;
    const host = target.hostname;
    return (
      host.endsWith(".buildingcultureid.space") ||
      host.endsWith(".buildingculture.capital") ||
      host === "buildingcultureid.space" ||
      host === "buildingculture.capital" ||
      host === "localhost"
    );
  } catch {
    return false;
  }
}
