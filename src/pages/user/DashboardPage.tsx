import { 
  Recycle, 
  Coins, 
  Leaf, 
  QrCode, 
  Truck, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { StatCard } from '../../components/dashboard/StatCard';
import { ActionCard } from '../../components/dashboard/ActionCard';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

export function DashboardPage() {
  const { profile } = useAuth();

  const totalRecycled = profile?.totalKgRecycled || 0;
  const totalCredits = profile?.totalCredits || 0;
  const co2Saved = (totalRecycled * 1.2).toFixed(1);

  const stats = [
    { 
      title: 'Total Recycled', 
      value: totalRecycled.toString(), 
      unit: 'KG', 
      icon: Recycle,
      progress: (totalRecycled / 12) * 100,
      delay: 100 
    },
    { 
      title: 'Credits Earned', 
      value: totalCredits.toString(), 
      icon: Coins,
      progress: totalCredits > 0 ? (totalCredits % 1000) / 10 : 0,
      delay: 200 
    },
    { 
      title: 'CO2 Saved', 
      value: co2Saved, 
      unit: 'KG', 
      icon: Leaf,
      progress: parseFloat(co2Saved) > 0 ? (parseFloat(co2Saved) / 15) * 100 : 0,
      delay: 300 
    },
  ];

  const actions = [
    {
      title: 'Scan Waste',
      description: 'Instantly identify materials & calculate potential carbon credits.',
      icon: QrCode,
      path: ROUTES.USER.SCAN,
      gradient: 'linear-gradient(135deg, #1D9E75 0%, #004D40 100%)'
    },
    {
      title: 'Schedule Pickup',
      description: 'Dealing with bulky waste? Request a professional pickup at your door.',
      icon: Truck,
      path: ROUTES.USER.PICKUP,
      gradient: 'linear-gradient(135deg, #26A37A 0%, #1B5E20 100%)'
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Welcome Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-bold tracking-tight text-[var(--brand-primary)]">
            Welcome, {profile?.name?.split(' ')[0] || 'Explorer'}!
          </h2>
          <p className="text-lg text-[var(--on-surface-variant)] font-medium">
            You've recycled {totalRecycled}kg so far. Every bit counts!
          </p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-[rgb(var(--brand-secondary-rgb)/0.08)] text-[var(--brand-secondary)] text-sm font-bold glow-sage border border-[rgb(var(--brand-secondary-rgb)/0.1)] shadow-xl shadow-[rgb(var(--brand-secondary-rgb)/0.05)] bioluminescent-glow">
          <TrendingUp size={18} />
          Top 5% Eco-Warrior in {profile?.city || 'Kolkata'}
        </div>
      </section>

      {/* Impact Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </section>

      {/* Quick Action Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {actions.map((action, index) => (
          <ActionCard key={index} {...action} />
        ))}
      </section>

      {/* Goal & Recent Activity Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Goal Progress */}
        <Card className="lg:col-span-1 glass-card border-none bg-[rgb(var(--surface-container-rgb)/0.4)] overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
            <Leaf size={120} className="text-[var(--brand-secondary)] rotate-12" />
          </div>
          
          <CardHeader>
            <CardTitle className="text-xl font-bold text-[var(--brand-primary)]">Weekly Goal</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center pt-4">
            <div className="relative h-56 w-56 flex items-center justify-center">
              {/* Organic Circular Progress */}
              <svg className="absolute inset-0 h-full w-full -rotate-90">
                <circle
                  cx="112"
                  cy="112"
                  r="90"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-[rgb(var(--outline-rgb)/0.1)]"
                />
                <circle
                  cx="112"
                  cy="112"
                  r="90"
                  fill="transparent"
                  stroke="url(#gradient-sage)"
                  strokeWidth="12"
                  strokeDasharray={2 * Math.PI * 90}
                  strokeDashoffset={2 * Math.PI * 90 * (1 - Math.min(totalRecycled / 12, 1))}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="gradient-sage" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--brand-secondary)" />
                    <stop offset="100%" stopColor="var(--brand-primary)" />
                  </linearGradient>
                </defs>
              </svg>
              
              <div className="text-center z-10 p-8 rounded-full bg-white/40 backdrop-blur-md bioluminescent-glow">
                <span className="text-5xl font-bold text-[var(--brand-primary)]">{Math.min(Math.round((totalRecycled / 12) * 100), 100)}</span>
                <span className="text-2xl font-bold text-[var(--brand-secondary)]">%</span>
                <p className="text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-widest mt-2">{totalRecycled} / 12 KG</p>
              </div>
            </div>
            <p className="text-sm text-center text-[var(--on-surface-variant)] font-medium mt-10 px-6 leading-relaxed">
              {totalRecycled >= 12 ? (
                <span className="text-[var(--brand-secondary)] font-bold">Goal reached! Amazing job!</span>
              ) : (
                <>You are <span className="text-[var(--brand-secondary)] font-bold">{(12 - totalRecycled).toFixed(1)}kg</span> away from reaching your weekly goal. Keep it up!</>
              )}
            </p>
          </CardContent>
        </Card>

        {/* Recent Activity List */}
        <Card className="lg:col-span-2 glass-card border-none bg-[rgb(var(--surface-container-rgb)/0.4)]">
          <CardHeader className="flex flex-row items-center justify-between p-8">
            <CardTitle className="text-xl font-bold text-[var(--brand-primary)]">Recent Activity</CardTitle>
            <Button variant="ghost" className="text-[var(--brand-secondary)] text-sm font-bold group hover:bg-[rgb(var(--brand-secondary-rgb)/0.05)] rounded-full px-6">
              View All <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardHeader>
          <CardContent className="px-8 pb-8 space-y-6">
            {/* Using arbitrary type to bypass strict TS check temporarily until user profile is extended */}
            {(profile as any)?.recentActivity?.length > 0 ? (profile as any).recentActivity.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-6 rounded-[2rem] bg-white/40 border border-[rgb(var(--outline-rgb)/0.05)] hover:bg-white/60 hover:shadow-lg hover:scale-[1.01] transition-all duration-500 group">
                <div className="flex items-center gap-6">
                  <div className="h-14 w-14 rounded-2xl bg-[rgb(var(--brand-secondary-rgb)/0.08)] flex items-center justify-center text-[var(--brand-secondary)] bioluminescent-glow group-hover:scale-110 transition-transform duration-500">
                    <Recycle size={24} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-[var(--brand-primary)]">{item.weight} {item.type} Recycled</h4>
                    <p className="text-sm font-medium text-[var(--on-surface-variant)]">{item.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-[var(--brand-secondary)]">{item.credits}</span>
                  <p className="text-[10px] font-bold text-[var(--on-surface-variant)] uppercase tracking-widest">Credits</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-12">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] mb-4">
                  <Leaf size={32} />
                </div>
                <h3 className="text-lg font-bold text-[var(--brand-primary)] mb-2">No activity yet</h3>
                <p className="text-[var(--on-surface-variant)] text-sm max-w-[200px] mx-auto leading-relaxed">
                  Start your journey to a greener future by scanning your first piece of waste.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
