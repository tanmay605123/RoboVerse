'use client';

import React, { useState } from 'react';
import {
  Wrench,
  Cpu,
  Layers,
  Battery,
  Zap,
  Gauge,
  Scale,
  Trash2,
  Plus,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Shield,
  Activity,
  Code2,
} from 'lucide-react';
import {
  useRobotStore,
  ROBOT_TEMPLATES,
  ChassisType,
  AttachedRobotPart,
} from '@/store/useRobotStore';

// Common addable hardware modules for custom mounting
const ADDABLE_COMPONENTS: Array<{
  componentTypeId: string;
  name: string;
  category: AttachedRobotPart['category'];
  massG: number;
  powerMw: number;
  snapPointId: string;
  defaultPos: [number, number, number];
}> = [
  {
    componentTypeId: 'ultrasonic_hcsr04',
    name: 'HC-SR04 Sonar Turret',
    category: 'sensor',
    massG: 12,
    powerMw: 80,
    snapPointId: 'turret_sensor',
    defaultPos: [0, 0.28, -0.65],
  },
  {
    componentTypeId: 'ir_line_array_5ch',
    name: '5-Ch IR Line Array',
    category: 'sensor',
    massG: 18,
    powerMw: 90,
    snapPointId: 'mount_ground_ir',
    defaultPos: [0, 0.03, -0.75],
  },
  {
    componentTypeId: 'mpu6050',
    name: 'MPU6050 6-DoF Gyro',
    category: 'sensor',
    massG: 5,
    powerMw: 40,
    snapPointId: 'deck_imu',
    defaultPos: [0, 0.22, 0],
  },
  {
    componentTypeId: 'arduino_uno',
    name: 'Arduino Uno R3',
    category: 'controller',
    massG: 25,
    powerMw: 200,
    snapPointId: 'deck_mcu',
    defaultPos: [0, 0.18, 0],
  },
  {
    componentTypeId: 'esp32',
    name: 'ESP32 Wi-Fi/BT Core',
    category: 'controller',
    massG: 15,
    powerMw: 250,
    snapPointId: 'deck_fc',
    defaultPos: [0, 0.18, 0],
  },
  {
    componentTypeId: 'motor_driver_l298n',
    name: 'L298N Dual H-Bridge',
    category: 'controller',
    massG: 32,
    powerMw: 150,
    snapPointId: 'deck_driver',
    defaultPos: [0, 0.18, 0.4],
  },
  {
    componentTypeId: 'battery_lipo_3s',
    name: '3S LiPo 11.1V 2200mAh',
    category: 'battery',
    massG: 190,
    powerMw: 0,
    snapPointId: 'bay_battery',
    defaultPos: [0, 0.1, -0.2],
  },
  {
    componentTypeId: 'battery_aa_pack_4',
    name: '4xAA 6V Battery Pack',
    category: 'battery',
    massG: 120,
    powerMw: 0,
    snapPointId: 'bay_battery',
    defaultPos: [0, 0.1, -0.3],
  },
  {
    componentTypeId: 'servo_mg996r',
    name: 'MG996R High Torque Servo',
    category: 'motor',
    massG: 55,
    powerMw: 600,
    snapPointId: 'turntable',
    defaultPos: [0, 0.1, 0],
  },
  {
    componentTypeId: 'robot_gripper',
    name: 'Precision Claw Gripper',
    category: 'gripper',
    massG: 35,
    powerMw: 350,
    snapPointId: 'end_effector',
    defaultPos: [0, 1.05, 0],
  },
];

