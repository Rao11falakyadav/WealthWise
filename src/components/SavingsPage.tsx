import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Button, Card, Input, Modal, ProgressBar, EmptyState, Spinner } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/format';
import type { SavingsGoal } from '@/lib/types';
import { Target, Plus, Trash2, Minus, Sparkles } from 'lucide-react';

const ICONS = ['Target', 'Home', 'Plane', 'GraduationCap', 'Heart', 'Shield', 'Car', 'Gift'];

export function SavingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [modal, setModal] = useState(false);
  const [contributeModal, setContributeModal] = useState<SavingsGoal | null>(null);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [icon, setIcon] = useState(ICONS[0]);
  const [contributeAmount, setContributeAmount] = useState('');

  async function load() {
    if (!user) return;
    const { data } = await supabase.from('savings_goals').select('*').order('created_at', { ascending: false });
    setGoals((data as SavingsGoal[]) || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [user]);

  async function addGoal() {
    setBusy(true);
    const targetAmount = parseFloat(target);
    if (!name || !targetAmount || targetAmount <= 0) { setBusy(false); return; }
    await supabase.from('savings_goals').insert({
      name, target_amount: targetAmount, target_date: targetDate || null, icon,
    });
    setBusy(false);
    setModal(false);
    setName(''); setTarget(''); setTargetDate(''); setIcon(ICONS[0]);
    await load();
  }

  async function deleteGoal(id: string) {
    await supabase.from('savings_goals').delete().eq('id', id);
    await load();
  }

  async function contribute(goal: SavingsGoal, amount: number) {
    if (!amount || amount === 0) return;
    setBusy(true);
    const newAmount = Math.max(0, Number(goal.current_amount) + amount);
    await supabase.from('savings_goals').update({ current_amount: newAmount }).eq('id', goal.id);
    setBusy(false);
    setContributeModal(null);
    setContributeAmount('');
    await load();
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="w-7 h-7 text-[#788B76]" />
      </div>
    );
  }

  const totalSaved = goals.reduce((s, g) => s + Number(g.current_amount), 0);
  const totalTarget = goals.reduce((s, g) => s + Number(g.target_amount), 0);

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-[#2C3329]">Savings goals</h1>
          <p className="text-sm text-[#788B76] mt-1">Give your money a destination.</p>
        </div>
        <Button variant="secondary" onClick={() => setModal(true)}>
          <span className="flex items-center gap-1.5"><Plus className="w-4 h-4" /> New goal</span>
        </Button>
      </div>

      {/* Summary banner */}
      {goals.length > 0 && (
        <div className="rounded-2xl bg-[#2C3329] p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#788B76] via-[#C06E52] to-[#B5895C]" />
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#8FA084] mb-2">Total saved</p>
              <p className="font-display text-4xl font-semibold text-[#EFEBE3]">{formatCurrency(totalSaved)}</p>
              <p className="text-[#EFEBE3]/50 text-sm mt-2">of {formatCurrency(totalTarget)} across {goals.length} goal{goals.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="w-20 h-20 rounded-full border-2 border-[#EFEBE3]/20 flex items-center justify-center">
              <span className="font-display text-xl font-semibold text-[#EFEBE3]">
                {totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      )}

      {goals.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon={<Target className="w-6 h-6" />}
            title="No goals yet"
            message="Define a target — a home, a trip, an emergency fund — and start building toward it."
            action={<Button variant="secondary" onClick={() => setModal(true)}><span className="flex items-center gap-1.5"><Plus className="w-4 h-4" /> Create a goal</span></Button>}
          />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {goals.map((g) => {
            const pct = g.target_amount > 0 ? (Number(g.current_amount) / Number(g.target_amount)) * 100 : 0;
            const done = pct >= 100;
            const remaining = Math.max(0, Number(g.target_amount) - Number(g.current_amount));
            return (
              <Card key={g.id} className="p-6 group">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[#EFEBE3] flex items-center justify-center text-[#C06E52]">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-[#2C3329]">{g.name}</h3>
                      {g.target_date && <p className="text-xs text-[#788B76] mt-0.5">By {formatDate(g.target_date)}</p>}
                    </div>
                  </div>
                  <button onClick={() => deleteGoal(g.id)} className="opacity-0 group-hover:opacity-100 text-[#B5AB9B] hover:text-[#C06E52] transition-all p-1.5 rounded-lg hover:bg-[#FAF0EC]">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-semibold text-[#2C3329]">{formatCurrency(Number(g.current_amount))}</span>
                    <span className="text-[#788B76]">{formatCurrency(Number(g.target_amount))}</span>
                  </div>
                  <ProgressBar value={Number(g.current_amount)} max={Number(g.target_amount)} color={done ? '#788B76' : '#C06E52'} />
                </div>

                <div className="flex items-center justify-between mt-5">
                  <span className="text-xs text-[#788B76]">
                    {done ? (
                      <span className="text-[#788B76] font-semibold flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> Goal reached!</span>
                    ) : (
                      <>{Math.round(pct)}% · {formatCurrency(remaining)} to go</>
                    )}
                  </span>
                  <Button variant="outline" onClick={() => setContributeModal(g)} className="text-xs py-1.5 px-3">
                    Add funds
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Create a goal">
        <div className="space-y-4">
          <Input label="Goal name" value={name} onChange={setName} placeholder="e.g. Emergency fund" />
          <Input label="Target amount" type="number" value={target} onChange={setTarget} placeholder="5000" step="0.01" min="0" />
          <Input label="Target date (optional)" type="date" value={targetDate} onChange={setTargetDate} />
          <div>
            <span className="block text-xs uppercase tracking-widest text-[#788B76] mb-2">Icon</span>
            <div className="grid grid-cols-8 gap-2">
              {ICONS.map((ic) => (
                <button key={ic} onClick={() => setIcon(ic)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${icon === ic ? 'bg-[#2C3329] text-[#EFEBE3]' : 'bg-[#F5F2EC] text-[#788B76] hover:bg-[#E8E2D9]'}`}>
                  <Target className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>
          <Button variant="secondary" onClick={addGoal} className="w-full" disabled={busy}>
            {busy ? <Spinner className="w-4 h-4 mx-auto" /> : 'Create goal'}
          </Button>
        </div>
      </Modal>

      <Modal open={!!contributeModal} onClose={() => setContributeModal(null)} title={contributeModal ? `Update — ${contributeModal.name}` : ''}>
        <div className="space-y-4">
          <p className="text-sm text-[#788B76]">
            Current: <span className="font-semibold text-[#2C3329]">{formatCurrency(Number(contributeModal?.current_amount || 0))}</span>
          </p>
          <Input label="Amount" type="number" value={contributeAmount} onChange={setContributeAmount} placeholder="0.00" step="0.01" min="0" />
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => contribute(contributeModal!, -Math.abs(parseFloat(contributeAmount) || 0))} disabled={busy || !contributeAmount}>
              <span className="flex items-center justify-center gap-1.5"><Minus className="w-4 h-4" /> Withdraw</span>
            </Button>
            <Button variant="secondary" className="flex-1" onClick={() => contribute(contributeModal!, Math.abs(parseFloat(contributeAmount) || 0))} disabled={busy || !contributeAmount}>
              <span className="flex items-center justify-center gap-1.5"><Plus className="w-4 h-4" /> Deposit</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
