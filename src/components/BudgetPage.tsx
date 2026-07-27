import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Button, Card, Input, Select, Modal, ProgressBar, EmptyState, Spinner } from '@/components/ui';
import { formatCurrency, monthKey, monthLabel } from '@/lib/format';
import type { Transaction, Budget } from '@/lib/types';
import { Wallet, Plus, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const EXPENSE_CATEGORIES = ['Groceries', 'Rent', 'Utilities', 'Transport', 'Dining', 'Shopping', 'Health', 'Childcare', 'Subscriptions', 'Other'];
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Side income', 'Investments', 'Gifts', 'Other'];

export function BudgetPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [txModal, setTxModal] = useState(false);
  const [budgetModal, setBudgetModal] = useState(false);
  const [busy, setBusy] = useState(false);

  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [txDescription, setTxDescription] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().slice(0, 10));

  const [bCategory, setBCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [bLimit, setBLimit] = useState('');

  async function load() {
    if (!user) return;
    const [txRes, bRes] = await Promise.all([
      supabase.from('transactions').select('*').order('date', { ascending: false }),
      supabase.from('budgets').select('*').eq('month', monthKey(new Date())),
    ]);
    setTransactions((txRes.data as Transaction[]) || []);
    setBudgets((bRes.data as Budget[]) || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [user]);

  async function addTransaction() {
    setBusy(true);
    const amount = parseFloat(txAmount);
    if (!amount || amount <= 0) { setBusy(false); return; }
    await supabase.from('transactions').insert({
      amount, type: txType, category: txCategory, description: txDescription, date: txDate,
    });
    setBusy(false);
    setTxModal(false);
    setTxAmount(''); setTxDescription('');
    await load();
  }

  async function deleteTransaction(id: string) {
    await supabase.from('transactions').delete().eq('id', id);
    await load();
  }

  async function addBudget() {
    setBusy(true);
    const limit = parseFloat(bLimit);
    if (!limit || limit <= 0) { setBusy(false); return; }
    await supabase.from('budgets').upsert(
      { category: bCategory, limit_amount: limit, month: monthKey(new Date()) },
      { onConflict: 'user_id,category,month' }
    );
    setBusy(false);
    setBudgetModal(false);
    setBLimit('');
    await load();
  }

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

  const spendByCategory = EXPENSE_CATEGORIES.map((cat) => ({
    category: cat,
    spent: monthTx.filter((t) => t.type === 'expense' && t.category === cat).reduce((s, t) => s + Number(t.amount), 0),
    budget: budgets.find((b) => b.category === cat)?.limit_amount ?? 0,
  })).filter((c) => c.spent > 0 || c.budget > 0);

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#788B76]">{monthLabel(new Date())}</p>
          <h1 className="font-display text-3xl md:text-4xl mt-1 font-semibold tracking-tight text-[#2C3329]">Budget</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setBudgetModal(true)}>
            Set limit
          </Button>
          <Button variant="secondary" onClick={() => setTxModal(true)}>
            <span className="flex items-center gap-1.5"><Plus className="w-4 h-4" /> Add transaction</span>
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="w-9 h-9 rounded-xl bg-[#EBF4EB] flex items-center justify-center mb-3">
            <ArrowUpRight className="w-4 h-4 text-[#788B76]" />
          </div>
          <p className="text-xs uppercase tracking-widest text-[#788B76] mb-1">Income</p>
          <p className="font-display text-2xl font-semibold text-[#2C3329]">{formatCurrency(income)}</p>
        </Card>
        <Card className="p-5">
          <div className="w-9 h-9 rounded-xl bg-[#FAF0EC] flex items-center justify-center mb-3">
            <ArrowDownRight className="w-4 h-4 text-[#C06E52]" />
          </div>
          <p className="text-xs uppercase tracking-widest text-[#788B76] mb-1">Expenses</p>
          <p className="font-display text-2xl font-semibold text-[#C06E52]">{formatCurrency(expenses)}</p>
        </Card>
        <Card className="p-5">
          <div className="w-9 h-9 rounded-xl bg-[#FAF8F4] border border-[#E8E2D9] flex items-center justify-center mb-3">
            <Wallet className="w-4 h-4 text-[#788B76]" />
          </div>
          <p className="text-xs uppercase tracking-widest text-[#788B76] mb-1">Net</p>
          <p className={`font-display text-2xl font-semibold ${income - expenses >= 0 ? 'text-[#2C3329]' : 'text-[#C06E52]'}`}>
            {formatCurrency(income - expenses)}
          </p>
        </Card>
      </div>

      {/* Category budgets */}
      {spendByCategory.length > 0 && (
        <Card className="p-6">
          <h2 className="font-display text-xl font-semibold text-[#2C3329] mb-5">Spending by category</h2>
          <div className="space-y-5">
            {spendByCategory.map((c) => {
              const over = c.budget > 0 && c.spent > c.budget;
              return (
                <div key={c.category}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-[#2C3329]">{c.category}</span>
                    <span className={over ? 'text-[#C06E52] font-semibold' : 'text-[#788B76]'}>
                      {formatCurrency(c.spent)}{c.budget > 0 && ` / ${formatCurrency(c.budget)}`}
                    </span>
                  </div>
                  <ProgressBar value={c.spent} max={c.budget > 0 ? c.budget : c.spent} color={over ? '#C06E52' : '#788B76'} />
                  {over && <p className="text-xs text-[#C06E52] mt-1.5">Over budget by {formatCurrency(c.spent - c.budget)}</p>}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Transactions list */}
      <Card className="p-6">
        <h2 className="font-display text-xl font-semibold text-[#2C3329] mb-5">All transactions</h2>
        {transactions.length === 0 ? (
          <EmptyState
            icon={<Wallet className="w-6 h-6" />}
            title="No transactions yet"
            message="Add your first income or expense to get started."
            action={<Button variant="secondary" onClick={() => setTxModal(true)}><span className="flex items-center gap-1.5"><Plus className="w-4 h-4" /> Add transaction</span></Button>}
          />
        ) : (
          <div className="space-y-1">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-3 border-b border-[#F0EDE8] last:border-0 group hover:bg-[#FAF8F4] px-2 -mx-2 rounded-lg transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${t.type === 'income' ? 'bg-[#EBF4EB] text-[#788B76]' : 'bg-[#FAF0EC] text-[#C06E52]'}`}>
                    {t.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#2C3329] truncate">{t.description || t.category}</p>
                    <p className="text-xs text-[#788B76]">{t.category} · {new Date(t.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-[#788B76]' : 'text-[#2C3329]'}`}>
                    {t.type === 'income' ? '+' : '−'}{formatCurrency(Number(t.amount))}
                  </span>
                  <button onClick={() => deleteTransaction(t.id)} className="opacity-0 group-hover:opacity-100 text-[#B5AB9B] hover:text-[#C06E52] transition-all p-1.5 rounded-lg hover:bg-[#FAF0EC]">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={txModal} onClose={() => setTxModal(false)} title="Add transaction">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => { setTxType('expense'); setTxCategory(EXPENSE_CATEGORIES[0]); }} className={`py-2.5 rounded-full text-sm font-medium transition-all ${txType === 'expense' ? 'bg-[#2C3329] text-[#EFEBE3]' : 'bg-[#F5F2EC] text-[#788B76] hover:bg-[#E8E2D9]'}`}>Expense</button>
            <button onClick={() => { setTxType('income'); setTxCategory(INCOME_CATEGORIES[0]); }} className={`py-2.5 rounded-full text-sm font-medium transition-all ${txType === 'income' ? 'bg-[#2C3329] text-[#EFEBE3]' : 'bg-[#F5F2EC] text-[#788B76] hover:bg-[#E8E2D9]'}`}>Income</button>
          </div>
          <Input label="Amount" type="number" value={txAmount} onChange={setTxAmount} placeholder="0.00" step="0.01" min="0" />
          <Select label="Category" value={txCategory} onChange={setTxCategory} options={(txType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((c) => ({ value: c, label: c }))} />
          <Input label="Description (optional)" value={txDescription} onChange={setTxDescription} placeholder="e.g. Grocery run" />
          <Input label="Date" type="date" value={txDate} onChange={setTxDate} />
          <Button variant="secondary" onClick={addTransaction} className="w-full" disabled={busy}>
            {busy ? <Spinner className="w-4 h-4 mx-auto" /> : 'Add transaction'}
          </Button>
        </div>
      </Modal>

      <Modal open={budgetModal} onClose={() => setBudgetModal(false)} title="Set budget limit">
        <div className="space-y-4">
          <Select label="Category" value={bCategory} onChange={setBCategory} options={EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }))} />
          <Input label="Monthly limit" type="number" value={bLimit} onChange={setBLimit} placeholder="0.00" step="0.01" min="0" />
          <Button variant="secondary" onClick={addBudget} className="w-full" disabled={busy}>
            {busy ? <Spinner className="w-4 h-4 mx-auto" /> : 'Save limit'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
