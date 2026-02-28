import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { LoginPromptDialog } from '@/components/LoginPromptDialog';
import { HelpMenu } from '@/components/HelpMenu';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { GuideTour } from '@/components/GuideTour';
import { LoadingScreen } from '@/components/LoadingScreen';

const Dashboard = () => {
  const { isAuthenticated, isAnonymous, user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showGuideTour, setShowGuideTour] = useState(false);
  /* const [showGuideTour, setShowGuideTour] = useState(false); REMOVED */
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  // Check if user needs onboarding (new authenticated user)
  useEffect(() => {
    if (isAuthenticated && !isAnonymous && user) {
      if (!user.onboarding_completed) {
        setShowOnboarding(true);
      }
    }
  }, [isAuthenticated, isAnonymous, user]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Show guide tour after onboarding
    setShowGuideTour(true);
  };

  const handleGuideTourComplete = () => {
    setShowGuideTour(false);
  };

  // Show loading screen while the auth redirect is in-flight
  if (!isAuthenticated) {
    return <LoadingScreen show={true} />;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-background border-b border-border flex items-center justify-between px-4 z-30">
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="p-2 hover:bg-muted rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="font-semibold">DataForgeAI</span>
        <div className="w-9" /> {/* Spacer for centering */}
      </div>

      {/* Mobile Sidebar Overlay */}
      {!isSidebarCollapsed && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarCollapsed(true)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ${isSidebarCollapsed ? '-translate-x-full' : 'translate-x-0'}`}>
        <AppSidebar
          collapsed={false}
          onToggle={() => setIsSidebarCollapsed(true)}
        />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AppSidebar
          collapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      <main className="flex-1 overflow-hidden relative pt-14 md:pt-0">
        <Outlet />
        {/* Help Menu - Bottom right corner, only on chat page */}
        {location.pathname === '/app' && <HelpMenu />}
      </main>

      {/* Login prompt for anonymous users - shown once per session */}
      <LoginPromptDialog isAnonymous={isAnonymous} />

      {/* Onboarding flow for new users */}
      <OnboardingFlow
        open={showOnboarding}
        onComplete={handleOnboardingComplete}
      />

      {/* Guide tour after onboarding */}
      <GuideTour
        open={showGuideTour}
        onComplete={handleGuideTourComplete}
      />
    </div>
  );
};

export default Dashboard;
