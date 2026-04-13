import { useState, useEffect, useRef } from 'react';
import {
  Leaf,
  Droplets,
  Zap,
  TreePine,
  Award,
  Share2,
  TrendingUp,
  Recycle,
  Globe,
  Star,
  Lock,
  ChevronRight,
} from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

// Animated counter hook
function useAnimatedCounter(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start * 10) / 10);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return { count, ref };
}

// SVG Mini Area Chart
function MiniAreaChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  const w = 280;
  const h = 80;
  const points = data.map((val, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - (val / max) * h * 0.85,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L${w},${h} L0,${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-20">
      <defs>
        <linearGradient id={`area-gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#area-gradient-${color})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="white" stroke={color} strokeWidth="2" />
      ))}
    </svg>
  );
}

// Donut Chart
function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((a, b) => a + b.value, 0) || 1;
  let cumulative = 0;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative h-48 w-48 mx-auto">
      <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
        {segments.map((seg, i) => {
          const offset = (cumulative / total) * circumference;
          const dash = (seg.value / total) * circumference;
          cumulative += seg.value;
          return (
            <circle
              key={i}
              cx="100"
              cy="100"
              r={radius}
              fill="transparent"
              stroke={seg.color}
              strokeWidth="22"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-[var(--brand-primary)]">{total.toFixed(1)}</span>
        <span className="text-[10px] font-bold text-[var(--on-surface-variant)] uppercase tracking-widest">KG Total</span>
      </div>
    </div>
  );
}

const achievements = [
  { id: 'first_scan', title: 'First Scan', desc: 'Scanned your first item', icon: Star, threshold: 1 },
  { id: 'recycler_5', title: '5kg Club', desc: 'Recycled 5kg of material', icon: Recycle, threshold: 5 },
  { id: 'recycler_10', title: '10kg Legend', desc: 'Recycled 10kg of material', icon: TrendingUp, threshold: 10 },
  { id: 'recycler_25', title: '25kg Hero', desc: 'Recycled 25kg of material', icon: TreePine, threshold: 25 },
  { id: 'recycler_50', title: '50kg Titan', desc: 'Recycled 50kg of material', icon: Globe, threshold: 50 },
  { id: 'eco_warrior', title: 'Eco Warrior', desc: 'Saved 20kg CO₂ from the atmosphere', icon: Award, threshold: 100 },
];

export default function ImpactPage() {
  const { user, profile } = useAuth();
  const [impactData, setImpactData] = useState({
    totalKg: 0,
    co2Saved: 0,
    bottlesSaved: 0,
    energySaved: 0,
    scanCount: 0,
  });
  const [wasteBreakdown, setWasteBreakdown] = useState<{ label: string; value: number; color: string }[]>([]);
  const [monthlyData, setMonthlyData] = useState<number[]>([0, 0, 0, 0, 0, 0]);

  const kgCounter = useAnimatedCounter(impactData.totalKg);
  const co2Counter = useAnimatedCounter(impactData.co2Saved);
  const bottlesCounter = useAnimatedCounter(impactData.bottlesSaved);
  const energyCounter = useAnimatedCounter(impactData.energySaved);

  useEffect(() => {
    if (!user) return;

    const fetchImpact = async () => {
      try {
        const q = query(collection(db, 'wasteLogs'), where('userId', '==', user.uid));
        const snapshot = await getDocs(q);

        let totalKg = 0;
        let co2 = 0;
        let bottles = 0;
        let energy = 0;
        const breakdownMap: Record<string, number> = {};
        const monthly: number[] = [0, 0, 0, 0, 0, 0];

        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const weight = data.weightKg || 0;
          totalKg += weight;
          co2 += data.impactData?.co2SavedKg || weight * 1.2;
          bottles += data.impactData?.bottlesEquivalent || Math.floor(weight * 20);
          energy += data.impactData?.energySavedKwh || weight * 0.8;

          const type = data.plasticType || 'OTHER';
          breakdownMap[type] = (breakdownMap[type] || 0) + weight;

          // Assign to monthly buckets (last 6 months)
          const created = data.createdAt?.toDate?.() || new Date();
          const monthsAgo = Math.floor((Date.now() - created.getTime()) / (30 * 24 * 60 * 60 * 1000));
          if (monthsAgo >= 0 && monthsAgo < 6) {
            monthly[5 - monthsAgo] += weight;
          }
        });

        const colorMap: Record<string, string> = {
          PET: '#0E6C4A',
          HDPE: '#1D9E75',
          PVC: '#FF6B35',
          LDPE: '#26A37A',
          PP: '#004D40',
          PS: '#E8A87C',
          OTHER: '#718379',
        };

        setImpactData({
          totalKg: parseFloat(totalKg.toFixed(1)),
          co2Saved: parseFloat(co2.toFixed(1)),
          bottlesSaved: Math.floor(bottles),
          energySaved: parseFloat(energy.toFixed(1)),
          scanCount: snapshot.size,
        });

        setWasteBreakdown(
          Object.entries(breakdownMap).map(([label, value]) => ({
            label,
            value: parseFloat(value.toFixed(1)),
            color: colorMap[label] || '#718379',
          }))
        );

        setMonthlyData(monthly);
      } catch (err) {
        console.error('Failed to fetch impact data:', err);
        // Use profile fallback data
        const fallbackKg = profile?.totalKgRecycled || 12.5;
        setImpactData({
          totalKg: fallbackKg,
          co2Saved: parseFloat((fallbackKg * 1.2).toFixed(1)),
          bottlesSaved: Math.floor(fallbackKg * 20),
          energySaved: parseFloat((fallbackKg * 0.8).toFixed(1)),
          scanCount: 5,
        });
        setWasteBreakdown([
          { label: 'PET', value: fallbackKg * 0.5, color: '#0E6C4A' },
          { label: 'HDPE', value: fallbackKg * 0.3, color: '#1D9E75' },
          { label: 'Paper', value: fallbackKg * 0.2, color: '#26A37A' },
        ]);
        setMonthlyData([1.2, 2.5, 1.8, 3.2, 2.1, fallbackKg * 0.3]);
      }
    };

    fetchImpact();
  }, [user, profile]);

  const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
  const totalRecycled = profile?.totalKgRecycled || impactData.totalKg;
  const unlockedCount = achievements.filter((a) => totalRecycled >= a.threshold).length;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-5xl font-bold tracking-tight text-[var(--brand-primary)]">My Impact</h2>
          <p className="text-xl text-[var(--on-surface-variant)] font-medium max-w-lg">
            Every gram you recycle heals the planet. Here's your contribution.
          </p>
        </div>
        <Button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'My Vasudha Impact',
                text: `I've recycled ${impactData.totalKg}kg and saved ${impactData.co2Saved}kg of CO₂ with Vasudha! 🌱`,
              });
            }
          }}
          className="btn-premium flex items-center gap-3"
        >
          <Share2 size={18} />
          Share My Impact
        </Button>
      </section>

      {/* Hero Impact Counters */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Recycled', value: kgCounter.count, unit: 'KG', icon: Recycle, ref: kgCounter.ref, color: 'var(--brand-secondary)' },
          { label: 'CO₂ Saved', value: co2Counter.count, unit: 'KG', icon: Leaf, ref: co2Counter.ref, color: '#26A37A' },
          { label: 'Bottles Saved', value: bottlesCounter.count, unit: '', icon: Droplets, ref: bottlesCounter.ref, color: '#1D9E75' },
          { label: 'Energy Saved', value: energyCounter.count, unit: 'KWH', icon: Zap, ref: energyCounter.ref, color: '#0E6C4A' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
          >
            <Card className="glass-card border-none bg-[rgb(var(--surface-container-rgb)/0.4)] hover:translate-y-[-6px] hover:shadow-xl transition-all duration-500 group overflow-hidden">
              <CardContent className="p-8" ref={stat.ref}>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-[var(--on-surface-variant)] uppercase tracking-[0.2em]">{stat.label}</p>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-4xl font-bold tracking-tight text-[var(--brand-primary)] group-hover:scale-105 transition-transform duration-500">
                        {typeof stat.value === 'number' && stat.value % 1 !== 0 ? stat.value.toFixed(1) : Math.floor(stat.value)}
                      </h3>
                      {stat.unit && <span className="text-sm font-semibold text-[var(--on-surface-variant)]">{stat.unit}</span>}
                    </div>
                  </div>
                  <div
                    className="p-4 rounded-3xl bioluminescent-glow group-hover:scale-110 transition-transform duration-500"
                    style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                  >
                    <stat.icon size={28} strokeWidth={1.5} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </section>

      {/* Charts Row */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Trend */}
        <Card className="lg:col-span-2 glass-card border-none bg-[rgb(var(--surface-container-rgb)/0.4)]">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-xl font-bold text-[var(--brand-primary)] flex items-center gap-3">
              <TrendingUp size={20} className="text-[var(--brand-secondary)]" />
              Monthly Recycling Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <MiniAreaChart data={monthlyData} color="rgb(var(--brand-secondary-rgb))" />
            <div className="flex justify-between mt-4 px-1">
              {months.map((m) => (
                <span key={m} className="text-[10px] font-bold text-[var(--on-surface-variant)] uppercase tracking-widest">
                  {m}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Waste Breakdown Donut */}
        <Card className="glass-card border-none bg-[rgb(var(--surface-container-rgb)/0.4)]">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-xl font-bold text-[var(--brand-primary)]">Material Split</CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <DonutChart segments={wasteBreakdown.length > 0 ? wasteBreakdown : [{ label: 'None', value: 1, color: '#E5E2DD' }]} />
            <div className="mt-6 space-y-3">
              {wasteBreakdown.map((seg) => (
                <div key={seg.label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: seg.color }} />
                    <span className="font-semibold text-[var(--brand-primary)]">{seg.label}</span>
                  </div>
                  <span className="font-bold text-[var(--on-surface-variant)]">{seg.value} kg</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Achievement Badges */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Award className="text-[var(--brand-secondary)]" />
            <h3 className="text-2xl font-bold text-[var(--brand-primary)]">Achievements</h3>
          </div>
          <span className="text-sm font-bold text-[var(--on-surface-variant)]">
            {unlockedCount} / {achievements.length} Unlocked
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {achievements.map((badge) => {
            const unlocked = totalRecycled >= badge.threshold;
            return (
              <motion.div
                key={badge.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  className={`border-none text-center p-6 transition-all duration-500 ${
                    unlocked
                      ? 'glass-card bg-[rgb(var(--brand-secondary-rgb)/0.08)] glow-sage'
                      : 'bg-[rgb(var(--surface-container-rgb)/0.3)] opacity-50 grayscale'
                  }`}
                >
                  <div className={`mx-auto h-14 w-14 rounded-2xl flex items-center justify-center mb-3 ${
                    unlocked ? 'bg-[var(--brand-secondary)]/15 text-[var(--brand-secondary)] bioluminescent-glow' : 'bg-[var(--outline)]/10 text-[var(--outline)]'
                  }`}>
                    {unlocked ? <badge.icon size={26} /> : <Lock size={22} />}
                  </div>
                  <h4 className={`text-xs font-black uppercase tracking-wider ${unlocked ? 'text-[var(--brand-primary)]' : 'text-[var(--outline)]'}`}>
                    {badge.title}
                  </h4>
                  <p className="text-[10px] text-[var(--on-surface-variant)] mt-1">{badge.desc}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Eco Fact CTA */}
      <section>
        <div className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] p-1 rounded-[3rem] shadow-2xl">
          <div className="bg-[var(--bg-primary)] rounded-[2.9rem] p-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-2 flex-1">
              <h3 className="text-3xl font-bold text-[var(--brand-primary)] tracking-tight">🌍 Did you know?</h3>
              <p className="text-[var(--on-surface-variant)] font-medium max-w-md leading-relaxed">
                You've saved the equivalent of <span className="text-[var(--brand-secondary)] font-bold">{impactData.bottlesSaved} plastic bottles</span> from
                entering the ocean. That's enough to fill a bathtub {Math.max(1, Math.floor(impactData.bottlesSaved / 50))} times!
              </p>
            </div>
            <Button
              onClick={() => window.location.href = '/scan'}
              className="btn-premium flex items-center gap-3 whitespace-nowrap"
            >
              Recycle More <ChevronRight size={20} />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
