import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Order } from '@/lib/supabase';
import { MOCK_ORDERS } from '@/lib/mockData';
import { useAuth } from '@/context/AuthContext';
import { ClipboardList, MapPin, Calendar, ArrowRight } from 'lucide-react';

export default function BuyerOrdersPage() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);

  function cancelOrder(orderId: string) {
    if (!confirm('Cancel this order?')) return;
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } : o)));
  }

  if (!profile) {
    return <div className="max-w-3xl mx-auto px-4 py-20 text-center"><p className="text-stone-400">Loading...</p></div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-stone-900 mb-1">Orders</h1>
      <p className="text-stone-500 mb-8">Track all orders across the marketplace.</p>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-stone-100 mb-4">
            <ClipboardList className="w-8 h-8 text-stone-400" />
          </div>
          <h3 className="text-lg font-semibold text-stone-700">No orders yet</h3>
          <p className="text-stone-500 mt-1">Browse the marketplace and place your first order.</p>
          <Link to="/" className="mt-5 inline-flex items-center gap-2 text-amber-600 font-semibold hover:text-amber-700">
            Browse marketplace <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="bg-white rounded-2xl border border-stone-200 p-5 hover:shadow-md transition">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadge(o.status)}`}>{o.status}</span>
                    <span className="text-xs text-stone-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(o.created_at).toLocaleDateString()}</span>
                  </div>
                  {o.listing && (
                    <Link to={`/listing/${o.listing.id}`} className="text-lg font-semibold text-stone-900 hover:text-amber-700 transition">{o.listing.title}</Link>
                  )}
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-stone-500">
                    <span>Qty: <strong className="text-stone-700">{o.quantity}</strong></span>
                    {o.listing && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{o.listing.location}</span>}
                    <span className="text-stone-400">·</span>
                    <span className="text-stone-600">{o.listing?.type}</span>
                  </div>
                  {o.notes && <p className="text-sm text-stone-500 mt-2 italic">"{o.notes}"</p>}
                </div>
                <div className="flex sm:flex-col sm:items-end justify-between gap-3 sm:gap-2 sm:min-w-[140px]">
                  <div>
                    <p className="text-xs text-stone-400">Total</p>
                    <p className="text-2xl font-bold text-stone-900">{Number(o.total_price).toLocaleString()} <span className="text-sm font-normal text-stone-400">AED</span></p>
                  </div>
                  {(o.status === 'pending' || o.status === 'confirmed') && (
                    <button onClick={() => cancelOrder(o.id)} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition">Cancel</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function statusBadge(status: string) {
  switch (status) {
    case 'pending': return 'bg-amber-100 text-amber-700';
    case 'confirmed': return 'bg-blue-100 text-blue-700';
    case 'completed': return 'bg-green-100 text-green-700';
    case 'cancelled': return 'bg-red-100 text-red-700';
    default: return 'bg-stone-100 text-stone-600';
  }
}
