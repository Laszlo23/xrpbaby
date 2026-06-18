import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/links")({
  beforeLoad: () => {
    throw redirect({ to: "/ecosystem" });
  },
  component: () => null,
});