export const RoboticsBuilderSidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'TEMPLATES' | 'DIAGNOSTICS' | 'PARTS' | 'CODE'>('TEMPLATES');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const {
    selectedTemplateId,
    loadTemplate,
    currentDesignTitle,
    setDesignTitle,
    chassisType,
    setChassisType,
    attachedParts,
    attachPart,
    detachPart,
    resetAssembly,
    totalMassG,
    centerOfMass,
    powerBudgetMw,
    batteryCapacityMah,
    estimatedRuntimeMin,
    thrustToWeightRatio,
  } = useRobotStore();

  const currentTemplate = ROBOT_TEMPLATES[selectedTemplateId] || ROBOT_TEMPLATES.tmpl_obstacle_car;

  // Mass budget percentage
  const maxSafeMassG = chassisType === 'drone_f450' ? 950 : 1400;
  const massPct = Math.min(100, Math.round((totalMassG / maxSafeMassG) * 100));

  if (isCollapsed) {
    return (
      <div className="absolute top-20 left-4 z-20">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-3 rounded-2xl bg-[#040B08]/90 border border-[rgba(57,255,106,0.3)] shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-[#39FF6A] hover:bg-[#39FF6A]/10 transition-all flex items-center gap-2 font-mono text-xs"
        >
          <Wrench className="w-4 h-4" />
          <span className="font-bold">CAD Tooling</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <aside className="absolute top-20 left-4 bottom-28 w-80 md:w-96 z-20 flex flex-col rounded-3xl bg-[#040B08]/90 backdrop-blur-xl border border-[rgba(57,255,106,0.25)] shadow-[0_16px_48px_rgba(0,0,0,0.7)] overflow-hidden font-sans select-none">
      {/* Top Header */}
      <div className="p-4 border-b border-[rgba(57,255,106,0.15)] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#39FF6A]/10 border border-[#39FF6A]/30 flex items-center justify-center text-[#39FF6A]">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-[#7FE7D6] tracking-wider font-bold">
              CAD Architecture
            </span>
            <input
              type="text"
              value={currentDesignTitle}
              onChange={(e) => setDesignTitle(e.target.value)}
              className="bg-transparent text-sm font-bold text-[#EAF7EF] focus:outline-none focus:border-b focus:border-[#39FF6A] w-48 block"
              placeholder="Design Title..."
            />
          </div>
        </div>

        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1.5 rounded-lg text-[#8FA99B] hover:text-[#EAF7EF] hover:bg-white/5 transition-colors"
          title="Collapse Panel"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="grid grid-cols-4 p-2 gap-1 bg-black/40 border-b border-[rgba(57,255,106,0.1)] text-[11px] font-mono">
        <button
          onClick={() => setActiveTab('TEMPLATES')}
          className={`py-1.5 rounded-lg font-bold transition-all ${
            activeTab === 'TEMPLATES'
              ? 'bg-[#39FF6A] text-[#07110D]'
              : 'text-[#8FA99B] hover:text-[#EAF7EF]'
          }`}
        >
          Presets
        </button>
        <button
          onClick={() => setActiveTab('DIAGNOSTICS')}
          className={`py-1.5 rounded-lg font-bold transition-all ${
            activeTab === 'DIAGNOSTICS'
              ? 'bg-[#39FF6A] text-[#07110D]'
              : 'text-[#8FA99B] hover:text-[#EAF7EF]'
          }`}
        >
          Physics
        </button>
        <button
          onClick={() => setActiveTab('PARTS')}
          className={`py-1.5 rounded-lg font-bold transition-all ${
            activeTab === 'PARTS'
              ? 'bg-[#39FF6A] text-[#07110D]'
              : 'text-[#8FA99B] hover:text-[#EAF7EF]'
          }`}
        >
          Parts ({attachedParts.length})
        </button>
        <button
          onClick={() => setActiveTab('CODE')}
          className={`py-1.5 rounded-lg font-bold transition-all ${
            activeTab === 'CODE'
              ? 'bg-[#39FF6A] text-[#07110D]'
              : 'text-[#8FA99B] hover:text-[#EAF7EF]'
          }`}
        >
          MCU Code
        </button>
      </div>

      {/* Tab Contents Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ================= TAB 1: PRESET TEMPLATES ================= */}
        {activeTab === 'TEMPLATES' && (
          <div className="space-y-3">
            <p className="text-xs text-[#8FA99B] font-mono">
              Select an engineered robot template to load standard kinematics, wiring & starter code:
            </p>

            <div className="space-y-2.5">
              {Object.values(ROBOT_TEMPLATES).map((tmpl) => {
                const isSelected = selectedTemplateId === tmpl.id;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => loadTemplate(tmpl.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#39FF6A]/10 border-[#39FF6A] shadow-[0_0_16px_rgba(57,255,106,0.2)]'
                        : 'bg-[#07110D]/60 border-white/10 hover:border-[#39FF6A]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/5 text-[#7FE7D6]">
                        {tmpl.category}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-mono font-bold text-[#39FF6A]">
                          LOADED
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-[#EAF7EF] mb-1">
                      {tmpl.name}
                    </h4>
                    <p className="text-xs text-white/60 line-clamp-2">
                      {tmpl.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 2: PHYSICAL DIAGNOSTICS ================= */}
        {activeTab === 'DIAGNOSTICS' && (
          <div className="space-y-4">
            {/* Chassis Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-[#8FA99B] uppercase font-bold">
                Chassis Architecture
              </label>
              <select
                value={chassisType}
                onChange={(e) => setChassisType(e.target.value as ChassisType)}
                className="w-full bg-[#07110D] border border-[rgba(57,255,106,0.3)] rounded-xl px-3 py-2 text-xs font-mono text-[#EAF7EF] focus:outline-none focus:border-[#39FF6A]"
              >
                <option value="chassis_2wd">2WD Differential Drive (Rover)</option>
                <option value="chassis_4wd">4WD Heavy-Duty Aluminum (Rover)</option>
                <option value="drone_f450">F450 Quadcopter Carbon Frame</option>
                <option value="arm_4dof">4-DOF Articulated Arm Turntable</option>
              </select>
            </div>

            {/* Mass Budget Card */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#8FA99B] flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-[#39FF6A]" /> Total Mass
                </span>
                <span className="font-bold text-[#EAF7EF]">
                  {totalMassG} g <span className="text-white/40">/ {maxSafeMassG} g</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    massPct > 90 ? 'bg-[#FF9A1F]' : 'bg-[#39FF6A]'
                  }`}
                  style={{ width: `${massPct}%` }}
                />
              </div>
            </div>

            {/* Center of Mass (CoM) */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#8FA99B] flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#7FE7D6]" /> Center of Mass (CoM)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#39FF6A]/10 text-[#39FF6A] font-bold">
                  STABLE
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
                <div className="p-2 rounded-xl bg-white/5">
                  <span className="text-[10px] text-white/40 block">X</span>
                  <span className="font-bold text-[#EAF7EF]">{centerOfMass[0]}m</span>
                </div>
                <div className="p-2 rounded-xl bg-white/5">
                  <span className="text-[10px] text-white/40 block">Y</span>
                  <span className="font-bold text-[#EAF7EF]">{centerOfMass[1]}m</span>
                </div>
                <div className="p-2 rounded-xl bg-white/5">
                  <span className="text-[10px] text-white/40 block">Z</span>
                  <span className="font-bold text-[#EAF7EF]">{centerOfMass[2]}m</span>
                </div>
              </div>
            </div>

            {/* Power & Battery */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#8FA99B] flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#FF9A1F]" /> Power Consumption
                </span>
                <span className="font-bold text-[#EAF7EF]">{powerBudgetMw} mW</span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#8FA99B] flex items-center gap-1.5">
                  <Battery className="w-3.5 h-3.5 text-[#39FF6A]" /> Estimated Runtime
                </span>
                <span className="font-bold text-[#39FF6A]">~{estimatedRuntimeMin} mins</span>
              </div>

              {chassisType === 'drone_f450' && (
                <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-white/5">
                  <span className="text-[#8FA99B]">Thrust-to-Weight</span>
                  <span className="font-bold text-[#7FE7D6]">
                    {thrustToWeightRatio} : 1 {thrustToWeightRatio >= 1.5 ? '(Flight Ready)' : '(Underpowered)'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: ATTACHED PARTS & PALETTE ================= */}
        {activeTab === 'PARTS' && (
          <div className="space-y-4">
            {/* Current Parts List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-[#8FA99B]">
                <span className="font-bold uppercase">Assembled Modules ({attachedParts.length})</span>
                <button
                  onClick={resetAssembly}
                  className="flex items-center gap-1 text-[11px] text-[#FF9A1F] hover:underline"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>

              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {attachedParts.map((part) => (
                  <div
                    key={part.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs font-mono"
                  >
                    <div>
                      <h5 className="font-bold text-[#EAF7EF] text-[11px]">{part.name}</h5>
                      <div className="flex items-center gap-2 text-[10px] text-[#8FA99B]">
                        <span>{part.massG}g</span>
                        <span>•</span>
                        <span>{part.powerMw}mW</span>
                      </div>
                    </div>
                    {part.id !== 'p_chassis' && part.id !== 'p_frame' && (
                      <button
                        onClick={() => detachPart(part.id)}
                        className="p-1.5 rounded-lg text-white/40 hover:text-[#FF9A1F] hover:bg-white/5 transition-colors"
                        title="Remove part"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Mountable Hardware Catalog */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <span className="text-xs font-mono font-bold uppercase text-[#7FE7D6] block">
                Snap-Mount New Component
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {ADDABLE_COMPONENTS.map((item) => (
                  <div
                    key={item.componentTypeId}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#07110D] border border-white/10 hover:border-[#39FF6A]/40 transition-colors text-xs font-mono"
                  >
                    <div>
                      <span className="font-bold text-[#EAF7EF] block text-[11px]">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-white/40">
                        +{item.massG}g • {item.powerMw}mW
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        attachPart(item.snapPointId, {
                          componentTypeId: item.componentTypeId,
                          name: item.name,
                          category: item.category,
                          massG: item.massG,
                          powerMw: item.powerMw,
                          position: item.defaultPos,
                        })
                      }
                      className="px-2.5 py-1 rounded-lg bg-[#39FF6A]/10 border border-[#39FF6A]/30 text-[#39FF6A] hover:bg-[#39FF6A] hover:text-[#07110D] transition-all flex items-center gap-1 text-[10px] font-bold"
                    >
                      <Plus className="w-3 h-3" /> Mount
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: STARTER CODE ================= */}
        {activeTab === 'CODE' && (
          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-[#8FA99B]">
              <span className="font-bold uppercase">C++ Firmware Logic</span>
              <span className="text-[10px] text-[#7FE7D6]">Auto-synced</span>
            </div>
            <pre className="p-3 rounded-2xl bg-black/60 border border-white/10 text-[#39FF6A] text-[11px] overflow-x-auto leading-relaxed max-h-96">
              <code>{currentTemplate.starterCode}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-[rgba(57,255,106,0.15)] flex items-center justify-between text-[11px] font-mono text-[#8FA99B] bg-black/40">
        <span>Kinematic Model: <strong className="text-[#39FF6A]">{chassisType}</strong></span>
        <span className="text-[#7FE7D6]">Ready to Sim</span>
      </div>
    </aside>
  );
};
