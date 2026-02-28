import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { ErrorToastContainer } from "@/components/ui/error-toast";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useAuth } from "@/contexts/AuthContext";

// Lazy-load all pages so each gets its own JS chunk and Suspense handles the
// loading state automatically while navigating between routes.
const Landing = lazy(() => import("./pages/Landing"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DetNest = lazy(() => import("./pages/DetNest"));
const CustomGenerator = lazy(() => import("./pages/CustomGenerator"));
const SampleDatasets = lazy(() => import("./pages/SampleDatasets"));
const HistoryPage = lazy(() => import("./pages/History"));
const SettingsPage = lazy(() => import("./pages/Settings"));
const MyDatasets = lazy(() => import("./pages/MyDatasets"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const GettingStarted = lazy(() => import("./pages/GettingStarted"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AnalyticsWorkspace = lazy(() => import("./pages/AnalyticsWorkspace"));

const queryClient = new QueryClient();

// Show the loading screen while auth state is being resolved on first load,
// then keep it visible via Suspense during any lazy-route navigation.
const AppWithLoading = () => {
  const { isLoading } = useAuth();

  return (
    <>
      <LoadingScreen show={isLoading} />
      {!isLoading && (
        <Suspense fallback={<LoadingScreen show={true} />}>
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
              <Route path="samples" element={<SampleDatasets />} />
              <Route path="datasets" element={<MyDatasets />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="analytics" element={<AnalyticsWorkspace />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      )}
    </>
  );
};

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
              <AppWithLoading />
            </BrowserRouter>
          </TooltipProvider>
        </ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
