import { createFileRoute, Outlet } from "@tanstack/react-router";

import { AppNav } from "@/components/app/AppNav";
import { WalletGate } from "@/components/app/WalletGate";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <AppNav />
      <div className="pt-24">
        <WalletGate>
          <Outlet />
        </WalletGate>
      </div>
    </main>
  );
}
