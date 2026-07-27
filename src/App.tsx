import { useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Landing } from '@/components/Landing';
import { AuthScreen } from '@/components/AuthScreen';
import { AppShell, type Tab } from '@/components/AppShell';
import { Dashboard } from '@/components/Dashboard';
import { BudgetPage } from '@/components/BudgetPage';
import { SavingsPage } from '@/components/SavingsPage';
import { LearnPage } from '@/components/LearnPage';
import { CommunityPage } from '@/components/CommunityPage';
import { CoachPage } from '@/components/CoachPage';
import { AccountPage } from '@/components/AccountPage';
import { LoadingScreen } from '@/components/ui';

type View = 'landing' | 'auth';

function AppContent() {
  const { session, loading } = useAuth();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [view, setView] = useState<View>('landing');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');

  if (loading) return <LoadingScreen />;
  if (!session) {
    if (view === 'landing') {
      return (
        <Landing
          onStart={() => { setAuthMode('signup'); setView('auth'); }}
          onSignIn={() => { setAuthMode('signin'); setView('auth'); }}
        />
      );
    }
    return (
      <AuthScreen
        mode={authMode}
        onModeChange={setAuthMode}
        onBack={() => setView('landing')}
      />
    );
  }

  return (
    <AppShell tab={tab} onTab={setTab}>
      {tab === 'dashboard' && <Dashboard onTab={(t) => setTab(t)} />}
      {tab === 'budget' && <BudgetPage />}
      {tab === 'goals' && <SavingsPage />}
      {tab === 'learn' && <LearnPage />}
      {tab === 'community' && <CommunityPage />}
      {tab === 'coach' && <CoachPage />}
      {tab === 'account' && <AccountPage />}
    </AppShell>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
