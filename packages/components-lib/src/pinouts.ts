/**
 * RoboVerse Pinout Coordinates & Snapping Helpers
 */

import { COMPONENT_VISUAL_REGISTRY, ComponentPinDef } from './definitions';

export function getComponentPin(componentId: string, pinId: string): ComponentPinDef | undefined {
  const comp = COMPONENT_VISUAL_REGISTRY[componentId];
  if (!comp) return undefined;
  return comp.pins.find((p) => p.id === pinId);
}

export function calculateRotatedPinPosition(
  pin: ComponentPinDef,
  componentWidth: number,
  componentHeight: number,
  rotationDegrees: number
): { x: number; y: number } {
  const rad = (rotationDegrees * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  // Center of component
  const cx = componentWidth / 2;
  const cy = componentHeight / 2;

  // Offset from center
  const dx = pin.x - cx;
  const dy = pin.y - cy;

  // Rotated offset
  const rx = dx * cos - dy * sin;
  const ry = dx * sin + dy * cos;

  return {
    x: cx + rx,
    y: cy + ry,
  };
}

/**
 * Breadboard hole coordinate calculator for snapping
 */
export function getBreadboardHoleCoord(
  col: number, // 1 to 30
  row: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J',
  baseX = 20,
  baseY = 35,
  pitch = 7.5
): { x: number; y: number } {
  const rowMap: Record<string, number> = {
    A: 0,
    B: 1,
    C: 2,
    D: 3,
    E: 4,
    // Trench separator between E and F
    F: 6,
    G: 7,
    H: 8,
    I: 9,
    J: 10,
  };

  const rowIndex = rowMap[row] ?? 0;
  return {
    x: baseX + (col - 1) * pitch,
    y: baseY + rowIndex * pitch,
  };
}
