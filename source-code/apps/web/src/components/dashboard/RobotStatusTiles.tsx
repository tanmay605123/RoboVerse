'use client';

import React from 'react';
import { CheckCircle2, Wrench, AlertTriangle, ArrowRight } from 'lucide-react';

export function RobotStatusTiles() {
  const robots = [
    {
      id: 'rob_01',
      name: 'Rover 4WD Chassis A1',
      status: 'WORKING',
      statusLabel: 'Operational',
      color: 'text-robo-neon',
      bgGlow: 'bg-robo-neon/10',
      borderColor: 'border-robo-neon/40',
      icon: CheckCircle2,
      detail: 'Differential motors calibrated • IMU active',
      subsystems: '4/4 ONLINE',
    },
    {
      id: 'rob_02',
      name: 'Ultrasonic Servo Radar',
      status: 'UNDER_REPAIR',
      statusLabel: 'Under Repair',
      color: 'text-robo-orange',
      bgGlow: 'bg-robo-orange/10',
      borderColor: 'border-robo-orange/40',
      icon: Wrench,
      detail: 'Echo pin jitter detected • Firmware patch pending',
      subsystems: '2/3 ONLINE',
    },
    {
      id: 'rob_03',
      name: '6-DOF Articulated Arm',
      status: 'TO_BE_REPAIRED',
      statusLabel: 'Needs Repair',
      color: 'text-robo-red',
      bgGlow: 'bg-robo-red/10',
      borderColor: 'border-robo-red/40',
      icon: AlertTriangle,
      detail: 'Elbow servo current surge • Needs gear check',
      subsystems: '1/6 FAULT',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {robots.map((robot) => {
        const Icon = robot.icon;
        return (
          <div
            key={robot.id}
            className={`rounded-2xl glass-panel p-4 border ${robot.borderColor} flex flex-col justify-between transition-all hover:-translate-y-1`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${robot.bgGlow} ${robot.color} border border-current/30 flex items-center gap-1`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{robot.statusLabel}</span>
                </span>
                <span className="text-[10px] font-mono text-robo-textMuted">
                  {robot.subsystems}
                </span>
              </div>

              <h4 className="text-sm font-bold text-robo-text font-sans">
                {robot.name}
              </h4>
              <p className="text-xs text-robo-textSecondary mt-1 leading-relaxed">
                {robot.detail}
              </p>
            </div>

            <div className="mt-4 pt-2 border-t border-robo-borderSubtle/40 flex items-center justify-between text-[11px] font-mono">
              <span className="text-robo-teal hover:underline cursor-pointer">
                Diagnostics
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-robo-textMuted" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
