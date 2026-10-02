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
];

export default function ShopsPage() {
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: 28.6315, // Default New Delhi
    lng: 77.2167,
  });
  const [locationName, setLocationName] = useState('New Delhi (Connaught Place)');
  const [radiusKm, setRadiusKm] = useState(25);
  const [componentFilter, setComponentFilter] = useState('');
  const [shops, setShops] = useState<ComponentShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Fetch nearby shops
  useEffect(() => {
    async function fetchShops() {
      setLoading(true);
      const params = new URLSearchParams({
        lat: currentCoords.lat.toString(),
        lng: currentCoords.lng.toString(),
        radiusKm: radiusKm.toString(),
      });
      if (componentFilter.trim()) {
        params.append('component', componentFilter.trim());
      }

      const res = await apiRequest(`/shops/nearby?${params.toString()}`);
      if (res.success && res.data) {
        setShops(res.data.shops || []);
      }
      setLoading(false);
    }

    fetchShops();
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
        setLocationName(`Current Location (${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)})`);
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

  return (
    <div className="min-h-screen bg-[#05100B] text-robo-text font-sans selection:bg-robo-neon selection:text-black">
      <Navbar />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
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
              </div>

              {gpsError && (
                <div className="mt-3 text-xs text-robo-accentOrange flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{gpsError}</span>
                </div>
              )}
            </div>

            {/* Radar Mini-HUD Display */}
            <div className="hidden lg:flex flex-col items-center justify-center p-6 rounded-2xl bg-black/60 border border-robo-neon/30 relative w-64 h-64 overflow-hidden shadow-neon-subtle">
              {/* Concentric rings */}
              <div className="absolute inset-4 rounded-full border border-robo-neon/20" />
              <div className="absolute inset-10 rounded-full border border-robo-neon/30" />
              <div className="absolute inset-16 rounded-full border border-robo-teal/30" />
              <div className="absolute inset-24 rounded-full border border-robo-neon/40" />

              {/* Crosshair lines */}
              <div className="absolute inset-x-0 top-1/2 h-[1px] bg-robo-neon/20" />
              <div className="absolute inset-y-0 left-1/2 w-[1px] bg-robo-neon/20" />

              {/* Center blip */}
              <div className="relative z-10 w-3 h-3 bg-robo-neon rounded-full shadow-neon-glow animate-pulse" />

              {/* Scanning sweep */}
              <div
                className="absolute inset-0 origin-center bg-gradient-to-tr from-robo-neon/20 to-transparent pointer-events-none"
                style={{
                  clipPath: 'polygon(50% 50%, 100% 0, 100% 50%)',
                  animation: 'spin 4s linear infinite',
                }}
              />

              <div className="absolute bottom-3 text-[10px] font-mono text-robo-neon tracking-widest">
                RADAR ACTIVE // {shops.length} SHOPS
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
        <section className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Component Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-robo-textSecondary" />
            <input
              type="text"
              value={componentFilter}
              onChange={(e) => setComponentFilter(e.target.value)}
              placeholder="Search components in stock (e.g. Arduino, ESP32, Servo, Ultrasonic, L298N)..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-robo-surfaceRaised/90 border border-robo-borderSubtle text-white placeholder-robo-textSecondary text-sm focus:outline-none focus:border-robo-neon transition-colors"
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
              No physical shops found within {radiusKm} km stocking &quot;{componentFilter || 'components'}&quot;.
              Expand your search radius or order directly from the TechSavyyy online store.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setRadiusKm(50);
                  setComponentFilter('');
                }}
                className="px-5 py-2.5 rounded-xl bg-robo-surfaceRaised border border-robo-neon text-robo-neon text-xs font-mono font-bold hover:bg-robo-neon hover:text-black transition-colors"
              >
                Expand to 50 km
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
                        Verified Student Partner
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
                        const isMatch = componentFilter && comp.toLowerCase().includes(componentFilter.toLowerCase());
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
                <div className="pt-2 flex items-center gap-3">
                  <a
                    href={`tel:${shop.phone}`}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-robo-surfaceRaised hover:bg-robo-surfaceRaised/80 border border-robo-borderSubtle text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-robo-teal" />
                    <span>Call Store</span>
                  </a>

                  <a
                    href={shop.directionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-robo-neon hover:bg-robo-neonHover text-black text-xs font-bold flex items-center justify-center gap-1.5 shadow-neon-subtle transition-all"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Google Maps Route</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                  </a>
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
    </div>
  );
}
