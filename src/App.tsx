import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { CoordinatorProvider } from "@/context/CoordinatorContext";
import Index from "./pages/Index";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import CustomerDashboard from "./pages/CustomerDashboard";
import CoordinatorDashboard from "./pages/CoordinatorDashboard";
import AgencyDashboard from "./pages/AgencyDashboard";
import ReportIncident from "./pages/ReportIncident";
import { AgenciesList } from "./pages/AgenciesList";
import { ResourcesView } from "./pages/ResourcesView";
import NotFound from "./pages/NotFound";
import { IncidentMap } from "./components/maps/IncidentMap";


const queryClient = new QueryClient();
<Route path="/testmap" element={<div style={{height: "400px"}}><IncidentMap /></div>} />


const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CoordinatorProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/customer" element={<CustomerDashboard />} />
              <Route path="/coordinator" element={<CoordinatorDashboard />} />
              <Route path="/coordinator/agencies" element={<AgenciesList />} />
              <Route path="/coordinator/resources" element={<ResourcesView />} />
              <Route path="/agency" element={<AgencyDashboard />} />
              <Route path="/report" element={<ReportIncident />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CoordinatorProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
