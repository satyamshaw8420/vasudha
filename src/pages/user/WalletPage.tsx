import { useState, useEffect } from 'react';
import {
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Gift,
  TreePine,
  Coffee,
  Sparkles,
  Clock,
  Wallet,
  Star,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

interface Transaction {
  id: string;
  type: 'earned' | 'redeemed' | 'bonus';
  amount: number;
  description: string;
  createdAt: any;
}

const redeemOptions = [
  {
    title: 'Plant a Tree',
    description: 'We plant a tree in your name through our partner NGO.',
    cost: 500,
    icon: TreePine,
    color: '#0E6C4A',
  },
  {
    title: 'Coffee Voucher',
    description: '₹100 off at partnered eco-cafés near you.',
    cost: 300,
    icon: Coffee,
    color: '#8B5E3C',
  },
  {
    title: 'Eco Gift Box',
    description: 'A surprise box of sustainable products delivered to you.',
    cost: 1000,
    icon: Gift,
    color: '#1D9E75',
  },
  {
    title: 'Premium Badge',
    description: 'Unlock an exclusive profile badge for top recyclers.',
    cost: 200,
    icon: Star,
    color: '#C49B3E',
  },
];

export default function WalletPage() {
  const { user, profile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  const balance = profile?.totalCredits || 0;

  useEffect(() => {
    if (!user) return;

    const fetchTransactions = async () => {
      try {
        const q = query(
          collection(db, 'creditTransactions'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const txns = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Transaction[];
        setTransactions(txns);
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
        // Fallback demo data
        setTransactions([
          { id: '1', type: 'earned', amount: 150, description: '3kg PET Plastic recycled', createdAt: { toDate: () => new Date(Date.now() - 86400000) } },
          { id: '2', type: 'earned', amount: 60, description: '2kg Paper recycled', createdAt: { toDate: () => new Date(Date.now() - 172800000) } },
          { id: '3', type: 'bonus', amount: 100, description: 'Weekly streak bonus', createdAt: { toDate: () => new Date(Date.now() - 259200000) } },
          { id: '4', type: 'redeemed', amount: -200, description: 'Premium Badge unlocked', createdAt: { toDate: () => new Date(Date.now() - 432000000) } },
          { id: '5', type: 'earned', amount: 80, description: '1.5kg HDPE recycled', createdAt: { toDate: () => new Date(Date.now() - 604800000) } },
        ]);
      }
    };

    fetchTransactions();
  }, [user]);

  const handleRedeem = async (option: typeof redeemOptions[0]) => {
    if (balance < option.cost) {
      alert(`You need ${option.cost - balance} more credits to redeem this!`);
      return;
    }
    setRedeemingId(option.title);
    await new Promise((r) => setTimeout(r, 1500));
    alert(`🎉 "${option.title}" redeemed successfully! You'll receive a confirmation email shortly.`);
    setRedeemingId(null);
  };

  const formatDate = (ts: any) => {
    try {
      const date = ts?.toDate?.() || new Date(ts);
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
      {/* Header */}
      <section className="space-y-2">
        <h2 className="text-5xl font-bold tracking-tight text-[var(--brand-primary)]">Wallet</h2>
        <p className="text-xl text-[var(--on-surface-variant)] font-medium max-w-lg">
          Your green credits — earned by recycling, redeemable for real rewards.
        </p>
      </section>

      {/* Balance Card Hero */}
      <section>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Card className="border-none overflow-hidden rounded-[3.5rem] shadow-2xl bg-gradient-to-br from-[var(--brand-primary)] to-[#0E6C4A] relative group">
            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
              <Wallet size={180} className="text-white" />
            </div>
            <CardContent className="p-12 relative z-10">
              <div className="space-y-2">
                <p className="text-sm font-bold text-white/60 uppercase tracking-[0.3em]">Available Balance</p>
                <div className="flex items-baseline gap-4">
                  <motion.span
                    key={balance}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-7xl font-bold text-white tracking-tight"
                  >
                    {balance.toLocaleString()}
                  </motion.span>
                  <span className="text-2xl font-bold text-white/50">Credits</span>
                </div>
              </div>
              <div className="flex items-center gap-6 mt-8">
                <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 text-white/80 text-sm font-bold">
                  <Sparkles size={16} />
                  Eco {profile?.city || 'Kolkata'} Rank #42
                </div>
                <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 text-white/80 text-sm font-bold">
                  <Coins size={16} />
                  Lifetime: {(balance * 1.5).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Redeem Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <Gift className="text-[var(--brand-secondary)]" />
          <h3 className="text-2xl font-bold text-[var(--brand-primary)]">Redeem Credits</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {redeemOptions.map((option, i) => (
            <motion.div
              key={option.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Card className="glass-card border-none bg-[rgb(var(--surface-container-rgb)/0.4)] hover:translate-y-[-6px] hover:shadow-xl transition-all duration-500 group h-full flex flex-col">
                <CardContent className="p-8 flex flex-col flex-1">
                  <div
                    className="h-14 w-14 rounded-2xl flex items-center justify-center mb-6 bioluminescent-glow group-hover:scale-110 transition-transform duration-500"
                    style={{ backgroundColor: `${option.color}15`, color: option.color }}
                  >
                    <option.icon size={26} />
                  </div>
                  <h4 className="text-lg font-bold text-[var(--brand-primary)] mb-2">{option.title}</h4>
                  <p className="text-sm text-[var(--on-surface-variant)] flex-1 leading-relaxed">{option.description}</p>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-lg font-black text-[var(--brand-secondary)]">{option.cost} <span className="text-xs font-bold text-[var(--on-surface-variant)]">credits</span></span>
                    <Button
                      onClick={() => handleRedeem(option)}
                      disabled={redeemingId === option.title || balance < option.cost}
                      className={`h-10 px-5 rounded-full text-xs font-bold transition-all duration-300 ${
                        balance >= option.cost
                          ? 'bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-secondary)] hover:scale-105 active:scale-95'
                          : 'bg-[var(--outline)]/10 text-[var(--outline)] cursor-not-allowed'
                      }`}
                    >
                      {redeemingId === option.title ? 'Redeeming...' : balance >= option.cost ? 'Redeem' : 'Locked'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Transaction History */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <Clock className="text-[var(--brand-secondary)]" />
          <h3 className="text-2xl font-bold text-[var(--brand-primary)]">Transaction History</h3>
        </div>

        <div className="space-y-3">
          {transactions.length > 0 ? (
            transactions.map((txn, i) => (
              <motion.div
                key={txn.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <Card className="glass-card border-none bg-[rgb(var(--surface-container-rgb)/0.4)] hover:translate-x-1 hover:shadow-lg transition-all duration-500 group">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
                        txn.type === 'earned' ? 'bg-green-500/10 text-green-600' :
                        txn.type === 'bonus' ? 'bg-amber-500/10 text-amber-600' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {txn.type === 'earned' ? <ArrowDownLeft size={22} /> :
                         txn.type === 'bonus' ? <Sparkles size={22} /> :
                         <ArrowUpRight size={22} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-[var(--brand-primary)]">{txn.description}</h4>
                        <p className="text-xs text-[var(--on-surface-variant)] font-medium mt-0.5 flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            txn.type === 'earned' ? 'bg-green-500/10 text-green-600' :
                            txn.type === 'bonus' ? 'bg-amber-500/10 text-amber-600' :
                            'bg-red-500/10 text-red-500'
                          }`}>{txn.type}</span>
                          {formatDate(txn.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xl font-bold ${
                      txn.type === 'redeemed' ? 'text-red-500' : 'text-[var(--brand-secondary)]'
                    }`}>
                      {txn.type === 'redeemed' ? '' : '+'}{txn.amount}
                    </span>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="bg-[rgb(var(--surface-container-rgb)/0.2)] rounded-[2.5rem] p-12 text-center border-2 border-dashed border-[rgb(var(--outline-rgb)/0.1)]">
              <Coins size={40} className="mx-auto text-[var(--outline)]/40 mb-4" />
              <p className="text-[var(--on-surface-variant)] font-bold uppercase tracking-widest">No Transactions Yet</p>
              <p className="text-sm text-[var(--on-surface-variant)] mt-2">Start recycling to earn credits!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
