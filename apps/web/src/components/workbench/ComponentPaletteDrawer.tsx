'use client';

import React, { useState } from 'react';
import {
  ROBOVERSE_COMPONENTS_CATALOG,
  ROBOVERSE_STARTER_ASSEMBLIES,
  CatalogComponentItem,
  StarterAssemblyItem,
  CircuitComponent,
  PlanTier,
} from '@roboverse/shared';
import { useCircuitStore } from '@/store/useCircuitStore';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Search,
  Cpu,
  Zap,
  Activity,
  Radio,
  Sliders,
  Tv,
  Lock,
  Plus,
  Info,
  X,
  ChevronDown,
  LayoutGrid,
  List,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Layers,
  BatteryCharging,
  MoveRight,
} from 'lucide-react';

export type PaletteMode =
  | 'components_basic'
  | 'components_all'
  | 'starters_all'
  | 'starters_arduino'
  | 'starters_assemblies';

interface ComponentPaletteDrawerProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const ComponentPaletteDrawer: React.FC<ComponentPaletteDrawerProps> = ({
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { addComponent, components, loadStarterAssembly } = useCircuitStore();
  const { planTier } = useAuthStore();

  const [mode, setMode] = useState<PaletteMode>('components_basic');
  const [viewFormat, setViewFormat] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [previewItem, setPreviewItem] = useState<CatalogComponentItem | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const isPro = planTier === PlanTier.PRO;
  const isPlus = planTier === PlanTier.PLUS || isPro;

  // Filter components or starters based on mode and search
  const isStartersMode = mode.startsWith('starters_');

  // Filtered components
  const filteredComponents = ROBOVERSE_COMPONENTS_CATALOG.filter((item) => {
    if (mode === 'components_basic' && !item.isFreeTier) return false;
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat) return false;
    }
    return true;
  });

  // Filtered starters
  const filteredStarters = ROBOVERSE_STARTER_ASSEMBLIES.filter((starter) => {
    if (mode === 'starters_arduino' && starter.category !== 'Arduino') return false;
    if (mode === 'starters_assemblies' && starter.category !== 'Circuit Assemblies') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = starter.title.toLowerCase().includes(q);
      const matchDesc = starter.description.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  // Handle adding a component to the active canvas
  const handleAddComponent = (item: CatalogComponentItem) => {
    const existingCount = components.filter((c) => c.typeId === item.id).length;

    const newComponent: CircuitComponent = {
      id: `${item.id}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 5)}`,
      typeId: item.id,
      name: `${item.name} ${existingCount > 0 ? existingCount + 1 : ''}`.trim(),
      category: item.category as any,
      model3DUrl: item.model3DUrl || `/models/${item.id}.glb`,
      position: [-1.2 + (components.length % 4) * 0.8, 0.2, -0.8 + Math.floor(components.length / 4) * 0.8],
      rotation: [0, 0, 0],
      properties: { ...item.defaultProperties },
      pins: item.pins.map((pin) => ({
        id: pin.id,
        name: pin.name,
        type: pin.type as any,
        position3D: [0, 0.2, 0],
      })),
    };

    addComponent(newComponent);
  };

  // Handle loading a starter circuit assembly
  const handleLoadStarter = (starter: StarterAssemblyItem) => {
    loadStarterAssembly({
      components: starter.components.map((c) => ({
        ...c,
        id: `${c.typeId}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 5)}`,
      })),
      wires: starter.wires.map((w) => ({
        ...w,
        id: `wire_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 5)}`,
      })),
      arduinoCode: starter.arduinoCode,
      title: starter.title,
    });
  };

  // Helper for component visual preview
  const renderComponentVisual = (item: CatalogComponentItem) => {
    const isArduino = item.id.includes('arduino');
    const isMicrobit = item.id.includes('microbit') || item.id.includes('pico');
    const isLed = item.id.includes('led');
    const isResistor = item.id.includes('resistor');
    const isBattery = item.id.includes('battery');
    const isSensor = item.category === 'SENSOR';
    const isMotor = item.category === 'ACTUATOR';

    if (isArduino) {
      return (
        <div className="w-12 h-10 rounded-md bg-[#0C382A] border border-[#39FF6A]/40 flex items-center justify-center text-[#39FF6A] text-[9px] font-mono font-black tracking-tight shadow-xs">
          UNO R3
        </div>
      );
    }
    if (isMicrobit) {
      return (
        <div className="w-12 h-10 rounded-md bg-[#0F261D] border border-[#7FE7D6]/40 flex items-center justify-center text-[#7FE7D6] text-[9px] font-mono font-black tracking-tight shadow-xs">
          micro:bit
        </div>
      );
    }
    if (isLed) {
      const color = item.defaultProperties?.color || (item.id.includes('green') ? '#39FF6A' : item.id.includes('blue') ? '#4C8DFF' : '#FF4D4D');
      return (
        <div className="flex flex-col items-center">
          <div
            className="w-5 h-6 rounded-t-full shadow-[0_0_8px_rgba(57,255,106,0.5)] border border-white/20"
            style={{ backgroundColor: color }}
          />
          <div className="flex gap-1 -mt-0.5">
            <div className="w-0.5 h-3 bg-gray-400" />
            <div className="w-0.5 h-3.5 bg-gray-400" />
          </div>
        </div>
      );
    }
    if (isResistor) {
      return (
        <div className="flex items-center">
          <div className="w-2 h-0.5 bg-gray-400" />
          <div className="w-8 h-3.5 rounded-full bg-[#D4A373] border border-amber-800 flex items-center justify-center gap-0.5 px-1 shadow-xs">
            <div className="w-1 h-3 bg-amber-900" />
            <div className="w-1 h-3 bg-red-600" />
            <div className="w-1 h-3 bg-amber-500" />
            <div className="w-1 h-3 bg-amber-300" />
          </div>
          <div className="w-2 h-0.5 bg-gray-400" />
        </div>
      );
    }
    if (isBattery) {
      return (
        <div className="w-8 h-12 rounded-sm bg-gradient-to-b from-[#0E2A1F] to-[#040B08] border border-[rgba(57,255,106,0.3)] border-t-4 border-t-amber-500 flex flex-col items-center justify-center text-white text-[8px] font-mono font-bold shadow-xs">
          <span>9V</span>
        </div>
      );
    }
    if (isMotor) {
      return (
        <div className="w-10 h-10 rounded-full bg-[#0E2A1F] border border-[#7FE7D6]/40 flex items-center justify-center text-white shadow-xs">
          <Activity className="w-5 h-5 text-[#7FE7D6]" />
        </div>
      );
    }
    if (isSensor) {
      return (
        <div className="w-10 h-10 rounded-lg bg-[#0E2A1F] border border-[#39FF6A]/40 flex items-center justify-center text-white shadow-xs">
          <Radio className="w-5 h-5 text-[#39FF6A]" />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-lg bg-[#040B08] border border-[rgba(57,255,106,0.2)] flex items-center justify-center text-[#39FF6A] shadow-xs">
        <Cpu className="w-5 h-5" />
      </div>
    );
  };

  const getDropdownLabel = () => {
    switch (mode) {
      case 'components_basic':
        return 'Components: Basic';
      case 'components_all':
        return 'Components: All';
      case 'starters_all':
        return 'Starters: All';
      case 'starters_arduino':
        return 'Starters: Arduino';
      case 'starters_assemblies':
        return 'Starters: Assemblies';
      default:
        return 'Components';
    }
  };

  return (
    <aside
      className={`relative h-full bg-[#07110D]/95 backdrop-blur-2xl border-l border-[rgba(57,255,106,0.15)] flex flex-col transition-all duration-300 select-none z-20 shadow-[0_0_30px_rgba(0,0,0,0.8)] ${
        isCollapsed ? 'w-0 overflow-hidden border-l-0' : 'w-72 sm:w-80 md:w-88'
      }`}
    >
      {/* DRAWER COLLAPSE TOGGLE TAB */}
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className="absolute -left-7 top-4 z-30 w-7 h-10 bg-[#0E2A1F] border-y border-l border-[rgba(57,255,106,0.25)] rounded-l-xl flex items-center justify-center text-[#8FA99B] hover:text-[#39FF6A] transition-colors"
          title={isCollapsed ? 'Expand Component Palette' : 'Collapse Component Palette'}
        >
          {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      )}

      {/* HEADER: Category Dropdown */}
      <div className="p-3 border-b border-[rgba(57,255,106,0.12)] space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          {/* Dropdown: Components / Starters */}
          <div className="relative flex-1">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] hover:border-[#39FF6A] text-xs font-mono font-bold text-[#EAF7EF] transition-all text-left"
            >
              <div className="flex items-center gap-1.5 truncate">
                <Layers className="w-3.5 h-3.5 text-[#39FF6A] shrink-0" />
                <span className="truncate">{getDropdownLabel()}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#8FA99B] shrink-0 ml-1" />
            </button>

            {/* Dropdown Options */}
            {showDropdown && (
              <div className="absolute left-0 top-full mt-1.5 w-full bg-[#0A1F17]/95 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-[rgba(57,255,106,0.25)] py-2 z-50 backdrop-blur-2xl animate-slide-up">
                <div className="px-3 py-1 text-[10px] font-mono font-extrabold uppercase tracking-wider text-[#8FA99B]">
                  Components
                </div>
                <button
                  onClick={() => {
                    setMode('components_basic');
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-1.5 text-xs font-mono font-semibold flex items-center justify-between ${
                    mode === 'components_basic'
                      ? 'bg-[rgba(57,255,106,0.2)] text-[#39FF6A] font-bold'
                      : 'text-[#CBD8D0] hover:bg-white/5'
                  }`}
                >
                  <span>Basic (Free Tier)</span>
                  <span className="text-[10px] text-[#8FA99B]">26 items</span>
                </button>
                <button
                  onClick={() => {
                    setMode('components_all');
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-1.5 text-xs font-mono font-semibold flex items-center justify-between ${
                    mode === 'components_all'
                      ? 'bg-[rgba(57,255,106,0.2)] text-[#39FF6A] font-bold'
                      : 'text-[#CBD8D0] hover:bg-white/5'
                  }`}
                >
                  <span>All Components</span>
                  <span className="text-[10px] text-[#8FA99B]">52 items</span>
                </button>

                <div className="my-1.5 border-t border-[rgba(57,255,106,0.10)]" />

                <div className="px-3 py-1 text-[10px] font-mono font-extrabold uppercase tracking-wider text-[#8FA99B]">
                  Starters
                </div>
                <button
                  onClick={() => {
                    setMode('starters_all');
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-1.5 text-xs font-mono font-semibold flex items-center justify-between ${
                    mode === 'starters_all'
                      ? 'bg-[rgba(57,255,106,0.2)] text-[#39FF6A] font-bold'
                      : 'text-[#CBD8D0] hover:bg-white/5'
                  }`}
                >
                  <span>All Starters</span>
                  <span className="text-[10px] text-[#8FA99B]">Ready circuits</span>
                </button>
                <button
                  onClick={() => {
                    setMode('starters_arduino');
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-1.5 text-xs font-mono font-semibold flex items-center justify-between ${
                    mode === 'starters_arduino'
                      ? 'bg-[rgba(57,255,106,0.2)] text-[#39FF6A] font-bold'
                      : 'text-[#CBD8D0] hover:bg-white/5'
                  }`}
                >
                  <span>Arduino Starters</span>
                  <span className="text-[10px] text-[#8FA99B]">Blink, Servo...</span>
                </button>
                <button
                  onClick={() => {
                    setMode('starters_assemblies');
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-1.5 text-xs font-mono font-semibold flex items-center justify-between ${
                    mode === 'starters_assemblies'
                      ? 'bg-[rgba(57,255,106,0.2)] text-[#39FF6A] font-bold'
                      : 'text-[#CBD8D0] hover:bg-white/5'
                  }`}
                >
                  <span>Circuit Assemblies</span>
                  <span className="text-[10px] text-[#8FA99B]">Sonar Radar</span>
                </button>
              </div>
            )}
          </div>

          {/* Grid / List View Toggle */}
          <div className="flex items-center p-0.5 bg-[#040B08] rounded-xl border border-[rgba(57,255,106,0.2)]">
            <button
              onClick={() => setViewFormat('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewFormat === 'grid'
                  ? 'bg-[rgba(57,255,106,0.2)] text-[#39FF6A]'
                  : 'text-[#8FA99B] hover:text-[#EAF7EF]'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewFormat('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewFormat === 'list'
                  ? 'bg-[rgba(57,255,106,0.2)] text-[#39FF6A]'
                  : 'text-[#8FA99B] hover:text-[#EAF7EF]'
              }`}
              title="List view"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Search Input Box */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#8FA99B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={isStartersMode ? 'Search circuit starters...' : 'Search components (e.g. LED, Uno)...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#040B08] border border-[rgba(57,255,106,0.15)] rounded-xl pl-8 pr-7 py-1.5 text-xs font-mono text-[#EAF7EF] placeholder-[#527063] focus:outline-none focus:border-[#39FF6A] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8FA99B] hover:text-[#EAF7EF]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* COMPONENT ITEMS GRID / LIST */}
      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
        {/* If in STARTERS mode */}
        {isStartersMode ? (
          <div className="space-y-3">
            {filteredStarters.map((starter) => (
              <div
                key={starter.id}
                onClick={() => handleLoadStarter(starter)}
                className="group relative p-3 rounded-2xl bg-[#0E2A1F]/40 border border-[rgba(57,255,106,0.15)] hover:border-[#39FF6A] hover:shadow-[0_0_15px_rgba(57,255,106,0.25)] transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#39FF6A] animate-pulse" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#39FF6A]">
                      {starter.category}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[rgba(57,255,106,0.15)] text-[#39FF6A] border border-[rgba(57,255,106,0.3)] font-bold">
                    {starter.components.length} parts
                  </span>
                </div>

                <h4 className="text-xs font-bold text-[#EAF7EF] group-hover:text-[#39FF6A] transition-colors">
                  {starter.title}
                </h4>

                <p className="text-[11px] text-[#8FA99B] line-clamp-2 mt-1">
                  {starter.description}
                </p>

                <div className="mt-2.5 pt-2 border-t border-[rgba(57,255,106,0.10)] flex items-center justify-between font-mono">
                  <span className="text-[10px] text-[#8FA99B]">
                    Ready to simulate
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLoadStarter(starter);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] text-[#07110D] text-[10px] font-bold shadow-xs hover:brightness-110 transition-all"
                  >
                    <span>Drop in Canvas</span>
                    <MoveRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* COMPONENTS MODE: Grid of small glass tiles */
          <>
            {viewFormat === 'grid' ? (
              <div className="grid grid-cols-3 gap-2">
                {filteredComponents.map((item) => (
                  <div
                    key={item.id}
                    draggable={true}
                    onDragStart={(e) => {
                      e.dataTransfer.setData(
                        'application/json',
                        JSON.stringify({ type: 'component', item })
                      );
                    }}
                    onClick={() => handleAddComponent(item)}
                    className="group relative flex flex-col items-center justify-between p-2 rounded-xl border border-[rgba(57,255,106,0.15)] hover:border-[#39FF6A] hover:shadow-[0_0_15px_rgba(57,255,106,0.25)] transition-all cursor-pointer text-center bg-[#040B08]/80"
                    title={item.name}
                  >
                    {/* Visual Component Artwork */}
                    <div className="w-full h-14 flex items-center justify-center p-1 group-hover:scale-105 transition-transform">
                      {renderComponentVisual(item)}
                    </div>

                    {/* Component Label */}
                    <span className="text-[9.5px] font-mono font-bold text-[#CBD8D0] truncate w-full mt-1 group-hover:text-[#39FF6A] transition-colors">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              /* LIST VIEW */
              <div className="space-y-2">
                {filteredComponents.map((item) => (
                  <div
                    key={item.id}
                    draggable={true}
                    onDragStart={(e) => {
                      e.dataTransfer.setData(
                        'application/json',
                        JSON.stringify({ type: 'component', item })
                      );
                    }}
                    onClick={() => handleAddComponent(item)}
                    className="group flex items-center justify-between p-2.5 rounded-xl border border-[rgba(57,255,106,0.15)] hover:border-[#39FF6A] hover:shadow-[0_0_12px_rgba(57,255,106,0.2)] transition-all cursor-pointer bg-[#040B08]/80"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-[#0E2A1F] flex items-center justify-center shrink-0 border border-[rgba(57,255,106,0.15)]">
                        {renderComponentVisual(item)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#EAF7EF] truncate group-hover:text-[#39FF6A] transition-colors">
                          {item.name}
                        </h4>
                        <span className="text-[10px] font-mono text-[#8FA99B] block truncate">
                          {item.category} • ₹{item.priceInr}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewItem(item);
                        }}
                        className="p-1 rounded-lg text-[#8FA99B] hover:text-[#39FF6A] hover:bg-white/5"
                        title="View pinout and datasheet"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddComponent(item);
                        }}
                        className="p-1 rounded-lg bg-[rgba(57,255,106,0.15)] text-[#39FF6A] hover:bg-[#39FF6A] hover:text-[#07110D] transition-colors"
                        title="Add to canvas"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* FOOTER: Component Count & TechSavyyy Parts Link */}
      <div className="p-3 border-t border-[rgba(57,255,106,0.12)] bg-[#040B08] flex items-center justify-between text-[11px] font-mono">
        <span className="text-[#8FA99B]">
          {isStartersMode ? `${filteredStarters.length} Starters` : `${filteredComponents.length} Components`}
        </span>
        <a
          href="/store"
          className="font-bold text-[#39FF6A] hover:underline flex items-center gap-1"
        >
          <span>TechSavyyy Store</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* DATASHEET & PINOUT MODAL IN DARK GLASS */}
      {previewItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A1F17]/95 rounded-2xl max-w-md w-full p-5 shadow-[0_20px_60px_rgba(0,0,0,0.9)] border border-[rgba(57,255,106,0.3)] animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(57,255,106,0.15)]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[rgba(57,255,106,0.15)] border border-[rgba(57,255,106,0.3)] text-[#39FF6A] flex items-center justify-center">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#EAF7EF]">
                    {previewItem.name}
                  </h3>
                  <span className="text-[10px] font-mono text-[#8FA99B]">{previewItem.category}</span>
                </div>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="p-1 rounded-full text-[#8FA99B] hover:text-[#EAF7EF]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 space-y-3 text-xs">
              <p className="text-[#CBD8D0] text-xs leading-relaxed">
                {previewItem.description}
              </p>

              <div>
                <h4 className="text-[11px] font-mono font-extrabold text-[#39FF6A] uppercase tracking-wider mb-1.5">
                  Pinout Terminals ({previewItem.pins.length})
                </h4>
                <div className="max-h-36 overflow-y-auto space-y-1 bg-[#040B08] p-2.5 rounded-xl border border-[rgba(57,255,106,0.15)] font-mono">
                  {previewItem.pins.map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#EAF7EF]">
                        {p.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0E2A1F] text-[#7FE7D6] border border-[rgba(57,255,106,0.2)]">
                        {p.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[rgba(57,255,106,0.12)]">
                <span className="text-xs font-mono font-bold text-[#EAF7EF]">
                  Store Price: ₹{previewItem.priceInr} <span className="text-[10px] text-[#8FA99B]">(18% GST)</span>
                </span>
                <button
                  onClick={() => {
                    handleAddComponent(previewItem);
                    setPreviewItem(null);
                  }}
                  className="px-4 py-1.5 rounded-full text-xs font-mono font-extrabold bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] text-[#07110D] shadow-[0_0_12px_rgba(57,255,106,0.4)]"
                >
                  Place in Circuit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
