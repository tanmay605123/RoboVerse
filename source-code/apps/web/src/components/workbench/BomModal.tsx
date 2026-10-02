'use client';

import React from 'react';
import { useCircuitStore } from '@/store/useCircuitStore';
import { useAuthStore } from '@/store/useAuthStore';
import { PlanTier } from '@roboverse/shared';
import { ShoppingCart, Download, FileText, X, Check, Tag } from 'lucide-react';

interface BomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRICING_CATALOG: Record<string, number> = {
  arduino_uno: 450,
  arduino_nano: 280,
  esp32_devkit: 420,
  led_red: 5,
  led_green: 5,
  buzzer_active: 25,
  servo_sg90: 120,
  motor_dc_tt: 90,
  sensor_ldr: 15,
  sensor_ultrasonic_hcsr04: 110,
  sensor_pir_hc_sr501: 95,
  sensor_dht11: 130,
  resistor_220: 2,
  resistor_10k: 2,
  potentiometer_10k: 20,
  push_button: 10,
  breadboard_half: 120,
  lcd_1602_i2c: 240,
};

export const BomModal: React.FC<BomModalProps> = ({ isOpen, onClose }) => {
  const { components, wires, arduinoCode } = useCircuitStore();
  const { planTier } = useAuthStore();

  if (!isOpen) return null;

  // Aggregate quantities
  const aggregated: Record<string, { name: string; qty: number; unitPrice: number }> = {};
  components.forEach((c) => {
    const type = c.typeId;
    const price = PRICING_CATALOG[type] || 25;
    if (!aggregated[type]) {
      aggregated[type] = {
        name: c.name,
        qty: 1,
        unitPrice: price,
      };
    } else {
      aggregated[type].qty += 1;
    }
  });

  // Add Jumper Wires pack if wires exist
  if (wires.length > 0) {
    aggregated['jumper_wires'] = {
      name: `Jumper Wires (${wires.length}x Multi-Color)`,
      qty: 1,
      unitPrice: 40,
    };
  }

  const items = Object.values(aggregated);
  const subtotal = items.reduce((acc, item) => acc + item.qty * item.unitPrice, 0);

  // Discount based on plan: 5% Plus, 10% Pro
  const discountPct = planTier === PlanTier.PRO ? 10 : planTier === PlanTier.PLUS ? 5 : 0;
  const discountAmount = Math.round((subtotal * discountPct) / 100);
  const total = subtotal - discountAmount;

  const handleExportJson = () => {
    const projectData = {
      title: 'RoboVerse Circuit Project',
      exportedAt: new Date().toISOString(),
      components,
      wires,
      arduinoCode,
      bom: items,
      totalCostInr: total,
    };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roboverse-circuit-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    const csvContent =
      'Component,Quantity,Unit Price (INR),Total (INR)\n' +
      items.map((i) => `"${i.name}",${i.qty},${i.unitPrice},${i.qty * i.unitPrice}`).join('\n') +
      `\nSubtotal,,,"₹${subtotal}"` +
      `\nDiscount (${discountPct}%),,,"-₹${discountAmount}"` +
      `\nTotal (Incl. GST),,,"₹${total}"`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roboverse-bom-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#07110D] border border-[#39FF6A]/40 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative font-sans">
        {/* Header */}
        <div className="p-4 bg-[#0E2A1F]/80 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#39FF6A]/10 text-[#39FF6A] border border-[#39FF6A]/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Bill of Materials (BOM)</h2>
              <p className="text-xs text-gray-400">Automated parts breakdown for your 3D circuit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Table */}
        <div className="p-6">
          <div className="max-h-60 overflow-y-auto rounded-xl border border-gray-800 bg-[#0E2A1F]/30">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#0E2A1F] text-gray-400 border-b border-gray-800 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Component</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-gray-300">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition">
                    <td className="p-3 font-medium text-white">{item.name}</td>
                    <td className="p-3 text-center">{item.qty}</td>
                    <td className="p-3 text-right">₹{item.unitPrice}</td>
                    <td className="p-3 text-right text-[#39FF6A] font-bold">
                      ₹{item.qty * item.unitPrice}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Summary */}
          <div className="mt-4 p-4 rounded-xl bg-[#0E2A1F]/60 border border-gray-800 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal:</span>
              <span>₹{subtotal}</span>
            </div>

            {discountPct > 0 ? (
              <div className="flex justify-between text-[#39FF6A]">
                <span className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  {planTier} Student Discount ({discountPct}%):
                </span>
                <span>-₹{discountAmount}</span>
              </div>
            ) : (
              <div className="flex justify-between text-gray-500 italic text-[11px]">
                <span>Plus/Pro discount: Upgrade for up to 10% off</span>
                <span>₹0</span>
              </div>
            )}

            <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-gray-800 font-sans">
              <span>Total Estimated Price (incl. 18% GST):</span>
              <span className="text-[#39FF6A] font-mono">₹{total}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-6 gap-3">
            <div className="flex gap-2">
              <button
                onClick={handleExportJson}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-800/80 hover:bg-gray-700 text-gray-300 border border-gray-700 rounded-xl text-xs font-medium transition"
              >
                <Download className="w-3.5 h-3.5" />
                Export JSON
              </button>
              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-800/80 hover:bg-gray-700 text-gray-300 border border-gray-700 rounded-xl text-xs font-medium transition"
              >
                <FileText className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>

            {/* Direct TechSavyyy Checkout CTA */}
            <a
              href={`/store?kit=custom&total=${total}`}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] hover:brightness-110 text-black font-bold text-xs rounded-xl shadow-lg transition"
            >
              <ShoppingCart className="w-4 h-4" />
              Buy Kit from TechSavyyy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
