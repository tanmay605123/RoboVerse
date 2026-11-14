'use client';

import React, { ReactNode, useState } from 'react';
import { AppSidebar } from '../layout/AppSidebar';
import { AppTopBar } from '../layout/AppTopBar';

export function SupportShell({ children }: { children: ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#07110D] text-[#EAF7EF] font-sans">
      <AppSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((value) => !value)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopBar
          onToggleSidebar={() => setIsSidebarCollapsed((value) => !value)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />
        <main className="hud-grid-bg flex-1">{children}</main>
      </div>
    </div>
  );
}

