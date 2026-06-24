import { getGoogleAnalyticsId } from "@/lib/google-analytics";

/** Google tag (gtag.js) — injected in root `<head>` for GA4. */
export function GoogleAnalyticsScripts() {
  const measurementId = getGoogleAnalyticsId();
  if (!measurementId) return null;

  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${measurementId}');
          `.trim(),
        }}
      />
    </>
  );
}
