'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCircuitStore } from '@/store/useCircuitStore';
import { useAuthStore } from '@/store/useAuthStore';
import { PlanTier } from '@roboverse/shared';
import {
  Download,
  ShoppingCart,
  MapPin,
  CheckCircle2,
  Package,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const COMPONENT_PRICES_INR: Record<string, number> = {
  arduino_uno: 450,
  arduino_nano: 280,
  esp32_devkit: 420,
  led_red: 5,
  led_green: 5,
  resistor_220: 2,
  resistor_10k: 2,
  potentiometer_10k: 25,
  push_button: 8,
  breadboard_half: 120,
  servo_sg90: 105,
  sensor_ultrasonic_hcsr04: 99,
  sensor_pir_hc_sr501: 120,
  battery_9v: 45,
  motor_dc_tt: 60,
  buzzer_active: 20,
};

export const ComponentListView: React.FC = () => {
  const { components, wires } = useCircuitStore();
  const { planTier } = useAuthStore();
  const [addedToCart, setAddedToCart] = useState(false);

  // Group components by type
  const grouped: Record<
    string,
    {
      name: string;
      qty: number;
      refs: string[];
      unitPrice: number;
      inStock: boolean;
      typeId: string;
    }
  > = {};

  // Reference counters
  const counters: Record<string, number> = {
    U: 0,
    R: 0,
    D: 0,
    BAT: 0,
    SW: 0,
    SERVO: 0,
    PING: 0,
    POT: 0,
    BB: 0,
  };

  components.forEach((c) => {
    let prefix = 'U';
    if (c.typeId.includes('resistor')) prefix = 'R';
    else if (c.typeId.includes('led')) prefix = 'D';
    else if (c.typeId.includes('battery')) prefix = 'BAT';
    else if (c.typeId.includes('push') || c.typeId.includes('switch')) prefix = 'SW';
    else if (c.typeId.includes('servo')) prefix = 'SERVO';
    else if (c.typeId.includes('ultrasonic')) prefix = 'PING';
    else if (c.typeId.includes('potentiometer')) prefix = 'POT';
    else if (c.typeId.includes('breadboard')) prefix = 'BB';

    counters[prefix] = (counters[prefix] || 0) + 1;
    const refName = `${prefix}${counters[prefix]}`;

    const key = c.typeId;
    if (!grouped[key]) {
      grouped[key] = {
        name: c.name,
        qty: 1,
        refs: [refName],
        unitPrice: COMPONENT_PRICES_INR[key] || 25,
        inStock: true,
        typeId: key,
      };
    } else {
      grouped[key].qty += 1;
      grouped[key].refs.push(refName);
    }
  });

  // Include jumper wires if wires exist
  if (wires.length > 0) {
    grouped['jumper_wires'] = {
      name: `Male-to-Male Jumper Wires (${wires.length}x Multi-Color)`,
      qty: 1,
      refs: ['W1-W' + wires.length],
      unitPrice: 40,
      inStock: true,
      typeId: 'jumper_wires',
    };
  }

  const items = Object.values(grouped);
  const subtotal = items.reduce((acc, item) => acc + item.qty * item.unitPrice, 0);

  // Plan discount (5% for Plus, 10% for Pro)
  const discountPct = planTier === PlanTier.PRO ? 10 : planTier === PlanTier.PLUS ? 5 : 0;
  const discountAmount = Math.round((subtotal * discountPct) / 100);
  const total = subtotal - discountAmount;

  // CSV Export
  const handleDownloadCsv = () => {
    const header = 'Name,Quantity,Component Refs,Estimated Price (INR),Availability in TechSavyyy\n';
    const rows = items
      .map(
        (i) =>
          `"${i.name}",${i.qty},"${i.refs.join(', ')}",₹${i.qty * i.unitPrice},In Stock`
      )
      .join('\n');
    const footer = `\nTotal (Incl. 18% GST),,,₹${total},\n`;

    const blob = new Blob([header + rows + footer], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roboverse-bom-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBuyAll = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  return (
    <div className="w-full h-full bg-[#07110D] p-4 md:p-8 overflow-auto select-none font-sans text-[#EAF7EF]">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-[rgba(255,255,255,0.03)] p-6 border border-[rgba(57,255,106,0.15)] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div>
            <h2 className="text-xl font-black text-[#EAF7EF]">Component List</h2>
            <p className="text-xs text-[#8FA99B] mt-1 font-mono">
              Bill of Materials (BOM) grouped by reference designator with live store availability
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Download CSV Button */}
            <button
              onClick={handleDownloadCsv}
              className="btn-secondary-white flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-bold"
            >
              <Download className="w-4 h-4 text-[#39FF6A]" />
              <span>Download CSV</span>
            </button>

            {/* Buy All Parts in TechSavyyy Store */}
            <button
              onClick={handleBuyAll}
              className="btn-primary-neon flex items-center gap-1.5 px-5 py-2 text-xs font-mono font-bold shadow-neon-pill"
            >
              {addedToCart ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#07110D]" />
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>Buy All Parts (₹{total})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Component List Table */}
        <div className="rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(57,255,106,0.15)] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono">
              <thead>
                <tr className="bg-[#040B08] border-b border-[rgba(57,255,106,0.15)] text-[11px] font-bold uppercase tracking-wider text-[#8FA99B]">
                  <th className="py-3.5 px-6">Name</th>
                  <th className="py-3.5 px-4 text-center">Quantity</th>
                  <th className="py-3.5 px-6">Component (Reference)</th>
                  <th className="py-3.5 px-6 text-right">Est. Price (₹)</th>
                  <th className="py-3.5 px-6 text-center">TechSavyyy Store</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(57,255,106,0.1)] text-xs">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#8FA99B]">
                      No components placed yet. Drag components from the palette onto the canvas.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr
                      key={item.typeId}
                      className="hover:bg-[rgba(57,255,106,0.05)] transition-colors"
                    >
                      <td className="py-4 px-6 font-bold text-[#EAF7EF]">
                        {item.name}
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-[#39FF6A]">
                        {item.qty}
                      </td>
                      <td className="py-4 px-6 text-xs text-[#CBD8D0]">
                        {item.refs.join(', ')}
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-[#EAF7EF]">
                        ₹{item.qty * item.unitPrice}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[rgba(57,255,106,0.12)] text-[#39FF6A] border border-[rgba(57,255,106,0.25)]">
                          <CheckCircle2 className="w-3 h-3" /> In Stock
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pricing Summary & Local Shop Finder Footer */}
          <div className="p-6 bg-[#040B08]/90 border-t border-[rgba(57,255,106,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
            <div className="flex items-center gap-2">
              <Link
                href="/shops"
                className="btn-secondary-white flex items-center gap-2 px-4 py-2 text-xs font-bold"
              >
                <MapPin className="w-4 h-4 text-[#4C8DFF]" />
                <span>Find in Nearby Component Shops</span>
              </Link>
            </div>

            <div className="text-right space-y-1">
              {discountPct > 0 && (
                <p className="text-xs text-[#8FA99B]">
                  {planTier} Discount ({discountPct}%):{' '}
                  <span className="text-[#39FF6A] font-bold">-₹{discountAmount}</span>
                </p>
              )}
              <div className="text-base font-black text-[#EAF7EF]">
                Total Estimated BOM:{' '}
                <span className="text-[#39FF6A]">₹{total}</span>{' '}
                <span className="text-[10px] text-[#8FA99B] font-normal">(Incl. 18% GST)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};