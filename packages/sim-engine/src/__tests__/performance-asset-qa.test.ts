import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  ALL_ROBOVERSE_COMPONENTS,
  QUALITY_PRESETS,
  auditSceneBudget,
  calculateLODLevel,
  VersionedLibraryComponent,
} from '@roboverse/shared';
import { runCIAssetQAPipeline } from '../qa/assetQAPipeline';

describe('Phase 12: Performance, 3D Asset Optimization, Triangle Budgets & CI QA Pipeline', () => {
  it('executes full CI Asset QA Pipeline over all 66+ components with ZERO violations', () => {
    const qaResult = runCIAssetQAPipeline(ALL_ROBOVERSE_COMPONENTS);

    if (!qaResult.passed) {
      console.error('Asset QA Violations:', qaResult.violations);
    }

    assert.strictEqual(
      qaResult.passed,
      true,
      `Expected Asset QA Pipeline to pass with 0 violations, but found ${qaResult.violations.length}`
    );
    assert.strictEqual(qaResult.violations.length, 0);
    assert.ok(qaResult.totalComponents >= 60, `Found ${qaResult.totalComponents} components (min 60 required)`);
    assert.ok(qaResult.totalTriangles > 0, 'Total triangle count must be > 0');
  });

  it('enforces strict triangle budgets: 20k-50k for boards, under 5k for small parts', () => {
    let boardCount = 0;
    let smallPartCount = 0;

    ALL_ROBOVERSE_COMPONENTS.forEach((comp) => {
      const budget = comp.model3D.triangleBudget;
      const isBoard = comp.category === 'MICROCONTROLLER' || budget > 12000;

      if (isBoard) {
        boardCount++;
        assert.ok(
          budget >= 10000 && budget <= 50000,
          `Board ${comp.id} (${comp.name}) triangle budget ${budget} must be between 10,000 and 50,000`
        );
      } else {
        smallPartCount++;
        assert.ok(
          budget <= 10000,
          `Component ${comp.id} (${comp.name}) triangle budget ${budget} must be under 10,000 for 60fps mobile performance`
        );
      }
    });

    assert.ok(boardCount >= 5, `Expected at least 5 microcontroller boards, found ${boardCount}`);
    assert.ok(smallPartCount >= 55, `Expected at least 55 small parts, found ${smallPartCount}`);
  });

  it('verifies PBR material parameters (roughness 0-1, metalness 0-1, valid dimensions in mm)', () => {
    ALL_ROBOVERSE_COMPONENTS.forEach((comp) => {
      const { pbrMaterials, dimensionsMm, massGrams } = comp.model3D;

      assert.ok(
        pbrMaterials.roughness >= 0 && pbrMaterials.roughness <= 1,
        `Component ${comp.id} roughness ${pbrMaterials.roughness} must be in [0, 1]`
      );
      assert.ok(
        pbrMaterials.metalness >= 0 && pbrMaterials.metalness <= 1,
        `Component ${comp.id} metalness ${pbrMaterials.metalness} must be in [0, 1]`
      );
      assert.strictEqual(
        dimensionsMm.length,
        3,
        `Component ${comp.id} must define 3D physical dimensions in mm [w, h, d]`
      );
      assert.ok(dimensionsMm[0] > 0 && dimensionsMm[1] > 0 && dimensionsMm[2] > 0);
      assert.ok(massGrams > 0, `Component ${comp.id} mass must be > 0 grams`);
    });
  });

  it('verifies Quality Presets configuration across all 4 graphics tiers', () => {
    const tiers = ['LOW', 'MEDIUM', 'HIGH', 'ULTRA'] as const;

    tiers.forEach((tier) => {
      const preset = QUALITY_PRESETS[tier];
      assert.ok(preset, `Preset ${tier} must be defined`);
      assert.ok(preset.maxSceneTriangles > 0, `Preset ${tier} maxSceneTriangles must be > 0`);
      assert.ok(preset.targetFps >= 30, `Preset ${tier} targetFps must be >= 30`);
      assert.ok(preset.wireCurveSegments >= 2, `Preset ${tier} wireCurveSegments must be >= 2`);
    });

    // Check budget scaling
    assert.strictEqual(QUALITY_PRESETS.LOW.maxSceneTriangles, 75000);
    assert.strictEqual(QUALITY_PRESETS.MEDIUM.maxSceneTriangles, 150000);
    assert.strictEqual(QUALITY_PRESETS.HIGH.maxSceneTriangles, 250000);
    assert.strictEqual(QUALITY_PRESETS.ULTRA.maxSceneTriangles, 500000);
  });

  it('dynamically computes Level of Detail (LOD) level based on camera distance', () => {
    // Under HIGH preset: LOD0 (< 1.8m), LOD1 (1.8m - 3.5m), LOD2 (> 3.5m)
    assert.strictEqual(calculateLODLevel(0.5, 'HIGH'), 0);
    assert.strictEqual(calculateLODLevel(1.5, 'HIGH'), 0);
    assert.strictEqual(calculateLODLevel(2.0, 'HIGH'), 1);
    assert.strictEqual(calculateLODLevel(3.0, 'HIGH'), 1);
    assert.strictEqual(calculateLODLevel(4.0, 'HIGH'), 2);
    assert.strictEqual(calculateLODLevel(10.0, 'HIGH'), 2);
  });

  it('audits 3D scene polygon budget utilization and recommends quality adjustments', () => {
    const lookup = new Map<string, VersionedLibraryComponent>();
    ALL_ROBOVERSE_COMPONENTS.forEach((c) => lookup.set(c.id, c));

    // Scene with 1 Uno (28,000 tris) + 1 Breadboard (4,200 tris) + 2 LEDs (2 x 800) + 4 wires
    const placed = [
      { componentId: 'comp_arduino_uno' },
      { componentId: 'comp_breadboard_half' },
      { componentId: 'comp_led_red' },
      { componentId: 'comp_led_green' },
    ];
    const wireCount = 4;

    const audit = auditSceneBudget(placed, wireCount, lookup, 'HIGH');

    // Expected component tris: 28000 + 18000 + 2800 + 2800 = 51600 + wire tris: ~768 = ~52368
    assert.ok(audit.totalTriangles > 45000 && audit.totalTriangles < 60000);
    assert.strictEqual(audit.boardCount, 2);
    assert.strictEqual(audit.smallPartCount, 2);
    assert.strictEqual(audit.isWithinBudget, true);
    assert.ok(audit.budgetUtilizationPct < 25); // Well under 250k budget

    // Heavy scene with 10 Arduino Megas (10 x 42,000 = 420,000 tris)
    const heavyPlaced = Array.from({ length: 10 }, () => ({
      componentId: 'comp_arduino_mega',
    }));
    const heavyAudit = auditSceneBudget(heavyPlaced, 10, lookup, 'LOW');

    assert.strictEqual(heavyAudit.isWithinBudget, false);
    assert.ok(heavyAudit.budgetUtilizationPct > 100);
  });
});
