import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui';
import { ArrowLeft, Eye, EyeOff, Check } from 'lucide-react';

const CURRENCIES = [
  { value: 'USD', label: 'USD $' },
  { value: 'EUR', label: 'EUR €' },
  { value: 'GBP', label: 'GBP £' },
  { value: 'INR', label: 'INR ₹' },
  { value: 'CAD', label: 'CAD $' },
  { value: 'AUD', label: 'AUD $' },
];

const TESTIMONIALS = [
  { quote: 'I paid off $14k of debt using this. The coach kept me grounded.', name: 'Priya M.', detail: 'Paid off debt in 18 months' },
  { quote: 'My first emergency fund. I never thought I could save this much.', name: 'Elena R.', detail: 'Saved $6,000 in one year' },
  { quote: 'I finally negotiated my raise. Ivy walked me through every word.', name: 'Aditi K.', detail: 'Got a 22% raise' },
];

export function AuthScreen({
  mode,
  onModeChange,
  onBack,
}: {
  mode: 'signin' | 'signup';
  onModeChange: (m: 'signin' | 'signup') => void;
  onBack: () => void;
}) {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const testimonial = TESTIMONIALS[Math.floor(Date.now() / 10000) % TESTIMONIALS.length];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const result =
      mode === 'signin'
        ? await signIn(email, password)
        : await signUp(email, password, fullName);
    setBusy(false);
    if (result.error) setError(result.error);
  }

  return (
    <div className="min-h-screen flex bg-[#EFEBE3]">

      {/* ── Left panel ── */}
      <div className="flex-1 flex flex-col min-h-screen px-8 sm:px-12 py-8">

        {/* Logo / back */}
        <button
          onClick={onBack}
          className="group flex items-center gap-2.5 w-fit"
        >
          <div className="w-8 h-8 rounded-full bg-[#2C3329] flex items-center justify-center text-[#EFEBE3] text-xs font-display font-semibold">w</div>
          <span className="font-display text-lg font-semibold text-[#2C3329] group-hover:text-[#C06E52] transition-colors">wealthwise</span>
          <ArrowLeft className="w-3.5 h-3.5 text-[#B5AB9B] opacity-0 group-hover:opacity-100 -ml-1 transition-all group-hover:-translate-x-0.5" />
        </button>

        {/* Form area */}
        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full py-12">

          {/* Headline */}
          <div className="mb-8">
            <h1 className="font-display text-[2.6rem] sm:text-5xl font-semibold tracking-tight text-[#2C3329] leading-[1.05] mb-3">
              {mode === 'signin' ? (
                <>Welcome<br /><span className="italic text-[#C06E52]">back.</span></>
              ) : (
                <>Begin,<br /><span className="italic text-[#C06E52]">gently.</span></>
              )}
            </h1>
            <p className="text-sm text-[#788B76] leading-relaxed">
              {mode === 'signin'
                ? 'Sign in to your account. Your money is waiting.'
                : 'A free account. Your money, private and yours.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <FloatingInput
                label="Your name"
                type="text"
                value={fullName}
                onChange={setFullName}
                placeholder="Falak Yadav"
              />
            )}

            <FloatingInput
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@email.com"
            />

            <div className="relative">
              <FloatingInput
                label={mode === 'signup' ? 'Password (min 6)' : 'Password'}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B5AB9B] hover:text-[#788B76] transition-colors p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-[#788B76] mb-1.5">Currency</label>
                <div className="relative">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-[#E8E2D9] bg-white text-[#2C3329] focus:outline-none focus:border-[#C06E52] focus:ring-2 focus:ring-[#C06E52]/12 transition-all text-sm appearance-none cursor-pointer hover:border-[#C8BFB4]"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#788B76" strokeWidth="2.5">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="text-sm text-[#C06E52] bg-[#FDF5F2] px-4 py-3 rounded-xl border border-[#C06E52]/25 flex items-start gap-2.5">
                <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-[#C06E52]/15 flex items-center justify-center text-[#C06E52] text-[10px] font-bold">!</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3.5 rounded-xl bg-[#C06E52] text-white font-semibold text-sm hover:bg-[#A55A41] active:scale-[0.99] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed mt-2 shadow-[0_2px_12px_rgba(192,110,82,0.25)] hover:shadow-[0_4px_20px_rgba(192,110,82,0.35)]"
            >
              {busy ? (
                <Spinner className="w-4 h-4 mx-auto" />
              ) : mode === 'signin' ? (
                'Sign in'
              ) : (
                'Create my account'
              )}
            </button>
          </form>

          {/* Switch mode */}
          <p className="text-center text-sm text-[#788B76] mt-6">
            {mode === 'signin' ? "Don't have an account? " : 'Already have one? '}
            <button
              onClick={() => { onModeChange(mode === 'signin' ? 'signup' : 'signin'); setError(null); }}
              className="text-[#C06E52] font-semibold hover:underline underline-offset-2"
            >
              {mode === 'signin' ? 'Join free' : 'Sign in'}
            </button>
          </p>

          {/* Trust badges */}
          {mode === 'signup' && (
            <div className="mt-8 pt-6 border-t border-[#E8E2D9] grid grid-cols-3 gap-2 text-center">
              {[
                { label: 'Free forever', sub: 'core features' },
                { label: 'Private', sub: 'encrypted data' },
                { label: 'No spam', sub: 'ever, promise' },
              ].map((b) => (
                <div key={b.label} className="flex flex-col items-center gap-1">
                  <div className="w-6 h-6 rounded-full bg-[#EBF4EB] flex items-center justify-center">
                    <Check className="w-3 h-3 text-[#788B76]" strokeWidth={2.5} />
                  </div>
                  <p className="text-xs font-semibold text-[#2C3329]">{b.label}</p>
                  <p className="text-[10px] text-[#788B76]">{b.sub}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="hidden md:flex flex-1 relative overflow-hidden flex-col">
        {/* Photo */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=85')`,
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#2C3329]/80 via-[#2C3329]/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#EFEBE3]/15 to-transparent" />

        {/* Quote card */}
        <div className="absolute bottom-10 left-8 right-8 z-10">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <p className="font-display text-xl text-white leading-snug mb-4 italic">
              "{testimonial.quote}"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#C06E52]/70 flex items-center justify-center text-white text-sm font-semibold font-display">
                {testimonial.name[0]}
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{testimonial.name}</p>
                <p className="text-white/60 text-xs">{testimonial.detail}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top badge */}
        <div className="absolute top-8 right-8 z-10">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2">
            <div className="w-2 h-2 rounded-full bg-[#8FA084] animate-pulse" />
            <span className="text-white text-xs font-medium">Trusted by 10,000+ women</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Custom floating-label input ── */
function FloatingInput({
  label,
  type,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-[#788B76] mb-1.5">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3.5 rounded-xl border border-[#E8E2D9] bg-white text-[#2C3329] placeholder:text-[#C8BFB4] focus:outline-none focus:border-[#C06E52] focus:ring-2 focus:ring-[#C06E52]/12 transition-all text-sm hover:border-[#C8BFB4]"
      />
    </label>
  );
}
