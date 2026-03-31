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
import StudentMentorHiring from "./pages/StudentMentorHiring";
import HiringThankYou from "./pages/HiringThankYou";
import InternalDashboard from "./pages/InternalDashboard";
import SalesEvaluation from "./pages/SalesEvaluation";
import SalesHiring from "./pages/SalesHiring";
import ResetPassword from "./pages/ResetPassword";
import AddExpense from "./pages/AddExpense";
import AdminExpenses from "./pages/AdminExpenses";
import BlogManager from "./pages/BlogManager";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import LeadForm from "./pages/LeadForm";
import LeadThankYou from "./pages/LeadThankYou";
import MuhasinTask from "./pages/MuhasinTask";
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
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/webinar" element={<Webinar />} />
      <Route path="/hiring" element={<HiringOverview />} />
      <Route path="/hiring/student-counsellor" element={<Hiring />} />
      <Route path="/hiring/student-mentor" element={<StudentMentorHiring />} />
      <Route path="/hiring/sales-executive" element={<SalesHiring />} />
      <Route path="/hiring/thank-you" element={<HiringThankYou />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/internal" element={<InternalDashboard />} />
      <Route path="/internal/sales-evaluation" element={<SalesEvaluation />} />
      <Route path="/internal/expenses" element={<AddExpense />} />
      <Route path="/admin/expenses" element={<AdminExpenses />} />
      <Route path="/internal/blog" element={<BlogManager />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      <Route path="/get-started" element={<LeadForm />} />
      <Route path="/get-started/thank-you" element={<LeadThankYou />} />
      <Route path="/muhasinatask" element={<MuhasinTask />} />
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
