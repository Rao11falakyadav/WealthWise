import { useState, useRef, useEffect } from 'react';
import { Button, Spinner } from '@/components/ui';
import { MessageCircle, Send, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'ivy';
  text: string;
}

const SUGGESTIONS = [
  'How do I start an emergency fund with $50/month?',
  'Explain index funds like I\'m brand new.',
  'Should I invest before paying off my student loan?',
  'I want to negotiate a raise. What do I say?',
];

const GREETING = "Hi, I'm Ivy — your financial coach. Ask me anything about budgeting, saving, or investing. What's on your mind today?";

function generateResponse(question: string): string {
  const q = question.toLowerCase();

  if (q.includes('emergency fund') || q.includes('emergency') || (q.includes('50') && q.includes('month'))) {
    return "Starting an emergency fund with $50/month is a beautiful first step. Here's how to make it work:\n\n1. Open a separate high-yield savings account — keep it separate so it's not too easy to spend.\n2. Automate the $50 transfer right after payday, before you're tempted to spend it.\n3. Your first milestone is $500 — enough to cover most minor emergencies.\n4. Then aim for one month of expenses, then three to six months.\n\nAn emergency fund is a feminist act because it gives you options — the option to leave, to wait, to choose. Even $50 a month becomes $600 in a year, and that's real freedom.\n\nSave first, spend what remains — do not spend first and save what remains.";
  }

  if (q.includes('index fund') || q.includes('index')) {
    return "Think of an index fund as buying a tiny slice of hundreds of companies at once. Instead of betting on one stock, you own a small piece of the whole market — like the S&P 500, which is 500 large U.S. companies.\n\nWhy it works:\n• Diversification lowers your risk — if one company stumbles, the others keep you steady.\n• Low fees — index funds cost a fraction of what active funds charge.\n• Studies show that over 15+ years, low-cost index funds outperform about 90% of professional stock pickers.\n\nYou can start with as little as $20 through a brokerage. The key is consistency, not the amount. Investing is patience wearing lipstick — let time do the heavy lifting.";
  }

  if (q.includes('student loan') || q.includes('debt') && q.includes('invest')) {
    return "This is one of the most common questions, and the answer depends on your interest rates.\n\nThe rule of thumb: if your student loan interest is below 5%, it often makes sense to invest the extra money — because the stock market historically returns about 7-10% annually, so you come out ahead over time.\n\nIf your loan interest is above 6-7%, paying it down is effectively a guaranteed return that's hard to beat in the market.\n\nEither way, always make the minimum payments. And if your employer offers a 401(k) match, capture that first — it's free money. The best approach is often a hybrid: invest a little, pay extra on the loan a little. The most important thing is to start, not to optimize perfectly.";
  }

  if (q.includes('negotiate') || q.includes('raise') || q.includes('salary')) {
    return "Negotiation is not confrontation — it's a conversation about fair value. Here's a script that works:\n\n1. Research first. Know the market rate for your role and city (Glassdoor, Levels.fyi, PayScale).\n2. Prepare three numbers: your ideal, your target, and your walk-away.\n3. Open with evidence, not a demand:\n\n\"I've been reflecting on the value I bring to the team — particularly the [specific project] that resulted in [specific outcome]. Based on my research and the scope of my role, I'd like to discuss adjusting my compensation to [your target number].\"\n\n4. Then stop talking. Silence is your friend.\n5. If the answer is no, ask: \"What would need to be true for a yes in six months?\" — then work toward that.\n\nYou don't get what you deserve. You get what you negotiate.";
  }

  if (q.includes('budget') || q.includes('50/30/20')) {
    return "The 50/30/20 rule is a simple, kind framework:\n\n• 50% for needs — rent, groceries, utilities, minimum debt payments\n• 30% for wants — dining, travel, hobbies\n• 20% for savings and extra debt payments\n\nIf your needs exceed 50% (which is common in expensive cities), don't panic. Temporarily trim wants and focus on growing income. The rule is a guideline, not a law.\n\nThe goal is not restriction — it's intention. A budget is a love letter to future you. Track your spending for one month to see where your money actually goes, then set limits that reflect your real priorities.";
  }

  if (q.includes('retire') || q.includes('retirement') || q.includes('401') || q.includes('ira') || q.includes('roth')) {
    return "Retirement is not a single number you must reach — it's a rate. The percentage you save consistently matters more than the balance at any moment.\n\nHere's the priority order most experts recommend:\n\n1. Capture your employer's 401(k) match first — it's free money.\n2. Build a small emergency fund ($500-$1,000).\n3. Max out a Roth IRA ($7,000/year in 2024) — it grows tax-free forever.\n4. Increase your 401(k) contributions toward 15% of gross income.\n\nA Roth IRA uses after-tax dollars, so all the growth is tax-free when you withdraw in retirement. The earlier you start, the more compounding works in your favor. Money is not the goal — freedom is.";
  }

  if (q.includes('save') || q.includes('saving')) {
    return "Saving is not about willpower — it's about systems. Here's what works:\n\n1. Automate it. Set up a transfer to savings the day after payday. If you don't see it, you won't spend it.\n2. Start small. Even $25/month builds the habit. Consistency beats amount.\n3. Give your savings a destination. A goal called 'Emergency Fund' is stronger than a goal called 'Savings.'\n4. Keep it separate from checking — a high-yield savings account earns more interest and adds friction to spending.\n\nSave first, spend what remains — do not spend first and save what remains. The best time to start was ten years ago. The second best is Tuesday.";
  }

  if (q.includes('invest') || q.includes('stock') || q.includes('portfolio')) {
    return "Investing is how money grows faster than inflation. Here's the calm, steady approach:\n\n1. Start with a broad, low-cost index fund (like one tracking the S&P 500 or total market). You buy hundreds of companies at once.\n2. Invest consistently — the same amount each month, regardless of what the news says.\n3. Don't try to time the market. Time IN the market beats timing the market.\n4. The earlier you start, the more compounding works in your favor — returns earn returns.\n\n$200/month at a 7% average annual return becomes roughly $240,000 in 30 years — and only $72,000 of that was your money. The rest is compounding. Investing is patience wearing lipstick.";
  }

  if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('thank')) {
    return "I'm so glad you're here. Whatever's on your mind about money — budgeting, saving, investing, debt, retirement, negotiation — I'm here to help you think it through. No judgment, just warm, specific guidance. What would you like to explore?";
  }

  return "That's a great question. While I'm a guide within wealthwise (not a full AI assistant), here's what I can tell you:\n\nThe most powerful financial moves are usually simple: spend less than you earn, automate your savings, invest consistently in low-cost index funds, and start now rather than later. Compound interest is quietly ruthless in your favor when you give it time.\n\nFor specific guidance on budgeting, saving, investing, debt, retirement, or salary negotiation, just ask me about any of those topics — I have detailed, practical advice ready. What would you like to dig into?";
}

