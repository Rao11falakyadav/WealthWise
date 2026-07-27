import { type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export function Spinner({ className = '' }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className}`} />;
}

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EFEBE3]">
      <Spinner className="w-7 h-7 text-[#788B76]" />
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-[#E8E2D9] ${className}`}>
      {children}
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  className = '',
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  type?: 'button' | 'submit';
  className?: string;
  disabled?: boolean;
}) {
  const variants = {
    primary: 'bg-[#2C3329] text-[#EFEBE3] hover:bg-[#3d463a]',
    secondary: 'bg-[#C06E52] text-white hover:bg-[#A55A41]',
    ghost: 'text-[#2C3329] hover:bg-[#E8E2D9]',
    outline: 'border border-[#788B76] text-[#2C3329] hover:bg-[#788B76] hover:text-white',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  step,
  min,
}: {
  label?: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  step?: string;
  min?: string;
}) {
  return (
    <label className="block">
      {label && <span className="block text-xs uppercase tracking-widest text-[#788B76] mb-2">{label}</span>}
      <input
        type={type}
        value={value}
        step={step}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-[#E8E2D9] bg-[#FAF8F4] text-[#2C3329] placeholder:text-[#B5AB9B] focus:outline-none focus:border-[#788B76] focus:ring-2 focus:ring-[#788B76]/15 transition-all"
      />
    </label>
  );
}

export function Select({
  label,
  value,
  onChange,
  options,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      {label && <span className="block text-xs uppercase tracking-widest text-[#788B76] mb-2">{label}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-[#E8E2D9] bg-[#FAF8F4] text-[#2C3329] focus:outline-none focus:border-[#788B76] focus:ring-2 focus:ring-[#788B76]/15 transition-all"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#2C3329]/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-[#FAF8F4] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in border border-[#E8E2D9]">
        <div className="flex items-center justify-between px-7 py-5 border-b border-[#E8E2D9] sticky top-0 bg-[#FAF8F4] rounded-t-2xl z-10">
          <h3 className="font-display text-xl font-semibold text-[#2C3329]">{title}</h3>
          <button
            onClick={onClose}
            className="text-[#788B76] hover:text-[#2C3329] transition-colors text-xl leading-none w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#E8E2D9]"
          >
            ×
          </button>
        </div>
        <div className="p-7">{children}</div>
      </div>
    </div>
  );
}

export function ProgressBar({ value, max, color = '#788B76' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="h-1.5 rounded-full bg-[#E8E2D9] overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

export function EmptyState({ icon, title, message, action }: { icon: ReactNode; title: string; message: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#E8E2D9] flex items-center justify-center text-[#788B76] mb-4">
        {icon}
      </div>
      <h3 className="font-display text-lg font-semibold text-[#2C3329] mb-1">{title}</h3>
      <p className="text-sm text-[#788B76] max-w-xs mb-5">{message}</p>
      {action}
    </div>
  );
}

export function Pill({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#E8E2D9] text-xs uppercase tracking-widest text-[#788B76] ${className}`}>
      {children}
    </span>
  );
}
