'use client';

import React from 'react';
import { useArduinoStudioStore } from '@/store/useArduinoStudioStore';
import { ArduinoStudioToolbar } from '@/components/arduino-studio/ArduinoStudioToolbar';
import { ArduinoStudioSidebar } from '@/components/arduino-studio/ArduinoStudioSidebar';
import { ArduinoStudioInspector } from '@/components/arduino-studio/ArduinoStudioInspector';
import { ArduinoStudio2DCanvas } from '@/components/arduino-studio/ArduinoStudio2DCanvas';
import { ArduinoStudio3DCanvas } from '@/components/arduino-studio/ArduinoStudio3DCanvas';
import { ArduinoStudioBottomPanel } from '@/components/arduino-studio/ArduinoStudioBottomPanel';

export default function ArduinoStudioPage() {
  const { visualizationMode } = useArduinoStudioStore();

  return (
    <div className="w-screen h-screen bg-[#07110D] flex flex-col overflow-hidden select-none">
      {/* Top Professional Toolbar */}
      <ArduinoStudioToolbar />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Left: Searchable Electronic Component Library */}
        <ArduinoStudioSidebar />

        {/* Center: Interactive Circuit Canvas (Synchronized 2D & 3D Modes) */}
        <main className="flex-1 relative h-full overflow-hidden">
          {visualizationMode === '2D' ? (
            <ArduinoStudio2DCanvas />
          ) : (
            <ArduinoStudio3DCanvas />
          )}
        </main>

        {/* Right: Selected Component Properties & Inspection */}
        <ArduinoStudioInspector />
      </div>

      {/* Bottom Panel: Monaco Code Editor, Compiler Output, Serial Monitor, Diagnostics & Logs */}
      <ArduinoStudioBottomPanel />
    </div>
  );
}
