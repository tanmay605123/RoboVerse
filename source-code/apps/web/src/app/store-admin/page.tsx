'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Logo } from '../../components/brand/Logo';
import { useAuthStore } from '../../store/useAuthStore';
import {
  ShoppingBag,
  Package,
  AlertTriangle,
  Truck,
  DollarSign,
  Search,
  Filter,
  Plus,
  ShieldAlert,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Layers,
  BatteryCharging,
  Plane,
} from 'lucide-react';

interface ProductItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  priceInr: number;
  mrpInr: number;
  gstPercent: number;
  stock: number;
  shippingClass: 'standard' | 'battery' | 'regulated_drone';
  ageRestricted: boolean;
  isActive: boolean;
}

const MOCK_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-1',
    sku: 'TS-ARD-UNO-R3',
    name: 'Arduino Uno R3 Compatible Board (DIP ATmega328P)',
    category: 'Microcontrollers',
    priceInr: 499,
    mrpInr: 650,
    gstPercent: 18,
    stock: 142,
    shippingClass: 'standard',
    ageRestricted: false,
    isActive: true,
  },
  {
    id: 'prod-2',
    sku: 'TS-ESP32-DEV-V1',
    name: 'ESP32 NodeMCU Wi-Fi + BLE Dev Board',
    category: 'Microcontrollers',
    priceInr: 399,
    mrpInr: 550,
    gstPercent: 18,
    stock: 89,
    shippingClass: 'standard',
    ageRestricted: false,
    isActive: true,
  },
  {
    id: 'prod-3',
    sku: 'TS-BATT-18650-2500',
    name: '18650 Li-ion 3.7V 2500mAh High-Drain Cell',
    category: 'Power & Batteries',
    priceInr: 180,
    mrpInr: 250,
    gstPercent: 18,
    stock: 6, // Low stock!
    shippingClass: 'battery',
    ageRestricted: true,
    isActive: true,
  },
  {
    id: 'prod-4',
    sku: 'TS-DRV-L298N',
    name: 'L298N Dual H-Bridge DC Stepper Motor Driver',
    category: 'Actuators & Motors',
    priceInr: 160,
    mrpInr: 220,
    gstPercent: 18,
    stock: 58,
    shippingClass: 'standard',
    ageRestricted: false,
    isActive: true,
  },
  {
    id: 'prod-5',
    sku: 'TS-MOT-BLDC-2212',
    name: '2212 920KV Brushless DC Motor for Quadcopters',
    category: 'Drones & UAV',
    priceInr: 720,
    mrpInr: 950,
    gstPercent: 18,
    stock: 24,
    shippingClass: 'regulated_drone',
    ageRestricted: true,
    isActive: true,
  },
  {
    id: 'prod-6',
    sku: 'TS-SRV-SG90',
    name: 'SG90 9g Micro Servo Motor with Horns',
    category: 'Actuators & Motors',
    priceInr: 110,
    mrpInr: 150,
    gstPercent: 18,
    stock: 4, // Low stock!
    shippingClass: 'standard',
    ageRestricted: false,
    isActive: true,
  },
  {
    id: 'prod-7',
    sku: 'TS-KIT-ROOKIE-01',
    name: 'RoboVerse Rookie Arduino Starter Kit (35 Parts)',
    category: 'Kits',
    priceInr: 1499,
    mrpInr: 2199,
    gstPercent: 18,
    stock: 35,
    shippingClass: 'standard',
    ageRestricted: false,
    isActive: true,
  },
];

