'use client';

import React, { useState } from 'react';
import { useArduinoStudioStore } from '@/store/useArduinoStudioStore';
import { COMPONENT_CATALOG } from './catalog';
import { ComponentCatalogItem } from './types';
import {
  Search,
  Plus,
  Zap,
  Cpu,
  Layers,
  Activity,
  Sliders,
  Radio,
  Info,
} from 'lucide-react';
import { CircuitComponent } from '@roboverse/shared';

const CATEGORIES = [
  { id: 'ALL', label: 'All', icon: Zap },
  { id: 'MICROCONTROLLER', label: 'MCUs', icon: Cpu },
  { id: 'PROTOTYPING', label: 'Boards', icon: Layers },
  { id: 'PASSIVE', label: 'Passives & Buttons', icon: Sliders },
  { id: 'ACTUATOR', label: 'LEDs & Motors', icon: Activity },
  { id: 'SENSOR', label: 'Sensors', icon: Radio },
];

export const ArduinoStudioSidebar: React.FC = () => {
  const { addComponent, components } = useArduinoStudioStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const filteredItems = COMPONENT_CATALOG.filter((item) => {
    const matchesCategory =
      selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddComponent = (item: ComponentCatalogItem) => {
    // Generate unique ID
    const count = components.filter((c) => c.typeId === item.typeId).length + 1;
    const newId = `${item.typeId}_${count}_${Math.random().toString(36).substr(2, 4)}`;

    // Stagger spawn location
    const spawnX = (components.length % 4) * 0.8 - 1.2;
    const spawnZ = Math.floor(components.length / 4) * 0.8 - 0.4;

    const newComponent: CircuitComponent = {
      id: newId,
      typeId: item.typeId,
      name: `${item.name} #${count}`,
      category: item.category as any,
      model3DUrl: `/models/${item.typeId}.glb`,
      position: [spawnX, 0.2, spawnZ],
      rotation: [0, 0, 0],
      properties: { ...item.defaultProperties },
      pins: item.pins.map((p) => ({
        id: p.id,
        name: p.name,
        type: p.type as any,
        position3D: p.rel3D
          ? [spawnX + p.rel3D[0], 0.2 + p.rel3D[1], spawnZ + p.rel3D[2]]
          : [spawnX, 0.2, spawnZ],
      })),
    };

    addComponent(newComponent);
  };

  return (
    <aside className="w-80 h-full bg-[#07110D]/95 border-r border-[#39FF6A]/20 flex flex-col backdrop-blur-xl z-20 font-sans select-none">
      {/* Header & Search */}
      <div className="p-3.5 border-b border-gray-800 bg-[#0E2A1F]/40 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#39FF6A]" />
            <h2 className="text-xs font-bold text-white tracking-wider uppercase">
              Components Library
            </h2>
          </div>
          <span className="text-[10px] text-gray-400 font-mono">
            {filteredItems.length} items
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Arduino, LED, Button, Resistor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#050B08] border border-gray-700/80 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#39FF6A] transition"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] whitespace-nowrap transition ${
                  isSelected
                    ? 'bg-[#39FF6A] text-black font-bold shadow-sm'
                    : 'bg-gray-800/40 text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="w-3 h-3" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Component Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin scrollbar-thumb-gray-800">
        {filteredItems.map((item) => (
          <div
            key={item.typeId}
            className="p-3 rounded-xl bg-[#0E2A1F]/30 hover:bg-[#0E2A1F]/60 border border-gray-800 hover:border-[#39FF6A]/40 transition group"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div>
                <h3 className="text-xs font-bold text-white group-hover:text-[#39FF6A] transition">
                  {item.name}
                </h3>
                <span className="text-[9px] font-mono text-gray-400">
                  {item.operatingVoltage}
                </span>
              </div>
              <button
                onClick={() => handleAddComponent(item)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#39FF6A]/10 hover:bg-[#39FF6A] text-[#39FF6A] hover:text-black border border-[#39FF6A]/30 text-[10px] font-bold transition shadow-sm"
                title={`Add ${item.name} to workspace`}
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            </div>

            <p className="text-[11px] text-gray-400 leading-tight mb-2">
              {item.description}
            </p>

            {/* Pins overview count */}
            <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono pt-1.5 border-t border-gray-800/60">
              <span>{item.pins.length} Pin Terminals</span>
              <span className="text-[#7FE7D6] text-[9px] uppercase">{item.category}</span>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-xs">
            No electronic components match &ldquo;{searchQuery}&rdquo;.
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2.5 border-t border-gray-800 bg-[#050B08] text-[10px] text-gray-400 flex items-center justify-between">
        <span className="text-gray-400">Drag or click &ldquo;Add&rdquo; to place</span>
        <span className="text-[#39FF6A] font-mono">100% Wire Compatible</span>
      </div>
    </aside>
  );
};
