'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppSidebar } from '../../components/layout/AppSidebar';
import { AppTopBar } from '../../components/layout/AppTopBar';
import { ShopsRadarMap } from '@/components/shops/ShopsRadarMap';
import { RegisterShopModal } from '@/components/shops/RegisterShopModal';
import { ReportShopModal } from '@/components/shops/ReportShopModal';
import {
  Compass,
  MapPin,
  Navigation,
  Phone,
  Clock,
  Star,
  Search,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  ShoppingBag,
  Sliders,
  AlertCircle,
  Radio,
  Sparkles,
  Plus,
  X,
  MessageCircle,
  Building2,
  Store,
  Layers,
  ArrowRight,
  ChevronRight,
  AlertTriangle,
  Check,
} from 'lucide-react';

export interface ShopItem {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  distance_meters: number;
  distance_km: number;
  travel_time_mins: number;
  opening_hours: string;
  categories: string[];
  is_verified: boolean;
  verified_status: 'verified' | 'pending' | 'rejected' | 'google_places';
  rating: number;
  review_count: number;
  google_maps_uri?: string;
  google_place_id?: string;
  photos: string[];
  stocked_components: string[];
  source: 'verified' | 'google_places';
}

const CITY_PRESETS = [
  { name: 'Bengaluru (SP Road)', lat: 12.9644, lng: 77.5833 },
  { name: 'Delhi (Lajpat Rai Market)', lat: 28.6562, lng: 77.2355 },
  { name: 'Mumbai (Lamington Road)', lat: 18.9616, lng: 72.8164 },
  { name: 'Hyderabad (Koti Electronics)', lat: 17.385, lng: 78.4867 },
  { name: 'Pune (Budhwar Peth)', lat: 18.5167, lng: 73.8562 },
  { name: 'Chennai (Ritchie Street)', lat: 13.0674, lng: 80.2707 },
];

const RADIUS_OPTIONS = [
  { label: '1 km', value: 1000 },
  { label: '3 km', value: 3000 },
  { label: '5 km', value: 5000 },
  { label: '10 km', value: 10000 },
  { label: '25 km', value: 25000 },
];

