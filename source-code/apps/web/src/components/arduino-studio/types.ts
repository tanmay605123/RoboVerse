import { CircuitComponent, WireConnection, CircuitDiagnosticError } from '@roboverse/shared';
import { CompilationResult, PinState, ComponentSimulationOutput } from '@roboverse/sim-engine';

export type StudioVisualizationMode = '2D' | '3D';
export type StudioToolMode = 'SELECT' | 'WIRE' | 'DELETE' | 'PAN';
export type StudioBottomTab = 'CODE' | 'COMPILER' | 'SERIAL' | 'DIAGNOSTICS' | 'LOGS';

export interface ComponentCatalogItem {
  typeId: string;
  name: string;
  category: 'MICROCONTROLLER' | 'PROTOTYPING' | 'PASSIVE' | 'ACTUATOR' | 'SENSOR' | 'POWER';
  description: string;
  operatingVoltage: string;
  defaultProperties: Record<string, any>;
  defaultWidth2D: number;
  defaultHeight2D: number;
  pins: Array<{
    id: string;
    name: string;
    type: string;
    rel2D: [number, number]; // [x, y] relative offset in 2D SVG
    rel3D?: [number, number, number];
    description?: string;
  }>;
  docs: {
    overview: string;
    pinout: string;
    schematicTips: string;
  };
}

export interface CircuitTemplate {
  id: string;
  name: string;
  description: string;
  code: string;
  components: CircuitComponent[];
  wires: WireConnection[];
}
