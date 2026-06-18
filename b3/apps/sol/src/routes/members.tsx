import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";

import { MemberNav } from "@/components/members/MemberNav";
import { getMemberDashboard } from "@/lib/api/member.functions";

export const Route = createFileRoute("/members")({
  beforeLoad: async () => {
    const member = await getMemberDashboard();
    if (!member) {
      throw redirect({ to: "/login" });
    }
    return { member };
  },
  component: MembersLayout,
});

function MembersLayout() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <MemberNav />
      <div className="pt-24">
        <Outlet />
      </div>
    </main>
  );
}
