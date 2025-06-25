
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SupabaseTournamentProvider } from "@/contexts/SupabaseTournamentContext";
import Dashboard from "./pages/Dashboard";
import TournamentNew from "./pages/TournamentNew";
import TournamentView from "./pages/TournamentView";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SupabaseTournamentProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tournament/new" element={<TournamentNew />} />
            <Route path="/tournament/:id" element={<TournamentView />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SupabaseTournamentProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
