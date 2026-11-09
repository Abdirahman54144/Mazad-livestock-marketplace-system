import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { Role } from '@/lib/supabase';
import { PawPrint, ShoppingBag, Shield, Eye, EyeOff, ArrowRight } from 'lucide-react';

const ANIMAL_BG = 'https://images.pexels.com/photos/6352767/pexels-photo-6352767.jpeg?auto=compress&cs=tinysrgb&w=1600';

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<Role>('buyer');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    if (mode === 'signin') {
      const { error } = await signIn(email, password);
      setBusy(false);
      if (error) setError(error);
      else navigate('/');
    } else {
      const { error } = await signUp(email, password, fullName, role, location, phone);
      setBusy(false);
      if (error) setError(error);
      else navigate('/');
    }
  }

  const roleOptions: { value: Role; label: string; icon: typeof ShoppingBag; desc: string }[] = [
    { value: 'buyer', label: 'Buyer', icon: ShoppingBag, desc: 'Browse and order livestock' },
    { value: 'seller', label: 'Seller', icon: PawPrint, desc: 'Post and manage listings' },
    { value: 'admin', label: 'Admin', icon: Shield, desc: 'Monitor the marketplace' },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-stone-50">
      {/* Left visual panel */}
      <div className="relative lg:w-1/2 min-h-[280px] lg:min-h-screen overflow-hidden">
        <img src={ANIMAL_BG} alt="Livestock" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-stone-900/80 via-stone-800/70 to-amber-900/60" />
        <div className="relative z-10 flex h-full flex-col justify-between p-8 lg:p-12">
          <div className="flex items-center gap-3 text-white">
            <div className="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <PawPrint className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Mazad</h1>
              <p className="text-xs text-amber-200/90">Livestock & Camel Marketplace</p>
            </div>
          </div>
          <div className="hidden lg:block text-white max-w-md">
            <h2 className="text-4xl font-bold leading-tight mb-4">
              The trusted marketplace for pastoralists and urban buyers.
            </h2>
            <p className="text-stone-200/90 text-lg leading-relaxed">
              Browse camels, goats, sheep, and cattle from sellers across the region. Place orders, manage listings, and track sales — all in one place.
            </p>
            <div className="flex gap-6 mt-8">
              <div>
                <p className="text-3xl font-bold text-amber-400">4</p>
                <p className="text-sm text-stone-300">Animal types</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-amber-400">3</p>
                <p className="text-sm text-stone-300">User roles</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-amber-400">24/7</p>
                <p className="text-sm text-stone-300">Marketplace</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-stone-900">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-stone-500 mt-2">
              {mode === 'signin'
                ? 'Sign in to manage your listings and orders.'
                : 'Join the marketplace as a buyer, seller, or admin.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Full name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition outline-none"
                    placeholder="Ahmed Al-Rashid"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">I am a...</label>
                  <div className="grid grid-cols-3 gap-2">
                    {roleOptions.map((opt) => {
                      const Icon = opt.icon;
                      const active = role === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setRole(opt.value)}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition text-center ${
                            active
                              ? 'border-amber-500 bg-amber-50 text-amber-900'
                              : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-xs font-semibold">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-stone-400 mt-1.5">
                    {roleOptions.find((r) => r.value === role)?.desc}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition outline-none"
                      placeholder="Dubai"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Phone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition outline-none"
                      placeholder="+971..."
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition outline-none"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3.5 rounded-xl transition disabled:opacity-50 group"
            >
              {busy ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
              {!busy && <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />}
            </button>
          </form>

          <p className="text-center text-sm text-stone-500 mt-6">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); }}
              className="font-semibold text-amber-600 hover:text-amber-700"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
