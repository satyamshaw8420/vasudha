import { useState, useEffect } from 'react';
import { 
  Recycle, 
  Coins, 
  Leaf, 
  History, 
  ArrowUpRight,
  MapPin,
  Calendar,
  Search,
  Truck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import { StatCard } from '../../components/dashboard/StatCard';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { format } from 'date-fns';

export default function WasteLogsPage() {
  const { user, profile } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'wasteLogs'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const logsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLogs(logsData);
      setLoading(false);
    }, (error) => {
      console.error("Error listening to logs:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredLogs = filter === 'All' 
    ? logs 
    : logs.filter(log => log.materialType === filter);

  const totalCredits = logs.reduce((acc, log) => acc + (log.creditsAwarded || 0), 0);
  const totalCO2 = logs.reduce((acc, log) => acc + (log.co2SavedKg || 0), 0);
  const totalWeight = logs.length * 0.5; // Estimated 0.5kg per log for now

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-5xl font-bold tracking-tight text-[var(--brand-primary)]">Waste Logs</h2>
          <p className="text-xl text-[var(--on-surface-variant)] font-medium max-w-lg">
            Your detailed history of molecular recovery and environmental impact.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)]" size={20} />
            <input 
              type="text" 
              placeholder="Search logs..." 
              className="pl-12 pr-6 py-4 bg-[rgb(var(--surface-container-rgb)/0.4)] border-none rounded-full glass-card focus:ring-2 focus:ring-[var(--brand-secondary)] transition-all min-w-[280px]"
            />
          </div>
        </div>
      </section>

      {/* Impact Overview Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard title="Total Weight" value={totalWeight.toFixed(1)} unit="KG" icon={Recycle} delay={100} />
        <StatCard title="Total Credits" value={totalCredits} icon={Coins} delay={200} />
        <StatCard title="Total CO2 Offset" value={totalCO2.toFixed(1)} unit="KG" icon={Leaf} delay={300} />
      </section>

      {/* Filter and Content Area */}
      <section className="space-y-8">
        <div className="flex flex-wrap items-center gap-3">
          {['All', 'Plastic', 'Paper', 'Glass', 'Metal'].map((f) => (
            <Button
              key={f}
              onClick={() => setFilter(f)}
              variant={filter === f ? 'default' : 'ghost'}
              className={`rounded-full px-8 py-6 h-auto text-sm font-bold transition-all duration-500 shadow-md ${
                filter === f 
                ? 'bg-[var(--brand-primary)] text-white scale-105' 
                : 'bg-[rgb(var(--surface-container-rgb)/0.4)] text-[var(--on-surface-variant)] hover:bg-[rgb(var(--brand-secondary-rgb)/0.05)]'
              }`}
            >
              {f}
            </Button>
          ))}
        </div>

        <div className="relative">
          {loading ? (
            <div className="flex items-center justify-center py-20 min-h-[400px]">
              <div className="relative w-24 h-24 rounded-full glass-panel glass-border flex items-center justify-center">
                <div className="absolute inset-0 bg-[var(--brand-primary)] blur-2xl opacity-20 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 border-t-2 border-[var(--brand-primary)] rounded-full animate-spin"></div>
                <Leaf className="w-10 h-10 text-[var(--brand-primary)]" />
              </div>
            </div>
          ) : filteredLogs.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              <AnimatePresence mode='popLayout'>
                {filteredLogs.map((log, index) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="glass-card border-none bg-[rgb(var(--surface-container-rgb)/0.4)] overflow-hidden group hover:bg-white/40 hover:shadow-2xl transition-all duration-700">
                      <CardContent className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="flex items-center gap-8">
                          {/* Log Icon with Bioluminescent Glow */}
                          <div className="h-16 w-16 rounded-[2rem] bg-[rgb(var(--brand-secondary-rgb)/0.08)] flex items-center justify-center text-[var(--brand-secondary)] bioluminescent-glow group-hover:scale-110 transition-transform duration-700">
                             <Recycle size={32} strokeWidth={1.5} />
                          </div>

                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="text-2xl font-bold text-[var(--brand-primary)]">{log.materialType}</h4>
                              <span className="px-3 py-1 rounded-full bg-[rgb(var(--brand-secondary-rgb)/0.1)] text-[var(--brand-secondary)] text-[10px] font-bold uppercase tracking-widest leading-none">
                                {log.confidence || '98% Match'}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-[var(--on-surface-variant)] font-medium italic text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar size={16} />
                                {log.createdAt?.toDate ? format(log.createdAt.toDate(), 'PPP p') : 'Processing...'}
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin size={16} />
                                {profile?.city || 'Vashudha Node'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Impact Details and Actions */}
                        <div className="flex flex-wrap items-center gap-8 md:gap-12">
                          <div className="text-right">
                             <p className="text-[10px] font-bold text-[var(--on-surface-variant)] uppercase tracking-[0.2em] mb-1">Impact Reward</p>
                             <div className="flex items-baseline gap-1 justify-end">
                               <span className="text-3xl font-bold text-[var(--brand-secondary)] group-hover:scale-110 transition-transform duration-500 inline-block">+{log.creditsAwarded || 100}</span>
                               <span className="text-sm font-bold text-[var(--on-surface-variant)] uppercase tracking-tighter">Credits</span>
                             </div>
                          </div>

                          <div className="h-12 w-[1px] bg-[rgb(var(--outline-rgb)/0.1)] hidden md:block" />

                          <div className="text-right hidden sm:block">
                             <p className="text-[10px] font-bold text-[var(--on-surface-variant)] uppercase tracking-[0.2em] mb-1">Molecular Recovery</p>
                             <div className="flex items-baseline gap-1 justify-end text-[var(--brand-primary)]">
                               <span className="text-2xl font-bold">{log.co2SavedKg || '0.5'}</span>
                               <span className="text-sm font-bold opacity-60">kg CO2</span>
                             </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Button variant="ghost" className="h-14 w-14 rounded-full bg-[rgb(var(--brand-primary-rgb)/0.03)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white transition-all duration-500 shadow-md">
                              <ArrowUpRight size={24} />
                            </Button>
                            <Button 
                              onClick={() => {}} // Navigate to pickup or details
                              className="h-14 px-8 rounded-full bg-[var(--brand-primary)] text-white font-bold group flex items-center gap-3 transition-all duration-500 hover:scale-105 active:scale-95 shadow-xl shadow-[rgb(var(--brand-primary-rgb)/0.2)]"
                            >
                              <Truck size={20} /> Request Pickup
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-32 rounded-[3rem] bg-[rgb(var(--surface-container-rgb)/0.2)] border-2 border-dashed border-[rgb(var(--outline-rgb)/0.1)] flex flex-col items-center gap-6">
               <div className="h-24 w-24 rounded-full bg-[rgb(var(--brand-secondary-rgb)/0.05)] flex items-center justify-center text-[var(--brand-secondary)]">
                  <History size={48} strokeWidth={1} />
               </div>
               <div>
                  <h3 className="text-2xl font-bold text-[var(--brand-primary)]">No Records Found</h3>
                  <p className="text-[var(--on-surface-variant)] font-medium max-w-xs mx-auto mt-2">
                    Start scanning your waste to begin your environmental transformation journey.
                  </p>
               </div>
               <Button className="mt-4 btn-premium">Start Scannng Now</Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
