import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { AnimalType, Listing } from '@/lib/supabase';
import { FALLBACK_IMAGES, MOCK_LISTINGS } from '@/lib/mockData';
import { PawPrint, MapPin, Search, SlidersHorizontal, TrendingUp, Store } from 'lucide-react';

const TYPES: (AnimalType | 'All')[] = ['All', 'Camel', 'Goat', 'Sheep', 'Cattle'];

export default function MarketplacePage() {
  const [listings] = useState<Listing[]>(MOCK_LISTINGS);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<AnimalType | 'All'>('All');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high'>('newest');

  const locations = useMemo(() => {
    const set = new Set(listings.map((l) => l.location));
    return Array.from(set).sort();
  }, [listings]);

  const filtered = useMemo(() => {
    let result = listings;
    if (typeFilter !== 'All') result = result.filter((l) => l.type === typeFilter);
    if (locationFilter) result = result.filter((l) => l.location === locationFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((l) => l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q));
    }
    if (sortBy === 'price_low') result = [...result].sort((a, b) => a.price - b.price);
    else if (sortBy === 'price_high') result = [...result].sort((a, b) => b.price - a.price);
    return result;
  }, [listings, typeFilter, locationFilter, search, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900 p-8 sm:p-12 mb-8">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <TrendingUp className="w-3.5 h-3.5" />
            Live Marketplace
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-3">
            Find quality livestock from trusted sellers
          </h1>
          <p className="text-stone-300 text-lg leading-relaxed">
            Browse camels, goats, sheep, and cattle. Filter by type and location, then place your order online.
          </p>
        </div>
        <div className="absolute -right-12 -bottom-12 opacity-10">
          <PawPrint className="w-72 h-72 text-white" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or description..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition outline-none"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                  typeFilter === t ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition outline-none text-stone-700"
          >
            <option value="">All locations</option>
            {locations.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition outline-none text-stone-700"
          >
            <option value="newest">Newest first</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
        </div>
        <div className="flex items-center gap-2 mt-3 text-sm text-stone-500">
          <SlidersHorizontal className="w-4 h-4" />
          <span>{filtered.length} {filtered.length === 1 ? 'listing' : 'listings'} found</span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-stone-100 mb-4">
            <Store className="w-8 h-8 text-stone-400" />
          </div>
          <h3 className="text-lg font-semibold text-stone-700">No listings found</h3>
          <p className="text-stone-500 mt-1">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((listing) => (
            <Link
              key={listing.id}
              to={`/listing/${listing.id}`}
              className="group bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-xl hover:shadow-stone-200/60 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative h-48 overflow-hidden bg-stone-100">
                <img
                  src={listing.image_url || FALLBACK_IMAGES[listing.type]}
                  alt={listing.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm text-stone-800 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                    {listing.type}
                  </span>
                </div>
                {listing.status === 'sold' && (
                  <div className="absolute inset-0 bg-stone-900/50 flex items-center justify-center">
                    <span className="bg-white text-stone-900 px-4 py-1.5 rounded-full font-semibold text-sm">Sold</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-stone-900 group-hover:text-amber-700 transition line-clamp-1">{listing.title}</h3>
                <div className="flex items-center gap-1.5 text-sm text-stone-500 mt-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="line-clamp-1">{listing.location}</span>
                </div>
                <p className="text-2xl font-bold text-stone-900 mt-3">
                  {Number(listing.price).toLocaleString()} <span className="text-sm font-normal text-stone-400">AED</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
