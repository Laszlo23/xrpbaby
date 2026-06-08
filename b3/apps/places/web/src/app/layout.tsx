import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SiteChrome } from "@/components/SiteChrome";
import { REFERENCE_YIELD_BAND_LABEL } from "@/lib/demo-properties";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg" }],
  },
  title: "Building Culture — Cultural real estate on Base",
  description: `Community funding for coworking, cultural, and housing — tokenized shares on Base. Planning yield band ${REFERENCE_YIELD_BAND_LABEL} p.a. · issuer disclosures and Legal hub.`,
  applicationName: "Building Culture",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    title: "Building Culture — Cultural real estate on Base",
    description: `Community-owned cultural real estate on Base — ${REFERENCE_YIELD_BAND_LABEL} planning band · economics in issuer materials.`,
    type: "website",
    url: "/",
    siteName: "Building Culture",
    locale: "en_US",
    images: [
      {
        url: "/properties/1/hero.jpg",
        width: 1200,
        height: 630,
        alt: "Building Culture — flagship cultural property listing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Building Culture — Cultural real estate on Base",
    description: `Cultural real estate on Base — ${REFERENCE_YIELD_BAND_LABEL} planning band · Building Culture.`,
    images: ["/properties/1/hero.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0c1814",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700,800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${manrope.variable} min-h-screen bg-[#050505] text-white antialiased`}
        style={
          {
            "--font-cabinet": "'Cabinet Grotesk', system-ui, sans-serif",
            "--font-jetbrains": "'JetBrains Mono', ui-monospace, monospace",
          } as Record<string, string>
        }
      >
        <Providers>
          {/* No animate-page-in on <main>: client-side navigations can restart the animation and re-apply keyframe opacity:0, making styles/content appear to vanish until the animation finishes. */}
          <SiteChrome>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
