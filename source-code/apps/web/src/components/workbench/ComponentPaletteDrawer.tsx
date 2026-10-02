'use client';

import React, { useState } from 'react';
import {
  CircuitComponent,
  ComponentCategory,
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
} from 'lucide-react';

interface PaletteItem {
  typeId: string;
  name: string;
  category: ComponentCategory;
  tier: 'FREE' | 'PLUS' | 'PRO';
  description: string;
  operatingVoltage: string;
  defaultProperties: Record<string, any>;
  pins: any[];
}

const CATALOG_ITEMS: PaletteItem[] = [
  // Microcontrollers
  {
    typeId: 'arduino_uno',
    name: 'Arduino Uno R3',
    category: 'MICROCONTROLLER',
    tier: 'FREE',
    description: 'ATmega328P 16MHz microcontroller with 14 digital I/O pins and 6 analog inputs.',
    operatingVoltage: '5V DC',
    defaultProperties: { clockMhz: 16 },
    pins: [
      { id: 'pin_5v', name: '5V', type: 'POWER_VCC' },
      { id: 'pin_3v3', name: '3.3V', type: 'POWER_VCC' },
      { id: 'pin_gnd_1', name: 'GND', type: 'GROUND' },
      { id: 'pin_d13', name: 'D13', type: 'DIGITAL_IO' },
      { id: 'pin_d9', name: 'D9 (PWM)', type: 'PWM' },
      { id: 'pin_a0', name: 'A0', type: 'ANALOG_IN' },
    ],
  },
  {
    typeId: 'arduino_nano',
    name: 'Arduino Nano',
    category: 'MICROCONTROLLER',
    tier: 'FREE',
    description: 'Compact breadboard-friendly ATmega328P microcontroller.',
    operatingVoltage: '5V DC',
    defaultProperties: { clockMhz: 16 },
    pins: [
      { id: 'pin_5v', name: '5V', type: 'POWER_VCC' },
      { id: 'pin_gnd', name: 'GND', type: 'GROUND' },
      { id: 'pin_d13', name: 'D13', type: 'DIGITAL_IO' },
    ],
  },
  {
    typeId: 'esp32_devkit',
    name: 'ESP32 DevKit V1',
    category: 'MICROCONTROLLER',
    tier: 'PLUS',
    description: 'Dual-core 240MHz Tensilica MCU with 2.4GHz Wi-Fi & Bluetooth 4.2 BLE.',
    operatingVoltage: '3.3V DC',
    defaultProperties: { clockMhz: 240, wifi: true },
    pins: [
      { id: 'pin_3v3', name: '3.3V', type: 'POWER_VCC' },
      { id: 'pin_gnd', name: 'GND', type: 'GROUND' },
      { id: 'gpio_2', name: 'GPIO 2 (LED)', type: 'DIGITAL_IO' },
    ],
  },

  // Actuators
  {
    typeId: 'led_red',
    name: 'Red 5mm LED',
    category: 'ACTUATOR',
    tier: 'FREE',
    description: 'High-brightness red indicator LED with 2.0V forward drop.',
    operatingVoltage: '2.0V - 2.2V (requires 220Ω resistor)',
    defaultProperties: { forwardVoltage: 2.0, color: '#FF3333' },
    pins: [
      { id: 'anode', name: 'Anode (+)', type: 'DIGITAL_IO' },
      { id: 'cathode', name: 'Cathode (-)', type: 'GROUND' },
    ],
  },
  {
    typeId: 'led_green',
    name: 'Green 5mm LED',
    category: 'ACTUATOR',
    tier: 'FREE',
    description: 'Standard 5mm green diffused LED.',
    operatingVoltage: '2.2V - 2.4V (requires 220Ω resistor)',
    defaultProperties: { forwardVoltage: 2.2, color: '#39FF6A' },
    pins: [
      { id: 'anode', name: 'Anode (+)', type: 'DIGITAL_IO' },
      { id: 'cathode', name: 'Cathode (-)', type: 'GROUND' },
    ],
  },
  {
    typeId: 'buzzer_active',
    name: '5V Active Buzzer',
    category: 'ACTUATOR',
    tier: 'FREE',
    description: 'Generates a constant audible 2.5kHz beep when 5V is applied.',
    operatingVoltage: '3.5V - 5.5V DC',
    defaultProperties: { frequencyHz: 2500 },
    pins: [
      { id: 'vcc', name: 'VCC (+)', type: 'POWER_VCC' },
      { id: 'gnd', name: 'GND (-)', type: 'GROUND' },
    ],
  },
  {
    typeId: 'servo_sg90',
    name: 'SG90 Micro Servo',
    category: 'ACTUATOR',
    tier: 'PLUS',
    description: '9g positional servo motor with 0° - 180° rotation controlled via 50Hz PWM.',
    operatingVoltage: '4.8V - 6.0V DC',
    defaultProperties: { angle: 90, torqueKgCm: 1.8 },
    pins: [
      { id: 'vcc', name: 'VCC (Red)', type: 'POWER_VCC' },
      { id: 'gnd', name: 'GND (Brown)', type: 'GROUND' },
      { id: 'pwm', name: 'Signal (Orange)', type: 'PWM' },
    ],
  },
  {
    typeId: 'motor_dc_tt',
    name: 'TT DC Gear Motor',
    category: 'ACTUATOR',
    tier: 'PLUS',
    description: '1:48 dual-shaft gear motor for rover wheels and mobile robots.',
    operatingVoltage: '3.0V - 6.0V DC',
    defaultProperties: { maxRpm: 200 },
    pins: [
      { id: 'pin_1', name: 'Terminal +', type: 'POWER_VCC' },
      { id: 'pin_2', name: 'Terminal -', type: 'GROUND' },
    ],
  },

  // Sensors
  {
    typeId: 'sensor_ldr',
    name: 'Photoresistor (LDR)',
    category: 'SENSOR',
    tier: 'FREE',
    description: 'Light-dependent resistor; resistance drops from 1MΩ (dark) to 10kΩ (light).',
    operatingVoltage: '0V - 5V in voltage divider',
    defaultProperties: { darkResistanceK: 1000, lightResistanceK: 10 },
    pins: [
      { id: 'pin_1', name: 'Pin 1', type: 'DIGITAL_IO' },
      { id: 'pin_2', name: 'Pin 2', type: 'DIGITAL_IO' },
    ],
  },
  {
    typeId: 'sensor_ultrasonic_hcsr04',
    name: 'HC-SR04 Ultrasonic Sensor',
    category: 'SENSOR',
    tier: 'PLUS',
    description: 'Non-contact sonar ranging module measuring distance from 2cm to 400cm.',
    operatingVoltage: '5.0V DC',
    defaultProperties: { testDistanceCm: 25 },
    pins: [
      { id: 'vcc', name: 'VCC', type: 'POWER_VCC' },
      { id: 'trig', name: 'Trig', type: 'DIGITAL_IO' },
      { id: 'echo', name: 'Echo', type: 'DIGITAL_IO' },
      { id: 'gnd', name: 'GND', type: 'GROUND' },
    ],
  },
  {
    typeId: 'sensor_pir_hc_sr501',
    name: 'PIR Motion Sensor',
    category: 'SENSOR',
    tier: 'PLUS',
    description: 'Pyroelectric infrared sensor detecting human/animal motion up to 7 meters.',
    operatingVoltage: '4.5V - 12V DC',
    defaultProperties: { delaySeconds: 3 },
    pins: [
      { id: 'vcc', name: 'VCC', type: 'POWER_VCC' },
      { id: 'out', name: 'OUT (3.3V High)', type: 'DIGITAL_IO' },
      { id: 'gnd', name: 'GND', type: 'GROUND' },
    ],
  },
  {
    typeId: 'sensor_dht11',
    name: 'DHT11 Temp & Humidity',
    category: 'SENSOR',
    tier: 'PLUS',
    description: 'Digital temperature (0-50°C) and relative humidity (20-90% RH) sensor.',
    operatingVoltage: '3.3V - 5.0V DC',
    defaultProperties: { tempC: 25, humidityPct: 55 },
    pins: [
      { id: 'vcc', name: 'VCC', type: 'POWER_VCC' },
      { id: 'data', name: 'DATA', type: 'DIGITAL_IO' },
      { id: 'gnd', name: 'GND', type: 'GROUND' },
    ],
  },

  // Passives
  {
    typeId: 'resistor_220',
    name: '220Ω Resistor',
    category: 'PASSIVE',
    tier: 'FREE',
    description: 'Ideal current-limiting resistor for 5V LEDs (Red, Yellow, Green).',
    operatingVoltage: '1/4 Watt rated',
    defaultProperties: { resistanceOhms: 220 },
    pins: [
      { id: 'lead_1', name: 'Lead 1', type: 'DIGITAL_IO' },
      { id: 'lead_2', name: 'Lead 2', type: 'DIGITAL_IO' },
    ],
  },
  {
    typeId: 'resistor_10k',
    name: '10kΩ Resistor',
    category: 'PASSIVE',
    tier: 'FREE',
    description: 'Standard pull-up or pull-down resistor for buttons and switches.',
    operatingVoltage: '1/4 Watt rated',
    defaultProperties: { resistanceOhms: 10000 },
    pins: [
      { id: 'lead_1', name: 'Lead 1', type: 'DIGITAL_IO' },
      { id: 'lead_2', name: 'Lead 2', type: 'DIGITAL_IO' },
    ],
  },
  {
    typeId: 'potentiometer_10k',
    name: '10kΩ Potentiometer',
    category: 'PASSIVE',
    tier: 'FREE',
    description: 'Rotary variable resistor for analog voltage division.',
    operatingVoltage: '0V - 5V',
    defaultProperties: { resistanceOhms: 10000, wiperPositionPct: 50 },
    pins: [
      { id: 'pin_1', name: 'Terminal A', type: 'DIGITAL_IO' },
      { id: 'wiper', name: 'Wiper (Out)', type: 'ANALOG_IN' },
      { id: 'pin_2', name: 'Terminal B', type: 'DIGITAL_IO' },
    ],
  },
  {
    typeId: 'push_button',
    name: 'Tactile Push Button',
    category: 'PASSIVE',
    tier: 'FREE',
    description: 'Momentary 6x6mm tactile push switch.',
    operatingVoltage: '12V DC 50mA max',
    defaultProperties: { isPressed: false },
    pins: [
      { id: 'pin_1', name: 'Terminal 1', type: 'DIGITAL_IO' },
      { id: 'pin_2', name: 'Terminal 2', type: 'DIGITAL_IO' },
    ],
  },

  // Displays
  {
    typeId: 'lcd_1602_i2c',
    name: '16x2 I2C LCD Display',
    category: 'DISPLAY',
    tier: 'PRO',
    description: 'Alphanumeric liquid crystal display with PCF8574 I2C backpack (addr 0x27).',
    operatingVoltage: '5.0V DC',
    defaultProperties: { textRow1: 'RoboVerse OS', textRow2: 'Online' },
    pins: [
      { id: 'gnd', name: 'GND', type: 'GROUND' },
      { id: 'vcc', name: 'VCC (5V)', type: 'POWER_VCC' },
      { id: 'sda', name: 'SDA (A4)', type: 'I2C_SDA' },
      { id: 'scl', name: 'SCL (A5)', type: 'I2C_SCL' },
    ],
  },
];