export function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([{ role: 'ivy', text: GREETING }]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  function send(text: string) {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: 'user', text }]);
    setInput('');
    setThinking(true);
    setTimeout(() => {
      const response = generateResponse(text);
      setMessages((m) => [...m, { role: 'ivy', text: response }]);
      setThinking(false);
    }, 700 + Math.random() * 500);
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-full bg-[#2C3329] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#8FA084]" />
          </div>
          <div>
            <h1 className="font-display text-3xl tracking-tight text-[#2C3329]">Meet Ivy</h1>
            <p className="text-xs uppercase tracking-widest text-[#788B76]">Your AI financial coach</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-[#E8E2D9] flex flex-col h-[60vh] min-h-[400px]">
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'ivy' && (
                <div className="w-8 h-8 rounded-full bg-[#E8F0E5] flex items-center justify-center shrink-0 mr-3 mt-1">
                  <Sparkles className="w-4 h-4 text-[#788B76]" />
                </div>
              )}
              <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                m.role === 'user'
                  ? 'bg-[#2C3329] text-[#EFEBE3] rounded-br-md'
                  : 'bg-[#F5F2EC] text-[#2C3329] rounded-bl-md border border-[#E8E2D9]'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-[#E8F0E5] flex items-center justify-center shrink-0 mr-3 mt-1">
                <Sparkles className="w-4 h-4 text-[#788B76]" />
              </div>
              <div className="bg-[#F5F2EC] border border-[#E8E2D9] px-4 py-3 rounded-2xl rounded-bl-md">
                <Spinner className="w-4 h-4 text-[#788B76]" />
              </div>
            </div>
          )}
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="px-6 pb-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#F5F2EC] border border-[#E8E2D9] text-[#5a6354] hover:border-[#788B76] hover:text-[#2C3329] transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="border-t border-[#E8E2D9] p-4 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send(input)}
            placeholder="Ask Ivy anything about money…"
            className="flex-1 px-4 py-3 rounded-full border border-[#E8E2D9] bg-[#FAF8F4] text-[#2C3329] placeholder:text-[#B5AB9B] focus:outline-none focus:border-[#788B76] focus:ring-2 focus:ring-[#788B76]/15 transition-all"
          />
          <Button onClick={() => send(input)} disabled={!input.trim() || thinking} className="px-4">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <p className="text-xs text-[#788B76] text-center">
        Ivy offers general financial guidance, not personalized financial advice.
      </p>
    </div>
  );
}
