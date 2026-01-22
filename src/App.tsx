import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import Webinar from "./pages/Webinar";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import HiringOverview from "./pages/HiringOverview";
import Hiring from "./pages/Hiring";
import HiringThankYou from "./pages/HiringThankYou";
import { initMetaPixel, trackMetaEvent } from "./lib/metaPixel";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const location = useLocation();

  useEffect(() => {
    initMetaPixel();
  }, []);

  useEffect(() => {
    // Track a basic page view for each route change
    trackMetaEvent("PageView");

    if (location.pathname === "/hiring/thank-you") {
      // Primary conversion event for hiring applications (Meta standard "Lead" event)
      trackMetaEvent("Lead");
    }
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/webinar" element={<Webinar />} />
      <Route path="/hiring" element={<HiringOverview />} />
      <Route path="/hiring/student-counsellor" element={<Hiring />} />
      <Route path="/hiring/thank-you" element={<HiringThankYou />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