const CATEGORIES: { id: string; label: string; icon: any }[] = [
  { id: 'ALL', label: 'All', icon: Zap },
  { id: 'MICROCONTROLLER', label: 'MCUs', icon: Cpu },
  { id: 'ACTUATOR', label: 'Actuators', icon: Activity },
  { id: 'SENSOR', label: 'Sensors', icon: Radio },
  { id: 'PASSIVE', label: 'Passives', icon: Sliders },
  { id: 'DISPLAY', label: 'Displays', icon: Tv },
];

export const ComponentPaletteDrawer: React.FC = () => {
  const { addComponent, components } = useCircuitStore();
  const { planTier } = useAuthStore();
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewItem, setPreviewItem] = useState<PaletteItem | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const filteredItems = CATALOG_ITEMS.filter((item) => {
    const matchesCat =
      activeCategory === 'ALL' || item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleItemClick = (item: PaletteItem) => {
    // Check plan permissions
    const isPro = planTier === PlanTier.PRO;
    const isPlus = planTier === PlanTier.PLUS || isPro;

    if (item.tier === 'PLUS' && !isPlus) {
      setShowUpgradeModal(true);
      return;
    }
    if (item.tier === 'PRO' && !isPro) {
      setShowUpgradeModal(true);
      return;
    }

    // Spawn component in workbench at offset
    const count = components.length;
    const newComponent: CircuitComponent = {
      id: `${item.typeId}_${Date.now().toString(36)}`,
      typeId: item.typeId,
      name: item.name,
      category: item.category,
      model3DUrl: `/models/${item.typeId}.glb`,
      position: [0.5 + (count % 3) * 0.8, 0.2, (count % 2) * 0.6],
      rotation: [0, 0, 0],
      properties: { ...item.defaultProperties },
      pins: item.pins.map((p) => ({
        ...p,
        position3D: [0, 0.2, 0],
      })),
    };

    addComponent(newComponent);
  };

  return (
    <div className="w-80 h-full bg-[#07110D]/95 border-r border-[#39FF6A]/20 flex flex-col backdrop-blur-xl z-20">
      {/* Drawer Header */}
      <div className="p-4 border-b border-[#39FF6A]/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#39FF6A]" />
            <h2 className="text-sm font-bold text-white tracking-wide">
              Component Library
            </h2>
          </div>
          <span className="text-[10px] font-mono bg-[#39FF6A]/10 text-[#39FF6A] border border-[#39FF6A]/30 px-2 py-0.5 rounded-full">
            {filteredItems.length} Available
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Arduino, sensor, LED..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0E2A1F]/60 border border-gray-700/60 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#39FF6A]"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 p-2 overflow-x-auto border-b border-gray-800 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#39FF6A]/20 text-[#39FF6A] border border-[#39FF6A]/40 font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/40 border border-transparent'
              }`}
            >
              <Icon className="w-3 h-3" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Components List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredItems.map((item) => {
          const isFree = item.tier === 'FREE';
          const isPlus = item.tier === 'PLUS';
          const isPro = item.tier === 'PRO';

          return (
            <div
              key={item.typeId}
              className="group relative p-3 rounded-xl bg-[#0E2A1F]/40 border border-gray-800 hover:border-[#39FF6A]/50 transition-all cursor-pointer hover:bg-[#0E2A1F]/70 hover:shadow-lg"
              onClick={() => handleItemClick(item)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white group-hover:text-[#39FF6A] transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                    {item.description}
                  </p>
                </div>

                {/* Plan Tier Badge */}
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider ${
                    isFree
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                      : isPlus
                      ? 'bg-teal-950/80 text-teal-400 border border-teal-800/50'
                      : 'bg-amber-950/80 text-amber-400 border border-amber-800/50'
                  }`}
                >
                  {item.tier}
                </span>
              </div>

              {/* Footer action buttons */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-800/60">
                <span className="text-[10px] text-gray-500 font-mono">
                  {item.operatingVoltage}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewItem(item);
                    }}
                    className="p-1 text-gray-400 hover:text-[#7FE7D6] hover:bg-gray-800 rounded transition"
                    title="View Datasheet & Pinout"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleItemClick(item);
                    }}
                    className="flex items-center gap-1 px-2 py-0.5 bg-[#39FF6A]/10 hover:bg-[#39FF6A]/20 text-[#39FF6A] border border-[#39FF6A]/30 rounded text-[10px] font-bold transition"
                  >
                    <Plus className="w-3 h-3" />
                    Add
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Datasheet Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#07110D] border border-[#39FF6A]/40 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#39FF6A]" />
              <h3 className="text-base font-bold text-white">{previewItem.name}</h3>
            </div>
            <p className="text-xs text-gray-400 mb-4">{previewItem.description}</p>

            <div className="space-y-3 font-mono text-xs">
              <div className="bg-[#0E2A1F] p-3 rounded-lg border border-gray-800">
                <span className="text-gray-400">Operating Voltage: </span>
                <span className="text-[#39FF6A] font-bold">{previewItem.operatingVoltage}</span>
              </div>

              <div className="bg-[#0E2A1F] p-3 rounded-lg border border-gray-800">
                <span className="text-gray-400">Category: </span>
                <span className="text-[#7FE7D6] font-bold">{previewItem.category}</span>
              </div>

              <div className="bg-[#0E2A1F] p-3 rounded-lg border border-gray-800">
                <div className="text-gray-400 mb-2 font-sans font-bold">Pinout Specifications:</div>
                <div className="space-y-1">
                  {previewItem.pins.map((p) => (
                    <div key={p.id} className="flex justify-between text-[11px] text-gray-300">
                      <span>{p.name}</span>
                      <span className="text-[#39FF6A]">{p.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                handleItemClick(previewItem);
                setPreviewItem(null);
              }}
              className="w-full mt-6 py-2 bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] text-black font-bold text-xs rounded-xl shadow-lg hover:brightness-110 transition"
            >
              Add to Workbench
            </button>
          </div>
        </div>
      )}

      {/* Upgrade Plan Paywall Prompt Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#07110D] border border-[#7FE7D6]/50 rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl relative">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#7FE7D6]/10 border border-[#7FE7D6]/40 mx-auto flex items-center justify-center text-[#7FE7D6] mb-4">
              <Lock className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white mb-2">Upgrade to RoboVerse Plus</h3>
            <p className="text-xs text-gray-300 mb-6">
              Unlock the entire component library (Ultrasonic, Servos, TT Motors, DHT11, ESP32, and Oscilloscope) starting at just ₹299/month (incl. 18% GST).
            </p>

            <div className="space-y-2">
              <a
                href="/#pricing"
                className="block w-full py-2.5 bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] text-black font-bold text-xs rounded-xl shadow-lg hover:brightness-110 transition"
              >
                View Plans & Upgrade
              </a>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="block w-full py-2 text-xs text-gray-400 hover:text-white"
              >
                Keep Exploring Free Components
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
