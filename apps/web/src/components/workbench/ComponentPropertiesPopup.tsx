'use client';

import React from 'react';
import { CircuitComponent } from '@roboverse/shared';
import { X, RotateCw, Trash2, Cpu, Info, Sliders } from 'lucide-react';

interface ComponentPropertiesPopupProps {
  component: CircuitComponent;
  onUpdateProperties: (id: string, properties: Record<string, any>) => void;
  onRotate: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  position?: { x: number; y: number };
}

export const ComponentPropertiesPopup: React.FC<ComponentPropertiesPopupProps> = ({
  component,
  onUpdateProperties,
  onRotate,
  onDelete,
  onClose,
  position,
}) => {
  const isResistor = component.typeId.includes('resistor');
  const isLed = component.typeId.includes('led');
  const isUltrasonic = component.typeId.includes('ultrasonic');
  const isServo = component.typeId.includes('servo');
  const isPotentiometer = component.typeId.includes('potentiometer');
  const isBattery = component.typeId.includes('battery');

  return (
    <div
      className="absolute z-40 w-72 bg-[#0A1F17]/95 backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] border border-[rgba(57,255,106,0.3)] p-4 select-none animate-slide-up text-[#EAF7EF] font-mono"
      style={{
        left: position ? `${Math.min(window.innerWidth - 320, Math.max(20, position.x))}px` : '20px',
        top: position ? `${Math.min(window.innerHeight - 360, Math.max(80, position.y))}px` : '80px',
      }}
    >
      {/* Header with Title & Reference Designator */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[rgba(57,255,106,0.15)]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[rgba(57,255,106,0.15)] text-[#39FF6A] flex items-center justify-center">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#EAF7EF] truncate max-w-[150px]">
              {component.name}
            </h4>
            <span className="text-[10px] text-[#8FA99B]">{component.id}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-full text-[#8FA99B] hover:text-[#39FF6A]"
          aria-label="Close properties"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Component Specific Parametric Controls */}
      <div className="py-3 space-y-3 text-xs">
        {/* Resistor Resistance & Unit */}
        {isResistor && (
          <div>
            <label className="block text-[11px] font-bold text-[#8FA99B] mb-1">
              Resistance Value
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max="10000000"
                value={component.properties?.resistanceOhms ?? 220}
                onChange={(e) =>
                  onUpdateProperties(component.id, {
                    ...component.properties,
                    resistanceOhms: parseFloat(e.target.value) || 220,
                  })
                }
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#040B08] border border-[rgba(57,255,106,0.2)] font-mono text-xs text-[#EAF7EF] focus:border-[#39FF6A] focus:outline-none"
              />
              <span className="px-3 py-1.5 rounded-lg bg-[#040B08] border border-[rgba(57,255,106,0.2)] text-xs font-bold text-[#39FF6A]">
                Ω
              </span>
            </div>
            <p className="text-[10px] text-[#8FA99B] mt-1">Color bands update dynamically</p>
          </div>
        )}

        {/* LED Color Picker */}
        {isLed && (
          <div>
            <label className="block text-[11px] font-bold text-brand-navy dark:text-gray-200 mb-1">
              LED Color
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { label: 'Red', color: '#FF3333' },
                { label: 'Green', color: '#12B76A' },
                { label: 'Blue', color: '#3B82F6' },
                { label: 'Yellow', color: '#F59E0B' },
                { label: 'White', color: '#FFFFFF' },
              ].map((c) => (
                <button
                  key={c.label}
                  onClick={() =>
                    onUpdateProperties(component.id, {
                      ...component.properties,
                      color: c.color,
                      colorName: c.label,
                    })
                  }
                  className={`h-7 rounded-lg border flex items-center justify-center transition-all ${
                    component.properties?.color === c.color
                      ? 'border-2 border-brand-orange scale-105 shadow-xs'
                      : 'border-black/20 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.color }}
                  title={c.label}
                />
              ))}
            </div>
          </div>
        )}

        {/* Ultrasonic Sensor Interactive Distance Slider */}
        {isUltrasonic && (
          <div>
            <div className="flex justify-between text-[11px] font-bold text-brand-navy dark:text-gray-200 mb-1">
              <span>Obstacle Distance</span>
              <span className="text-brand-orange font-mono">
                {component.properties?.distanceCm ?? 45} cm
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="400"
              value={component.properties?.distanceCm ?? 45}
              onChange={(e) =>
                onUpdateProperties(component.id, {
                  ...component.properties,
                  distanceCm: parseInt(e.target.value, 10),
                })
              }
              className="w-full accent-brand-orange cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-brand-muted">
              <span>2 cm</span>
              <span>400 cm</span>
            </div>
          </div>
        )}

        {/* Servo Motor Angle Slider */}
        {isServo && (
          <div>
            <div className="flex justify-between text-[11px] font-bold text-brand-navy dark:text-gray-200 mb-1">
              <span>Horn Angle</span>
              <span className="text-brand-orange font-mono">
                {component.properties?.angle ?? 90}°
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="180"
              value={component.properties?.angle ?? 90}
              onChange={(e) =>
                onUpdateProperties(component.id, {
                  ...component.properties,
                  angle: parseInt(e.target.value, 10),
                })
              }
              className="w-full accent-brand-orange cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-brand-muted">
              <span>0°</span>
              <span>180°</span>
            </div>
          </div>
        )}

        {/* Potentiometer Dial Slider */}
        {isPotentiometer && (
          <div>
            <div className="flex justify-between text-[11px] font-bold text-brand-navy dark:text-gray-200 mb-1">
              <span>Wiper Position</span>
              <span className="text-brand-orange font-mono">
                {Math.round((component.properties?.position ?? 0.5) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round((component.properties?.position ?? 0.5) * 100)}
              onChange={(e) =>
                onUpdateProperties(component.id, {
                  ...component.properties,
                  position: parseInt(e.target.value, 10) / 100,
                })
              }
              className="w-full accent-brand-orange cursor-pointer"
            />
          </div>
        )}

        {/* Battery Voltage */}
        {isBattery && (
          <div>
            <label className="block text-[11px] font-bold text-[#8FA99B] mb-1">
              Output Voltage
            </label>
            <input
              type="number"
              step="0.5"
              value={component.properties?.voltage ?? 9.0}
              onChange={(e) =>
                onUpdateProperties(component.id, {
                  ...component.properties,
                  voltage: parseFloat(e.target.value) || 9.0,
                })
              }
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#040B08] border border-[rgba(57,255,106,0.2)] font-mono text-xs text-[#EAF7EF] focus:border-[#39FF6A] focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Footer Actions: Rotate and Delete */}
      <div className="pt-2.5 border-t border-[rgba(57,255,106,0.15)] flex items-center justify-between">
        <button
          onClick={() => onRotate(component.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(57,255,106,0.15)] border border-[rgba(57,255,106,0.2)] hover:border-[#39FF6A] text-xs font-bold text-[#EAF7EF] transition-colors"
        >
          <RotateCw className="w-3.5 h-3.5 text-[#39FF6A]" />
          <span>Rotate 45°</span>
        </button>

        <button
          onClick={() => onDelete(component.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(255,77,77,0.12)] border border-[rgba(255,77,77,0.3)] hover:bg-[rgba(255,77,77,0.25)] text-xs font-bold text-[#FF4D4D] transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};
