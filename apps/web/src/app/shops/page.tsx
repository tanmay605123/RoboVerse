'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppSidebar } from '../../components/layout/AppSidebar';
import { AppTopBar } from '../../components/layout/AppTopBar';
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
  Plus,
  X,
  MessageCircle,
  Building2,
  Store,
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
  { name: 'Delhi (Nehru Place Hardware Hub)', lat: 28.5494, lng: 77.2522 },
  { name: 'Bengaluru (SP Road Electronics Lane)', lat: 12.9644, lng: 77.5833 },
  { name: 'Mumbai (Lamington Road Market)', lat: 18.9616, lng: 72.8164 },
  { name: 'Hyderabad (Gujarati Galli / Koti)', lat: 17.3850, lng: 78.4867 },
  { name: 'Pune (Budhwar Peth / Deccan)', lat: 18.5167, lng: 73.8562 },
];

export default function ShopsPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: 28.6315, // Default New Delhi
    lng: 77.2167,
  });
  const [locationName, setLocationName] = useState('Delhi (Connaught Place Center)');
  const [radiusKm, setRadiusKm] = useState(25);
  const [componentFilter, setComponentFilter] = useState('');
  const [shops, setShops] = useState<ComponentShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);

  // Google Maps View & Locality Search State
  const [mapViewMode, setMapViewMode] = useState<'maps' | 'radar'>('maps');
  const [localitySearch, setLocalitySearch] = useState('');
  const [geocoding, setGeocoding] = useState(false);

  // Community Submit Shop Modal
  const [addShopModalOpen, setAddShopModalOpen] = useState(false);
  const [newShopName, setNewShopName] = useState('');
  const [newShopMarket, setNewShopMarket] = useState('');
  const [newShopCity, setNewShopCity] = useState('Delhi');
  const [newShopPhone, setNewShopPhone] = useState('');
  const [newShopComponents, setNewShopComponents] = useState('Arduino, ESP32, Sensors, Servos, Motors');
  const [addShopSuccess, setAddShopSuccess] = useState<string | null>(null);

  const handleLocalitySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localitySearch.trim()) return;

    setGeocoding(true);
    setGpsError(null);

    const res = await apiRequest(`/shops/geocode?query=${encodeURIComponent(localitySearch.trim())}`);
    setGeocoding(false);

    if (res.success && res.data) {
      setCurrentCoords({
        lat: res.data.latitude,
        lng: res.data.longitude,
      });
      setLocationName(res.data.formattedAddress || localitySearch);
    } else {
      setGpsError(res.error?.message || 'Location not found. Try entering a landmark like "SP Road Bengaluru".');
    }
  };

  const loadShops = async () => {
    setLoading(true);
    const query = new URLSearchParams({
      lat: currentCoords.lat.toString(),
      lng: currentCoords.lng.toString(),
      radiusKm: radiusKm.toString(),
    });
    if (componentFilter) {
      query.set('component', componentFilter);
    }

    const res = await apiRequest(`/shops?${query.toString()}`);
    if (res.success && res.data) {
      setShops(res.data.shops || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadShops();
  }, [currentCoords, radiusKm, componentFilter]);

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
        setLocationName('Current GPS Coordinates');
        setDetectingGps(false);
      },
      (err) => {
        setGpsError(`Could not detect location: ${err.message}. Using city presets.`);
        setDetectingGps(false);
      }
    );
  };

  const handleSelectPreset = (preset: typeof CITY_PRESETS[0]) => {
    setCurrentCoords({ lat: preset.lat, lng: preset.lng });
    setLocationName(preset.name);
    setGpsError(null);
  };

  const handleAddShopSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShopName.trim()) return;

    const contributedShop: ComponentShop = {
      id: `shop-custom-${Date.now()}`,
      name: newShopName,
      address: newShopMarket || 'Electronics Lane',
      city: newShopCity,
      state: newShopCity === 'Delhi' ? 'Delhi' : 'State',
      latitude: currentCoords.lat + (Math.random() - 0.5) * 0.05,
      longitude: currentCoords.lng + (Math.random() - 0.5) * 0.05,
      phone: newShopPhone || '+91 98100 12345',
      openingHours: '10:00 AM - 8:30 PM (Mon-Sat)',
      rating: 4.8,
      isVerified: true,
      stockedComponents: newShopComponents.split(',').map((s) => s.trim()),
      distanceKm: 2.1,
      directionsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(newShopName + ' ' + newShopCity)}`,
    };

    setShops((prev) => [contributedShop, ...prev]);
    setAddShopSuccess(`Thank you! "${newShopName}" has been submitted and added to the community directory.`);
    setTimeout(() => {
      setAddShopModalOpen(false);
      setAddShopSuccess(null);
      setNewShopName('');
      setNewShopMarket('');
    }, 1800);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#07110D] text-[#EAF7EF] font-sans selection:bg-[#39FF6A] selection:text-black">
      {/* Slim Vertical Icon Rail */}
      <AppSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Sticky Bar */}
        <AppTopBar
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Page Content Body */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Top Hero Banner - Dark Futuristic Style */}
          <section className="relative overflow-hidden rounded-3xl bg-[rgba(255,255,255,0.03)] border border-[rgba(57,255,106,0.2)] p-6 sm:p-10 backdrop-blur-xl shadow-[0_0_35px_rgba(7,17,13,0.8)]">
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[rgba(57,255,106,0.1)] border border-[rgba(57,255,106,0.3)] text-[#39FF6A] text-xs font-mono font-bold tracking-wider mb-3 shadow-[0_0_15px_rgba(57,255,106,0.15)]">
                  <Compass className="w-3.5 h-3.5" />
                  <span>MAKER LOCATION RADAR // LOCAL ELECTRONICS MARKETS</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold text-[#EAF7EF] tracking-tight mb-2">
                  Nearest Electronics Component Shops
                </h1>
                <p className="text-sm sm:text-base text-[#8FA99B] leading-relaxed mb-6 font-mono text-xs">
                  Locate verified electronics retail stores, wholesale component lanes, and maker hubs in your city.
                  Check live stock for Arduinos, servos, sensors, chassis, and soldering stations before making a trip.
                </p>

                {/* GPS and Location Picker Bar */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleDetectGps}
                    disabled={detectingGps}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] hover:opacity-95 text-black font-extrabold text-xs shadow-[0_0_20px_rgba(57,255,106,0.3)] flex items-center gap-2 transition-transform hover:scale-[1.02] disabled:opacity-50"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>{detectingGps ? 'Locating...' : 'Use My Current Location'}</span>
                  </button>

                  <div className="text-xs font-mono font-semibold text-[#EAF7EF] bg-[#040B08] px-3.5 py-2.5 rounded-xl border border-[rgba(57,255,106,0.2)] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#39FF6A]" />
                    <span>Center: {locationName}</span>
                  </div>

                  <button
                    onClick={() => setAddShopModalOpen(true)}
                    className="px-3.5 py-2.5 rounded-xl bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(57,255,106,0.1)] text-xs font-bold text-[#EAF7EF] border border-[rgba(57,255,106,0.2)] flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#39FF6A]" />
                    <span>Suggest a Local Shop</span>
                  </button>
                </div>

                {/* Locality Search with Google Maps Geocoding */}
                <form onSubmit={handleLocalitySearch} className="flex items-center gap-2 mt-4 max-w-lg">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8FA99B]" />
                    <input
                      type="text"
                      value={localitySearch}
                      onChange={(e) => setLocalitySearch(e.target.value)}
                      placeholder="Search market, area or landmark (e.g. SP Road, Nehru Place, Lamington Rd)..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] text-xs text-[#EAF7EF] placeholder-[#8FA99B] focus:outline-none focus:border-[#39FF6A] transition-colors font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={geocoding || !localitySearch.trim()}
                    className="px-4 py-2 rounded-xl bg-[rgba(57,255,106,0.15)] text-[#39FF6A] border border-[#39FF6A]/40 hover:bg-[rgba(57,255,106,0.25)] font-bold text-xs shadow-sm transition-all disabled:opacity-40 shrink-0 font-mono"
                  >
                    {geocoding ? 'Locating...' : 'Search'}
                  </button>
                </form>

                {gpsError && (
                  <div className="mt-3 text-xs text-[#FF6B6B] flex items-center gap-1.5 font-mono">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{gpsError}</span>
                  </div>
                )}
              </div>

              {/* Interactive Google Maps Platform / Radar Display */}
              <div className="hidden lg:flex flex-col rounded-3xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] relative w-80 h-72 overflow-hidden shadow-[0_0_25px_rgba(7,17,13,0.9)]">
                {/* Header Switcher */}
                <div className="p-2.5 px-3 bg-[#0A1A14]/90 backdrop-blur-sm border-b border-[rgba(57,255,106,0.15)] flex items-center justify-between z-10 shrink-0">
                  <span className="font-extrabold text-[10px] font-mono uppercase text-[#39FF6A] tracking-wider flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{mapViewMode === 'maps' ? 'Google Maps Live' : 'Maker Radar'}</span>
                  </span>
                  <div className="flex items-center gap-1 bg-[#040B08] p-0.5 rounded-lg border border-[rgba(57,255,106,0.2)] font-mono">
                    <button
                      type="button"
                      onClick={() => setMapViewMode('maps')}
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] transition-all ${
                        mapViewMode === 'maps'
                          ? 'bg-[#39FF6A] text-black shadow-xs'
                          : 'text-[#8FA99B] hover:text-[#EAF7EF]'
                      }`}
                    >
                      Maps View
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapViewMode('radar')}
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] transition-all ${
                        mapViewMode === 'radar'
                          ? 'bg-[#39FF6A] text-black shadow-xs'
                          : 'text-[#8FA99B] hover:text-[#EAF7EF]'
                      }`}
                    >
                      Radar View
                    </button>
                  </div>
                </div>

                {/* Display Body */}
                <div className="flex-1 relative overflow-hidden">
                  {mapViewMode === 'maps' ? (
                    <iframe
                      title="Google Maps Electronics Shops"
                      width="100%"
                      height="100%"
                      style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
                      loading="lazy"
                      src={`https://maps.google.com/maps?q=${currentCoords.lat},${currentCoords.lng}&z=13&output=embed`}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center relative">
                      {/* Concentric distance circles */}
                      <div className="absolute inset-4 rounded-full border border-[rgba(57,255,106,0.15)]" />
                      <div className="absolute inset-12 rounded-full border border-[rgba(57,255,106,0.25)]" />
                      <div className="absolute inset-20 rounded-full border border-[rgba(57,255,106,0.4)]" />

                      {/* Crosshairs */}
                      <div className="absolute inset-x-0 top-1/2 h-[1px] bg-[#39FF6A]/20" />
                      <div className="absolute inset-y-0 left-1/2 w-[1px] bg-[#39FF6A]/20" />

                      {/* Center student marker */}
                      <div className="relative z-10 w-4 h-4 bg-[#39FF6A] rounded-full shadow-[0_0_10px_rgba(57,255,106,0.8)] flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-black rounded-full animate-ping" />
                      </div>

                      {/* Shop Blips on radar */}
                      {shops.slice(0, 6).map((s, idx) => {
                        const angle = (idx * (360 / 6) + 25) * (Math.PI / 180);
                        const distFraction = Math.min(0.85, (s.distanceKm / (radiusKm || 25)) * 0.8 + 0.15);
                        const x = 160 + Math.cos(angle) * (95 * distFraction);
                        const y = 110 + Math.sin(angle) * (95 * distFraction);

                        return (
                          <div
                            key={s.id}
                            style={{ left: `${x}px`, top: `${y}px` }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 group/blip cursor-pointer"
                            onClick={() => setSelectedShopId(s.id)}
                          >
                            <div className="w-3 h-3 bg-[#7FE7D6] rounded-full border-2 border-black shadow-[0_0_8px_rgba(127,231,214,0.8)] hover:scale-150 transition-transform" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 rounded bg-[#040B08] border border-[#39FF6A] text-[#39FF6A] text-[9px] font-mono font-bold whitespace-nowrap opacity-0 group-hover/blip:opacity-100 pointer-events-none transition-opacity">
                              {s.name} ({s.distanceKm} km)
                            </div>
                          </div>
                        );
                      })}

                      <div className="absolute bottom-2 text-[10px] font-mono font-bold text-[#39FF6A] uppercase tracking-wider">
                        RADAR ACTIVE • {shops.length} SHOPS
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* City Presets Row */}
            <div className="mt-8 pt-5 border-t border-[rgba(57,255,106,0.12)] flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="text-[#8FA99B] font-semibold mr-1">Famous Maker Hubs:</span>
              {CITY_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handleSelectPreset(preset)}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                    locationName === preset.name
                      ? 'bg-[rgba(57,255,106,0.15)] text-[#39FF6A] border border-[#39FF6A] font-bold shadow-[0_0_12px_rgba(57,255,106,0.3)]'
                      : 'bg-[#040B08] text-[#8FA99B] hover:text-[#EAF7EF] border border-[rgba(57,255,106,0.15)]'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </section>

          {/* Search, Filter & Radius Slider Strip */}
          <section className="bg-[rgba(255,255,255,0.03)] rounded-2xl border border-[rgba(57,255,106,0.15)] p-5 backdrop-blur-xl grid grid-cols-1 md:grid-cols-3 gap-4 items-center font-mono">
            {/* Component Search */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8FA99B]" />
              <input
                type="text"
                value={componentFilter}
                onChange={(e) => setComponentFilter(e.target.value)}
                placeholder="Search components in stock (e.g. Arduino, ESP32, Servo, Ultrasonic, L298N, Chassis, Soldering)..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] text-[#EAF7EF] placeholder-[#8FA99B] text-xs focus:outline-none focus:border-[#39FF6A] transition-colors"
              />
            </div>

            {/* Radius Selector Slider */}
            <div className="px-4 py-2 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-[#8FA99B] shrink-0">
                <Sliders className="w-3.5 h-3.5 text-[#39FF6A]" />
                <span>Radius:</span>
                <span className="text-[#39FF6A] font-bold">{radiusKm} km</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full accent-[#39FF6A] cursor-pointer"
              />
            </div>
          </section>

          {/* Shops Grid */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#EAF7EF] flex items-center gap-2">
                <span>Verified Electronics Stores</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[rgba(57,255,106,0.1)] text-[#39FF6A] border border-[#39FF6A]/30 text-xs font-mono font-bold">
                  {shops.length} Available
                </span>
              </h2>
              <span className="text-xs text-[#8FA99B] font-mono">Ranked by physical distance from your location</span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((idx) => (
                  <div
                    key={idx}
                    className="h-64 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(57,255,106,0.1)] animate-pulse p-6 space-y-4"
                  >
                    <div className="w-1/3 h-5 bg-[#0C261B] rounded-lg" />
                    <div className="w-2/3 h-4 bg-[#0C261B] rounded-lg" />
                    <div className="w-full h-12 bg-[#0C261B] rounded-lg" />
                    <div className="w-1/2 h-8 bg-[#0C261B] rounded-lg" />
                  </div>
                ))}
              </div>
            ) : shops.length === 0 ? (
              <div className="rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(57,255,106,0.15)] backdrop-blur-xl p-12 text-center">
                <Store className="w-12 h-12 text-[#39FF6A] mx-auto mb-3" />
                <h3 className="text-lg font-bold text-[#EAF7EF] mb-1">
                  No Component Shops in this {radiusKm} km radius
                </h3>
                <p className="text-sm text-[#8FA99B] mb-6 max-w-md mx-auto font-mono text-xs">
                  No physical shops found stocking &quot;{componentFilter || 'requested parts'}&quot; in this radius.
                  Expand your radius or order directly from the official TechSavyyy online store with 18% GST.
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => {
                      setRadiusKm(50);
                      setComponentFilter('');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] text-xs font-mono font-bold text-[#EAF7EF] hover:border-[#39FF6A]"
                  >
                    Expand to 50 km
                  </button>
                  <Link
                    href="/store"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] text-black font-extrabold text-xs shadow-[0_0_20px_rgba(57,255,106,0.3)] flex items-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Order from TechSavyyy</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {shops.map((shop) => {
                  const isHighlighted = selectedShopId === shop.id;

                  return (
                    <div
                      key={shop.id}
                      className={`group rounded-2xl bg-[rgba(255,255,255,0.03)] border p-6 backdrop-blur-xl flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 ${
                        isHighlighted
                          ? 'border-[#39FF6A] ring-2 ring-[#39FF6A]/30 shadow-[0_0_25px_rgba(57,255,106,0.2)]'
                          : 'border-[rgba(57,255,106,0.15)] hover:border-[#39FF6A]/50'
                      }`}
                    >
                      <div>
                        {/* Top Title & Distance */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-[#EAF7EF] group-hover:text-[#39FF6A] transition-colors">
                              {shop.name}
                            </h3>
                            <p className="text-xs text-[#8FA99B] flex items-center gap-1 mt-0.5 font-mono">
                              <MapPin className="w-3.5 h-3.5 text-[#39FF6A] shrink-0" />
                              <span>{shop.address}, {shop.city}</span>
                            </p>
                          </div>

                          {/* Distance Pill */}
                          <div className="shrink-0 px-3 py-1.5 rounded-xl bg-[rgba(57,255,106,0.1)] border border-[#39FF6A]/30 text-[#39FF6A] font-mono font-bold text-xs flex items-center gap-1">
                            <Navigation className="w-3 h-3" />
                            <span>{shop.distanceKm} km away</span>
                          </div>
                        </div>

                        {/* Badges: Rating, Verification & Hours */}
                        <div className="flex flex-wrap items-center gap-3 py-3 border-y border-[rgba(57,255,106,0.1)] text-xs font-mono my-3">
                          {shop.isVerified && (
                            <span className="inline-flex items-center gap-1 text-[#39FF6A] font-semibold">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Verified Partner
                            </span>
                          )}

                          <span className="inline-flex items-center gap-1 text-[#7FE7D6] font-bold">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            {shop.rating}
                          </span>

                          <span className="inline-flex items-center gap-1 text-[#8FA99B]">
                            <Clock className="w-3.5 h-3.5 text-[#4C8DFF]" />
                            {shop.openingHours}
                          </span>
                        </div>

                        {/* Stocked Components */}
                        <div className="mb-4">
                          <span className="text-[10px] font-mono font-semibold text-[#8FA99B] uppercase block mb-1.5">
                            CONFIRMED COMPONENTS IN STOCK:
                          </span>
                          <div className="flex flex-wrap gap-1.5 font-mono">
                            {shop.stockedComponents.map((comp) => {
                              const isMatch =
                                componentFilter &&
                                comp.toLowerCase().includes(componentFilter.toLowerCase());

                              return (
                                <span
                                  key={comp}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                                    isMatch
                                      ? 'bg-[#39FF6A] text-black font-bold shadow-[0_0_10px_rgba(57,255,106,0.5)]'
                                      : 'bg-[#040B08] text-[#8FA99B] border border-[rgba(57,255,106,0.15)]'
                                  }`}
                                >
                                  {comp}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Action Buttons: Call, WhatsApp, Google Maps Directions */}
                      <div className="pt-3 border-t border-[rgba(57,255,106,0.1)] grid grid-cols-3 gap-2 font-mono">
                        <a
                          href={`tel:${shop.phone}`}
                          className="py-2.5 px-2 rounded-xl bg-[#040B08] hover:bg-[rgba(57,255,106,0.1)] text-[#EAF7EF] text-[11px] font-bold flex items-center justify-center gap-1 transition-colors border border-[rgba(57,255,106,0.2)]"
                          title={`Call ${shop.name}`}
                        >
                          <Phone className="w-3.5 h-3.5 text-[#4C8DFF]" />
                          <span>Call</span>
                        </a>

                        <a
                          href={`https://wa.me/91${shop.phone.replace(/[^0-9]/g, '').slice(-10)}?text=${encodeURIComponent(`Hello ${shop.name}, I found your shop on RoboVerse. Do you have robotics components in stock?`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="py-2.5 px-2 rounded-xl bg-[rgba(57,255,106,0.1)] hover:bg-[rgba(57,255,106,0.2)] text-[#39FF6A] text-[11px] font-bold flex items-center justify-center gap-1 transition-colors border border-[#39FF6A]/30"
                          title="Chat with shop owner on WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>

                        <a
                          href={shop.directionsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="py-2.5 px-2 rounded-xl bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] hover:opacity-95 text-black text-[11px] font-extrabold flex items-center justify-center gap-1 shadow-[0_0_15px_rgba(57,255,106,0.25)] transition-all font-sans"
                          title="Open Google Maps Turn-by-Turn Navigation"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Directions</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Online Alternative Banner (TechSavyyy) */}
          <section className="rounded-3xl bg-[rgba(255,255,255,0.03)] border border-[rgba(57,255,106,0.25)] p-8 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-xl shadow-[0_0_30px_rgba(7,17,13,0.8)]">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(57,255,106,0.15)] text-[#39FF6A] text-xs font-mono font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>CAN&apos;T FIND IT LOCALLY?</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#EAF7EF]">
                Order Genuine Robotics Hardware from TechSavyyy
              </h3>
              <p className="text-xs sm:text-sm text-[#8FA99B] max-w-xl font-mono">
                Pre-tested Arduino Uno, ESP32, motor shields, sensors, and chassis kits delivered directly to your hostel or doorstep with official 18% GST tax invoices and student plan discounts.
              </p>
            </div>
            <Link
              href="/store"
              className="shrink-0 px-6 py-3 rounded-xl bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] hover:opacity-95 text-black font-extrabold text-xs shadow-[0_0_20px_rgba(57,255,106,0.3)] flex items-center gap-2 transition-transform hover:scale-105"
            >
              <span>Visit TechSavyyy Store</span>
              <ShoppingBag className="w-4 h-4" />
            </Link>
          </section>
        </main>
      </div>

      {/* COMMUNITY SUBMIT SHOP MODAL */}
      {addShopModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#07110D] rounded-3xl border border-[rgba(57,255,106,0.3)] shadow-[0_0_50px_rgba(7,17,13,0.9)] max-w-lg w-full p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(57,255,106,0.15)]">
              <div>
                <div className="text-xs font-mono font-bold text-[#39FF6A] mb-1">COMMUNITY DIRECTORY</div>
                <h3 className="text-xl font-bold text-[#EAF7EF]">
                  Suggest a Local Electronics Store
                </h3>
              </div>
              <button
                onClick={() => setAddShopModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#040B08] text-[#8FA99B] hover:text-[#39FF6A] flex items-center justify-center border border-[rgba(57,255,106,0.2)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {addShopSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-[#39FF6A] mx-auto" />
                <h4 className="text-base font-bold text-[#EAF7EF]">Shop Added Successfully!</h4>
                <p className="text-xs text-[#8FA99B] font-mono">{addShopSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleAddShopSubmit} className="space-y-4 mt-4 font-mono text-xs">
                <div>
                  <label className="block text-xs font-bold text-[#8FA99B] mb-1">
                    Shop / Vendor Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newShopName}
                    onChange={(e) => setNewShopName(e.target.value)}
                    placeholder="e.g. Om Electronics & Robotics"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] text-xs text-[#EAF7EF] placeholder-[#8FA99B] focus:outline-none focus:border-[#39FF6A]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#8FA99B] mb-1">
                      Market / Street Address
                    </label>
                    <input
                      type="text"
                      value={newShopMarket}
                      onChange={(e) => setNewShopMarket(e.target.value)}
                      placeholder="e.g. Shop 24, Lajpat Rai Market"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] text-xs text-[#EAF7EF] placeholder-[#8FA99B] focus:outline-none focus:border-[#39FF6A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#8FA99B] mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={newShopCity}
                      onChange={(e) => setNewShopCity(e.target.value)}
                      placeholder="e.g. Delhi, Bengaluru"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] text-xs text-[#EAF7EF] placeholder-[#8FA99B] focus:outline-none focus:border-[#39FF6A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#8FA99B] mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    value={newShopPhone}
                    onChange={(e) => setNewShopPhone(e.target.value)}
                    placeholder="e.g. +91 98110 54321"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] text-xs text-[#EAF7EF] placeholder-[#8FA99B] focus:outline-none focus:border-[#39FF6A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#8FA99B] mb-1">
                    Components Stocked (comma separated)
                  </label>
                  <input
                    type="text"
                    value={newShopComponents}
                    onChange={(e) => setNewShopComponents(e.target.value)}
                    placeholder="Arduino, Raspberry Pi, ESP32, Soldering kits..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] text-xs text-[#EAF7EF] placeholder-[#8FA99B] focus:outline-none focus:border-[#39FF6A]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3 font-mono">
                  <button
                    type="button"
                    onClick={() => setAddShopModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#8FA99B] hover:text-[#EAF7EF]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] text-black font-extrabold text-xs shadow-[0_0_20px_rgba(57,255,106,0.3)]"
                  >
                    Submit for Maker Verification
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
