'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/landing/Navbar';
import { apiRequest } from '../../lib/apiClient';
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
  Flag,
  X,
  Store,
  ChevronRight,
} from 'lucide-react';

interface ComponentShop {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  phone: string;
  openingHours: string;
  rating: number;
  isVerified: boolean;
  stockedComponents: string[];
  distanceKm: number;
  directionsUrl: string;
}

const CITY_PRESETS = [
  { name: 'Delhi (Chandni Chowk / Lajpat Rai)', lat: 28.6562, lng: 77.2355 },
  { name: 'Delhi (Nehru Place)', lat: 28.5494, lng: 77.2522 },
  { name: 'Bengaluru (SP Road)', lat: 12.9644, lng: 77.5833 },
  { name: 'Mumbai (Lamington Road)', lat: 18.9616, lng: 72.8164 },
  { name: 'Pune (Budhwar Peth)', lat: 18.5186, lng: 73.8553 },
  { name: 'Hyderabad (Koti / Gujarati Galli)', lat: 17.3850, lng: 78.4867 },
];

const CATEGORY_CHIPS = [
  'All',
  'Arduino',
  'Microcontrollers',
  'Sensors',
  'Motors',
  'Batteries',
  'Tools',
];

export default function ShopsPage() {
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: 28.6315, // Default New Delhi Connaught Place
    lng: 77.2167,
  });
  const [locationName, setLocationName] = useState('New Delhi (Connaught Place)');
  const [radiusKm, setRadiusKm] = useState(25);
  const [componentFilter, setComponentFilter] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [shops, setShops] = useState<ComponentShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Moderation / Report Store modal
  const [reportingShop, setReportingShop] = useState<ComponentShop | null>(null);
  const [reportReason, setReportReason] = useState('Store closed or relocated');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Fetch nearby shops
  useEffect(() => {
    async function fetchShops() {
      setLoading(true);
      const params = new URLSearchParams({
        lat: currentCoords.lat.toString(),
        lng: currentCoords.lng.toString(),
        radiusKm: radiusKm.toString(),
      });

      const effectiveFilter = activeCategory !== 'All' ? activeCategory : componentFilter;
      if (effectiveFilter.trim()) {
        params.append('component', effectiveFilter.trim());
      }

      const res = await apiRequest(`/shops/nearby?${params.toString()}`);
      if (res.success && res.data) {
        setShops(res.data.shops || []);
      }
      setLoading(false);
    }

    fetchShops();
  }, [currentCoords, radiusKm, componentFilter, activeCategory]);

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
        setLocationName(`Detected GPS (${pos.coords.latitude.toFixed(2)}°N, ${pos.coords.longitude.toFixed(2)}°E)`);
        setDetectingGps(false);
      },
      (err) => {
        setGpsError(`Could not access GPS: ${err.message}. Using city presets.`);
        setDetectingGps(false);
      }
    );
  };

  const handleSelectPreset = (preset: typeof CITY_PRESETS[0]) => {
    setCurrentCoords({ lat: preset.lat, lng: preset.lng });
    setLocationName(preset.name);
    setGpsError(null);
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingShop) return;

    setIsSubmittingReport(true);
    const res = await apiRequest('/shops/report', {
      method: 'POST',
      body: JSON.stringify({
        shopId: reportingShop.id,
        shopName: reportingShop.name,
        reason: reportReason,
        details: reportDetails,
      }),
    });

    setIsSubmittingReport(false);
    if (res.success) {
      setReportSuccess(`Report submitted for ${reportingShop.name}. Our verification team will audit it.`);
      setReportingShop(null);
      setReportDetails('');
      setTimeout(() => setReportSuccess(null), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-[#05100B] text-robo-text font-sans selection:bg-robo-neon selection:text-black">
      <Navbar />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Success Alert Banner */}
        {reportSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-[#0E2A1F] border border-[#39FF6A]/60 text-[#39FF6A] text-xs font-mono flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#39FF6A]" />
              <span>{reportSuccess}</span>
            </div>
            <button onClick={() => setReportSuccess(null)} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Header HUD */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B1E16] via-[#071710] to-[#040D08] border border-robo-borderSubtle p-8 sm:p-12 mb-10 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-robo-neon/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-robo-surfaceRaised/80 border border-robo-neon/40 text-robo-neon text-xs font-mono mb-4">
                <Compass className="w-3.5 h-3.5 animate-spin-slow" />
                <span>GEOLOCATION RADAR // ELECTRONICS RETAIL HUBS</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
                Nearest Component Shops
              </h1>
              <p className="text-sm sm:text-base text-robo-textSecondary leading-relaxed mb-6">
                Locate verified electronics markets and offline component shops stocking microcontrollers, sensors, 
                motors, and soldering gear in your city. Verified shops honor RoboVerse student discounts.
              </p>

              {/* GPS Detection Bar */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleDetectGps}
                  disabled={detectingGps}
                  className="px-4 py-2.5 rounded-xl bg-robo-neon hover:bg-robo-neonHover text-black font-bold text-xs flex items-center gap-2 shadow-neon-glow transition-all disabled:opacity-50"
                >
                  <Navigation className="w-4 h-4" />
                  <span>{detectingGps ? 'Locating...' : 'Detect My GPS'}</span>
                </button>

                <div className="text-xs font-mono text-robo-teal bg-black/50 px-3.5 py-2 rounded-xl border border-robo-teal/30 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-robo-neon" />
                  <span>Center: {locationName}</span>
                </div>

                <Link
                  href="/store-admin"
                  className="px-3.5 py-2 rounded-xl bg-[#0E2A1F] hover:bg-[#39FF6A]/10 text-gray-300 hover:text-[#39FF6A] border border-gray-700 text-xs font-mono transition"
                >
                  Register Store &rarr;
                </Link>
              </div>

              {gpsError && (
                <div className="mt-3 text-xs text-robo-accentOrange flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{gpsError}</span>
                </div>
              )}
            </div>

            {/* Radar Mini-HUD Display with Map Pins */}
            <div className="hidden lg:flex flex-col items-center justify-center p-6 rounded-2xl bg-black/70 border border-robo-neon/30 relative w-72 h-72 overflow-hidden shadow-neon-subtle">
              {/* Concentric distance rings (5km, 10km, 25km, 50km) */}
              <div className="absolute inset-4 rounded-full border border-robo-neon/20" />
              <div className="absolute inset-12 rounded-full border border-robo-neon/30" />
              <div className="absolute inset-20 rounded-full border border-robo-teal/30" />
              <div className="absolute inset-28 rounded-full border border-robo-neon/40" />

              {/* Crosshair axes */}
              <div className="absolute inset-x-0 top-1/2 h-[1px] bg-robo-neon/20" />
              <div className="absolute inset-y-0 left-1/2 w-[1px] bg-robo-neon/20" />

              {/* Center User Blip */}
              <div className="relative z-10 w-3.5 h-3.5 bg-[#7FE7D6] rounded-full shadow-lg shadow-[#7FE7D6]/50 animate-pulse" title="Your Location" />

              {/* Plotted Shop Blips on Radar */}
              {shops.slice(0, 8).map((shop, idx) => {
                const angle = (idx * 45 * Math.PI) / 180;
                const distRatio = Math.min(1.0, shop.distanceKm / (radiusKm || 25));
                const radiusPx = 25 + distRatio * 85;
                const x = Math.cos(angle) * radiusPx;
                const y = Math.sin(angle) * radiusPx;

                return (
                  <div
                    key={shop.id}
                    className="absolute z-20 w-3 h-3 rounded-full bg-[#39FF6A] border border-black shadow-md shadow-[#39FF6A]/60 cursor-pointer hover:scale-150 transition-transform"
                    style={{
                      transform: `translate(${x}px, ${y}px)`,
                    }}
                    title={`${shop.name} (${shop.distanceKm} km)`}
                  />
                );
              })}

              {/* Scanning sweep */}
              <div
                className="absolute inset-0 origin-center bg-gradient-to-tr from-robo-neon/25 to-transparent pointer-events-none"
                style={{
                  clipPath: 'polygon(50% 50%, 100% 0, 100% 50%)',
                  animation: 'spin 4s linear infinite',
                }}
              />

              <div className="absolute bottom-2 text-[10px] font-mono text-robo-neon tracking-widest">
                POSTGIS RADAR // {shops.length} SHOPS
              </div>
            </div>
          </div>

          {/* Quick Major Hub Presets */}
          <div className="mt-8 pt-6 border-t border-robo-borderSubtle/60 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-robo-textSecondary font-mono mr-1">Major Hubs:</span>
            {CITY_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleSelectPreset(preset)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  locationName === preset.name
                    ? 'bg-robo-teal text-black font-bold'
                    : 'bg-black/40 text-robo-textSecondary border border-robo-borderSubtle hover:text-white hover:border-robo-neon/40'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </section>

        {/* Filter Controls Bar */}
        <section className="mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Component Search */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-robo-textSecondary" />
              <input
                type="text"
                value={componentFilter}
                onChange={(e) => {
                  setComponentFilter(e.target.value);
                  setActiveCategory('All');
                }}
                placeholder="Search components in stock (e.g. Arduino, ESP32, Servo, Ultrasonic, L298N)..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-robo-surfaceRaised/90 border border-robo-borderSubtle text-white placeholder-robo-textSecondary text-sm focus:outline-none focus:border-robo-neon transition-colors font-mono"
              />
            </div>

            {/* Radius Selector Slider */}
            <div className="px-4 py-2 rounded-2xl bg-robo-surfaceRaised border border-robo-borderSubtle flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-mono text-robo-textSecondary shrink-0">
                <Sliders className="w-3.5 h-3.5 text-robo-teal" />
                <span>Radius:</span>
                <span className="text-white font-bold">{radiusKm} km</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full accent-robo-neon cursor-pointer"
              />
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
            {CATEGORY_CHIPS.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setComponentFilter('');
                }}
                className={`px-3 py-1.5 rounded-full transition ${
                  activeCategory === cat
                    ? 'bg-[#39FF6A] text-black font-bold shadow-md'
                    : 'bg-[#0E2A1F]/60 text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Shops Grid */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block w-8 h-8 border-2 border-robo-neon border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-robo-textSecondary font-mono text-sm">Scanning electronics vendor telemetry within {radiusKm} km...</p>
          </div>
        ) : shops.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-robo-surfaceRaised/50 border border-robo-borderSubtle p-8">
            <Radio className="w-12 h-12 text-robo-textSecondary mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No Component Shops in This Radius</h3>
            <p className="text-sm text-robo-textSecondary mb-6 max-w-md mx-auto">
              No physical shops found within {radiusKm} km stocking &quot;{componentFilter || activeCategory}&quot;.
              Expand your search radius or order directly from the TechSavyyy online store.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setRadiusKm(100);
                  setComponentFilter('');
                  setActiveCategory('All');
                }}
                className="px-5 py-2.5 rounded-xl bg-robo-surfaceRaised border border-robo-neon text-robo-neon text-xs font-mono font-bold hover:bg-robo-neon hover:text-black transition-colors"
              >
                Expand to 100 km
              </button>
              <Link
                href="/store"
                className="px-5 py-2.5 rounded-xl bg-robo-neon text-black font-bold text-xs flex items-center gap-1.5 shadow-neon-glow"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Shop TechSavyyy Store</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shops.map((shop) => (
              <div
                key={shop.id}
                className="group relative rounded-3xl bg-gradient-to-b from-[#091B13] to-[#040E0A] border border-robo-borderSubtle hover:border-robo-neon/60 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-neon-card"
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-white group-hover:text-robo-neon transition-colors">
                          {shop.name}
                        </h3>
                      </div>
                      <p className="text-xs text-robo-textSecondary flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-robo-neon shrink-0" />
                        <span>{shop.address}, {shop.city}</span>
                      </p>
                    </div>

                    {/* Distance Pill */}
                    <div className="shrink-0 px-3 py-1.5 rounded-xl bg-robo-surfaceRaised border border-robo-neon/40 text-robo-neon font-mono text-xs font-bold shadow-neon-subtle flex items-center gap-1">
                      <Navigation className="w-3 h-3" />
                      <span>{shop.distanceKm} km</span>
                    </div>
                  </div>

                  {/* Verification & Rating */}
                  <div className="flex flex-wrap items-center gap-3 py-3 border-y border-robo-borderSubtle/60 text-xs mb-4">
                    {shop.isVerified && (
                      <span className="inline-flex items-center gap-1 text-robo-neon font-medium">
                        <ShieldCheck className="w-4 h-4 text-robo-neon" />
                        TechSavyyy Certified Partner
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1 text-yellow-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {shop.rating}
                    </span>

                    <span className="inline-flex items-center gap-1 text-robo-textSecondary font-mono">
                      <Clock className="w-3.5 h-3.5 text-robo-teal" />
                      {shop.openingHours}
                    </span>
                  </div>

                  {/* Stocked Components */}
                  <div className="mb-6">
                    <span className="text-[10px] font-mono text-robo-textSecondary block mb-2">
                      STOCKING COMPONENTS:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {shop.stockedComponents.map((comp) => {
                        const isMatch =
                          (componentFilter && comp.toLowerCase().includes(componentFilter.toLowerCase())) ||
                          (activeCategory !== 'All' && comp.toLowerCase().includes(activeCategory.toLowerCase()));
                        return (
                          <span
                            key={comp}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-mono ${
                              isMatch
                                ? 'bg-robo-neon text-black font-bold shadow-neon-subtle'
                                : 'bg-black/50 text-robo-textSecondary border border-robo-borderSubtle'
                            }`}
                          >
                            {comp}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-2 flex items-center gap-2">
                  <a
                    href={`tel:${shop.phone}`}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-robo-surfaceRaised hover:bg-robo-surfaceRaised/80 border border-robo-borderSubtle text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-robo-teal" />
                    <span>Call</span>
                  </a>

                  <a
                    href={shop.directionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-robo-neon hover:bg-robo-neonHover text-black text-xs font-bold flex items-center justify-center gap-1.5 shadow-neon-subtle transition-all"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Directions</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>

                  <button
                    onClick={() => setReportingShop(shop)}
                    className="p-2.5 rounded-xl bg-black/40 hover:bg-red-500/10 text-gray-400 hover:text-[#FF3939] border border-gray-800 transition"
                    title="Report outdated hours or missing store"
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TechSavyyy Banner Bottom */}
        <section className="mt-16 rounded-3xl bg-gradient-to-r from-[#0E281D] via-[#091D14] to-[#040F0A] border border-robo-teal/40 p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-robo-teal/10 border border-robo-teal text-robo-teal text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CANT FIND IT LOCALLY?</span>
            </div>
            <h3 className="text-2xl font-bold text-white">Order Genuine Components from TechSavyyy</h3>
            <p className="text-sm text-robo-textSecondary max-w-xl">
              Quality-tested Arduino, ESP32, chassis kits and sensors shipped directly to your hostel or doorstep with official 18% GST tax invoices and student discounts.
            </p>
          </div>
          <Link
            href="/store"
            className="shrink-0 px-6 py-3 rounded-xl bg-robo-teal hover:bg-robo-teal/90 text-black font-bold text-sm shadow-neon-glow flex items-center gap-2 transition-transform hover:scale-105"
          >
            <span>Visit TechSavyyy Store</span>
            <ShoppingBag className="w-4 h-4" />
          </Link>
        </section>
      </main>

      {/* REPORT STORE MODAL */}
      {reportingShop && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#07110D] border border-red-500/30 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setReportingShop(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3 text-[#FF3939]">
              <Flag className="w-5 h-5" />
              <h3 className="text-lg font-bold text-white">Report Store Issue</h3>
            </div>

            <p className="text-xs text-gray-400 mb-4">
              Help keep the RoboVerse hardware telemetry accurate for other students.
            </p>

            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div>
                <label className="text-xs text-gray-300 font-bold block mb-1">Store Name</label>
                <input
                  type="text"
                  disabled
                  value={reportingShop.name}
                  className="w-full bg-[#0E2A1F] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white opacity-80"
                />
              </div>

              <div>
                <label className="text-xs text-gray-300 font-bold block mb-1">Issue Category</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-[#0E2A1F] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#39FF6A]"
                >
                  <option value="Store closed or relocated">Store is permanently closed or relocated</option>
                  <option value="Incorrect address or phone">Incorrect address or phone number</option>
                  <option value="Out of stock for common components">Out of stock for common components</option>
                  <option value="Fake pricing or overcharging">Fake pricing or charging above MRP</option>
                  <option value="Other">Other discrepancy</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-300 font-bold block mb-1">Additional Details (Optional)</label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="e.g. Shop moved to Basement floor, phone number changed..."
                  rows={3}
                  className="w-full bg-[#0E2A1F] border border-gray-700 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#39FF6A]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReportingShop(null)}
                  className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="flex-1 py-2.5 bg-[#FF3939] hover:bg-red-600 text-white rounded-xl text-xs font-bold transition shadow-md disabled:opacity-50"
                >
                  {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
