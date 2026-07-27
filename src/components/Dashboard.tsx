import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Card, ProgressBar, Spinner, Button } from '@/components/ui';
import { formatCurrency, monthKey, monthLabel } from '@/lib/format';
import type { Transaction, SavingsGoal, Investment, CourseProgress } from '@/lib/types';
import { ArrowUpRight, ArrowDownRight, Target, TrendingUp, MessageCircle, ArrowRight, GraduationCap, Sparkles } from 'lucide-react';

export function Dashboard({ onTab }: { onTab: (t: 'budget' | 'goals' | 'coach' | 'learn') => void }) {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [progress, setProgress] = useState<CourseProgress[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [txRes, goalsRes, invRes, progRes] = await Promise.all([
        supabase.from('transactions').select('*').order('date', { ascending: false }).limit(50),
        supabase.from('savings_goals').select('*').order('created_at', { ascending: false }),
        supabase.from('investments').select('*'),
        supabase.from('course_progress').select('*'),
      ]);
      setTransactions((txRes.data as Transaction[]) || []);
      setGoals((goalsRes.data as SavingsGoal[]) || []);
      setInvestments((invRes.data as Investment[]) || []);
      setProgress((progRes.data as CourseProgress[]) || []);
      setLoading(false);
    })();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="w-7 h-7 text-[#788B76]" />
      </div>
    );
  }

  const thisMonth = monthKey(new Date());
  const monthTx = transactions.filter((t) => monthKey(t.date) === thisMonth);
  const income = monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const expenses = monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const net = income - expenses;
  const savingsRate = income > 0 ? Math.round(((net) / income) * 100) : 0;

  const totalSavings = goals.reduce((s, g) => s + Number(g.current_amount), 0);
  const portfolioValue = investments.reduce((s, i) => s + Number(i.shares) * Number(i.current_price), 0);
  const completedCourses = progress.filter((p) => p.completed).length;

  const firstName = (profile?.full_name || '').split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-widest text-[#788B76] mb-1">{monthLabel(new Date())}</p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-[#2C3329]">
          {greeting}, {firstName}.
        </h1>
        <p className="text-[#788B76] text-sm mt-1">Here's how your money is moving this month.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Income" value={formatCurrency(income)} icon={ArrowUpRight} tone="sage" />
        <StatCard label="Expenses" value={formatCurrency(expenses)} icon={ArrowDownRight} tone="terracotta" />
        <StatCard label="Net" value={formatCurrency(net)} icon={Target} tone={net >= 0 ? 'sage' : 'terracotta'} />
        <StatCard label="Portfolio" value={formatCurrency(portfolioValue)} icon={TrendingUp} tone="sand" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Savings rate */}
        <Card className="p-6">
          <p className="text-xs uppercase tracking-widest text-[#788B76] mb-1">Savings rate</p>
          <p className="font-display text-4xl font-semibold text-[#2C3329] mb-4">{savingsRate}%</p>
          <ProgressBar value={Math.max(0, savingsRate)} max={100} color="#788B76" />
          <p className="text-xs text-[#788B76] mt-3">{monthTx.length} transactions this month</p>
        </Card>

        {/* Goals */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-[#C06E52]" />
            <p className="text-xs uppercase tracking-widest text-[#788B76]">Savings goals</p>
          </div>
          {goals.length === 0 ? (
            <p className="text-sm text-[#788B76] py-4">No goals yet. Start with something small.</p>
          ) : (
            <>
              <p className="font-display text-2xl font-semibold text-[#2C3329] mb-1">{formatCurrency(totalSavings)}</p>
              <p className="text-xs text-[#788B76] mb-5">saved across {goals.length} goal{goals.length !== 1 ? 's' : ''}</p>
              <div className="space-y-4">
                {goals.slice(0, 3).map((g) => (
                  <div key={g.id}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-[#2C3329] font-medium truncate pr-2">{g.name}</span>
                      <span className="text-[#788B76] shrink-0">
                        {Math.round(g.target_amount > 0 ? (Number(g.current_amount) / Number(g.target_amount)) * 100 : 0)}%
                      </span>
                    </div>
                    <ProgressBar value={Number(g.current_amount)} max={Number(g.target_amount)} color="#C06E52" />
                  </div>
                ))}
              </div>
            </>
          )}
          {goals.length > 0 && (
            <button onClick={() => onTab('goals')} className="text-xs text-[#C06E52] font-medium mt-5 hover:underline flex items-center gap-1">
              View all goals <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </Card>

        {/* Learning */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-4 h-4 text-[#788B76]" />
            <p className="text-xs uppercase tracking-widest text-[#788B76]">Learning</p>
          </div>
          <p className="font-display text-4xl font-semibold text-[#2C3329] mb-1">{completedCourses}</p>
          <p className="text-sm text-[#788B76] mb-6">modules completed</p>
          <Button variant="outline" className="w-full text-sm" onClick={() => onTab('learn')}>
            <span className="flex items-center justify-center gap-2">Continue learning <ArrowRight className="w-3.5 h-3.5" /></span>
          </Button>
        </Card>
      </div>

      {/* Recent transactions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-semibold text-[#2C3329]">Recent transactions</h2>
          <button onClick={() => onTab('budget')} className="text-xs text-[#788B76] hover:text-[#C06E52] transition-colors font-medium">
            View all →
          </button>
        </div>
        {transactions.length === 0 ? (
          <p className="text-sm text-[#788B76] py-8 text-center border border-dashed border-[#E8E2D9] rounded-xl">
            No transactions yet. Add your first one in Budget.
          </p>
        ) : (
          <div className="space-y-1">
            {transactions.slice(0, 8).map((t) => (
              <div key={t.id} className="flex items-center justify-between py-3 border-b border-[#F0EDE8] last:border-0 hover:bg-[#FAF8F4] px-2 -mx-2 rounded-lg transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${t.type === 'income' ? 'bg-[#EBF4EB] text-[#788B76]' : 'bg-[#FAF0EC] text-[#C06E52]'}`}>
                    {t.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#2C3329] truncate">{t.description || t.category}</p>
                    <p className="text-xs text-[#788B76]">{t.category} · {new Date(t.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-[#788B76]' : 'text-[#2C3329]'}`}>
                  {t.type === 'income' ? '+' : '−'}{formatCurrency(Number(t.amount))}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Ivy CTA */}
      <div className="rounded-2xl bg-[#2C3329] p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#8FA084]/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="flex items-center justify-between flex-wrap gap-6 relative z-10">
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-xl bg-[#EFEBE3]/10 border border-[#EFEBE3]/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-[#8FA084]" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-semibold text-[#EFEBE3] mb-1">Meet Ivy, your AI coach.</h3>
              <p className="text-[#EFEBE3]/60 text-sm max-w-md leading-relaxed">
                Warm, specific guidance on budgeting, saving, and investing — day or night.
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={() => onTab('coach')} className="bg-[#EFEBE3]/10 text-[#EFEBE3] hover:bg-[#EFEBE3]/20 border-0">
            <span className="flex items-center gap-2">Talk to Ivy <ArrowRight className="w-4 h-4" /></span>
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: typeof Target;
  tone: 'sage' | 'terracotta' | 'sand';
}) {
  const tones = {
    sage: 'bg-[#EBF4EB] text-[#788B76]',
    terracotta: 'bg-[#FAF0EC] text-[#C06E52]',
    sand: 'bg-[#FAF5EE] text-[#B5895C]',
  };
  return (
    <div className="bg-white rounded-2xl border border-[#E8E2D9] p-5 hover:border-[#C8BFB4] transition-colors">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${tones[tone]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-xs uppercase tracking-widest text-[#788B76] mb-1">{label}</p>
      <p className="font-display text-2xl font-semibold text-[#2C3329]">{value}</p>
    </div>
  );
}
