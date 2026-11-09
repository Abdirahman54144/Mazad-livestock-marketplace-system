import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FALLBACK_IMAGES, MOCK_LISTINGS, MOCK_PROFILES } from '@/lib/mockData';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, MapPin, Phone, ShoppingBag, Check, AlertCircle } from 'lucide-react';

export default function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listing = MOCK_LISTINGS.find((l) => l.id === id) || null;
  const seller = listing ? MOCK_PROFILES.find((p) => p.id === listing.seller_id) || null : null;

  function handleOrder() {
    if (!listing || !profile) return;
    if (profile.id === listing.seller_id) { setError('You cannot order your own listing.'); return; }
    setOrdering(true);
    setError(null);
    setTimeout(() => {
      setOrdering(false);
      setOrderSuccess(true);
    }, 600);
  }

  if (!listing) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-stone-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-stone-700">Listing not found</h2>
        <Link to="/" className="text-amber-600 hover:text-amber-700 font-medium mt-2 inline-block">Back to marketplace</Link>
      </div>
    );
  }

  const totalPrice = Number(listing.price) * quantity;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 transition mb-5">
        <ArrowLeft className="w-4 h-4" />
        Back to marketplace
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden bg-stone-100">
            <img
              src={listing.image_url || FALLBACK_IMAGES[listing.type]}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-stone-800 text-sm font-semibold px-3 py-1.5 rounded-full shadow-sm">
                {listing.type}
              </span>
            </div>
            {listing.status === 'sold' && (
              <div className="absolute inset-0 bg-stone-900/50 flex items-center justify-center">
                <span className="bg-white text-stone-900 px-6 py-2 rounded-full font-semibold">Sold</span>
              </div>
            )}
          </div>

          <h1 className="text-3xl font-bold text-stone-900 mt-6">{listing.title}</h1>
          <div className="flex items-center gap-2 text-stone-500 mt-2">
            <MapPin className="w-4 h-4" />
            <span>{listing.location}</span>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-stone-700 uppercase tracking-wide mb-2">Description</h3>
            <p className="text-stone-600 leading-relaxed whitespace-pre-wrap">
              {listing.description || 'No description provided.'}
            </p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sticky top-24 shadow-sm">
            <p className="text-sm text-stone-500">Price per unit</p>
            <p className="text-4xl font-bold text-stone-900 mt-1">
              {Number(listing.price).toLocaleString()} <span className="text-lg font-normal text-stone-400">AED</span>
            </p>

            {seller && (
              <div className="flex items-center gap-3 mt-5 pt-5 border-t border-stone-100">
                <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-semibold">
                  {seller.full_name?.charAt(0).toUpperCase() || 'S'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-800">{seller.full_name || 'Seller'}</p>
                  <p className="text-xs text-stone-500 capitalize">{seller.role}</p>
                </div>
                {seller.phone && (
                  <a href={`tel:${seller.phone}`} className="ml-auto p-2 rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200 transition">
                    <Phone className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}

            {orderSuccess ? (
              <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-5 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-green-800">Order placed!</h3>
                <p className="text-sm text-green-600 mt-1">The seller will confirm your order shortly.</p>
                <button onClick={() => navigate('/orders')} className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition">
                  View My Orders
                </button>
              </div>
            ) : listing.status === 'sold' ? (
              <div className="mt-6 bg-stone-100 rounded-xl p-5 text-center text-stone-500">This listing has been sold.</div>
            ) : profile?.id === listing.seller_id ? (
              <div className="mt-6 bg-stone-100 rounded-xl p-5 text-center text-stone-500 text-sm">
                This is your listing. Manage it from your dashboard.
              </div>
            ) : (
              <>
                <div className="mt-6">
                  <label className="block text-sm font-medium text-stone-700 mb-2">Quantity</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-100 transition font-bold text-lg">−</button>
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center px-2 py-2.5 rounded-xl border border-stone-300 outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-100 transition font-bold text-lg">+</button>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-stone-700 mb-2">Notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Delivery preferences, questions..."
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition resize-none"
                  />
                </div>

                <div className="mt-5 pt-5 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-stone-500">Total</span>
                  <span className="text-2xl font-bold text-stone-900">
                    {totalPrice.toLocaleString()} <span className="text-sm font-normal text-stone-400">AED</span>
                  </span>
                </div>

                {error && (
                  <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
                )}

                <button
                  onClick={handleOrder}
                  disabled={ordering || !profile}
                  className="mt-5 w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3.5 rounded-xl transition disabled:opacity-50"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {ordering ? 'Placing order...' : 'Place Order'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
