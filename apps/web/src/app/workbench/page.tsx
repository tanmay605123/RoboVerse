'use client';

import React, { useEffect, useState } from 'react';
import { useCircuitStore } from '@/store/useCircuitStore';
import { CircuitHeader, CircuitViewTab } from '@/components/workbench/CircuitHeader';
import { CircuitToolbar, WireStyle } from '@/components/workbench/CircuitToolbar';
import { Realistic2DCanvas } from '@/components/workbench/Realistic2DCanvas';
import { BreadboardCanvas } from '@/components/workbench/BreadboardCanvas';
import { SchematicSheetView } from '@/components/workbench/SchematicSheetView';
import { ComponentListView } from '@/components/workbench/ComponentListView';
import { ComponentPaletteDrawer } from '@/components/workbench/ComponentPaletteDrawer';
import { ArduinoEditorDrawer } from '@/components/workbench/ArduinoEditorDrawer';
import { CircuitDiagnosticsBar } from '@/components/workbench/CircuitDiagnosticsBar';
import { BeginnerCurriculumDrawer } from '@/components/workbench/BeginnerCurriculumDrawer';
import { CircuitLabGuide } from '@/components/workbench/CircuitLabGuide';

export default function WorkbenchPage() {
  const {
    projectName,
    setProjectName,
    activeTab,
    setActiveTab,
    is3DMode,
    toggle3DMode,
    wireStyle,
    setWireStyle,
    areComponentsVisible,
    toggleComponentsVisibility,
    activeWireColor,
    setActiveWireColor,
    isSimulating,
    startSimulation,
    stopSimulation,
    undo,
    redo,
    undoStack,
    redoStack,
    selectedComponentId,
    removeComponent,
    rotateComponent,
    flipComponent,
    isCodeOpen,
    toggleCodeOpen,
    isNoteActive,
    setIsNoteActive,
    components,
    wires,
  } = useCircuitStore();

  const [isPaletteCollapsed, setIsPaletteCollapsed] = useState(false);
  const [isCurriculumOpen, setIsCurriculumOpen] = useState(false);
  const [startInProjectPicker, setStartInProjectPicker] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (!localStorage.getItem('roboverse-circuit-guide-seen')) setIsGuideOpen(true);
    } catch {
      // The guide remains available from the toolbar if browser storage is disabled.
    }
  }, []);

  const closeGuide = () => {
    setIsGuideOpen(false);
    try {
      localStorage.setItem('roboverse-circuit-guide-seen', 'true');
    } catch {
      // Keep the close action usable when browser storage is disabled.
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Export handlers
  const handleExportPng = () => {
    // In browser, trigger screenshot download
    const svgEl = document.querySelector('svg');
    if (!svgEl) {
      showToast('Rendering preview image...');
      return;
    }
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName.toLowerCase().replace(/\s+/g, '_')}_circuit.svg`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Circuit artwork downloaded!');
  };

  const handleExportJson = () => {
    const netlist = {
      project: projectName,
      timestamp: new Date().toISOString(),
      components,
      wires,
    };
    const blob = new Blob([JSON.stringify(netlist, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName.toLowerCase().replace(/\s+/g, '_')}_netlist.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Netlist JSON exported!');
  };

  const handleExportCsv = () => {
    const rows = [
      ['Item #', 'Component Name', 'Category', 'Reference', 'Quantity', 'Unit Price (INR)'],
      ...components.map((c, i) => [
        (i + 1).toString(),
        `"${c.name}"`,
        c.category,
        c.id,
        '1',
        c.typeId.includes('arduino') ? '450' : c.typeId.includes('servo') ? '105' : '15',
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${projectName.toLowerCase().replace(/\s+/g, '_')}_bom.csv`);
    link.click();
    showToast('BOM CSV downloaded!');
  };

  const handleExportPdf = () => {
    window.print();
  };

  const handleShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      showToast('Project share link copied to clipboard!');
    }
  };

  return (
    <div className="w-screen h-screen bg-[#07110D] flex flex-col overflow-hidden select-none text-[#EAF7EF]">
      {/* 1. TOP HEADER: Logo, Project Name, View Tabs, Student Profile */}
      <CircuitHeader
        projectName={projectName}
        onRename={setProjectName}
        activeTab={activeTab}
        onTabChange={(tab: CircuitViewTab) => setActiveTab(tab)}
      />

      {/* 2. SUB-HEADER TOOLBAR: Edit tools, Wire colors/style, Code, Sim, Send To */}
      <CircuitToolbar
        onRotate={() => selectedComponentId && rotateComponent(selectedComponentId)}
        onDelete={() => selectedComponentId && removeComponent(selectedComponentId)}
        onUndo={undo}
        onRedo={redo}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        onAddNote={() => setIsNoteActive(!isNoteActive)}
        isNoteActive={isNoteActive}
        onToggleVisibility={toggleComponentsVisibility}
        areComponentsVisible={areComponentsVisible}
        activeWireColor={activeWireColor}
        onSelectWireColor={setActiveWireColor}
        wireStyle={wireStyle as WireStyle}
        onSelectWireStyle={(style) => setWireStyle(style)}
        onFlip={() => selectedComponentId && flipComponent(selectedComponentId)}
        isCurriculumOpen={isCurriculumOpen}
        onToggleCurriculum={() => {
          const opening = !isCurriculumOpen;
          setStartInProjectPicker(opening);
          setIsCurriculumOpen(opening);
        }}
        onNewProject={() => {
          setStartInProjectPicker(true);
          setIsCurriculumOpen(true);
        }}
        onOpenGuide={() => setIsGuideOpen(true)}
        isCodeOpen={isCodeOpen}
        onToggleCode={toggleCodeOpen}
        isSimulating={isSimulating}
        onToggleSimulation={() => (isSimulating ? stopSimulation() : startSimulation())}
        onExportPng={handleExportPng}
        onExportJson={handleExportJson}
        onExportCsv={handleExportCsv}
        onExportPdf={handleExportPdf}
        onShareLink={handleShareLink}
      />

      {/* 3. MAIN WORKBENCH VIEWPORT */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* VIEW TAB 1: CIRCUITS (2D Realistic Top-Down Canvas or 3D Workshop Table) */}
        {activeTab === 'circuits' && (
          <div className="flex-1 flex relative h-full overflow-hidden">
            {/* Center Canvas Area */}
            <main className="flex-1 relative h-full overflow-hidden">
              {!is3DMode ? (
                <Realistic2DCanvas
                  onToggle3DMode={toggle3DMode}
                  is3DMode={is3DMode}
                  wireColor={activeWireColor}
                />
              ) : (
                <BreadboardCanvas />
              )}

              {/* Bottom Diagnostics Bar */}
              <CircuitDiagnosticsBar />
            </main>

            {/* Right: Code Drawer (Monaco / Blockly / C++) */}
            {isCodeOpen && (
              <ArduinoEditorDrawer
                isOpen={isCodeOpen}
                onClose={() => toggleCodeOpen()}
              />
            )}

            {/* Right: Beginner Curriculum Drawer (16 Lessons) */}
            <BeginnerCurriculumDrawer
              isOpen={isCurriculumOpen}
              onClose={() => setIsCurriculumOpen(false)}
              startInProjectPicker={startInProjectPicker}
              onOpenCodeEditor={() => {
                if (!isCodeOpen) toggleCodeOpen();
              }}
            />

            {/* Right: Component Palette (Small Glass Tiles, 3-Column Grid, Search, Starters) */}
            <ComponentPaletteDrawer
              isCollapsed={isPaletteCollapsed}
              onToggleCollapse={() => setIsPaletteCollapsed(!isPaletteCollapsed)}
            />
          </div>
        )}

        {/* VIEW TAB 2: SCHEMATIC (Drawing Sheet Frame, IEEE Std 315, Title Block, Netlist) */}
        {activeTab === 'schematic' && (
          <div className="flex-1 h-full overflow-auto bg-[#07110D]">
            <SchematicSheetView />
          </div>
        )}

        {/* VIEW TAB 3: COMPONENTS (BOM Table, 18% GST Pricing, TechSavyyy Store stock) */}
        {activeTab === 'components' && (
          <div className="flex-1 h-full overflow-auto bg-[#07110D]">
            <ComponentListView />
          </div>
        )}
      </div>

      {/* FLOATING TOAST NOTIFICATION IN DARK GLASS */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0A1F17]/95 text-[#EAF7EF] border border-[#39FF6A] px-4 py-2 rounded-2xl shadow-[0_0_20px_rgba(57,255,106,0.35)] text-xs font-mono font-bold animate-slide-up flex items-center gap-2 backdrop-blur-xl">
          <span className="w-2 h-2 rounded-full bg-[#39FF6A] animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      <CircuitLabGuide
        isOpen={isGuideOpen}
        onClose={closeGuide}
        onOpenLessons={() => {
          setActiveTab('circuits');
          setStartInProjectPicker(true);
          setIsCurriculumOpen(true);
        }}
        onOpenCode={() => {
          setActiveTab('circuits');
          if (!isCodeOpen) toggleCodeOpen();
        }}
        onSetView={setActiveTab}
      />
    </div>
  );
}
