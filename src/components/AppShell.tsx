import { type ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, Wallet, Target, GraduationCap, Users, MessageCircle, LogOut, User } from 'lucide-react';

export type Tab = 'dashboard' | 'budget' | 'goals' | 'learn' | 'community' | 'coach' | 'account';

const NAV: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'budget', label: 'Budget', icon: Wallet },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'learn', label: 'Learn', icon: GraduationCap },
  { id: 'community', label: 'Community', icon: Users },
  { id: 'coach', label: 'AI Coach', icon: MessageCircle },
  { id: 'account', label: 'Account', icon: User },
];

export function AppShell({ tab, onTab, children }: { tab: Tab; onTab: (t: Tab) => void; children: ReactNode }) {
  const { profile, signOut } = useAuth();
  const firstName = (profile?.full_name || '').split(' ')[0] || 'there';

  return (
    <div className="min-h-screen bg-[#EFEBE3] flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-60 flex-col border-r border-[#E8E2D9] bg-[#FAF8F4] sticky top-0 h-screen">
        <div className="px-6 py-6">
          <span className="font-display text-xl font-semibold tracking-tight text-[#2C3329]">wealthwise</span>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 mt-2">
          {NAV.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-[#2C3329] text-[#EFEBE3]'
                    : 'text-[#5a6354] hover:bg-[#E8E2D9] hover:text-[#2C3329]'
                }`}
              >
                <item.icon className="w-[18px] h-[18px]" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[#E8E2D9]">
          <div className="px-3 py-2 mb-1">
            <p className="text-[10px] uppercase tracking-widest text-[#788B76]">Signed in</p>
            <p className="text-sm font-medium text-[#2C3329] truncate">{firstName}</p>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#788B76] hover:bg-[#E8E2D9] hover:text-[#2C3329] transition-all"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile + main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center justify-between px-5 py-4 bg-[#FAF8F4]/90 backdrop-blur sticky top-0 z-30 border-b border-[#E8E2D9]">
          <span className="font-display text-lg font-semibold text-[#2C3329]">wealthwise</span>
          <button onClick={signOut} className="text-[#788B76] p-2">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 px-5 sm:px-8 py-6 sm:py-10 max-w-5xl mx-auto w-full pb-28 lg:pb-10">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-[#FAF8F4]/95 backdrop-blur border-t border-[#E8E2D9] flex justify-around px-1 py-2 z-30">
          {NAV.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTab(item.id)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                  active ? 'text-[#2C3329]' : 'text-[#788B76]'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
