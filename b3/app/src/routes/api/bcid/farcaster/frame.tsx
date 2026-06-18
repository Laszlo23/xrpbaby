import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/bcid/farcaster/frame")({
  server: {
    handlers: {
      GET: async () => {
        const { getServerPublicOrigin } = await import("@/lib/app-origin");
        const origin = getServerPublicOrigin();

        const frameHtml = `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${origin}/landing/bcid-frame.png" />
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
  <meta property="fc:frame:button:1" content="Mint BCID" />
  <meta property="fc:frame:button:1:action" content="link" />
  <meta property="fc:frame:button:1:target" content="${origin}/bcid" />
  <meta property="fc:frame:button:2" content="Learn more" />
  <meta property="fc:frame:button:2:action" content="link" />
  <meta property="fc:frame:button:2:target" content="${origin}/bcid" />
  <meta property="og:title" content="Building Culture ID" />
  <meta property="og:description" content="Portable builder identity. Prove work, not followers." />
  <title>BCID Farcaster Frame</title>
</head>
<body>
  <p>Building Culture ID — <a href="${origin}/bcid">Mint your BCID</a></p>
</body>
</html>`;

        return new Response(frameHtml, {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      },
    },
  },
  component: () => null,
});