export default function ShopsPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Active Map Center Coordinates & Search Radius
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: 12.9644, // Default Bengaluru SP Road
    lng: 77.5833,
  });
  const [locationName, setLocationName] = useState('Bengaluru (SP Road)');
  const [radiusM, setRadiusM] = useState<number>(5000);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [openNowOnly, setOpenNowOnly] = useState<boolean>(false);

  // Stores State
  const [shops, setShops] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);

  // GPS State
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Modals
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [reportingShop, setReportingShop] = useState<ShopItem | null>(null);
  const [confirmedOpenShops, setConfirmedOpenShops] = useState<Record<string, boolean>>({});

  // Fetch shops from Next.js / Supabase Edge endpoint
  const loadNearbyShops = async () => {
    setLoading(true);
    setGpsError(null);

    try {
      const params = new URLSearchParams({
        lat: currentCoords.lat.toString(),
        lng: currentCoords.lng.toString(),
        radius_m: radiusM.toString(),
      });
      if (searchQuery.trim()) params.set('query', searchQuery.trim());

      const res = await fetch(`/api/shops/nearby?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setShops(data.shops || []);
        if (data.shops?.length > 0 && !selectedShopId) {
          setSelectedShopId(data.shops[0].id);
        }
      }
    } catch {
      // Continue gracefully
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNearbyShops();
  }, [currentCoords, radiusM]);

  // GPS Detection Handler
  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setDetectingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocationName('My GPS Coordinates');
        setDetectingGps(false);
      },
      (err) => {
        setGpsError(`Could not detect location: ${err.message}. Using city presets.`);
        setDetectingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // City preset selection
  const handleSelectPreset = (preset: typeof CITY_PRESETS[0]) => {
    setCurrentCoords({ lat: preset.lat, lng: preset.lng });
    setLocationName(preset.name);
    setGpsError(null);
  };

  // Search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadNearbyShops();
  };

  // Crowdsource confirm open
  const handleConfirmOpen = (shopId: string) => {
    setConfirmedOpenShops((prev) => ({ ...prev, [shopId]: true }));
  };

  // Filtered shops based on client UI selections
  const filteredShops = shops.filter((shop) => {
    if (verifiedOnly && !shop.is_verified) return false;
    if (selectedCategory !== 'ALL') {
      const matchCat = shop.categories.some((c) =>
        c.toLowerCase().includes(selectedCategory.toLowerCase())
      );
      if (!matchCat) return false;
    }
    return true;
  });

  const selectedShop = shops.find((s) => s.id === selectedShopId) || filteredShops[0];

  return (
    <div className="flex h-screen overflow-hidden bg-[#07110D] text-[#EAF7EF] font-sans selection:bg-[#39FF6A] selection:text-black">
      {/* LEFT NAVIGATION RAIL */}
      <AppSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOP SYSTEM BAR */}
        <AppTopBar
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* MAIN BODY AREA: DUAL PANEL (Left Store Drawer/List + Right Interactive Map) */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
          {/* ================= LEFT STORE DRAWER & LIST ================= */}
          <aside className="w-full lg:w-[480px] xl:w-[520px] bg-[#040B08]/95 border-r border-[rgba(57,255,106,0.15)] flex flex-col overflow-hidden shrink-0 z-10">
            {/* Top Search & Presets Header */}
            <div className="p-4 border-b border-[rgba(57,255,106,0.12)] space-y-3 shrink-0 bg-[#07110D]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#39FF6A]/10 border border-[#39FF6A]/30 flex items-center justify-center text-[#39FF6A]">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-[#EAF7EF]">Maker Radar</h2>
                    <p className="text-[10px] font-mono text-[#8FA99B]">
                      Verified Electronics & Robotics Stores
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#39FF6A]/10 border border-[#39FF6A]/30 hover:border-[#39FF6A] text-[#39FF6A] text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Store</span>
                </button>
              </div>

              {/* GPS & Location Display */}
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-black/40 border border-white/5 font-mono text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <MapPin className="w-3.5 h-3.5 text-[#39FF6A] shrink-0" />
                  <span className="truncate text-white/80">{locationName}</span>
                </div>
                <button
                  onClick={handleDetectGps}
                  disabled={detectingGps}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#39FF6A]/20 text-[#39FF6A] border border-[#39FF6A]/30 text-[10px] font-bold shrink-0 transition-colors flex items-center gap-1"
                >
                  <Navigation className="w-3 h-3" />
                  <span>{detectingGps ? 'Locating...' : 'GPS'}</span>
                </button>
              </div>

              {/* City Presets Quick Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono no-scrollbar">
                <span className="text-[#8FA99B] font-bold shrink-0">City Hubs:</span>
                {CITY_PRESETS.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => handleSelectPreset(city)}
                    className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/5 text-[#CBD8D0] hover:border-[#39FF6A] hover:text-[#39FF6A] shrink-0 transition-colors"
                  >
                    {city.name.split(' ')[0]}
                  </button>
                ))}
              </div>

              {/* Search Form Bar */}
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8FA99B]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search parts, shop name, or market..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] text-xs text-[#EAF7EF] placeholder:text-[#527063] focus:outline-none focus:border-[#39FF6A] font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary-neon px-3 py-2 rounded-xl text-xs font-mono font-bold shrink-0"
                >
                  Search
                </button>
              </form>

              {/* Radius Selector Pills */}
              <div className="flex items-center justify-between font-mono text-[11px] pt-1 border-t border-white/5">
                <span className="text-[#8FA99B]">Radius:</span>
                <div className="flex items-center gap-1">
                  {RADIUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setRadiusM(opt.value)}
                      className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                        radiusM === opt.value
                          ? 'bg-[#39FF6A] text-[#07110D]'
                          : 'bg-white/5 text-[#8FA99B] hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Filter Chips Bar */}
            <div className="px-4 py-2 bg-[#0A1F17]/60 border-b border-[rgba(57,255,106,0.1)] flex items-center justify-between text-[10px] font-mono shrink-0">
              <div className="flex items-center gap-1.5 overflow-x-auto pr-2">
                {['ALL', 'Arduino', 'Sensors', 'Motors', 'Tools'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-0.5 rounded-lg font-bold transition-all ${
                      selectedCategory === cat
                        ? 'bg-[#39FF6A]/20 border border-[#39FF6A] text-[#39FF6A]'
                        : 'bg-white/5 text-[#8FA99B] hover:text-white border border-transparent'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-1 text-[#8FA99B] cursor-pointer hover:text-white shrink-0">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded border-[rgba(57,255,106,0.3)] bg-black/40 text-[#39FF6A] focus:ring-0 w-3 h-3"
                />
                <span className="font-bold">Verified</span>
              </label>
            </div>

            {/* Stores List Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? (
                <div className="py-12 text-center space-y-2 font-mono text-xs text-[#8FA99B]">
                  <Compass className="w-8 h-8 text-[#39FF6A] mx-auto animate-spin" />
                  <p>Scanning electronics markets on PostGIS radar...</p>
                </div>
              ) : filteredShops.length === 0 ? (
                <div className="py-12 text-center space-y-3 font-mono p-6 rounded-2xl bg-black/40 border border-white/5">
                  <Store className="w-10 h-10 text-[#FF9A1F] mx-auto" />
                  <h4 className="text-sm font-bold text-[#EAF7EF]">No Local Stores in Radius</h4>
                  <p className="text-xs text-[#8FA99B] leading-relaxed">
                    Try expanding the search radius to 25 km, or order from the RoboVerse TechSavyyy store with 24-48h pan-India delivery.
                  </p>
                  <Link
                    href="/store"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#39FF6A] text-[#07110D] font-bold text-xs shadow-[0_0_12px_rgba(57,255,106,0.3)]"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Open TechSavyyy Store</span>
                  </Link>
                </div>
              ) : (
                filteredShops.map((shop) => {
                  const isSelected = selectedShopId === shop.id;
                  const isConfirmed = confirmedOpenShops[shop.id];

                  return (
                    <div
                      key={shop.id}
                      onClick={() => setSelectedShopId(shop.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#39FF6A]/10 border-[#39FF6A] shadow-[0_0_16px_rgba(57,255,106,0.2)]'
                          : 'bg-[#07110D]/70 border-white/5 hover:border-[#39FF6A]/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[#EAF7EF] line-clamp-1">
                            {shop.name}
                          </h4>
                          {shop.is_verified ? (
                            <span className="flex items-center gap-0.5 px-2 py-0.2 rounded-full bg-[#39FF6A]/20 text-[#39FF6A] text-[10px] font-mono font-bold shrink-0">
                              <ShieldCheck className="w-3 h-3" /> Verified
                            </span>
                          ) : (
                            <span className="px-2 py-0.2 rounded-full bg-white/5 text-[#8FA99B] text-[10px] font-mono shrink-0">
                              Google Maps
                            </span>
                          )}
                        </div>

                        <span className="text-xs font-mono font-bold text-[#39FF6A] shrink-0">
                          {shop.distance_km} km
                        </span>
                      </div>

                      <p className="text-xs text-[#8FA99B] line-clamp-1 mb-2 font-mono">
                        {shop.address}
                      </p>

                      <div className="flex items-center justify-between text-[11px] font-mono text-white/60 pt-2 border-t border-white/5">
                        <span className="flex items-center gap-1 text-[#7FE7D6]">
                          <Clock className="w-3 h-3" /> ~{shop.travel_time_mins}m travel
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-0.5 text-[#FACC15]">
                            <Star className="w-3 h-3 fill-current" /> {shop.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Selected Shop Details Drawer (Bottom Dock) */}
            {selectedShop && (
              <div className="p-4 bg-[#0A1A14] border-t border-[rgba(57,255,106,0.2)] space-y-3 font-mono shrink-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-[#EAF7EF]">{selectedShop.name}</h3>
                    <p className="text-xs text-[#8FA99B] line-clamp-1">{selectedShop.address}</p>
                  </div>
                  <span className="text-xs font-black text-[#39FF6A] px-2 py-1 rounded-xl bg-[#39FF6A]/10 border border-[#39FF6A]/30">
                    {selectedShop.distance_km} km
                  </span>
                </div>

                {/* Stocked components chips */}
                <div className="space-y-1">
                  <span className="text-[10px] text-[#7FE7D6] uppercase font-bold block">
                    Likely Stocks:
                  </span>
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {selectedShop.stocked_components.slice(0, 4).map((c, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-white/5 text-white/80">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions: Call, Directions, Confirm Open, Report */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-xs font-bold">
                  <a
                    href={`tel:${selectedShop.phone}`}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-[#39FF6A] text-[#EAF7EF] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#39FF6A]" />
                    <span>Call</span>
                  </a>

                  <a
                    href={selectedShop.google_maps_uri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedShop.name)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-[#39FF6A] text-[#07110D] flex items-center justify-center gap-1.5 hover:brightness-110 transition-all shadow-[0_0_12px_rgba(57,255,106,0.3)]"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Navigate</span>
                  </a>

                  <button
                    onClick={() => handleConfirmOpen(selectedShop.id)}
                    className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 transition-colors ${
                      confirmedOpenShops[selectedShop.id]
                        ? 'bg-[#39FF6A]/20 border-[#39FF6A] text-[#39FF6A]'
                        : 'bg-white/5 border-white/10 text-[#8FA99B] hover:text-white'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{confirmedOpenShops[selectedShop.id] ? 'Confirmed' : 'Confirm'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] text-[#8FA99B]">
                  <span>Hours: {selectedShop.opening_hours}</span>
                  <button
                    onClick={() => setReportingShop(selectedShop)}
                    className="text-[#FF9A1F] hover:underline flex items-center gap-1"
                  >
                    <AlertTriangle className="w-3 h-3" /> Report Issue
                  </button>
                </div>
              </div>
            )}
          </aside>

          {/* ================= RIGHT MAP & RADAR VIEWPORT ================= */}
          <main className="flex-1 relative h-full overflow-hidden bg-[#07110D]">
            <ShopsRadarMap
              center={currentCoords}
              radiusKm={radiusM / 1000}
              shops={filteredShops}
              selectedShopId={selectedShopId}
              onSelectShop={(id) => setSelectedShopId(id)}
            />
          </main>
        </div>
      </div>

      {/* ================= MODALS ================= */}
      <RegisterShopModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        defaultCoords={currentCoords}
        onSuccess={(newShop) => {
          setShops((prev) => [newShop, ...prev]);
          setSelectedShopId(newShop.id);
        }}
      />

      <ReportShopModal
        isOpen={Boolean(reportingShop)}
        onClose={() => setReportingShop(null)}
        shop={reportingShop}
      />
    </div>
  );
}