export default function StoreAdminPage() {
  const { profile } = useAuthStore();
  const [products, setProducts] = useState<ProductItem[]>(MOCK_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showAgeRestrictionInfo, setShowAgeRestrictionInfo] = useState(true);

  const toggleAgeRestriction = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ageRestricted: !p.ageRestricted } : p))
    );
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-[#05100B] text-robo-text flex flex-col font-sans selection:bg-robo-neon selection:text-black">
      {/* Top Navbar */}
      <header className="h-16 px-6 bg-[#040C08]/90 border-b border-robo-borderSubtle flex items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Logo variant="horizontal" size="sm" />
          <div className="h-5 w-px bg-robo-borderSubtle hidden sm:block" />
          <span className="text-xs font-mono font-bold text-robo-teal hidden sm:flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-robo-neon" />
            TECHSAVYYY STORE OPS // INVENTORY & LOGISTICS
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/store"
            className="px-3 py-1.5 rounded-xl bg-robo-surfaceRaised border border-robo-borderSubtle text-xs font-mono text-robo-textSecondary hover:text-robo-text transition-colors"
          >
            Public Storefront
          </Link>
          <div className="w-8 h-8 rounded-lg bg-robo-orange/20 border border-robo-orange/40 flex items-center justify-center text-xs font-mono font-bold text-robo-orange">
            {profile?.fullName?.charAt(0) || 'S'}
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl glass-panel border border-robo-borderSubtle bg-[#040E0A]">
            <div className="flex items-center justify-between text-xs font-mono text-robo-textMuted mb-2">
              <span>ACTIVE SKUS</span>
              <Package className="w-4 h-4 text-robo-teal" />
            </div>
            <div className="text-2xl font-mono font-bold text-robo-neon">60+ Parts & Kits</div>
            <div className="text-xs text-robo-textSecondary mt-1">Free 2D/3D & Physical Hardware</div>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-robo-borderSubtle bg-[#040E0A]">
            <div className="flex items-center justify-between text-xs font-mono text-robo-textMuted mb-2">
              <span>LOW STOCK ALERTS</span>
              <AlertTriangle className="w-4 h-4 text-robo-orange" />
            </div>
            <div className="text-2xl font-mono font-bold text-robo-orange">2 Items Low</div>
            <div className="text-xs text-robo-textSecondary mt-1">18650 Cells & SG90 Servos</div>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-robo-borderSubtle bg-[#040E0A]">
            <div className="flex items-center justify-between text-xs font-mono text-robo-textMuted mb-2">
              <span>ORDERS IN QUEUE</span>
              <Truck className="w-4 h-4 text-robo-neon" />
            </div>
            <div className="text-2xl font-mono font-bold text-robo-text">7 Pending</div>
            <div className="text-xs text-robo-teal mt-1">Razorpay Verified Payments</div>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-robo-borderSubtle bg-[#040E0A]">
            <div className="flex items-center justify-between text-xs font-mono text-robo-textMuted mb-2">
              <span>STORE REVENUE (MTD)</span>
              <DollarSign className="w-4 h-4 text-robo-teal" />
            </div>
            <div className="text-2xl font-mono font-bold text-robo-teal">₹1,48,250</div>
            <div className="text-xs text-robo-textSecondary mt-1">All Prices GST-Inclusive (18%)</div>
          </div>
        </div>

        {/* Regulatory Banner */}
        {showAgeRestrictionInfo && (
          <div className="p-4 rounded-2xl bg-[#040E0A] border border-robo-orange/40 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-robo-orange shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-robo-text font-mono">
                  DPDP & DGCA SAFETY COMPLIANCE ENFORCEMENT
                </h4>
                <p className="text-xs text-robo-textSecondary mt-1 leading-relaxed">
                  Products with shipping class <code className="text-robo-teal font-mono">regulated_drone</code> or <code className="text-robo-teal font-mono">battery</code> (high-capacity LiPo/Li-ion) automatically mandate verified parental consent for minors under 18 years before Razorpay checkout creation.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAgeRestrictionInfo(false)}
              className="text-xs font-mono text-robo-textMuted hover:text-robo-text shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Inventory Table Container */}
        <div className="rounded-2xl glass-panel p-6 border border-robo-borderSubtle space-y-5 bg-[#040D09]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-robo-borderSubtle/60 pb-4">
            <div>
              <h3 className="text-base font-bold text-robo-text font-sans flex items-center gap-2">
                <Package className="w-5 h-5 text-robo-neon" />
                <span>TechSavyyy Hardware Catalog & Stock Control</span>
              </h3>
              <p className="text-xs text-robo-textSecondary mt-0.5">
                Manage unit pricing, stock levels, GST slab percentages, and shipping logistics classifications.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-black/60 border border-robo-borderSubtle rounded-xl px-3 py-1.5 text-xs text-robo-text font-mono focus:border-robo-neon outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="Microcontrollers">Microcontrollers</option>
                <option value="Actuators & Motors">Actuators & Motors</option>
                <option value="Power & Batteries">Power & Batteries</option>
                <option value="Drones & UAV">Drones & UAV</option>
                <option value="Kits">Kits</option>
              </select>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 border border-robo-borderSubtle text-xs text-robo-text flex-1 sm:flex-none">
                <Search className="w-3.5 h-3.5 text-robo-textMuted" />
                <input
                  type="text"
                  placeholder="Search SKU or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs text-robo-text placeholder:text-robo-textMuted focus:outline-none w-36"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="text-[11px] font-mono text-robo-textMuted border-b border-robo-borderSubtle/60 uppercase">
                <tr>
                  <th className="pb-3 px-3">Product / SKU</th>
                  <th className="pb-3 px-3">Category</th>
                  <th className="pb-3 px-3">Price (Inc. GST)</th>
                  <th className="pb-3 px-3">Stock Level</th>
                  <th className="pb-3 px-3">Shipping Class</th>
                  <th className="pb-3 px-3">Age Restrict</th>
                  <th className="pb-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-robo-borderSubtle/30">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-robo-surfaceRaised/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-robo-text">{prod.name}</div>
                      <div className="text-[10px] font-mono text-robo-teal">{prod.sku}</div>
                    </td>
                    <td className="py-3 px-3 text-robo-textSecondary">
                      {prod.category}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-robo-neon">₹{prod.priceInr}</div>
                      <div className="text-[10px] font-mono text-robo-textMuted line-through">₹{prod.mrpInr}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2 font-mono">
                        <span
                          className={`font-bold ${
                            prod.stock < 10 ? 'text-robo-orange animate-pulse' : 'text-robo-text'
                          }`}
                        >
                          {prod.stock} units
                        </span>
                        {prod.stock < 10 && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-robo-orange/20 text-robo-orange border border-robo-orange/40">
                            LOW
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-black/60 border border-robo-borderSubtle text-[10px] font-mono text-robo-teal inline-flex items-center gap-1">
                        {prod.shippingClass === 'battery' && <BatteryCharging className="w-3 h-3 text-robo-orange" />}
                        {prod.shippingClass === 'regulated_drone' && <Plane className="w-3 h-3 text-robo-orange" />}
                        {prod.shippingClass.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => toggleAgeRestriction(prod.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors ${
                          prod.ageRestricted
                            ? 'bg-robo-orange/20 text-robo-orange border-robo-orange/40'
                            : 'bg-black/50 text-robo-textMuted border-robo-borderSubtle'
                        }`}
                      >
                        {prod.ageRestricted ? '18+ REQUIRED' : 'OPEN'}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-robo-neon/15 text-robo-neon border border-robo-neon/40 font-bold">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
