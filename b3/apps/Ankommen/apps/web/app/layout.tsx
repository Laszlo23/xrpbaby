import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@ankommen/ui/globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Ankommen AI — Welcome to Austria",
  description: "Your AI guide for housing, benefits, jobs, healthcare and understanding official letters in Austria.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "Ankommen AI" },
};

export const viewport: Viewport = {
  themeColor: "#c8102e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased flex min-h-screen flex-col`}>
        <Providers>
          <div className="flex min-h-screen flex-1 flex-col">{children}</div>
          <footer className="mt-auto border-t bg-card">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 md:flex-row">
              <p className="text-center text-sm text-muted-foreground md:text-left">
                Powered by <strong>Building Culture</strong> — Technology. Community. Impact.
              </p>
              <p className="text-xs italic text-muted-foreground">AI that helps people belong.</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
