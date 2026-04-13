import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  QrCode,
  History,
  Truck,
  Leaf,
  Settings,
  LogOut,
  Bell,
  User,
  Layers,
} from 'lucide-react';
import { auth } from '../../lib/firebase';
import { ROUTES } from '../../constants/routes';
import { SuccessBloom } from '../shared/SuccessBloom';

export function AppLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate(ROUTES.AUTH.LOGIN);
  };

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: ROUTES.USER.DASHBOARD },
    { icon: <QrCode size={20} />, label: 'Scan Waste', path: ROUTES.USER.SCAN },
    { icon: <History size={20} />, label: 'Waste Logs', path: ROUTES.USER.WASTE_LOG },
    { icon: <Truck size={20} />, label: 'Pickup Status', path: ROUTES.USER.PICKUP },
    { icon: <Leaf size={20} />, label: 'My Impact', path: ROUTES.USER.IMPACT },
    { icon: <Layers size={20} />, label: 'Process', path: ROUTES.USER.PROCESS },
  ];

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)] overflow-hidden">
      <SuccessBloom />
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[var(--surface-container)] border-r border-[rgb(var(--outline-rgb)/0.1)]">
        <div className="p-6 flex items-center gap-3">
          <img src="/logo2.png" alt="Vasudha Logo" className="w-10 h-10 object-contain" />
          <h1 className="text-2xl font-bold text-[#1D9E75] glow-text leading-none tracking-wide pt-1">VASUDHA</h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
              }
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[rgb(var(--outline-rgb)/0.1)] space-y-2">
          <NavLink to={ROUTES.USER.SETTINGS} className="sidebar-link">
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-left text-red-400 hover:bg-red-400/10 hover:text-red-400"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[var(--bg-primary)] h-screen overflow-y-auto">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-[rgb(var(--bg-primary-rgb)/0.8)] backdrop-blur-md border-b border-[rgb(var(--outline-rgb)/0.1)]">
          <div className="md:hidden flex items-center gap-2">
            <img src="/logo2.png" alt="Vasudha Logo" className="w-8 h-8 object-contain" />
            <h1 className="text-xl font-bold text-[#1D9E75] glow-text leading-none tracking-wide pt-1">VASUDHA</h1>
          </div>

          <div className="flex-1 hidden md:block">
            {/* Search or page info could go here */}
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-[var(--surface-container)] text-[var(--on-surface-variant)]">
              <Bell size={20} />
            </button>
            <div className="h-8 w-8 rounded-full bg-[rgb(var(--brand-primary-rgb)/0.2)] border border-[rgb(var(--brand-primary-rgb)/0.3)] flex items-center justify-center text-[var(--brand-primary)]">
              <User size={18} />
            </div>
          </div>
        </header>

        <div className="p-6 pb-24 md:pb-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[rgb(var(--surface-container-rgb)/0.9)] backdrop-blur-lg border-t border-[rgb(var(--outline-rgb)/0.1)] flex justify-around items-center p-3 px-6">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `p-2 rounded-xl transition-colors ${isActive ? 'text-[var(--brand-primary)] bg-[rgb(var(--brand-primary-rgb)/0.1)]' : 'text-[var(--on-surface-variant)]'}`
            }
          >
            {item.icon}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
