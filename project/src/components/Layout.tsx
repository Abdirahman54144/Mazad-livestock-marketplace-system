import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PawPrint, Menu, X, LayoutDashboard, Shield, Store, ClipboardList } from 'lucide-react';

export default function Layout() {
  const { profile } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'Marketplace', to: '/', icon: Store },
    { label: 'Orders', to: '/orders', icon: ClipboardList },
    { label: 'Seller', to: '/seller', icon: LayoutDashboard },
    { label: 'Admin', to: '/admin', icon: Shield },
  ];

  function isActive(path: string) {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition">
                <PawPrint className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-stone-900 leading-none">Mazad</h1>
                <p className="text-[11px] text-stone-400 leading-none mt-0.5">Livestock Marketplace</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                      isActive(item.to) ? 'bg-amber-50 text-amber-700' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2.5 pl-3 border-l border-stone-200">
                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-semibold text-sm">
                  {profile?.full_name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-stone-800 max-w-[140px] truncate">{profile?.full_name || 'Admin'}</p>
                  <p className="text-xs text-amber-600 capitalize">{profile?.role}</p>
                </div>
              </div>
            </div>

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100">
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-stone-200 bg-white px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive(item.to) ? 'bg-amber-50 text-amber-700' : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-stone-500 text-sm">
            <PawPrint className="w-4 h-4 text-amber-600" />
            <span className="font-semibold text-stone-700">Mazad</span>
            <span>· Livestock & Camel Marketplace</span>
          </div>
          <p className="text-xs text-stone-400">Built for pastoralists and urban buyers.</p>
        </div>
      </footer>
    </div>
  );
}
