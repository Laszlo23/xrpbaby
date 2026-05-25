import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community — Building Culture",
  description: "Platform updates, tasks, referrals, and web3 growth loop for investors.",
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
