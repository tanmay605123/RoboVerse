'use client';

import React, { useState } from 'react';
import { AppSidebar } from '../../components/layout/AppSidebar';
import { AppTopBar } from '../../components/layout/AppTopBar';
import { useAuthStore } from '../../store/useAuthStore';
import { ShoppingBag, Package, Truck, FileText, CheckCircle2 } from 'lucide-react';

export default function StoreAdminPage() {
  const { user, profile } = useAuthStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#07110D] text-[#EAF7EF] font-sans selection:bg-[#39FF6A] selection:text-black">
      <AppSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AppTopBar
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[rgba(57,255,106,0.12)]">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#EAF7EF] flex items-center gap-3">
                <ShoppingBag className="w-7 h-7 text-[#FF9A1F]" />
                <span>TechSavyyy Hardware Store Console</span>
              </h1>
              <p className="text-xs text-[#8FA99B] font-mono mt-1">
                Inventory fulfillment, shipment tracking, GST invoice reconciliation, and order dispatch.
              </p>
            </div>
            <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-[rgba(255,154,31,0.15)] border border-[rgba(255,154,31,0.3)] text-[#FF9A1F]">
              STORE ADMIN
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#0E2A1F]/60 border border-[rgba(57,255,106,0.15)] backdrop-blur-md">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-[#39FF6A]" />
                <span className="text-xs text-[#8FA99B] font-mono font-bold">Pending Orders</span>
              </div>
              <p className="text-2xl font-black text-[#EAF7EF] mt-2">12 Orders</p>
              <p className="text-[11px] text-[#8FA99B] mt-1">Awaiting dispatch &amp; tracking ID</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0E2A1F]/60 border border-[rgba(57,255,106,0.15)] backdrop-blur-md">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-[#7FE7D6]" />
                <span className="text-xs text-[#8FA99B] font-mono font-bold">In Transit</span>
              </div>
              <p className="text-2xl font-black text-[#EAF7EF] mt-2">48 Shipments</p>
              <p className="text-[11px] text-[#8FA99B] mt-1">Delhivery / BlueDart tracking synced</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0E2A1F]/60 border border-[rgba(57,255,106,0.15)] backdrop-blur-md">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#FF9A1F]" />
                <span className="text-xs text-[#8FA99B] font-mono font-bold">GST Invoices</span>
              </div>
              <p className="text-2xl font-black text-[#EAF7EF] mt-2">100% Tax Compliant</p>
              <p className="text-[11px] text-[#8FA99B] mt-1">Embedded 18% GST auto-generated</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
