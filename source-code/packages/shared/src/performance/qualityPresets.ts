import { VersionedLibraryComponent } from '../types/componentLibrary';

export type QualityTier = 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA';

export interface QualityPresetConfig {
  tier: QualityTier;
  label: string;
  description: string;
  targetFps: number;
  maxSceneTriangles: number;
  shadowMapSize: number; // 0 = disabled
  enableContactShadows: boolean;
  wireCurveSegments: number; // 2 = straight linear, 8 = smooth curve, 16 = high catenary
  enableBloom: boolean;
  enableParticleDust: boolean;
  particleCount: number;
  lodDistanceLOD1: number; // Distance in meters to switch to LOD1
  lodDistanceLOD2: number; // Distance in meters to switch to LOD2
  instancingEnabled: boolean;
}

export const QUALITY_PRESETS: Record<QualityTier, QualityPresetConfig> = {
  LOW: {
    tier: 'LOW',
    label: 'Battery Saver',
    description: 'Flat shading, disabled shadows, straight wires. Ideal for low-end mobile devices.',
    targetFps: 30,
    maxSceneTriangles: 75000,
    shadowMapSize: 0,
    enableContactShadows: false,
    wireCurveSegments: 2,
    enableBloom: false,
    enableParticleDust: false,
    particleCount: 0,
    lodDistanceLOD1: 0.8,
    lodDistanceLOD2: 1.8,
    instancingEnabled: true,
  },
  MEDIUM: {
    tier: 'MEDIUM',
    label: 'Balanced (Mobile 60fps)',
    description: 'Optimized PBR, basic contact shadows, 6-segment wires. Target 60 fps on phones.',
    targetFps: 60,
    maxSceneTriangles: 150000,
    shadowMapSize: 512,
    enableContactShadows: true,
    wireCurveSegments: 6,
    enableBloom: false,
    enableParticleDust: true,
    particleCount: 25,
    lodDistanceLOD1: 1.2,
    lodDistanceLOD2: 2.5,
    instancingEnabled: true,
  },
  HIGH: {
    tier: 'HIGH',
    label: 'High Fidelity (Desktop)',
    description: 'Full PBR materials, soft contact shadows, 12-segment slack wires, ambient dust.',
    targetFps: 60,
    maxSceneTriangles: 250000,
    shadowMapSize: 1024,
    enableContactShadows: true,
    wireCurveSegments: 12,
    enableBloom: true,
    enableParticleDust: true,
    particleCount: 60,
    lodDistanceLOD1: 1.8,
    lodDistanceLOD2: 3.5,
    instancingEnabled: true,
  },
  ULTRA: {
    tier: 'ULTRA',
    label: 'Ultra Cinematic 3D',
    description: '2K shadow maps, high-density catenary curves, full bloom & physical lens glow.',
    targetFps: 60,
    maxSceneTriangles: 500000,
    shadowMapSize: 2048,
    enableContactShadows: true,
    wireCurveSegments: 24,
    enableBloom: true,
    enableParticleDust: true,
    particleCount: 120,
    lodDistanceLOD1: 2.5,
    lodDistanceLOD2: 5.0,
    instancingEnabled: true,
  },
};

export interface SceneBudgetAudit {
  totalTriangles: number;
  boardCount: number;
  smallPartCount: number;
  wireCount: number;
  wireTriangles: number;
  componentTriangles: number;
  budgetLimit: number;
  budgetUtilizationPct: number;
  isWithinBudget: boolean;
  activePreset: QualityTier;
  recommendedPreset: QualityTier;
}

/**
 * Calculates current 3D scene polygon budget utilization
 */
export function auditSceneBudget(
  placedComponents: Array<{ componentId: string }>,
  wireCount: number,
  componentLookup: Map<string, VersionedLibraryComponent>,
  preset: QualityTier = 'HIGH'
): SceneBudgetAudit {
  const config = QUALITY_PRESETS[preset];
  let componentTriangles = 0;
  let boardCount = 0;
  let smallPartCount = 0;

  placedComponents.forEach((item) => {
    const comp = componentLookup.get(item.componentId);
    if (comp && comp.model3D) {
      componentTriangles += comp.model3D.triangleBudget;
      if (comp.category === 'MICROCONTROLLER' || comp.model3D.triangleBudget > 15000) {
        boardCount += 1;
      } else {
        smallPartCount += 1;
      }
    } else {
      // Fallback estimate for unlisted part
      componentTriangles += 1200;
      smallPartCount += 1;
    }
  });

  // Wires: cylinder segments * 8 radial segments * 2 triangles per quad
  const wireTriangles = wireCount * config.wireCurveSegments * 16;
  const totalTriangles = componentTriangles + wireTriangles;
  const budgetUtilizationPct = Math.round((totalTriangles / config.maxSceneTriangles) * 100);
  const isWithinBudget = totalTriangles <= config.maxSceneTriangles;

  // Recommended preset based on scene load
  let recommendedPreset: QualityTier = 'ULTRA';
  if (totalTriangles > 250000) {
    recommendedPreset = 'HIGH';
  }
  if (totalTriangles > 150000) {
    recommendedPreset = 'MEDIUM';
  }
  if (totalTriangles > 75000) {
    recommendedPreset = 'LOW';
  }

  return {
    totalTriangles,
    boardCount,
    smallPartCount,
    wireCount,
    wireTriangles,
    componentTriangles,
    budgetLimit: config.maxSceneTriangles,
    budgetUtilizationPct,
    isWithinBudget,
    activePreset: preset,
    recommendedPreset,
  };
}

/**
 * Computes Level of Detail (LOD) level (0, 1, or 2) given camera distance
 */
export function calculateLODLevel(
  distanceToCameraMeters: number,
  preset: QualityTier = 'HIGH'
): 0 | 1 | 2 {
  const config = QUALITY_PRESETS[preset];
  if (distanceToCameraMeters >= config.lodDistanceLOD2) {
    return 2;
  }
  if (distanceToCameraMeters >= config.lodDistanceLOD1) {
    return 1;
  }
  return 0;
}
