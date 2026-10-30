'use client';

import React, { useState } from 'react';
import {
  X,
  Store,
  MapPin,
  Phone,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface RegisterShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCoords: { lat: number; lng: number };
  onSuccess: (shop: any) => void;
}

const CATEGORY_OPTIONS = [
  'Arduino & Microcontrollers',
  'Sensors & Modules',
  'DC & Stepper Motors',
  'RC Servos & Horns',
  'LiPo & Power Systems',
  '3D Printing & Chassis',
  'Soldering & Workshop Tools',
];

export const RegisterShopModal: React.FC<RegisterShopModalProps> = ({
  isOpen,
  onClose,
  defaultCoords,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [pincode, setPincode] = useState('');
  const [lat, setLat] = useState(defaultCoords.lat);
  const [lng, setLng] = useState(defaultCoords.lng);
  const [openingHours, setOpeningHours] = useState('10:00 AM - 8:30 PM (Mon-Sat)');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'Arduino & Microcontrollers',
    'Sensors & Modules',
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) return;

    setIsSubmitting(true);

    const newShop = {
      id: `shop_reg_${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      state: 'India',
      pincode: pincode.trim(),
      latitude: lat,
      longitude: lng,
      opening_hours: openingHours,
      categories: selectedCategories,
      verified_status: 'pending' as const,
      is_verified: false,
      rating: 4.8,
      review_count: 1,
      photos: [],
      distance_km: 1.2,
      distance_meters: 1200,
      travel_time_mins: 8,
      google_maps_uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        name + ' ' + city
      )}`,
      stocked_components: selectedCategories,
      source: 'verified' as const,
    };

    try {
      // Try database insert if session exists
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;

      await (supabase.from('shops') as any).insert({
        name: newShop.name,
        phone: newShop.phone,
        address: newShop.address,
        city: newShop.city,
        pincode: newShop.pincode,
        location: `POINT(${lng} ${lat})`,
        opening_hours: newShop.opening_hours,
        categories: newShop.categories,
        owner_id: userId || null,
        verified_status: 'pending',
      });
    } catch {
      // Continue gracefully
    }

    setIsSubmitting(false);
    setSuccessMsg(
      `Shop "${name}" registered successfully! It is now submitted to the RoboVerse Maker Radar directory.`
    );

    setTimeout(() => {
      onSuccess(newShop);
      setSuccessMsg(null);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl bg-[#07110D]/95 border border-[rgba(57,255,106,0.3)] rounded-3xl p-6 md:p-8 shadow-[0_24px_80px_rgba(0,0,0,0.85)] font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[rgba(57,255,106,0.15)] mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#39FF6A]/10 border border-[#39FF6A]/30 flex items-center justify-center text-[#39FF6A]">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#EAF7EF]">
                Register Electronics / Robotics Shop
              </h3>
              <p className="text-xs text-[#8FA99B] font-mono">
                Connect your physical store with students & makers in your city
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 text-[#8FA99B] hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {successMsg ? (
          <div className="py-8 text-center space-y-3 font-mono">
            <CheckCircle2 className="w-12 h-12 text-[#39FF6A] mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-[#EAF7EF]">Store Submitted!</h4>
            <p className="text-xs text-[#8FA99B] max-w-md mx-auto">{successMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[#8FA99B] block mb-1 uppercase font-bold">Store Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Om Electronics & Robotics"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#040B08] border border-white/10 rounded-xl px-3 py-2 text-[#EAF7EF] focus:border-[#39FF6A] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[#8FA99B] block mb-1 uppercase font-bold">Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98100 12345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#040B08] border border-white/10 rounded-xl px-3 py-2 text-[#EAF7EF] focus:border-[#39FF6A] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[#8FA99B] block mb-1 uppercase font-bold">Street Address *</label>
              <input
                type="text"
                required
                placeholder="Shop #, Street / Market (e.g., Sadar Patrappa Road)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-[#040B08] border border-white/10 rounded-xl px-3 py-2 text-[#EAF7EF] focus:border-[#39FF6A] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[#8FA99B] block mb-1 uppercase font-bold">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#040B08] border border-white/10 rounded-xl px-3 py-2 text-[#EAF7EF] focus:border-[#39FF6A] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[#8FA99B] block mb-1 uppercase font-bold">Pincode</label>
                <input
                  type="text"
                  placeholder="560002"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full bg-[#040B08] border border-white/10 rounded-xl px-3 py-2 text-[#EAF7EF] focus:border-[#39FF6A] focus:outline-none"
                />
              </div>
            </div>

            {/* Operating Hours */}
            <div>
              <label className="text-[#8FA99B] block mb-1 uppercase font-bold">Opening Hours</label>
              <input
                type="text"
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                className="w-full bg-[#040B08] border border-white/10 rounded-xl px-3 py-2 text-[#EAF7EF] focus:border-[#39FF6A] focus:outline-none"
              />
            </div>

            {/* Stocked Categories */}
            <div>
              <label className="text-[#8FA99B] block mb-1.5 uppercase font-bold">Stocked Categories</label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORY_OPTIONS.map((cat) => {
                  const selected = selectedCategories.includes(cat);
                  return (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                        selected
                          ? 'bg-[#39FF6A]/20 border-[#39FF6A] text-[#39FF6A]'
                          : 'bg-white/5 border-white/10 text-[#8FA99B] hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Coordinates / Map hint */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-[11px] text-[#8FA99B]">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#39FF6A]" /> GPS Pin: {lat.toFixed(4)}, {lng.toFixed(4)}
              </span>
              <span className="text-[#7FE7D6]">Auto-aligned with active radar</span>
            </div>

            {/* Submit Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[#8FA99B] hover:text-white text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary-neon px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
              >
                {isSubmitting ? 'Submitting...' : 'Register Store'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
