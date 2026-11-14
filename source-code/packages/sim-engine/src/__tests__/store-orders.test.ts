import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  calculateAuthoritativeOrder,
  CATALOG_PRODUCTS_BY_ID,
  OFFICIAL_STORE_CATALOG,
  PlanTier,
  StoreProduct,
} from '@roboverse/shared';

describe('Phase 7: TechSavyyy E-Commerce Store & Order Flow', () => {
  const dummyAddress = {
    addressLine1: 'Hostel 4, Room 302, IIT Delhi Campus',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110016',
  };

  it('contains all 10 curriculum kits and individual hardware components', () => {
    assert.ok(OFFICIAL_STORE_CATALOG.length >= 20);

    const kits = OFFICIAL_STORE_CATALOG.filter((p: StoreProduct) => p.isKit);
    assert.strictEqual(kits.length, 10);

    const arduinoKit = OFFICIAL_STORE_CATALOG.find((p: StoreProduct) => p.sku === 'KIT-01-ARDUINO-STARTER');
    assert.ok(arduinoKit);
    assert.strictEqual(arduinoKit?.priceInr, 1199.00);
    assert.strictEqual(arduinoKit?.sumOfPartsInr, 1467.00);

    const droneKit = OFFICIAL_STORE_CATALOG.find((p: StoreProduct) => p.sku === 'KIT-09-DRONE-F450');
    assert.ok(droneKit);
    assert.strictEqual(droneKit?.priceInr, 11999.00);
    assert.strictEqual(droneKit?.ageRestricted, true);
    assert.strictEqual(droneKit?.shippingClass, 'regulated_drone');
  });

  it('computes authoritative 18% GST and pricing strictly from catalog ignoring client manipulation', () => {
    const result = calculateAuthoritativeOrder({
      userId: 'usr_student_test_01',
      userPlanTier: PlanTier.FREE,
      isMinor: false,
      hasParentalConsent: false,
      items: [
        { productId: 'prod_kit_01_arduino_starter', quantity: 1 },
      ],
      shippingAddress: dummyAddress,
      catalogProducts: CATALOG_PRODUCTS_BY_ID,
    });

    assert.strictEqual(result.subtotalInr, 1199.00);
    assert.strictEqual(result.discountAmountInr, 0);
    assert.strictEqual(result.finalAmountInr, 1199.00);

    // 18% GST Verification:
    // Base = 1199 / 1.18 = 1016.10
    // Total Tax = 1199 - 1016.10 = 182.90
    // CGST = 182.90 / 2 = 91.45
    // SGST = 182.90 - 91.45 = 91.45
    assert.strictEqual(result.taxBreakdown.baseAmountInr, 1016.10);
    assert.strictEqual(result.taxBreakdown.totalTaxAmountInr, 182.90);
    assert.strictEqual(result.taxBreakdown.cgstAmountInr, 91.45);
    assert.strictEqual(result.taxBreakdown.sgstAmountInr, 91.45);
    assert.strictEqual(result.taxBreakdown.gstRatePercentage, 18);
    assert.strictEqual(result.shippingClass, 'standard');
    assert.strictEqual(result.shippingFeeInr, 0); // Free delivery on orders >= 499
  });

  it('applies 5% discount for Plus and 10% discount for Pro members', () => {
    const freeOrder = calculateAuthoritativeOrder({
      userPlanTier: PlanTier.FREE,
      isMinor: false,
      hasParentalConsent: false,
      items: [{ productId: 'prod_uno_ch340', quantity: 2 }], // 399 * 2 = 798
      shippingAddress: dummyAddress,
      catalogProducts: CATALOG_PRODUCTS_BY_ID,
    });
    assert.strictEqual(freeOrder.subtotalInr, 798.00);
    assert.strictEqual(freeOrder.discountAmountInr, 0);
    assert.strictEqual(freeOrder.finalAmountInr, 798.00);

    const plusOrder = calculateAuthoritativeOrder({
      userPlanTier: PlanTier.PLUS,
      isMinor: false,
      hasParentalConsent: false,
      items: [{ productId: 'prod_uno_ch340', quantity: 2 }],
      shippingAddress: dummyAddress,
      catalogProducts: CATALOG_PRODUCTS_BY_ID,
    });
    // 5% of 798 = 39.9 -> Math.round is 40
    assert.strictEqual(plusOrder.discountPercentage, 5);
    assert.strictEqual(plusOrder.discountAmountInr, 40);
    assert.strictEqual(plusOrder.finalAmountInr, 758);

    const proOrder = calculateAuthoritativeOrder({
      userPlanTier: PlanTier.PRO,
      isMinor: false,
      hasParentalConsent: false,
      items: [{ productId: 'prod_uno_ch340', quantity: 2 }],
      shippingAddress: dummyAddress,
      catalogProducts: CATALOG_PRODUCTS_BY_ID,
    });
    // 10% of 798 = 79.8 -> Math.round is 80
    assert.strictEqual(proOrder.discountPercentage, 10);
    assert.strictEqual(proOrder.discountAmountInr, 80);
    assert.strictEqual(proOrder.finalAmountInr, 718);
  });

  it('enforces stock availability and prevents overselling', () => {
    assert.throws(
      () =>
        calculateAuthoritativeOrder({
          userPlanTier: PlanTier.FREE,
          isMinor: false,
          hasParentalConsent: false,
          items: [{ productId: 'prod_kit_09_drone_f450', quantity: 9999 }],
          shippingAddress: dummyAddress,
          catalogProducts: CATALOG_PRODUCTS_BY_ID,
        }),
      /Insufficient stock/
    );
  });

  it('blocks minors without parental consent from purchasing age-restricted hardware', () => {
    // Soldering Kit is age-restricted
    assert.throws(
      () =>
        calculateAuthoritativeOrder({
          userPlanTier: PlanTier.FREE,
          isMinor: true,
          hasParentalConsent: false,
          items: [{ productId: 'prod_kit_10_soldering_tools', quantity: 1 }],
          shippingAddress: dummyAddress,
          catalogProducts: CATALOG_PRODUCTS_BY_ID,
        }),
      /age-restricted/
    );

    // Minor WITH parental consent succeeds
    const approvedOrder = calculateAuthoritativeOrder({
      userPlanTier: PlanTier.FREE,
      isMinor: true,
      hasParentalConsent: true,
      items: [{ productId: 'prod_kit_10_soldering_tools', quantity: 1 }],
      shippingAddress: dummyAddress,
      catalogProducts: CATALOG_PRODUCTS_BY_ID,
    });
    assert.strictEqual(approvedOrder.finalAmountInr, 1199.00);
  });

  it('escalates shipping class when ordering batteries or regulated drones', () => {
    // Standard order
    const stdOrder = calculateAuthoritativeOrder({
      userPlanTier: PlanTier.FREE,
      isMinor: false,
      hasParentalConsent: false,
      items: [{ productId: 'prod_uno_ch340', quantity: 1 }],
      shippingAddress: dummyAddress,
      catalogProducts: CATALOG_PRODUCTS_BY_ID,
    });
    assert.strictEqual(stdOrder.shippingClass, 'standard');

    // Battery order escalates to 'battery'
    const batteryOrder = calculateAuthoritativeOrder({
      userPlanTier: PlanTier.FREE,
      isMinor: false,
      hasParentalConsent: false,
      items: [
        { productId: 'prod_uno_ch340', quantity: 1 },
        { productId: 'prod_battery_18650', quantity: 2 },
      ],
      shippingAddress: dummyAddress,
      catalogProducts: CATALOG_PRODUCTS_BY_ID,
    });
    assert.strictEqual(batteryOrder.shippingClass, 'battery');

    // Drone order escalates to 'regulated_drone'
    const droneOrder = calculateAuthoritativeOrder({
      userPlanTier: PlanTier.FREE,
      isMinor: false,
      hasParentalConsent: false,
      items: [
        { productId: 'prod_battery_18650', quantity: 2 },
        { productId: 'prod_drone_f450_frame', quantity: 1 },
      ],
      shippingAddress: dummyAddress,
      catalogProducts: CATALOG_PRODUCTS_BY_ID,
    });
    assert.strictEqual(droneOrder.shippingClass, 'regulated_drone');
    assert.ok(droneOrder.ageRestrictionNotice);
  });
});
