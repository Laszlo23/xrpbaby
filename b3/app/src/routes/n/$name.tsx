import { createFileRoute, redirect } from "@tanstack/react-router";

import { cultureProfilePath } from "@/lib/identity/urls";
import { parseIdentityFullName } from "@/lib/identity/tlds";

/** Short share link: /n/laszlo.culture → canonical profile /id/laszlo.culture */
export const Route = createFileRoute("/n/$name")({
  beforeLoad: ({ params }) => {
    const parsed = parseIdentityFullName(params.name);
    const slug = parsed ? `${parsed.handle}.${parsed.tld}` : params.name.toLowerCase();
    throw redirect({ to: cultureProfilePath(slug) });
  },
  component: () => null,
});
