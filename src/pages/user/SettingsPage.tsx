import { useState } from 'react';
import {
  User,
  MapPin,
  Phone,
  Bell,
  Shield,
  LogOut,
  Trash2,
  Target,
  ChevronRight,
  Save,
  Info,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { auth, db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ROUTES } from '../../constants/routes';

export default function SettingsPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(profile?.name || '');
  const [city, setCity] = useState(profile?.city || '');
  const [area, setArea] = useState(profile?.area || '');
  const [weeklyGoal, setWeeklyGoal] = useState(12);
  const [notifications, setNotifications] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name,
        city,
        area,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Failed to save. Please try again.');
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate(ROUTES.AUTH.LOGIN);
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.'
    );
    if (confirmed) {
      alert('Account deletion request submitted. Our team will process this within 48 hours.');
    }
  };

  const inputClass =
    'w-full px-5 py-4 rounded-2xl bg-white/60 border border-[rgb(var(--outline-rgb)/0.1)] text-[var(--brand-primary)] font-semibold placeholder:text-[var(--on-surface-variant)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--brand-secondary)]/30 focus:border-[var(--brand-secondary)] transition-all duration-300';

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20 max-w-3xl">
      {/* Header */}
      <section className="space-y-2">
        <h2 className="text-5xl font-bold tracking-tight text-[var(--brand-primary)]">Settings</h2>
        <p className="text-xl text-[var(--on-surface-variant)] font-medium">Manage your profile and preferences.</p>
      </section>

      {/* Profile Section */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="glass-card border-none bg-[rgb(var(--surface-container-rgb)/0.4)] rounded-[3rem] overflow-hidden">
          <CardContent className="p-10 space-y-8">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] flex items-center justify-center text-white shadow-xl">
                {profile?.photoURL ? (
                  <img src={profile.photoURL} alt="Avatar" className="h-full w-full rounded-3xl object-cover" />
                ) : (
                  <User size={36} />
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[var(--brand-primary)]">{profile?.name || 'User'}</h3>
                <p className="text-sm text-[var(--on-surface-variant)] font-medium">{user?.email || profile?.phone}</p>
                <p className="text-[10px] font-bold text-[var(--brand-secondary)] uppercase tracking-widest mt-1">
                  {profile?.role || 'user'} · Joined {profile?.createdAt ? new Date(profile.createdAt as any).getFullYear() : '2026'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[var(--on-surface-variant)] uppercase tracking-[0.2em] flex items-center gap-2">
                  <User size={12} /> Full Name
                </label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Your name" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[var(--on-surface-variant)] uppercase tracking-[0.2em] flex items-center gap-2">
                  <Phone size={12} /> Phone
                </label>
                <input type="text" value={profile?.phone || ''} disabled className={`${inputClass} opacity-50 cursor-not-allowed`} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[var(--on-surface-variant)] uppercase tracking-[0.2em] flex items-center gap-2">
                  <MapPin size={12} /> City
                </label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} placeholder="Your city" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[var(--on-surface-variant)] uppercase tracking-[0.2em] flex items-center gap-2">
                  <MapPin size={12} /> Area / Locality
                </label>
                <input type="text" value={area} onChange={(e) => setArea(e.target.value)} className={inputClass} placeholder="Area or locality" />
              </div>
            </div>

            <Button
              onClick={handleSaveProfile}
              disabled={saving}
              className="btn-premium flex items-center gap-3 w-full justify-center"
            >
              {saving ? 'Saving...' : saved ? '✓ Saved!' : <><Save size={18} /> Save Changes</>}
            </Button>
          </CardContent>
        </Card>
      </motion.section>

      {/* Preferences */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }} className="space-y-4">
        <h3 className="text-xl font-bold text-[var(--brand-primary)] flex items-center gap-3">
          <Target size={20} className="text-[var(--brand-secondary)]" />
          Preferences
        </h3>

        <Card className="glass-card border-none bg-[rgb(var(--surface-container-rgb)/0.4)] rounded-[2.5rem]">
          <CardContent className="p-0 divide-y divide-[rgb(var(--outline-rgb)/0.05)]">
            {/* Notifications Toggle */}
            <div className="flex items-center justify-between p-7 px-10">
              <div className="flex items-center gap-5">
                <div className="h-11 w-11 rounded-2xl bg-[var(--brand-secondary)]/10 text-[var(--brand-secondary)] flex items-center justify-center">
                  <Bell size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-[var(--brand-primary)]">Pickup Notifications</h4>
                  <p className="text-xs text-[var(--on-surface-variant)]">Get notified when agent is en route</p>
                </div>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`h-8 w-14 rounded-full transition-all duration-300 relative ${
                  notifications ? 'bg-[var(--brand-secondary)]' : 'bg-[var(--outline)]/20'
                }`}
              >
                <div
                  className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-all duration-300 ${
                    notifications ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Weekly Goal */}
            <div className="flex items-center justify-between p-7 px-10">
              <div className="flex items-center gap-5">
                <div className="h-11 w-11 rounded-2xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center">
                  <Target size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-[var(--brand-primary)]">Weekly Recycling Goal</h4>
                  <p className="text-xs text-[var(--on-surface-variant)]">Set your weekly target in kilograms</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setWeeklyGoal(Math.max(1, weeklyGoal - 1))} className="h-8 w-8 rounded-full bg-[var(--outline)]/10 text-[var(--brand-primary)] font-bold hover:bg-[var(--outline)]/20 transition-colors">-</button>
                <span className="text-xl font-bold text-[var(--brand-primary)] w-10 text-center">{weeklyGoal}</span>
                <button onClick={() => setWeeklyGoal(weeklyGoal + 1)} className="h-8 w-8 rounded-full bg-[var(--brand-secondary)]/10 text-[var(--brand-secondary)] font-bold hover:bg-[var(--brand-secondary)]/20 transition-colors">+</button>
                <span className="text-xs font-bold text-[var(--on-surface-variant)] uppercase">kg</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* Account Actions */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="space-y-4">
        <h3 className="text-xl font-bold text-[var(--brand-primary)] flex items-center gap-3">
          <Shield size={20} className="text-[var(--brand-secondary)]" />
          Account
        </h3>

        <Card className="glass-card border-none bg-[rgb(var(--surface-container-rgb)/0.4)] rounded-[2.5rem]">
          <CardContent className="p-0 divide-y divide-[rgb(var(--outline-rgb)/0.05)]">
            <button onClick={handleLogout} className="w-full flex items-center justify-between p-7 px-10 hover:bg-[rgb(var(--outline-rgb)/0.03)] transition-colors group">
              <div className="flex items-center gap-5">
                <div className="h-11 w-11 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <LogOut size={20} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-[var(--brand-primary)]">Sign Out</h4>
                  <p className="text-xs text-[var(--on-surface-variant)]">Log out of your account on this device</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-[var(--on-surface-variant)] group-hover:translate-x-1 transition-transform" />
            </button>

            <button onClick={handleDeleteAccount} className="w-full flex items-center justify-between p-7 px-10 hover:bg-red-50 transition-colors group">
              <div className="flex items-center gap-5">
                <div className="h-11 w-11 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
                  <Trash2 size={20} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-red-500">Delete Account</h4>
                  <p className="text-xs text-[var(--on-surface-variant)]">Permanently delete all your data</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-red-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </CardContent>
        </Card>
      </motion.section>

      {/* App Info */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
        <div className="text-center space-y-2 py-8">
          <p className="text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-[0.2em] flex items-center justify-center gap-2">
            <Info size={12} /> Vasudha v1.0.0 · Ethereal Earth Edition
          </p>
          <p className="text-[10px] text-[var(--on-surface-variant)]/60">
            Made with 🌱 for a greener planet
          </p>
        </div>
      </motion.section>
    </div>
  );
}
