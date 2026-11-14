import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ALL_ROBOVERSE_COMPONENTS, VersionedLibraryComponent } from '@roboverse/shared';

describe('RoboVerse Component Library CI Asset QA Pipeline', () => {
  it('must contain at least 60 distinct hardware components in the library', () => {
    assert.ok(
      ALL_ROBOVERSE_COMPONENTS.length >= 60,
      `Expected at least 60 components, but found ${ALL_ROBOVERSE_COMPONENTS.length}`
    );
  });

  it('must guarantee that every component is 100% FREE for all users', () => {
    ALL_ROBOVERSE_COMPONENTS.forEach((comp) => {
      assert.strictEqual(
        comp.isFreeTier,
        true,
        `Component ${comp.id} (${comp.name}) must have isFreeTier set to true.`
      );
    });
  });

  it('must fail if any component lacks a recognized open CAD license', () => {
    const validLicenses = ['CC-BY-4.0', 'CC-BY-SA-4.0', 'MIT', 'Apache-2.0', 'CERN-OHL-P', 'Open-Hardware-Public'];
    ALL_ROBOVERSE_COMPONENTS.forEach((comp) => {
      assert.ok(
        comp.license && validLicenses.includes(comp.license),
        `Component ${comp.id} must track a valid open license. Found: ${comp.license}`
      );
    });
  });

  it('must verify Format 1 (Realistic 2D Artwork) with dimensions and drawing layers for every component', () => {
    ALL_ROBOVERSE_COMPONENTS.forEach((comp) => {
      assert.ok(comp.artwork2D, `Component ${comp.id} is missing Format 1 (artwork2D).`);
      assert.ok(comp.artwork2D.viewBox, `Component ${comp.id} artwork2D missing viewBox.`);
      assert.ok(comp.artwork2D.widthMm > 0, `Component ${comp.id} artwork2D widthMm must be > 0.`);
      assert.ok(comp.artwork2D.heightMm > 0, `Component ${comp.id} artwork2D heightMm must be > 0.`);
      assert.ok(comp.artwork2D.bodyColor, `Component ${comp.id} artwork2D missing bodyColor.`);
      assert.ok(
        Array.isArray(comp.artwork2D.drawLayers) && comp.artwork2D.drawLayers.length > 0,
        `Component ${comp.id} artwork2D must have at least one draw layer.`
      );
    });
  });

  it('must verify Format 2 (Realistic 3D Model with PBR Materials & Budget) for every component', () => {
    ALL_ROBOVERSE_COMPONENTS.forEach((comp) => {
      assert.ok(comp.model3D, `Component ${comp.id} is missing Format 2 (model3D).`);
      assert.ok(
        ['procedural_pbr', 'gltf_draco'].includes(comp.model3D.meshType),
        `Component ${comp.id} model3D meshType must be procedural_pbr or gltf_draco.`
      );
      assert.strictEqual(comp.model3D.dimensionsMm.length, 3, `Component ${comp.id} model3D must have 3 dimensions in mm.`);
      assert.ok(comp.model3D.massGrams > 0, `Component ${comp.id} model3D mass in grams must be > 0.`);
      assert.ok(
        comp.model3D.triangleBudget > 0 && comp.model3D.triangleBudget <= 50000,
        `Component ${comp.id} triangle budget must be between 1 and 50,000 for 60fps mobile execution.`
      );
      assert.ok(comp.model3D.pbrMaterials, `Component ${comp.id} model3D missing pbrMaterials.`);
      assert.ok(typeof comp.model3D.pbrMaterials.roughness === 'number', `Component ${comp.id} roughness must be numeric.`);
      assert.ok(typeof comp.model3D.pbrMaterials.metalness === 'number', `Component ${comp.id} metalness must be numeric.`);
    });
  });

  it('must verify Format 3 (IEC/IEEE Schematic Symbol) for every component', () => {
    ALL_ROBOVERSE_COMPONENTS.forEach((comp) => {
      assert.ok(comp.schematic, `Component ${comp.id} is missing Format 3 (schematic).`);
      assert.ok(['ieee', 'iec'].includes(comp.schematic.symbolType), `Component ${comp.id} schematic symbolType must be ieee or iec.`);
      assert.ok(comp.schematic.designatorPrefix, `Component ${comp.id} schematic missing designatorPrefix (e.g. U, R, C, D).`);
      assert.ok(comp.schematic.width > 0, `Component ${comp.id} schematic width must be > 0.`);
      assert.ok(comp.schematic.height > 0, `Component ${comp.id} schematic height must be > 0.`);
      assert.ok(
        Array.isArray(comp.schematic.terminals) && comp.schematic.terminals.length > 0,
        `Component ${comp.id} schematic must have terminals defined.`
      );
    });
  });

  it('must verify that all pins have 2D and 3D anchor coordinates and electrical roles', () => {
    const validRoles = [
      'POWER_INPUT',
      'POWER_OUTPUT',
      'GROUND',
      'ANALOG_INPUT',
      'ANALOG_OUTPUT',
      'DIGITAL_INPUT',
      'DIGITAL_OUTPUT',
      'PWM_OUTPUT',
      'BIDIRECTIONAL',
      'PASSIVE_TERMINAL',
    ];

    ALL_ROBOVERSE_COMPONENTS.forEach((comp) => {
      assert.ok(Array.isArray(comp.pins) && comp.pins.length > 0, `Component ${comp.id} must define pins array.`);
      comp.pins.forEach((pin) => {
        assert.ok(pin.id, `Pin in ${comp.id} missing id.`);
        assert.ok(pin.name, `Pin ${pin.id} in ${comp.id} missing name.`);
        assert.ok(pin.type, `Pin ${pin.id} in ${comp.id} missing type.`);
        assert.ok(
          validRoles.includes(pin.electricalRole),
          `Pin ${pin.id} in ${comp.id} has invalid electricalRole: ${pin.electricalRole}`
        );
        assert.strictEqual(pin.anchor2D.length, 2, `Pin ${pin.id} in ${comp.id} anchor2D must be [x, y].`);
        assert.strictEqual(pin.anchor3D.length, 3, `Pin ${pin.id} in ${comp.id} anchor3D must be [x, y, z].`);
      });
    });
  });

  it('must verify datasheet cards and unique SKU identifiers for every component', () => {
    const seenSkus = new Set<string>();
    const seenIds = new Set<string>();

    ALL_ROBOVERSE_COMPONENTS.forEach((comp) => {
      assert.ok(!seenIds.has(comp.id), `Duplicate component id found: ${comp.id}`);
      seenIds.add(comp.id);

      assert.ok(!seenSkus.has(comp.sku), `Duplicate component SKU found: ${comp.sku}`);
      seenSkus.add(comp.sku);

      assert.ok(comp.datasheet, `Component ${comp.id} missing datasheet.`);
      assert.ok(comp.datasheet.summary, `Component ${comp.id} datasheet missing summary.`);
      assert.ok(comp.datasheet.operatingVoltage, `Component ${comp.id} datasheet missing operatingVoltage.`);
      assert.ok(comp.datasheet.pinoutDescription, `Component ${comp.id} datasheet missing pinoutDescription.`);
      assert.ok(comp.datasheet.schematicTips, `Component ${comp.id} datasheet missing schematicTips.`);
    });
  });
});
