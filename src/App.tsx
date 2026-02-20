import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { ErrorToastContainer } from "@/components/ui/error-toast";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import DetNest from "./pages/DetNest";
import CustomGenerator from "./pages/CustomGenerator";
import SampleDatasets from "./pages/SampleDatasets";
import HistoryPage from "./pages/History";
import SettingsPage from "./pages/Settings";import MyDatasets from './pages/MyDatasets';import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import GettingStarted from "./pages/GettingStarted";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <ChatProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <ErrorToastContainer />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/getting-started" element={<GettingStarted />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/app" element={<Dashboard />}>
                  <Route index element={<DetNest />} />
                  <Route path="generator" element={<CustomGenerator />} />
                  <Route path="samples" element={<SampleDatasets />} />                  <Route path="datasets" element={<MyDatasets />} />                  <Route path="history" element={<HistoryPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
