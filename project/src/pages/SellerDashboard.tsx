import { useState } from 'react';
import type { Listing, AnimalType, Order } from '@/lib/supabase';
import { FALLBACK_IMAGES, MOCK_LISTINGS, MOCK_ORDERS } from '@/lib/mockData';
import { useAuth } from '@/context/AuthContext';
import { Plus, Pencil, Trash2, X, MapPin, TrendingUp, Package, DollarSign, Clock } from 'lucide-react';

const TYPES: AnimalType[] = ['Camel', 'Goat', 'Sheep', 'Cattle'];

type Draft = {
  id?: string;
  title: string;
  type: AnimalType;
  price: string;
  location: string;
  description: string;
  image_url: string;
};

const EMPTY_DRAFT: Draft = { title: '', type: 'Camel', price: '', location: '', description: '', image_url: '' };

export default function SellerDashboard() {
  const { profile } = useAuth();
  const [listings, setListings] = useState<Listing[]>(MOCK_LISTINGS);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [showModal, setShowModal] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [error, setError] = useState<string | null>(null);

  function openCreate() { setDraft(EMPTY_DRAFT); setError(null); setShowModal(true); }

  function openEdit(l: Listing) {
    setDraft({ id: l.id, title: l.title, type: l.type, price: String(l.price), location: l.location, description: l.description, image_url: l.image_url || '' });
    setError(null);
    setShowModal(true);
  }

  function handleSave() {
    setError(null);
    if (!draft.title.trim() || !draft.price || !draft.location.trim()) { setError('Title, price, and location are required.'); return; }
    const payload: Listing = {
      id: draft.id || `l${Date.now()}`,
      seller_id: profile?.id || 'a0000000-0000-0000-0000-000000000001',
      title: draft.title.trim(),
      type: draft.type,
      price: parseFloat(draft.price),
      location: draft.location.trim(),
      description: draft.description.trim(),
      image_url: draft.image_url.trim() || FALLBACK_IMAGES[draft.type],
      status: 'available',
      created_at: new Date().toISOString(),
    };
    if (draft.id) {
      setListings((prev) => prev.map((l) => (l.id === draft.id ? { ...l, ...payload, id: draft.id } : l)));
    } else {
      setListings((prev) => [payload, ...prev]);
    }
    setShowModal(false);
  }

  function handleDelete(listingId: string) {
    if (!confirm('Delete this listing? This cannot be undone.')) return;
    setListings((prev) => prev.filter((l) => l.id !== listingId));
  }

  function toggleStatus(l: Listing) {
    const newStatus = l.status === 'available' ? 'sold' : 'available';
    setListings((prev) => prev.map((x) => (x.id === l.id ? { ...x, status: newStatus } : x)));
  }

  function updateOrderStatus(orderId: string, status: Order['status']) {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  }

  const totalRevenue = orders.filter((o) => o.status === 'completed').reduce((sum, o) => sum + Number(o.total_price), 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const availableCount = listings.filter((l) => l.status === 'available').length;

  if (!profile) {
    return <div className="max-w-3xl mx-auto px-4 py-20 text-center"><p className="text-stone-400">Loading...</p></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Seller Dashboard</h1>
          <p className="text-stone-500 mt-1">Manage your livestock listings and incoming orders.</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold px-5 py-3 rounded-xl transition">
          <Plus className="w-5 h-5" />
          New Listing
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Listings', value: listings.length, icon: Package, color: 'text-stone-700 bg-stone-100' },
          { label: 'Available', value: availableCount, icon: TrendingUp, color: 'text-green-700 bg-green-100' },
          { label: 'Pending Orders', value: pendingOrders, icon: Clock, color: 'text-amber-700 bg-amber-100' },
          { label: 'Revenue (completed)', value: `${totalRevenue.toLocaleString()} AED`, icon: DollarSign, color: 'text-blue-700 bg-blue-100' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl border border-stone-200 p-5">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-stone-900">{stat.value}</p>
              <p className="text-sm text-stone-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <h2 className="text-xl font-bold text-stone-900 mb-4">All Listings</h2>
      {listings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center">
          <Package className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500">No listings yet.</p>
          <button onClick={openCreate} className="mt-4 text-amber-600 font-semibold hover:text-amber-700">Create your first listing</button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden mb-10">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wide px-5 py-3">Listing</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wide px-5 py-3">Type</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wide px-5 py-3">Price</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wide px-5 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-stone-500 uppercase tracking-wide px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {listings.map((l) => (
                  <tr key={l.id} className="hover:bg-stone-50/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={l.image_url || FALLBACK_IMAGES[l.type]} alt="" className="w-12 h-12 rounded-lg object-cover" />
                        <div>
                          <p className="font-medium text-stone-800 line-clamp-1">{l.title}</p>
                          <p className="text-xs text-stone-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{l.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-stone-600">{l.type}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-stone-800">{Number(l.price).toLocaleString()} AED</td>
                    <td className="px-5 py-3">
                      <button onClick={() => toggleStatus(l)} className={`text-xs font-semibold px-2.5 py-1 rounded-full transition ${l.status === 'available' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-stone-200 text-stone-600 hover:bg-stone-300'}`}>
                        {l.status === 'available' ? 'Available' : 'Sold'}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(l)} className="p-2 rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-700 transition" title="Edit"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(l.id)} className="p-2 rounded-lg text-stone-500 hover:bg-red-50 hover:text-red-600 transition" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <h2 className="text-xl font-bold text-stone-900 mb-4">All Orders</h2>
      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center">
          <Clock className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500">No orders yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase px-5 py-3">Listing</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase px-5 py-3">Qty</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase px-5 py-3">Total</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase px-5 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-stone-500 uppercase px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-stone-50/50">
                    <td className="px-5 py-3 text-sm font-medium text-stone-800">{o.listing?.title || 'Listing'}</td>
                    <td className="px-5 py-3 text-sm text-stone-600">{o.quantity}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-stone-800">{Number(o.total_price).toLocaleString()} AED</td>
                    <td className="px-5 py-3"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadge(o.status)}`}>{o.status}</span></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {o.status === 'pending' && <button onClick={() => updateOrderStatus(o.id, 'confirmed')} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition">Confirm</button>}
                        {o.status === 'confirmed' && <button onClick={() => updateOrderStatus(o.id, 'completed')} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition">Complete</button>}
                        {(o.status === 'pending' || o.status === 'confirmed') && <button onClick={() => updateOrderStatus(o.id, 'cancelled')} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition">Cancel</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 sticky top-0 bg-white">
              <h3 className="text-lg font-bold text-stone-900">{draft.id ? 'Edit Listing' : 'New Listing'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg text-stone-400 hover:bg-stone-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Title *</label>
                <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-stone-300 outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition" placeholder="Healthy 3-year-old camel" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Type *</label>
                  <select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as AnimalType })} className="w-full px-4 py-3 rounded-xl border border-stone-300 outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition bg-white">
                    {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Price (AED) *</label>
                  <input type="number" min={0} value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-stone-300 outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition" placeholder="5000" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Location *</label>
                <input value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-stone-300 outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition" placeholder="Dubai, UAE" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Image URL (optional)</label>
                <input value={draft.image_url} onChange={(e) => setDraft({ ...draft, image_url: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-stone-300 outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Description</label>
                <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} rows={4} className="w-full px-4 py-3 rounded-xl border border-stone-300 outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition resize-none" placeholder="Describe the animal — age, health, breed, weight..." />
              </div>
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-stone-100 sticky bottom-0 bg-white">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border border-stone-300 text-stone-700 font-semibold hover:bg-stone-50 transition">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-stone-900 text-white font-semibold hover:bg-stone-800 transition">Save Listing</button>
            </div>
          </div>
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
