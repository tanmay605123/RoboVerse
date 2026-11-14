export type ComponentLicense =
  | 'CC-BY-4.0'
  | 'CC-BY-SA-4.0'
  | 'MIT'
  | 'Apache-2.0'
  | 'CERN-OHL-P'
  | 'Open-Hardware-Public';

export type ElectricalRole =
  | 'POWER_INPUT'
  | 'POWER_OUTPUT'
  | 'GROUND'
  | 'ANALOG_INPUT'
  | 'ANALOG_OUTPUT'
  | 'DIGITAL_INPUT'
  | 'DIGITAL_OUTPUT'
  | 'PWM_OUTPUT'
  | 'BIDIRECTIONAL'
  | 'PASSIVE_TERMINAL';

export interface PinAnchorDefinition {
  id: string;
  name: string;
  type: string;
  electricalRole: ElectricalRole;
  anchor2D: [number, number];       // [x, y] relative offset in mm/px
  anchor3D: [number, number, number]; // [x, y, z] relative offset in 3D world units
  description?: string;
}

export interface ComponentArtwork2D {
  viewBox: string;                 // e.g. "0 0 240 180"
  widthMm: number;
  heightMm: number;
  bodyColor: string;               // e.g. "#0A5C80" for Arduino PCB blue
  accentColor?: string;
  silkscreenText?: string;
  svgPath?: string;                // Vector outline path
  drawLayers: Array<{
    type: 'rect' | 'circle' | 'path' | 'text' | 'pad';
    params: Record<string, any>;
    color: string;
  }>;
}

export interface ComponentModel3D {
  meshType: 'procedural_pbr' | 'gltf_draco';
  modelUrl?: string;
  dimensionsMm: [number, number, number]; // [width, height, depth]
  massGrams: number;
  triangleBudget: number;                 // <5000 for small, 20k-50k for board
  pbrMaterials: {
    baseColor: string;
    roughness: number;
    metalness: number;
    transmission?: number;                // For translucent LED lenses / housings
    opacity?: number;
    emissive?: string;
    emissiveIntensity?: number;
  };
  features?: {
    hasMovingShaft?: boolean;
    hasRotatingHorn?: boolean;
    hasIndicatorLight?: boolean;
    hasSoundTransducer?: boolean;
  };
}

export interface ComponentSchematic {
  symbolType: 'ieee' | 'iec';
  designatorPrefix: string;               // 'U', 'R', 'C', 'D', 'SW', 'M', 'Q', 'BT'
  width: number;
  height: number;
  terminals: Array<{
    pinId: string;
    label: string;
    side: 'left' | 'right' | 'top' | 'bottom';
    offsetPct: number;                    // 0.0 to 1.0 along the edge
  }>;
}

export interface ComponentDatasheet {
  summary: string;
  operatingVoltage: string;
  maxCurrentRating: string;
  pinoutDescription: string;
  schematicTips: string;
  absoluteMaxRatings?: Record<string, string | number>;
}

export interface VersionedLibraryComponent {
  id: string;
  sku: string;
  name: string;
  category: string;
  version: string;
  license: ComponentLicense;
  isFreeTier: boolean;
  dimensionsMm: [number, number, number];
  massGrams: number;
  pins: PinAnchorDefinition[];
  electricalParams: Record<string, any>;
  physicalParams: Record<string, any>;
  artwork2D: ComponentArtwork2D;
  model3D: ComponentModel3D;
  schematic: ComponentSchematic;
  datasheet: ComponentDatasheet;
}
