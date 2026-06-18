import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/bcc/")({
  beforeLoad: () => {
    throw redirect({ to: "/bcc/dashboard" });
  },
  component: () => null,
});
