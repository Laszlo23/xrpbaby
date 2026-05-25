import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Web3Provider } from "@bc/wallet-kit";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "./pages/NotFound.tsx";
import CookiesPage from "./pages/legal/CookiesPage.tsx";
import DisclaimerPage from "./pages/legal/DisclaimerPage.tsx";
import ImprintPage from "./pages/legal/ImprintPage.tsx";
import PrivacyPage from "./pages/legal/PrivacyPage.tsx";
import TermsPage from "./pages/legal/TermsPage.tsx";
import PropertyPage from "./pages/PropertyPage.tsx";
import CommunityGuide from "./pages/CommunityGuide.tsx";
import { ThemedStoryline } from "./pages/ThemedStoryline.tsx";
import { wagmiConfig } from "@/lib/wagmi-config";

const queryClient = new QueryClient();

const enableWeb3 = import.meta.env.VITE_ENABLE_WEB3 === "true";

const AppShell = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/land" replace />} />
        <Route path="/land" element={<ThemedStoryline theme="land" />} />
        <Route path="/city" element={<ThemedStoryline theme="city" />} />
        <Route path="/water" element={<ThemedStoryline theme="water" />} />
        <Route path="/guide" element={<CommunityGuide />} />
        <Route path="/property/:slug" element={<PropertyPage />} />
        <Route path="/legal/terms" element={<TermsPage />} />
        <Route path="/legal/privacy" element={<PrivacyPage />} />
        <Route path="/legal/cookies" element={<CookiesPage />} />
        <Route path="/legal/imprint" element={<ImprintPage />} />
        <Route path="/legal/disclaimer" element={<DisclaimerPage />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    {enableWeb3 ? (
      <Web3Provider wagmiConfig={wagmiConfig} includeQueryClient={false}>
        <AppShell />
      </Web3Provider>
    ) : (
      <AppShell />
    )}
  </QueryClientProvider>
);

export default App;
