import type { Metadata } from "next";
import { VeriffKyc } from "@/components/kyc/VeriffKyc";

export const metadata: Metadata = {
  title: "Identity verification",
  description: "Complete identity verification with Veriff to satisfy issuer and ComplianceRegistry rules where required.",
};

export default function KycPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-16">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Identity verification</h1>
        <p className="text-sm leading-relaxed text-zinc-400">
          Verification is provided by Veriff. Your wallet address is sent as reference data (vendor data) for webhook and
          operational correlation — not legal advice; see terms and privacy.
        </p>
        <p className="mx-auto mt-4 max-w-xl text-xs leading-relaxed text-zinc-500">
          After you finish, Veriff redirects you back to{" "}
          <strong className="font-medium text-zinc-400">this site</strong> (configured callback on our domain—not
          Veriff&apos;s generic help URL). New to the flow? See Veriff&apos;s overview of document and selfie steps:{" "}
          <a
            href="https://www.veriff.com/get-verified?navigation=slim"
            target="_blank"
            rel="noopener noreferrer"
            className="text-action underline-offset-2 hover:underline"
          >
            How to get verified with Veriff
          </a>
          .
        </p>
      </header>

      <div className="glass-card-strong p-6">
        <h2 className="text-lg font-semibold text-white">Veriff</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Start verification below. After the session is created, Veriff opens the in-page verification frame.
        </p>
        <div className="mt-6 flex justify-center">
          <VeriffKyc />
        </div>
      </div>
    </div>
  );
}
