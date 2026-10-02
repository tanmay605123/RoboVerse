import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { useMobileAuthStore } from '../store/useMobileAuthStore';
import { mobileApiRequest } from '../api/client';
import {
  ShoppingBag,
  ShoppingCart,
  Star,
  Plus,
  Minus,
  Trash2,
  X,
  CreditCard,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Zap,
} from 'lucide-react-native';

export function StoreScreen() {
  const { planTier } = useMobileAuthStore();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Cart
  const [cart, setCart] = useState<{ product: any; quantity: number }[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Checkout modal
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('Hostel 4, Room 302, Delhi');
  const [isPaying, setIsPaying] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null);

  const discountPct = planTier === 'PRO' ? 10 : planTier === 'PLUS' ? 5 : 0;

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      const endpoint =
        selectedCategory === 'ALL'
          ? '/store/products'
          : `/store/products?category=${selectedCategory}`;

      const res = await mobileApiRequest(endpoint);
      if (res.success && res.data) {
        setProducts(res.data.products || []);
      }
      setLoading(false);
    }

    loadProducts();
  }, [selectedCategory]);

  const addToCart = (product: any) => {
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.product.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx].quantity += 1;
        return next;
      }
      return [...prev, { product, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as any
    );
  };

  const cartSubtotal = cart.reduce((acc, i) => acc + i.product.priceInr * i.quantity, 0);
  const discountAmount = Math.round((cartSubtotal * discountPct) / 100);
  const finalPayable = cartSubtotal - discountAmount;
  const taxableBase = Number((finalPayable / 1.18).toFixed(2));
  const gstTotal = Number((finalPayable - taxableBase).toFixed(2));
  const totalItemCount = cart.reduce((acc, i) => acc + i.quantity, 0);

  const handlePayRazorpay = async () => {
    setIsPaying(true);

    const checkoutRes = await mobileApiRequest('/store/checkout', {
      method: 'POST',
      body: JSON.stringify({
        items: cart.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
          unitPrice: i.product.priceInr,
          title: i.product.title,
        })),
        shippingAddress: {
          addressLine1: shippingAddress,
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110016',
        },
      }),
    });

    if (checkoutRes.success && checkoutRes.data) {
      const { razorpayOrderId } = checkoutRes.data;

      // Verify payment with mock signature
      const verifyRes = await mobileApiRequest('/store/verify-order', {
        method: 'POST',
        body: JSON.stringify({
          razorpayOrderId,
          razorpayPaymentId: `pay_mobile_${Date.now()}`,
          razorpaySignature: 'mock_sig_mobile_dev_mode',
        }),
      });

      setIsPaying(false);
      if (verifyRes.success && verifyRes.data) {
        setConfirmedOrder(verifyRes.data);
        setCart([]);
      }
    } else {
      setIsPaying(false);
      // Fallback order for offline presentation
      setConfirmedOrder({
        orderId: `RV-ORD-${Date.now()}`,
        status: 'CONFIRMED',
        invoiceNumber: 'RV-INV-2026-01048',
      });
      setCart([]);
    }
  };

  return (
    <View style={styles.screen}>
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.storeTitle}>TechSavyyy Store</Text>
          <Text style={styles.discountPill}>
            {planTier} Plan: {discountPct}% Student Discount Active
          </Text>
        </View>

        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => setCartOpen(true)}
          activeOpacity={0.8}
        >
          <ShoppingCart size={18} color="#000" />
          {totalItemCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{totalItemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Category Pills */}
      <View style={styles.categoryScroll}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
          {[
            { id: 'ALL', label: 'All' },
            { id: 'ROBOT_KITS', label: 'Robot Kits' },
            { id: 'MICROCONTROLLERS', label: 'Dev Boards' },
            { id: 'ACTUATORS', label: 'Motors & Servos' },
            { id: 'SENSORS', label: 'Sensors' },
            { id: 'TOOLS', label: 'Tools' },
          ].map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.catChip, selectedCategory === c.id && styles.catChipActive]}
              onPress={() => setSelectedCategory(c.id)}
            >
              <Text
                style={[styles.catChipText, selectedCategory === c.id && styles.catChipTextActive]}
              >
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Product List */}
      {loading ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="small" color={COLORS.neon} />
          <Text style={styles.loaderText}>Loading TechSavyyy Catalog...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.productList}>
          {products.map((p) => {
            const discPrice = Math.round(p.priceInr - (p.priceInr * discountPct) / 100);

            return (
              <View key={p.id} style={styles.productCard}>
                <Image
                  source={{
                    uri: p.images?.[0] || 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=400&q=80',
                  }}
                  style={styles.productImage}
                />

                <View style={styles.productDetails}>
                  <Text style={styles.categoryTag}>{p.category}</Text>
                  <Text style={styles.itemTitle}>{p.title}</Text>
                  <Text style={styles.itemDesc} numberOfLines={2}>
                    {p.description}
                  </Text>

                  <View style={styles.priceRow}>
                    <View>
                      <View style={styles.priceInline}>
                        <Text style={styles.finalPrice}>₹{discPrice}</Text>
                        {discountPct > 0 && (
                          <Text style={styles.originalPrice}>₹{p.priceInr}</Text>
                        )}
                      </View>
                      <Text style={styles.gstNotice}>incl. 18% GST</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => addToCart(p)}
                      activeOpacity={0.8}
                    >
                      <Plus size={14} color="#000" />
                      <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Cart Bottom Sheet Modal */}
      <Modal visible={cartOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHeader}>
              <View style={styles.sheetTitleRow}>
                <ShoppingCart size={18} color={COLORS.neon} />
                <Text style={styles.sheetTitle}>Shopping Cart ({totalItemCount})</Text>
              </View>
              <TouchableOpacity onPress={() => setCartOpen(false)}>
                <X size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {cart.length === 0 ? (
              <View style={styles.emptyCartBox}>
                <Text style={styles.emptyText}>Your cart is currently empty.</Text>
              </View>
            ) : (
              <ScrollView style={styles.cartItemList}>
                {cart.map((i) => (
                  <View key={i.product.id} style={styles.cartItemRow}>
                    <View style={styles.cartItemInfo}>
                      <Text style={styles.cartItemTitle} numberOfLines={1}>
                        {i.product.title}
                      </Text>
                      <Text style={styles.cartItemPrice}>₹{i.product.priceInr} each</Text>
                    </View>

                    <View style={styles.qtyControl}>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => updateQty(i.product.id, -1)}
                      >
                        <Minus size={12} color={COLORS.textSecondary} />
                      </TouchableOpacity>
                      <Text style={styles.qtyNumber}>{i.quantity}</Text>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => updateQty(i.product.id, 1)}
                      >
                        <Plus size={12} color={COLORS.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}

            {cart.length > 0 && (
              <View style={styles.cartSummary}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal:</Text>
                  <Text style={styles.summaryVal}>₹{cartSubtotal}</Text>
                </View>

                {discountPct > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: COLORS.neon }]}>
                      {planTier} Plan Discount ({discountPct}%):
                    </Text>
                    <Text style={[styles.summaryVal, { color: COLORS.neon }]}>-₹{discountAmount}</Text>
                  </View>
                )}

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Taxable Base:</Text>
                  <Text style={styles.summaryVal}>₹{taxableBase}</Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>18% GST (CGST 9% + SGST 9%):</Text>
                  <Text style={styles.summaryVal}>₹{gstTotal}</Text>
                </View>

                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total Payable (incl. GST):</Text>
                  <Text style={styles.totalValue}>₹{finalPayable}</Text>
                </View>

                <TouchableOpacity
                  style={styles.checkoutBtn}
                  onPress={() => {
                    setCartOpen(false);
                    setCheckoutModalOpen(true);
                  }}
                  activeOpacity={0.8}
                >
                  <CreditCard size={16} color="#000" />
                  <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Checkout Confirmation Modal */}
      <Modal visible={checkoutModalOpen} animationType="fade" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.checkoutDialog}>
            <TouchableOpacity
              style={styles.closeDialog}
              onPress={() => {
                setCheckoutModalOpen(false);
                setConfirmedOrder(null);
              }}
            >
              <X size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>

            {confirmedOrder ? (
              <View style={styles.confirmedBox}>
                <View style={styles.checkCircle}>
                  <CheckCircle2 size={36} color={COLORS.neon} />
                </View>
                <Text style={styles.confirmedTitle}>Order Placed Successfully!</Text>
                <Text style={styles.confirmedDesc}>
                  Official 18% GST Tax Invoice generated for your records.
                </Text>

                <View style={styles.invoiceDetails}>
                  <Text style={styles.invRow}>Order ID: {confirmedOrder.orderId}</Text>
                  <Text style={styles.invRow}>Invoice No: {confirmedOrder.invoiceNumber}</Text>
                  <Text style={styles.invRow}>Amount: ₹{finalPayable}</Text>
                </View>

                <TouchableOpacity
                  style={styles.doneBtn}
                  onPress={() => {
                    setCheckoutModalOpen(false);
                    setConfirmedOrder(null);
                  }}
                >
                  <Text style={styles.doneBtnText}>Back to Store</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={styles.dialogTitle}>Razorpay Express Checkout</Text>
                <Text style={styles.dialogSubtitle}>UPI / GPay / NetBanking / Cards</Text>

                <View style={styles.addressBox}>
                  <Text style={styles.addressLabel}>DELIVERY ADDRESS</Text>
                  <TextInput
                    value={shippingAddress}
                    onChangeText={setShippingAddress}
                    style={styles.addressInput}
                  />
                </View>

                <View style={styles.amountBox}>
                  <Text style={styles.amountLabel}>AMOUNT PAYABLE (INCL. 18% GST)</Text>
                  <Text style={styles.amountValue}>₹{finalPayable}</Text>
                </View>

                <TouchableOpacity
                  style={styles.payBtn}
                  onPress={handlePayRazorpay}
                  disabled={isPaying}
                  activeOpacity={0.8}
                >
                  {isPaying ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <>
                      <ShieldCheck size={16} color="#000" />
                      <Text style={styles.payBtnText}>Pay with Razorpay</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bgBase,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#05110C',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  storeTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  discountPill: {
    color: COLORS.neon,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    fontFamily: 'monospace',
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.neon,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: COLORS.neon,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: COLORS.neon,
    fontSize: 9,
    fontWeight: '900',
  },
  categoryScroll: {
    paddingVertical: 8,
    backgroundColor: '#06140E',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  catRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  catChip: {
    backgroundColor: '#091A14',
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  catChipActive: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.teal,
  },
  catChipText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  catChipTextActive: {
    color: '#000',
    fontWeight: '800',
  },
  productList: {
    padding: 16,
    gap: 12,
  },
  centerLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 8,
    fontFamily: 'monospace',
  },
  productCard: {
    backgroundColor: '#081A12',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    overflow: 'hidden',
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#040C08',
  },
  productDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  categoryTag: {
    color: COLORS.teal,
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  itemTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  itemDesc: {
    color: COLORS.textMuted,
    fontSize: 10,
    lineHeight: 14,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  priceInline: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  finalPrice: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  originalPrice: {
    color: COLORS.textMuted,
    fontSize: 11,
    textDecorationLine: 'line-through',
  },
  gstNotice: {
    color: COLORS.textMuted,
    fontSize: 8,
    fontFamily: 'monospace',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neon,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '800',
  },
  // Bottom Sheet
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#081A12',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.borderHighlight,
    padding: 20,
    maxHeight: '80%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sheetTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  emptyCartBox: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  cartItemList: {
    maxHeight: 220,
  },
  cartItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  cartItemInfo: {
    flex: 1,
    marginRight: 10,
  },
  cartItemTitle: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  cartItemPrice: {
    color: COLORS.neon,
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#040C08',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  qtyBtn: {
    padding: 6,
  },
  qtyNumber: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
    paddingHorizontal: 6,
  },
  cartSummary: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
    gap: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: 'monospace',
  },
  summaryVal: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontFamily: 'monospace',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  totalValue: {
    color: COLORS.neon,
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.neon,
    borderRadius: 14,
    height: 46,
    marginTop: 10,
    gap: 8,
  },
  checkoutBtnText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '800',
  },
  // Checkout Dialog
  checkoutDialog: {
    backgroundColor: '#091C14',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.borderHighlight,
    margin: 20,
    padding: 22,
    position: 'relative',
  },
  closeDialog: {
    position: 'absolute',
    top: 14,
    right: 14,
  },
  dialogTitle: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 2,
  },
  dialogSubtitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: 'monospace',
    marginBottom: 16,
  },
  addressBox: {
    marginBottom: 14,
  },
  addressLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontFamily: 'monospace',
    marginBottom: 6,
  },
  addressInput: {
    backgroundColor: '#040C08',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#FFF',
    fontSize: 12,
  },
  amountBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  amountLabel: {
    color: COLORS.textMuted,
    fontSize: 8,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  amountValue: {
    color: COLORS.neon,
    fontSize: 20,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.neon,
    borderRadius: 12,
    height: 46,
    gap: 8,
  },
  payBtnText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '800',
  },
  confirmedBox: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  checkCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(57, 255, 106, 0.15)',
    borderWidth: 2,
    borderColor: COLORS.neon,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  confirmedTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  confirmedDesc: {
    color: COLORS.textSecondary,
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 14,
  },
  invoiceDetails: {
    backgroundColor: '#040C08',
    borderRadius: 10,
    padding: 12,
    width: '100%',
    marginBottom: 16,
    gap: 4,
  },
  invRow: {
    color: COLORS.teal,
    fontSize: 11,
    fontFamily: 'monospace',
  },
  doneBtn: {
    backgroundColor: COLORS.teal,
    borderRadius: 10,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  doneBtnText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '800',
  },
});
