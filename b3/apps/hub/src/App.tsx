import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CultureAuthProvider } from "@bc/culture-auth/react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import CommunityGuide from "./pages/CommunityGuide.tsx";
import NotFound from "./pages/NotFound.tsx";
import { BuyBccButton } from "@/components/BuyBccChrome";
import { FarcasterLinkChrome } from "@/components/FarcasterLinkChrome";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CultureAuthProvider accentColor="#C5FF41" includeQueryClient={false}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/guide" element={<CommunityGuide />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BuyBccButton />
          <FarcasterLinkChrome />
        </BrowserRouter>
      </TooltipProvider>
    </CultureAuthProvider>
  </QueryClientProvider>
);

export default App;
