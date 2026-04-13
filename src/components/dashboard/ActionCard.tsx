import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';

interface ActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  gradient?: string;
}

export function ActionCard({ 
  title, 
  description, 
  icon: Icon, 
  path, 
  gradient = 'linear-gradient(135deg, var(--brand-primary) 0%, #26a37a 100%)' 
}: ActionCardProps) {
  const navigate = useNavigate();

  return (
    <Card 
      onClick={() => navigate(path)}
      className="group relative overflow-hidden glass-card border-none cursor-pointer transition-all duration-700 hover:scale-[1.03] active:scale-[0.97] hover:shadow-2xl hover:shadow-[rgb(var(--brand-secondary-rgb)/0.1)]"
    >
      {/* Background Subtle Gradient */}
      <div 
        className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-700" 
        style={{ background: gradient }}
      />
      
      <CardContent className="p-10 flex flex-col h-full relative z-10">
        <div className="mb-8 h-16 w-16 rounded-[2rem] bg-[rgb(var(--brand-primary-rgb)/0.05)] flex items-center justify-center text-[var(--brand-primary)] bioluminescent-glow transition-all duration-700 group-hover:scale-110 group-hover:-rotate-3">
          <Icon size={36} strokeWidth={1.5} />
        </div>
        
        <div className="mt-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold tracking-tight text-[var(--brand-primary)] group-hover:translate-x-1 transition-transform duration-500">{title}</h3>
            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-[rgb(var(--brand-primary-rgb)/0.03)] group-hover:bg-[var(--brand-primary)] group-hover:text-white transition-all duration-500">
              <ArrowUpRight size={20} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>
          <p className="text-[var(--on-surface-variant)] leading-relaxed mt-3 line-clamp-2 font-medium">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
