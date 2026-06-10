import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/bcc/")({
  beforeLoad: () => {
    throw redirect({ to: "/mission", hash: "token-home" });
  },
  component: () => null,
});
