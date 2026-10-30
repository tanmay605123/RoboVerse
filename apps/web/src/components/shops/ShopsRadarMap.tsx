'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Compass,
  MapPin,
  Store,
  Navigation,
  ShieldCheck,
  Star,
  ExternalLink,
  Layers,
  Radio,
} from 'lucide-react';

interface ShopLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distance_km: number;
  is_verified: boolean;
  rating: number;
  address: string;
  phone: string;
}

interface ShopsRadarMapProps {
  center: { lat: number; lng: number };
  radiusKm: number;
  shops: ShopLocation[];
  selectedShopId: string | null;
  onSelectShop: (shopId: string) => void;
}

// Dark Green Futuristic Control-Room Google Map Styles
const DARK_GREEN_MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#07110D' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#040B08' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8FA99B' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#39FF6A' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#7FE7D6' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#0A2016' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#132B20' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0E2A1F' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#1C3F2F' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#0A1B14' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#041510' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#325C4B' }],
  },
];

export const ShopsRadarMap: React.FC<ShopsRadarMapProps> = ({
  center,
  radiusKm,
  shops,
  selectedShopId,
  onSelectShop,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [useGoogleMaps, setUseGoogleMaps] = useState<boolean>(false);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState<boolean>(false);

  // Check if Google Maps JS API is available on window
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).google?.maps) {
      setGoogleMapsLoaded(true);
      setUseGoogleMaps(true);
    }
  }, []);

  // Compute 2D radar positions relative to center coordinates
  const radarPins = shops.map((shop) => {
    // 1 deg lat ~ 111km, 1 deg lng ~ 111km * cos(lat)
    const latDiffKm = (shop.latitude - center.lat) * 111.0;
    const lngDiffKm = (shop.longitude - center.lng) * 111.0 * Math.cos((center.lat * Math.PI) / 180);

    // Map into normalized percentage within radius circle
    const normRadius = Math.max(radiusKm, 1);
    const xPct = 50 + (lngDiffKm / normRadius) * 45;
    const yPct = 50 - (latDiffKm / normRadius) * 45;

    return {
      ...shop,
      xPct: Math.max(5, Math.min(95, xPct)),
      yPct: Math.max(5, Math.min(95, yPct)),
      isSelected: selectedShopId === shop.id,
    };
  });

  return (
    <div className="relative w-full h-full bg-[#040B08] overflow-hidden select-none flex items-center justify-center">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(57,255,106,0.06)_0%,transparent_75%)] pointer-events-none" />

      {/* Grid Pattern Coordinates */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(57,255,106,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(57,255,106,0.15) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* ================= RADAR HUD DISPLAY ================= */}
      <div className="relative w-full max-w-2xl aspect-square flex items-center justify-center p-4">
        {/* Concentric Range Rings */}
        <div className="absolute inset-4 rounded-full border border-[rgba(57,255,106,0.15)] flex items-center justify-center pointer-events-none">
          <span className="absolute top-2 text-[10px] font-mono text-[#8FA99B]/60">
            {radiusKm} km limit
          </span>
        </div>

        <div className="absolute inset-16 rounded-full border border-[rgba(57,255,106,0.2)] flex items-center justify-center pointer-events-none">
          <span className="absolute top-2 text-[9px] font-mono text-[#8FA99B]/50">
            {(radiusKm * 0.66).toFixed(1)} km
          </span>
        </div>

        <div className="absolute inset-32 rounded-full border border-[rgba(57,255,106,0.25)] border-dashed flex items-center justify-center pointer-events-none">
          <span className="absolute top-2 text-[9px] font-mono text-[#8FA99B]/50">
            {(radiusKm * 0.33).toFixed(1)} km
          </span>
        </div>

        {/* Orthogonal Crosshair Grid */}
        <div className="absolute inset-x-0 h-px bg-[rgba(57,255,106,0.2)] pointer-events-none" />
        <div className="absolute inset-y-0 w-px bg-[rgba(57,255,106,0.2)] pointer-events-none" />

        {/* Rotating Radar Beam Sweep */}
        <div className="absolute inset-4 rounded-full overflow-hidden pointer-events-none">
          <div className="w-full h-full origin-center animate-[spin_8s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(57,255,106,0.15)_60deg,transparent_60.5deg)]" />
        </div>

        {/* Center Marker: Student's Location */}
        <div className="relative z-20 flex flex-col items-center">
          <div className="w-5 h-5 rounded-full bg-[#39FF6A] border-4 border-[#07110D] shadow-[0_0_20px_#39FF6A] animate-pulse" />
          <div className="mt-1 px-2 py-0.5 rounded-full bg-black/80 border border-[#39FF6A]/40 text-[10px] font-mono text-[#39FF6A] font-bold">
            Your Location
          </div>
        </div>

        {/* Store Pins placed on the Radar Plane */}
        {radarPins.map((shop) => (
          <div
            key={shop.id}
            onClick={() => onSelectShop(shop.id)}
            style={{
              position: 'absolute',
              left: `${shop.xPct}%`,
              top: `${shop.yPct}%`,
              transform: 'translate(-50%, -50%)',
            }}
            className="z-30 cursor-pointer group"
          >
            {/* Pulsing ring for selected pin */}
            {shop.isSelected && (
              <span className="absolute -inset-2 rounded-full bg-[#39FF6A]/30 animate-ping" />
            )}

            <div
              className={`flex items-center gap-1.5 p-1.5 rounded-full border transition-all ${
                shop.isSelected
                  ? 'bg-[#39FF6A] text-[#07110D] border-white scale-110 shadow-[0_0_20px_#39FF6A]'
                  : shop.is_verified
                  ? 'bg-[#0E2A1F] text-[#39FF6A] border-[#39FF6A]/40 hover:border-[#39FF6A] hover:scale-105'
                  : 'bg-[#0A1611] text-[#7FE7D6] border-white/20 hover:border-[#7FE7D6]'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
            </div>

            {/* Hover Tooltip Card */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-40 w-44 p-2.5 rounded-xl bg-[#040B08]/95 border border-[rgba(57,255,106,0.3)] shadow-[0_8px_24px_rgba(0,0,0,0.8)] backdrop-blur-md pointer-events-none">
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span className="text-[#39FF6A] font-bold">{shop.distance_km} km</span>
                {shop.is_verified && (
                  <span className="text-[#39FF6A] flex items-center gap-0.5 font-bold">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
              <h5 className="text-xs font-bold text-[#EAF7EF] line-clamp-1">{shop.name}</h5>
              <p className="text-[10px] text-[#8FA99B] line-clamp-1">{shop.address}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Top Overlay Stats */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-none font-mono text-xs">
        <div className="px-3 py-1.5 rounded-xl bg-[#040B08]/90 border border-[rgba(57,255,106,0.25)] text-[#EAF7EF] flex items-center gap-2 backdrop-blur-md">
          <Radio className="w-3.5 h-3.5 text-[#39FF6A] animate-pulse" />
          <span>Maker Radar Active</span>
          <span className="text-[#8FA99B]">({shops.length} stores in {radiusKm}km)</span>
        </div>
      </div>

      {/* Bottom Switch Notice */}
      <div className="absolute bottom-4 right-4 z-20 pointer-events-none font-mono text-[10px] text-[#8FA99B]">
        <span>GPS Datum: WGS84 • PostGIS 4326</span>
      </div>
    </div>
  );
};
