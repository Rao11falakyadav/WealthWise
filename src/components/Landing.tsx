import { Button } from '@/components/ui';
import { ArrowRight, Sparkles, LineChart, Target, BookOpen, Quote } from 'lucide-react';

const MARQUEE_QUOTES = [
  'Save first, spend what remains — do not spend first and save what remains.',
  'Investing is patience wearing lipstick.',
  'Money is not the goal — freedom is.',
  'A budget is a love letter to future you.',
  'The best time to start was ten years ago. The second best is Tuesday.',
  'Compound interest is quietly ruthless (in your favor).',
];

const FEATURES = [
  {
    icon: Target,
    title: 'Budget with kindness',
    body: 'Track income and expenses without shame. See where every dollar wants to go.',
  },
  {
    icon: Sparkles,
    title: 'Grow what you save',
    body: 'Give your money a destination. Goals that feel like promises, not punishments.',
  },
  {
    icon: LineChart,
    title: 'Investment simulator',
    body: 'Interactive investment simulators show how small, steady contributions compound.',
  },
  {
    icon: BookOpen,
    title: 'Learn in your voice',
    body: 'Short editorial lessons on savings, index funds, negotiation and retirement — no jargon.',
  },
];

export function Landing({ onStart, onSignIn }: { onStart: () => void; onSignIn: () => void }) {
  return (
    <div className="min-h-screen bg-[#EFEBE3]">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-[#EFEBE3]/90 backdrop-blur-md border-b border-[#E8E2D9]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display text-xl font-semibold tracking-tight text-[#2C3329]">wealthwise</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onSignIn}>Sign in</Button>
            <Button variant="primary" onClick={onStart}>Join free</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-12">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#E8E2D9] text-xs uppercase tracking-widest text-[#788B76] mb-6">
            Financial literacy, refined
          </span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-[#2C3329]">
            Money, on <span className="italic text-[#C06E52]">your</span> terms.
            <br />
            A calmer relationship with money.
          </h1>
          <p className="mt-6 text-lg text-[#5a6354] leading-relaxed max-w-xl">
            A calm, editorial home for budgeting, saving and investing — built for women, guided by real experts and one very warm AI coach.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button variant="primary" onClick={onStart}>
              <span className="flex items-center gap-2">Start free <ArrowRight className="w-4 h-4" /></span>
            </Button>
            <span className="text-xs text-[#788B76] uppercase tracking-widest">Free forever core</span>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <section className="py-8 overflow-hidden border-y border-[#E8E2D9] bg-[#FAF8F4]">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...MARQUEE_QUOTES, ...MARQUEE_QUOTES].map((q, i) => (
            <div key={i} className="flex items-center gap-6 px-6">
              <span className="font-display text-2xl md:text-3xl italic text-[#2C3329]">{q}</span>
              <span className="text-[#C06E52] text-2xl">✦</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <div className="grid sm:grid-cols-2 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="p-8 rounded-2xl bg-white border border-[#E8E2D9] hover:border-[#788B76] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#EFEBE3] flex items-center justify-center text-[#C06E52] mb-5">
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="font-display text-2xl font-medium text-[#2C3329] mb-2">{f.title}</h3>
              <p className="text-[#5a6354] leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ivy coach section */}
      <section className="bg-[#2C3329] text-[#EFEBE3] py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#EFEBE3]/20 text-xs uppercase tracking-widest text-[#8FA084] mb-6">
            Meet Ivy, your AI coach
          </span>
          <h2 className="font-display text-4xl sm:text-5xl tracking-tight leading-[1.1]">
            Ask anything, day or night.
          </h2>
          <p className="mt-5 text-lg text-[#EFEBE3]/70 leading-relaxed max-w-2xl mx-auto">
            Warm, specific, non-judgmental guidance. Ivy is your financial coach — there to help you think through budgeting, saving, and investing decisions, big and small.
          </p>
          <div className="mt-10 p-6 rounded-2xl bg-[#EFEBE3]/5 border border-[#EFEBE3]/10 text-left max-w-xl mx-auto">
            <p className="text-[#EFEBE3]/90 leading-relaxed">
              "Hi, I'm Ivy — your financial coach. Ask me anything about budgeting, saving, or investing. What's on your mind today?"
            </p>
          </div>
        </div>
      </section>

      {/* Stories */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#E8E2D9] text-xs uppercase tracking-widest text-[#788B76] mb-4">
            Stories from women who did it
          </span>
          <h2 className="font-display text-4xl sm:text-5xl tracking-tight text-[#2C3329]">
            Stories that lit our path.
          </h2>
          <p className="mt-4 text-[#5a6354] max-w-xl mx-auto">
            Real journeys of paying off debt, buying homes, and getting to yes.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { title: 'How I saved my first $5k', author: '— Elena, wealthwise member' },
            { title: 'The negotiation script that works', author: '— Maya, wealthwise member' },
            { title: 'Why an emergency fund is a feminist act', author: '— Priya, wealthwise member' },
          ].map((s) => (
            <div key={s.title} className="p-7 rounded-2xl bg-white border border-[#E8E2D9]">
              <Quote className="w-7 h-7 text-[#C06E52] mb-4" />
              <h3 className="font-display text-xl font-medium text-[#2C3329] mb-3 leading-snug">{s.title}</h3>
              <p className="text-sm text-[#788B76]">{s.author}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-5 sm:px-8 pb-24 text-center">
        <h2 className="font-display text-4xl sm:text-5xl tracking-tight text-[#2C3329] leading-[1.1]">
          Join thousands of women taking quiet, confident steps with their money.
        </h2>
        <p className="mt-5 text-[#5a6354] max-w-xl mx-auto">
          It's free to start, and nothing scary happens.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button variant="primary" onClick={onStart}>
            <span className="flex items-center gap-2">Start free <ArrowRight className="w-4 h-4" /></span>
          </Button>
          <Button variant="outline" onClick={onSignIn}>Sign in</Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E8E2D9] py-10">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between flex-wrap gap-4">
          <span className="font-display text-lg font-semibold text-[#2C3329]">wealthwise</span>
          <p className="text-xs text-[#788B76] uppercase tracking-widest">A calmer relationship with money.</p>
        </div>
      </footer>
    </div>
  );
}
