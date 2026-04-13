import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  color?: string;
  delay?: number;
  progress?: number;
}

export function StatCard({ title, value, unit, icon: Icon, delay = 0, progress = 0 }: StatCardProps) {
  return (
    <Card 
      className="glass-card glow-sage border-none bg-[rgb(var(--surface-container-rgb)/0.4)] transition-all duration-500 hover:translate-y-[-6px] hover:shadow-xl group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-8">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-[var(--on-surface-variant)] uppercase tracking-[0.2em]">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold tracking-tight text-[var(--brand-primary)] group-hover:scale-105 transition-transform duration-500">{value}</h3>
              {unit && <span className="text-sm font-semibold text-[var(--on-surface-variant)]">{unit}</span>}
            </div>
          </div>
          <div className="p-4 rounded-3xl bg-[rgb(var(--brand-secondary-rgb)/0.08)] text-[var(--brand-secondary)] bioluminescent-glow group-hover:scale-110 transition-transform duration-500">
            <Icon size={28} strokeWidth={1.5} />
          </div>
        </div>
        <div className="mt-8 h-1.5 w-full bg-[rgb(var(--outline-rgb)/0.1)] rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[var(--brand-secondary)] to-[var(--brand-primary)] rounded-full shadow-[0_0_12px_rgba(var(--brand-secondary-rgb)/0.3)] transition-all duration-1000" 
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
