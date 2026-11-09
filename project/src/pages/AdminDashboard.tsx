import { useMemo, useState } from 'react';
import type { Profile, Listing, Order } from '@/lib/supabase';
import { MOCK_PROFILES, MOCK_LISTINGS, MOCK_ORDERS } from '@/lib/mockData';
import { useAuth } from '@/context/AuthContext';
import { Users, Package, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [profiles] = useState<Profile[]>(MOCK_PROFILES);
  const [listings] = useState<Listing[]>(MOCK_LISTINGS);
  const [orders] = useState<Order[]>(MOCK_ORDERS);
  const [tab, setTab] = useState<'overview' | 'users' | 'listings' | 'orders'>('overview');

  const metrics = useMemo(() => {
    const completedOrders = orders.filter((o) => o.status === 'completed');
    const totalSales = completedOrders.reduce((sum, o) => sum + Number(o.total_price), 0);
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const buyers = profiles.filter((p) => p.role === 'buyer').length;
    const sellers = profiles.filter((p) => p.role === 'seller').length;
    const admins = profiles.filter((p) => p.role === 'admin').length;

    const salesByType: Record<string, number> = {};
    completedOrders.forEach((o) => {
      const type = o.listing?.type || 'Unknown';
      salesByType[type] = (salesByType[type] || 0) + Number(o.total_price);
    });

    const dailyMap: Record<string, number> = {};
    const last7 = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });
    last7.forEach((d) => { dailyMap[d.toISOString().slice(0, 10)] = 0; });
    completedOrders.forEach((o) => {
      const day = o.created_at.slice(0, 10);
      if (day in dailyMap) dailyMap[day] += Number(o.total_price);
    });
    const dailyLabels = last7.map((d) => d.toLocaleDateString('en', { weekday: 'short' }));
    const dailyValues = last7.map((d) => dailyMap[d.toISOString().slice(0, 10)] || 0);

    const monthlyMap: Record<string, number> = {};
    const last6 = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      d.setDate(1);
      return d;
    });
    last6.forEach((d) => { monthlyMap[d.toISOString().slice(0, 7)] = 0; });
    completedOrders.forEach((o) => {
      const month = o.created_at.slice(0, 7);
      if (month in monthlyMap) monthlyMap[month] += Number(o.total_price);
    });
    const monthlyLabels = last6.map((d) => d.toLocaleDateString('en', { month: 'short' }));
    const monthlyValues = last6.map((d) => monthlyMap[d.toISOString().slice(0, 7)] || 0);

    return { totalSales, pendingOrders, buyers, sellers, admins, salesByType, dailyLabels, dailyValues, monthlyLabels, monthlyValues };
  }, [profiles, orders]);

  const maxDaily = Math.max(...metrics.dailyValues, 1);
  const maxMonthly = Math.max(...metrics.monthlyValues, 1);
  const maxTypeSales = Math.max(...Object.values(metrics.salesByType), 1);

  if (!profile) {
    return <div className="max-w-3xl mx-auto px-4 py-20 text-center"><p className="text-stone-400">Loading...</p></div>;
  }

  const tabs = [
    { key: 'overview' as const, label: 'Overview', icon: TrendingUp },
    { key: 'users' as const, label: 'Users', icon: Users },
    { key: 'listings' as const, label: 'Listings', icon: Package },
    { key: 'orders' as const, label: 'Orders', icon: ShoppingCart },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-stone-900 mb-1">Admin Dashboard</h1>
      <p className="text-stone-500 mb-8">Monitor marketplace activity, users, and sales metrics.</p>

      <div className="flex gap-1 mb-6 bg-white rounded-xl border border-stone-200 p-1 overflow-x-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${tab === t.key ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'}`}>
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'overview' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Sales', value: `${metrics.totalSales.toLocaleString()} AED`, icon: DollarSign, color: 'text-green-700 bg-green-100' },
              { label: 'Total Orders', value: orders.length, icon: ShoppingCart, color: 'text-blue-700 bg-blue-100' },
              { label: 'Total Listings', value: listings.length, icon: Package, color: 'text-stone-700 bg-stone-100' },
              { label: 'Total Users', value: profiles.length, icon: Users, color: 'text-amber-700 bg-amber-100' },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="bg-white rounded-2xl border border-stone-200 p-5">
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${s.color}`}><Icon className="w-5 h-5" /></div>
                  <p className="text-2xl font-bold text-stone-900">{s.value}</p>
                  <p className="text-sm text-stone-500">{s.label}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-stone-200 p-6">
              <h3 className="font-semibold text-stone-900 mb-1">Daily Sales (Last 7 Days)</h3>
              <p className="text-sm text-stone-500 mb-5">Revenue from completed orders</p>
              <div className="flex items-end justify-between gap-2 h-40">
                {metrics.dailyValues.map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-amber-100 rounded-t-lg relative group" style={{ height: `${(val / maxDaily) * 100}%`, minHeight: val > 0 ? '4px' : '2px' }}>
                      <div className="absolute inset-0 bg-amber-500 rounded-t-lg opacity-0 group-hover:opacity-100 transition" />
                    </div>
                    <span className="text-xs text-stone-400">{metrics.dailyLabels[i]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-6">
              <h3 className="font-semibold text-stone-900 mb-1">Monthly Sales (Last 6 Months)</h3>
              <p className="text-sm text-stone-500 mb-5">Revenue trend over time</p>
              <div className="flex items-end justify-between gap-2 h-40">
                {metrics.monthlyValues.map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-stone-200 rounded-t-lg relative group" style={{ height: `${(val / maxMonthly) * 100}%`, minHeight: val > 0 ? '4px' : '2px' }}>
                      <div className="absolute inset-0 bg-stone-800 rounded-t-lg opacity-0 group-hover:opacity-100 transition" />
                    </div>
                    <span className="text-xs text-stone-400">{metrics.monthlyLabels[i]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-6 lg:col-span-2">
              <h3 className="font-semibold text-stone-900 mb-1">Sales by Animal Type</h3>
              <p className="text-sm text-stone-500 mb-5">Revenue distribution across livestock categories</p>
              {Object.keys(metrics.salesByType).length === 0 ? (
                <p className="text-stone-400 text-sm text-center py-6">No completed sales yet.</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(metrics.salesByType).map(([type, amount]) => (
                    <div key={type}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium text-stone-700">{type}</span>
                        <span className="text-stone-500">{amount.toLocaleString()} AED</span>
                      </div>
                      <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-amber-700 rounded-full transition-all duration-500" style={{ width: `${(amount / maxTypeSales) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Buyers', value: metrics.buyers, color: 'text-blue-700' },
              { label: 'Sellers', value: metrics.sellers, color: 'text-green-700' },
              { label: 'Admins', value: metrics.admins, color: 'text-amber-700' },
            ].map((u) => (
              <div key={u.label} className="bg-white rounded-2xl border border-stone-200 p-5 text-center">
                <p className={`text-3xl font-bold ${u.color}`}>{u.value}</p>
                <p className="text-sm text-stone-500 mt-1">{u.label}</p>
              </div>
            ))}
          </div>
        </div>
      ) : tab === 'users' ? (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase px-5 py-3">Name</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase px-5 py-3">Email</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase px-5 py-3">Role</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase px-5 py-3">Location</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase px-5 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 font-semibold text-sm">{p.full_name?.charAt(0).toUpperCase() || 'U'}</div>
                        <span className="font-medium text-stone-800">{p.full_name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-stone-600">{p.email}</td>
                    <td className="px-5 py-3"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleBadge(p.role)}`}>{p.role}</span></td>
                    <td className="px-5 py-3 text-sm text-stone-600">{p.location || '—'}</td>
                    <td className="px-5 py-3 text-sm text-stone-500">{new Date(p.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : tab === 'listings' ? (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase px-5 py-3">Title</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase px-5 py-3">Type</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase px-5 py-3">Price</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase px-5 py-3">Location</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase px-5 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase px-5 py-3">Posted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {listings.map((l) => (
                  <tr key={l.id} className="hover:bg-stone-50/50">
                    <td className="px-5 py-3 font-medium text-stone-800">{l.title}</td>
                    <td className="px-5 py-3 text-sm text-stone-600">{l.type}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-stone-800">{Number(l.price).toLocaleString()} AED</td>
                    <td className="px-5 py-3 text-sm text-stone-600">{l.location}</td>
                    <td className="px-5 py-3"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${l.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-stone-200 text-stone-600'}`}>{l.status}</span></td>
                    <td className="px-5 py-3 text-sm text-stone-500">{new Date(l.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase px-5 py-3">Listing</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase px-5 py-3">Buyer</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase px-5 py-3">Qty</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase px-5 py-3">Total</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase px-5 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-stone-50/50">
                    <td className="px-5 py-3 font-medium text-stone-800">{o.listing?.title || '—'}</td>
                    <td className="px-5 py-3 text-sm text-stone-600">{o.buyer?.email || '—'}</td>
                    <td className="px-5 py-3 text-sm text-stone-600">{o.quantity}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-stone-800">{Number(o.total_price).toLocaleString()} AED</td>
                    <td className="px-5 py-3"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${orderBadge(o.status)}`}>{o.status}</span></td>
                    <td className="px-5 py-3 text-sm text-stone-500">{new Date(o.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function roleBadge(role: string) {
  switch (role) {
    case 'admin': return 'bg-amber-100 text-amber-700';
    case 'seller': return 'bg-green-100 text-green-700';
    case 'buyer': return 'bg-blue-100 text-blue-700';
    default: return 'bg-stone-100 text-stone-600';
  }
}

function orderBadge(status: string) {
  switch (status) {
    case 'pending': return 'bg-amber-100 text-amber-700';
    case 'confirmed': return 'bg-blue-100 text-blue-700';
    case 'completed': return 'bg-green-100 text-green-700';
    case 'cancelled': return 'bg-red-100 text-red-700';
    default: return 'bg-stone-100 text-stone-600';
  }
}
