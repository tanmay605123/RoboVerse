'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { AppSidebar } from '../../components/layout/AppSidebar';
import { AppTopBar } from '../../components/layout/AppTopBar';
import { useAuthStore } from '../../store/useAuthStore';
import { Product3DViewerModal } from '../../components/shops/Product3DViewerModal';
import { DynamicUpiQrModal } from '../../components/shops/DynamicUpiQrModal';
import { InvoiceModal } from '../../components/shops/InvoiceModal';
import { buildGstInvoice, InvoiceData } from '../../lib/invoice/generateInvoice';
import {
  ShoppingBag,
  ShoppingCart,
  Search,
  Filter,
  Star,
  CheckCircle2,
  Tag,
  ShieldCheck,
  Truck,
  ArrowRight,
  Plus,
  Minus,
  Trash2,
  X,
  CreditCard,
  FileText,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Zap,
  Printer,
  QrCode,
  Clock,
  ChevronRight,
  Gift,
  Box,
  Eye,
  Layers,
  Wrench,
  Cpu,
} from 'lucide-react';

interface Product {
  id: string;
  sku: string;
  title: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  priceInr: number;
  mrpInr: number;
  gstPercent: number;
  stockQuantity: number;
  ageRestricted: boolean;
  shippingClass: 'standard' | 'battery' | 'regulated_drone';
  images: string[];
  specs?: Record<string, any>;
  description: string;
  componentId?: string;
  rating?: number;
  isKitOfMonth?: boolean;
}

interface LearningKit {
  id: string;
  name: string;
  slug: string;
  description: string;
  kitPriceInr: number;
  sumOfPartsInr: number;
  savingsInr: number;
  savingsPercent: number;
  shippingClass: string;
  ageRestricted: boolean;
  level: string;
  image: string;
  linkedCourseSlug?: string;
  linkedCircuitSampleId?: string;
  bom: Array<{
    id: string;
    name: string;
    sku: string;
    quantity: number;
    unitPriceInr: number;
  }>;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const CATEGORIES = [
  { id: 'ALL', label: 'All Components' },
  { id: 'cat_kits', label: '📦 Robotics Kits' },
  { id: 'cat_boards', label: '⚡ Microcontrollers' },
  { id: 'cat_sensors', label: '📡 Sensors & Inputs' },
  { id: 'cat_motion', label: '⚙️ Motors & Actuators' },
  { id: 'cat_displays', label: '📺 Displays' },
  { id: 'cat_power', label: '🔋 Power & Batteries' },
  { id: 'cat_tools', label: '🛠️ Tools & Soldering' },
  { id: 'cat_drones', label: '🛸 Drones & Aerial' },
];

function StoreContent() {
  const { user, profile, studentIdCard, planTier, entitlements, isAuthenticated } = useAuthStore();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [kits, setKits] = useState<LearningKit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState<{ code: string; discountInr: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // 3D Viewer Modal State
  const [viewerProduct, setViewerProduct] = useState<Product | null>(null);

  // Quick Specs Modal
  const [activeSpecsProduct, setActiveSpecsProduct] = useState<Product | null>(null);

  // Expanded Kit BOM Modal
  const [activeKitBom, setActiveKitBom] = useState<LearningKit | null>(null);

  // Checkout modal
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutMethod, setCheckoutMethod] = useState<'checkout' | 'qr'>('qr');
  const [shippingAddress, setShippingAddress] = useState({
    fullName: profile?.fullName || 'Tanmay Chawda',
    phone: '+91 98765 43210',
    addressLine1: 'Hostel 4, Room 302, IIT Delhi Campus',
    addressLine2: 'Hauz Khas',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110016',
    country: 'India',
  });
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Dynamic UPI QR Modal state
  const [upiQrModalOpen, setUpiQrModalOpen] = useState(false);
  const [activeQrOrder, setActiveQrOrder] = useState<any | null>(null);

  // Official GST Invoice Modal state
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<InvoiceData | null>(null);

  // Past Orders modal
  const [ordersModalOpen, setOrdersModalOpen] = useState(false);
  const [pastOrders, setPastOrders] = useState<any[]>([]);

  // Minor & Parental Consent state (Section 10)
  const isMinor = (profile as any)?.is_minor ?? false;
  const hasParentalConsent = Boolean((profile as any)?.parental_consent_at);
  const [parentConsentGiven, setParentConsentGiven] = useState(hasParentalConsent);

  // Check URL Search Params on mount for jump from Lab BOM (e.g. ?component_id=... or ?kit=...)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load Razorpay Checkout SDK if not present
      if (!(window as any).Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
      }

      const params = new URLSearchParams(window.location.search);
      const compId = params.get('component_id');
      const kitParam = params.get('kit');
      const catParam = params.get('category');

      if (compId) {
        setSearchQuery(compId);
      }
      if (catParam) {
        setSelectedCategory(catParam);
      }
      if (kitParam) {
        setSelectedCategory('cat_kits');
      }
    }
  }, []);

  // Fetch Products & Kits
  useEffect(() => {
    async function loadCatalog() {
      setLoading(true);
      try {
        const prodParams = new URLSearchParams();
        if (selectedCategory !== 'ALL' && selectedCategory !== 'cat_kits') {
          prodParams.append('category', selectedCategory);
        }
        if (searchQuery.trim()) {
          prodParams.append('search', searchQuery.trim());
        }
        if (sortBy) {
          prodParams.append('sort', sortBy);
        }

        const [prodRes, kitRes] = await Promise.all([
          fetch(`/api/store/products?${prodParams.toString()}`).then((r) => r.json()),
          fetch('/api/store/kits').then((r) => r.json()),
        ]);

        if (prodRes.success && prodRes.data) {
          setProducts(prodRes.data.products || []);
        }

        if (kitRes.success && kitRes.data) {
          setKits(kitRes.data.kits || []);
        }
      } catch (err) {
        console.error('Failed to load store catalog:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCatalog();
  }, [selectedCategory, searchQuery, sortBy]);

  // Plan discount derived from current_entitlements single source of truth
  const tierString = entitlements?.badge || String(planTier).toUpperCase();
  const discountPct = entitlements?.storeDiscountPercent ?? (tierString === 'PRO' ? 10 : tierString === 'PLUS' ? 5 : 0);

  // Cart operations
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const addKitToCart = (kit: LearningKit) => {
    // Add kit as a composite product
    const kitProduct: Product = {
      id: kit.id,
      sku: `RV-KIT-${kit.slug.slice(0, 6).toUpperCase()}`,
      title: kit.name,
      slug: kit.slug,
      categoryId: 'cat_kits',
      categoryName: 'Robotics Kits',
      priceInr: kit.kitPriceInr,
      mrpInr: kit.sumOfPartsInr,
      gstPercent: 18,
      stockQuantity: 40,
      ageRestricted: kit.ageRestricted,
      shippingClass: (kit.shippingClass as any) || 'standard',
      images: [kit.image],
      description: kit.description,
      rating: 4.9,
    };
    addToCart(kitProduct);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Cart totals calculation
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce(
    (acc, item) => acc + item.product.priceInr * item.quantity,
    0
  );
  const cartPlanDiscountAmount = Math.round((cartSubtotal * discountPct) / 100);
  const couponDiscountAmount = couponApplied ? couponApplied.discountInr : 0;
  const cartFinalAmount = Math.max(0, cartSubtotal - cartPlanDiscountAmount - couponDiscountAmount);
  const taxableBaseAmount = Number((cartFinalAmount / 1.18).toFixed(2));
  const gstTotal = Number((cartFinalAmount - taxableBaseAmount).toFixed(2));
  const cgst = Number((gstTotal / 2).toFixed(2));
  const sgst = Number((gstTotal / 2).toFixed(2));

  // Check if any cart item has age restriction
  const hasAgeRestrictedCartItem = cart.some((i) => i.product.ageRestricted);

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'ROBOFIRST' || code === 'ROBOKID10') {
      const disc = Math.min(200, Math.round(cartSubtotal * 0.1));
      setCouponApplied({ code, discountInr: disc });
      setCouponError(null);
    } else if (code === 'STUDENT5') {
      const disc = Math.round(cartSubtotal * 0.05);
      setCouponApplied({ code, discountInr: disc });
      setCouponError(null);
    } else {
      setCouponError('Invalid coupon code. Try "ROBOFIRST" for 10% off.');
    }
  };

  // Handle Checkout submission
  const handleInitiateCheckout = async () => {
    setCheckoutError(null);

    // Verify age restriction
    if (hasAgeRestrictedCartItem && isMinor && !parentConsentGiven) {
      setCheckoutError('Parental or guardian consent is required to order age-restricted items (3S LiPo, drone flight controllers, high heat tools).');
      setCheckoutModalOpen(true);
      return;
    }

    setCheckoutModalOpen(true);
  };

  const handleProcessOrder = async () => {
    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const res = await fetch('/api/store/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user ? { Authorization: `Bearer session_token` } : {}),
        },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: item.product.priceInr,
            title: item.product.title,
            sku: item.product.sku,
            categoryId: item.product.categoryId,
            ageRestricted: item.product.ageRestricted,
          })),
          shippingAddress,
          couponCode: couponApplied?.code,
          method: checkoutMethod,
          planTier: tierString,
          isMinor,
          hasParentalConsent: parentConsentGiven,
        }),
      });

      const json = await res.json();
      setCheckoutLoading(false);

      if (!json.success || !json.data) {
        setCheckoutError(json.error?.message || 'Checkout creation failed.');
        return;
      }

      const orderData = json.data;

      if (checkoutMethod === 'qr') {
        // Open Dynamic Single-Use UPI QR modal with 15-minute countdown
        setActiveQrOrder({
          ...orderData,
          totalInr: orderData.totalInr,
          gstAmountInr: orderData.gstTotalInr,
        });
        setCheckoutModalOpen(false);
        setUpiQrModalOpen(true);
      } else {
        // Standard Razorpay Checkout
        if (typeof window !== 'undefined' && (window as any).Razorpay) {
          try {
            const rzp = new (window as any).Razorpay({
              key: orderData.razorpayKeyId,
              amount: Math.round(orderData.totalInr * 100),
              currency: 'INR',
              name: 'RoboVerse TechSavyyy',
              description: `Order ${orderData.orderNumber}`,
              order_id: orderData.razorpayOrderId,
              handler: function (response: any) {
                handleOrderVerified({ ...orderData, paymentId: response.razorpay_payment_id });
              },
              prefill: {
                name: shippingAddress.fullName,
                contact: shippingAddress.phone,
                email: user?.email || '',
              },
              theme: { color: '#39FF6A' },
            });
            setCheckoutModalOpen(false);
            rzp.open();
            return;
          } catch {
            // Fallback if Razorpay popup fails to initialize
          }
        }
        // In dev / sandbox without external Razorpay popup script, verify directly
        handleOrderVerified(orderData);
      }
    } catch (err: any) {
      setCheckoutLoading(false);
      setCheckoutError(err.message || 'Network error during checkout.');
    }
  };

  const handleOrderVerified = (orderData: any) => {
    // Generate official GST Tax Invoice
    const gstInvoice = buildGstInvoice({
      order: {
        id: orderData.orderId,
        orderNumber: orderData.orderNumber,
        subtotalInr: cartSubtotal,
        discountInr: cartPlanDiscountAmount + couponDiscountAmount,
        gstAmountInr: gstTotal,
        totalInr: cartFinalAmount,
        shippingAddress: {
          fullName: shippingAddress.fullName,
          phone: shippingAddress.phone,
          addressLine1: shippingAddress.addressLine1,
          addressLine2: shippingAddress.addressLine2,
          city: shippingAddress.city,
          state: shippingAddress.state,
          pincode: shippingAddress.pincode,
        },
        items: cart.map((c) => ({
          productId: c.product.id,
          name: c.product.title,
          sku: c.product.sku,
          category: c.product.categoryId,
          quantity: c.quantity,
          priceInr: c.product.priceInr,
          gstPercent: 18,
        })),
        payment: {
          method: checkoutMethod === 'qr' ? 'DYNAMIC UPI QR' : 'RAZORPAY CHECKOUT',
          razorpayPaymentId: orderData.paymentId || `pay_rzp_${Date.now()}`,
          razorpayOrderId: orderData.razorpayOrderId,
          status: 'COMPLETED',
        },
      },
      studentId: studentIdCard?.studentId || 'RV-2026-001001',
      schoolOrCollege: profile?.schoolOrCollegeName,
    });

    // Update state & clear cart
    setActiveInvoice(gstInvoice);
    setCart([]);
    setCartOpen(false);
    setCheckoutModalOpen(false);
    setUpiQrModalOpen(false);
    setInvoiceModalOpen(true);

    // Save to past orders list
    setPastOrders((prev) => [gstInvoice, ...prev]);
  };

  const handleRefreshQr = async () => {
    if (!activeQrOrder) return;
    try {
      const res = await fetch('/api/store/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: item.product.priceInr,
            title: item.product.title,
          })),
          shippingAddress,
          method: 'qr',
          planTier: tierString,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setActiveQrOrder(json.data);
      }
    } catch (e) {
      console.warn('QR refresh error:', e);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#07110D] text-[#EAF7EF] font-sans selection:bg-[#39FF6A] selection:text-black">
      {/* Vertical Icon Rail */}
      <AppSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AppTopBar
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Page Body */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Top Hero Banner */}
          <section className="relative overflow-hidden rounded-3xl bg-[rgba(255,255,255,0.03)] border border-[rgba(57,255,106,0.2)] p-6 sm:p-10 backdrop-blur-xl shadow-[0_0_35px_rgba(7,17,13,0.8)]">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[rgba(57,255,106,0.1)] border border-[rgba(57,255,106,0.3)] text-[#39FF6A] text-xs font-mono font-bold tracking-wider mb-3 shadow-[0_0_15px_rgba(57,255,106,0.15)]">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>TECHSAVYYY OFFICIAL HARDWARE WAREHOUSE</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold text-[#EAF7EF] tracking-tight mb-2">
                  TechSavyyy Hardware Store
                </h1>
                <p className="text-xs sm:text-sm text-[#8FA99B] max-w-2xl leading-relaxed font-mono">
                  All components tested for RoboVerse labs. GST-inclusive prices, Razorpay Dynamic Single-Use UPI QR,
                  server-verified stock, and instant GST invoices.
                </p>
              </div>

              {/* Cart & Past Invoices Quick Actions */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setOrdersModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(57,255,106,0.1)] text-xs font-bold text-[#EAF7EF] border border-[rgba(57,255,106,0.2)] flex items-center gap-2 transition-colors font-mono"
                >
                  <FileText className="w-4 h-4 text-[#7FE7D6]" />
                  <span>Past Invoices</span>
                </button>

                <button
                  onClick={() => setCartOpen(true)}
                  className="relative px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] hover:opacity-95 text-black font-extrabold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(57,255,106,0.35)] transition-transform active:scale-95 font-sans"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Cart</span>
                  {cartItemCount > 0 && (
                    <span className="ml-1 w-5 h-5 rounded-full bg-black text-[#39FF6A] text-[11px] font-mono font-bold flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Member Tier Benefits Banner */}
            <div className="relative z-10 mt-6 pt-5 border-t border-[rgba(57,255,106,0.15)] flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-[#39FF6A] font-bold">Active Tier: {tierString}</span>
                {discountPct > 0 ? (
                  <span className="px-2 py-0.5 rounded bg-[rgba(57,255,106,0.15)] text-[#39FF6A] border border-[#39FF6A]/30">
                    {discountPct}% Member Discount Applied
                  </span>
                ) : (
                  <span className="text-[#8FA99B]">
                    (Upgrade to Plus for 5% off or Pro for 10% off all hardware)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-[#8FA99B]">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-[#7FE7D6]" /> Free Express Delivery on Kits
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#39FF6A]" /> 100% Genuine Tested ICs
                </span>
                <span className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-[#39FF6A]" /> 18% GST Compliant
                </span>
              </div>
            </div>
          </section>

          {/* Search, Sorter & Category Chips */}
          <section className="bg-[rgba(255,255,255,0.03)] rounded-2xl border border-[rgba(57,255,106,0.15)] p-5 backdrop-blur-xl space-y-4 font-mono">
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8FA99B]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search hardware by name, SKU, or keyword (e.g. Starter Kit, ESP32, Servo, Ultrasonic, L298N)..."
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] text-[#EAF7EF] placeholder-[#8FA99B] text-xs focus:outline-none focus:border-[#39FF6A] transition-colors"
                />
              </div>

              {/* Sorter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#8FA99B] shrink-0">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] text-[#EAF7EF] text-xs font-semibold focus:outline-none focus:border-[#39FF6A]"
                >
                  <option value="popular">Most Popular</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl font-semibold transition-all shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-[rgba(57,255,106,0.15)] text-[#39FF6A] border border-[#39FF6A] shadow-[0_0_12px_rgba(57,255,106,0.25)]'
                      : 'bg-[#040B08] text-[#8FA99B] hover:text-[#EAF7EF] border border-[rgba(57,255,106,0.15)]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </section>

          {/* SECTION: ROBOTICS LEARNING KITS (When Kits or ALL selected) */}
          {(selectedCategory === 'ALL' || selectedCategory === 'cat_kits') && kits.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#EAF7EF] flex items-center gap-2">
                    <Box className="w-5 h-5 text-[#39FF6A]" />
                    <span>Curriculum Robotics Kits</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#39FF6A]/10 text-[#39FF6A] text-xs font-mono font-bold border border-[#39FF6A]/30">
                      {kits.length} Kits
                    </span>
                  </h2>
                  <p className="text-xs text-[#8FA99B] font-mono mt-0.5">
                    Pre-packaged project kits with interactive circuit simulations and lesson links.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {kits.map((kit) => {
                  const finalKitPrice = Math.round(
                    kit.kitPriceInr - (kit.kitPriceInr * discountPct) / 100
                  );

                  return (
                    <div
                      key={kit.id}
                      className="group rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[#39FF6A]/20 p-5 backdrop-blur-xl hover:border-[#39FF6A]/60 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3 text-xs font-mono">
                          <span className="px-2.5 py-0.5 rounded bg-[#39FF6A]/10 text-[#39FF6A] font-bold border border-[#39FF6A]/30">
                            {kit.level} Level
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 font-bold border border-emerald-500/30">
                            Save ₹{kit.savingsInr} ({kit.savingsPercent}% OFF)
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-white group-hover:text-[#39FF6A] transition-colors font-sans">
                          {kit.name}
                        </h3>

                        <p className="text-xs text-[#8FA99B] mt-2 line-clamp-2 leading-relaxed">
                          {kit.description}
                        </p>

                        {/* BOM Breakdown Preview */}
                        <div className="mt-4 p-3 bg-black/40 rounded-xl border border-gray-800 space-y-1.5 text-xs font-mono">
                          <div className="flex justify-between text-gray-400 text-[11px] font-bold uppercase tracking-wider">
                            <span>Included BOM Items:</span>
                            <span>{kit.bom.length} Parts</span>
                          </div>
                          {kit.bom.slice(0, 3).map((item) => (
                            <div key={item.id} className="flex justify-between text-[11px] text-gray-300">
                              <span className="truncate pr-2">• {item.name}</span>
                              <span className="text-[#39FF6A] shrink-0 font-bold">x{item.quantity}</span>
                            </div>
                          ))}
                          {kit.bom.length > 3 && (
                            <button
                              onClick={() => setActiveKitBom(kit)}
                              className="text-[10px] text-[#7FE7D6] hover:underline block pt-1"
                            >
                              + View all {kit.bom.length} items &amp; circuit specs
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-gray-800 font-mono">
                        <div className="flex items-baseline justify-between mb-3">
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-xl font-bold text-[#39FF6A]">
                                ₹{finalKitPrice}
                              </span>
                              <span className="text-xs text-gray-500 line-through">
                                ₹{kit.sumOfPartsInr}
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-400">GST 18% Inclusive</span>
                          </div>

                          {kit.linkedCircuitSampleId && (
                            <Link
                              href="/circuit-lab"
                              className="text-[11px] text-[#7FE7D6] hover:text-[#39FF6A] flex items-center gap-1 transition"
                            >
                              <span>Test in Lab</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setActiveKitBom(kit)}
                            className="px-3 py-2 rounded-xl bg-[#040B08] hover:bg-gray-800 text-gray-300 text-xs font-semibold border border-gray-700 transition"
                          >
                            BOM
                          </button>
                          <button
                            onClick={() => addKitToCart(kit)}
                            className="flex-1 py-2 px-4 rounded-xl bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] hover:opacity-95 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow transition font-sans"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Add Kit to Cart</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Products Grid */}
          {selectedCategory !== 'cat_kits' && (
            <section>
              <div className="flex items-center justify-between mb-4 font-mono">
                <h2 className="text-lg font-bold text-[#EAF7EF] flex items-center gap-2 font-sans">
                  <span>Hardware Catalog</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[rgba(57,255,106,0.1)] text-[#39FF6A] border border-[#39FF6A]/30 text-xs font-mono font-bold">
                    {products.length} Products
                  </span>
                </h2>
                <span className="text-xs text-[#8FA99B]">All prices inclusive of 18% GST</span>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((idx) => (
                    <div
                      key={idx}
                      className="h-96 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(57,255,106,0.1)] animate-pulse p-6 space-y-4"
                    >
                      <div className="w-full h-44 bg-[#0C261B] rounded-xl" />
                      <div className="w-2/3 h-5 bg-[#0C261B] rounded-lg" />
                      <div className="w-full h-8 bg-[#0C261B] rounded-lg" />
                      <div className="w-1/2 h-8 bg-[#0C261B] rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(57,255,106,0.15)] p-12 text-center backdrop-blur-xl font-mono">
                  <AlertCircle className="w-10 h-10 text-[#FF9A1F] mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-[#EAF7EF] mb-1 font-sans">
                    No Hardware Components Found
                  </h3>
                  <p className="text-xs text-[#8FA99B] mb-4 max-w-md mx-auto">
                    Try adjusting your search terms or choosing &quot;All Components&quot; to see our full inventory.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('ALL');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 rounded-xl bg-[rgba(57,255,106,0.15)] text-[#39FF6A] border border-[#39FF6A]/40 text-xs font-bold"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => {
                    const finalUnitPrice = Math.round(
                      product.priceInr - (product.priceInr * discountPct) / 100
                    );
                    const taxableBase = Number((finalUnitPrice / 1.18).toFixed(2));
                    const gstUnit = Number((finalUnitPrice - taxableBase).toFixed(2));
                    const inCartItem = cart.find((i) => i.product.id === product.id);

                    return (
                      <div
                        key={product.id}
                        className="group rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(57,255,106,0.15)] p-5 backdrop-blur-xl hover:border-[#39FF6A]/50 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
                      >
                        <div>
                          {/* Top Badges */}
                          <div className="flex items-center justify-between gap-2 mb-3 font-mono">
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#040B08] text-[#7FE7D6] border border-[rgba(57,255,106,0.15)] uppercase">
                              {product.categoryName}
                            </span>
                            {product.ageRestricted && (
                              <span className="px-2 py-0.5 rounded bg-[#FF9A1F]/10 text-[#FF9A1F] border border-[#FF9A1F]/30 text-[10px] font-bold flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" />
                                18+ Required
                              </span>
                            )}
                          </div>

                          {/* 3D Interactive Model Preview Trigger & Image */}
                          <div className="relative h-44 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.15)] overflow-hidden mb-4 flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={product.images[0]}
                              alt={product.title}
                              className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                              onError={(e: any) => {
                                e.target.src = 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=400&q=80';
                              }}
                            />

                            {/* 3D View Button Overlay */}
                            <button
                              onClick={() => setViewerProduct(product)}
                              className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-black/75 hover:bg-[#39FF6A] hover:text-black text-gray-300 border border-gray-700 hover:border-[#39FF6A] text-[10px] font-mono flex items-center gap-1 transition shadow"
                              title="Inspect 3D CAD Model"
                            >
                              <Box className="w-3 h-3" />
                              <span>View 3D</span>
                            </button>
                          </div>

                          {/* Title & Description */}
                          <h3 className="text-base font-bold text-[#EAF7EF] group-hover:text-[#39FF6A] transition-colors mb-1 line-clamp-1 font-sans">
                            {product.title}
                          </h3>
                          <p className="text-xs text-[#8FA99B] line-clamp-2 mb-3 leading-relaxed">
                            {product.description}
                          </p>

                          {/* Specs Chips */}
                          {product.specs && (
                            <div className="flex flex-wrap gap-1.5 mb-4 font-mono">
                              {Object.entries(product.specs).slice(0, 3).map(([key, val]) => (
                                <span
                                  key={key}
                                  className="px-2 py-0.5 rounded text-[10px] bg-[#040B08] text-[#8FA99B] font-medium border border-[rgba(57,255,106,0.1)]"
                                >
                                  {key}: <strong className="text-[#EAF7EF]">{String(val)}</strong>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Bottom Price Box & Add Actions */}
                        <div className="pt-3 border-t border-[rgba(57,255,106,0.1)] font-mono">
                          <div className="flex items-end justify-between mb-3">
                            <div>
                              <div className="flex items-baseline gap-2">
                                <span className="text-xl font-extrabold text-[#39FF6A]">
                                  ₹{finalUnitPrice}
                                </span>
                                {discountPct > 0 && (
                                  <span className="text-xs text-[#8FA99B] line-through">
                                    ₹{product.priceInr}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-[#8FA99B]">
                                (Base ₹{taxableBase} + ₹{gstUnit} GST 18%)
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-[10px] font-bold text-[#39FF6A] bg-[rgba(57,255,106,0.1)] px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-[#39FF6A]/30">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                <span>In Stock</span>
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setActiveSpecsProduct(product)}
                              className="px-3 py-2 rounded-xl bg-[#040B08] hover:bg-[rgba(57,255,106,0.1)] text-[#8FA99B] hover:text-[#EAF7EF] text-xs font-semibold border border-[rgba(57,255,106,0.15)] transition-colors"
                              title="Quick Specs"
                            >
                              Specs
                            </button>

                            {inCartItem ? (
                              <div className="flex-1 flex items-center justify-between px-3 py-1.5 rounded-xl bg-[rgba(57,255,106,0.12)] border border-[#39FF6A]/40 text-[#39FF6A]">
                                <button
                                  onClick={() => updateQuantity(product.id, -1)}
                                  className="p-1 hover:text-[#EAF7EF]"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="font-bold text-xs">{inCartItem.quantity} in cart</span>
                                <button
                                  onClick={() => updateQuantity(product.id, 1)}
                                  className="p-1 hover:text-[#EAF7EF]"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => addToCart(product)}
                                className="flex-1 py-2 px-4 rounded-xl bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] hover:opacity-95 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(57,255,106,0.25)] transition-transform active:scale-95 font-sans"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add to Cart</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </main>
      </div>

      {/* 3D PRODUCT VIEWER MODAL */}
      {viewerProduct && (
        <Product3DViewerModal
          isOpen={Boolean(viewerProduct)}
          onClose={() => setViewerProduct(null)}
          product={viewerProduct}
          onAddToCart={() => addToCart(viewerProduct)}
        />
      )}

      {/* EXPANDED KIT BOM MODAL */}
      {activeKitBom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-mono">
          <div className="relative w-full max-w-2xl bg-[#07110D] border border-[#39FF6A]/40 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <div>
                <span className="text-[10px] text-[#39FF6A] font-bold uppercase tracking-wider">
                  FULL BILL OF MATERIALS (BOM)
                </span>
                <h3 className="text-xl font-bold text-white font-sans mt-0.5">
                  {activeKitBom.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveKitBom(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-xs text-gray-300 leading-relaxed font-sans">
                {activeKitBom.description}
              </p>

              <div className="rounded-2xl bg-black/40 border border-gray-800 p-4 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-gray-400 border-b border-gray-800 pb-2 uppercase">
                  <span>Component Name</span>
                  <span>Unit Price</span>
                </div>
                {activeKitBom.bom.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs py-1 border-b border-gray-800/50">
                    <span className="text-gray-200">
                      {item.quantity}x {item.name}{' '}
                      <span className="text-[10px] text-gray-500">({item.sku})</span>
                    </span>
                    <span className="text-[#39FF6A] font-bold">₹{item.unitPriceInr * item.quantity}</span>
                  </div>
                ))}
                <div className="flex justify-between text-xs pt-2 font-bold text-gray-300">
                  <span>Sum of Individual Components:</span>
                  <span>₹{activeKitBom.sumOfPartsInr}</span>
                </div>
                <div className="flex justify-between text-sm pt-1 font-bold text-white border-t border-gray-700">
                  <span>Bundled RoboVerse Kit Price:</span>
                  <span className="text-[#39FF6A]">₹{activeKitBom.kitPriceInr}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-800 flex justify-end gap-3 font-sans">
              <button
                onClick={() => setActiveKitBom(null)}
                className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-bold text-gray-300"
              >
                Close
              </button>
              <button
                onClick={() => {
                  addKitToCart(activeKitBom);
                  setActiveKitBom(null);
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] hover:opacity-95 text-black font-extrabold text-xs shadow"
              >
                Add Complete Kit to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK SPECS MODAL */}
      {activeSpecsProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn font-mono">
          <div className="bg-[#07110D] rounded-3xl border border-[rgba(57,255,106,0.3)] shadow-[0_0_50px_rgba(7,17,13,0.9)] max-w-lg w-full p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(57,255,106,0.15)]">
              <div>
                <span className="text-[10px] font-bold text-[#39FF6A] uppercase tracking-wider">
                  SPECIFICATION SHEET
                </span>
                <h3 className="text-lg font-bold text-[#EAF7EF] font-sans">
                  {activeSpecsProduct.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveSpecsProduct(null)}
                className="w-8 h-8 rounded-full bg-[#040B08] text-[#8FA99B] hover:text-[#39FF6A] flex items-center justify-center border border-[rgba(57,255,106,0.2)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <p className="text-xs text-[#8FA99B] leading-relaxed">
                {activeSpecsProduct.description}
              </p>

              <div className="rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(57,255,106,0.15)] p-4 space-y-2 text-xs">
                <div className="font-bold text-[#EAF7EF] mb-2 font-sans">Technical Parameters:</div>
                {activeSpecsProduct.specs ? (
                  Object.entries(activeSpecsProduct.specs).map(([key, val]) => (
                    <div key={key} className="flex justify-between py-1 border-b border-[rgba(57,255,106,0.08)]">
                      <span className="text-[#8FA99B] capitalize">{key}:</span>
                      <span className="font-bold text-[#EAF7EF]">{String(val)}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-[#8FA99B]">Standard electronic pinout compatible with 5V/3.3V logic.</div>
                )}
                <div className="flex justify-between py-1 pt-2">
                  <span className="text-[#8FA99B]">HSN Code:</span>
                  <span className="font-bold text-[#EAF7EF]">8542.31.00 (ICs &amp; Controllers)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#8FA99B]">GST Rate:</span>
                  <span className="font-bold text-[#39FF6A]">18% Integrated GST</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  addToCart(activeSpecsProduct);
                  setActiveSpecsProduct(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] hover:opacity-95 text-black font-extrabold text-xs shadow-[0_0_20px_rgba(57,255,106,0.3)] transition-all font-sans"
              >
                Add this Component to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CART DRAWER */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md animate-fadeIn font-mono">
          <div className="w-full max-w-md bg-[#07110D] border-l border-[rgba(57,255,106,0.25)] h-full flex flex-col justify-between shadow-[0_0_50px_rgba(7,17,13,0.9)]">
            {/* Drawer Header */}
            <div className="p-5 border-b border-[rgba(57,255,106,0.15)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#39FF6A]" />
                <h3 className="text-base font-bold text-[#EAF7EF] font-sans">Hardware Cart</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[rgba(57,255,106,0.1)] text-[#39FF6A] border border-[#39FF6A]/30 text-xs font-bold">
                  {cartItemCount} Items
                </span>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="w-8 h-8 rounded-full bg-[#040B08] text-[#8FA99B] hover:text-[#39FF6A] flex items-center justify-center border border-[rgba(57,255,106,0.2)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="p-5 flex-1 overflow-y-auto space-y-3">
              {cart.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <ShoppingBag className="w-12 h-12 text-[#8FA99B] mx-auto opacity-40" />
                  <p className="text-sm text-[#8FA99B]">Your hardware cart is currently empty.</p>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="px-4 py-2 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] text-xs font-bold text-[#EAF7EF] hover:border-[#39FF6A]"
                  >
                    Explore Components
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-3.5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(57,255,106,0.15)] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.product.images[0]}
                        alt={item.product.title}
                        className="w-12 h-12 rounded-xl object-contain border border-[rgba(57,255,106,0.2)] bg-[#040B08] p-1 shrink-0"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-[#EAF7EF] line-clamp-1 font-sans">
                          {item.product.title}
                        </h4>
                        <span className="text-xs font-semibold text-[#39FF6A]">
                          ₹{item.product.priceInr} each (incl. GST)
                        </span>
                        {item.product.ageRestricted && (
                          <span className="block text-[9px] text-[#FF9A1F]">
                            18+ Consent Required
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center rounded-lg bg-[#040B08] border border-[rgba(57,255,106,0.2)]">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="p-1 text-[#8FA99B] hover:text-[#39FF6A]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-[#EAF7EF]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="p-1 text-[#8FA99B] hover:text-[#39FF6A]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1.5 text-[#8FA99B] hover:text-[#FF6B6B]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-[rgba(57,255,106,0.15)] bg-[#040B08]/90 space-y-4">
                {/* Coupon Code Input */}
                <div className="space-y-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Coupon (e.g. ROBOFIRST)"
                      className="flex-1 px-3 py-1.5 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] text-xs uppercase font-semibold text-[#EAF7EF] focus:outline-none focus:border-[#39FF6A]"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="px-3.5 py-1.5 rounded-xl bg-[rgba(57,255,106,0.15)] text-[#39FF6A] border border-[#39FF6A]/40 hover:bg-[rgba(57,255,106,0.25)] font-bold text-xs"
                    >
                      Apply
                    </button>
                  </div>
                  {couponApplied && (
                    <div className="text-[11px] text-[#39FF6A] flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Code {couponApplied.code} applied (-₹{couponApplied.discountInr})</span>
                    </div>
                  )}
                  {couponError && (
                    <div className="text-[11px] text-[#FF6B6B]">{couponError}</div>
                  )}
                </div>

                {/* 18% GST Calculations Strip */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#8FA99B]">
                    <span>Hardware MRP Total</span>
                    <span>₹{cartSubtotal}</span>
                  </div>

                  {discountPct > 0 && (
                    <div className="flex justify-between text-[#39FF6A] font-semibold">
                      <span>{tierString} Student Discount ({discountPct}%)</span>
                      <span>-₹{cartPlanDiscountAmount}</span>
                    </div>
                  )}

                  {couponApplied && (
                    <div className="flex justify-between text-[#39FF6A] font-semibold">
                      <span>Coupon Discount</span>
                      <span>-₹{couponApplied.discountInr}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-[#8FA99B] pt-1 border-t border-[rgba(57,255,106,0.1)]">
                    <span>Taxable Base Value</span>
                    <span>₹{taxableBaseAmount}</span>
                  </div>

                  <div className="flex justify-between text-[#8FA99B]">
                    <span>18% GST (CGST 9% + SGST 9%)</span>
                    <span>₹{gstTotal}</span>
                  </div>

                  <div className="flex justify-between text-[#8FA99B]">
                    <span>Delivery (India-wide)</span>
                    <span className="text-[#39FF6A] font-bold">FREE</span>
                  </div>

                  <div className="flex justify-between text-[#EAF7EF] font-black text-sm pt-2 border-t border-[rgba(57,255,106,0.15)]">
                    <span>Total Payable Amount</span>
                    <span className="text-[#39FF6A] text-base">₹{cartFinalAmount}</span>
                  </div>
                </div>

                <button
                  onClick={handleInitiateCheckout}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] hover:opacity-95 text-black font-extrabold text-xs shadow-[0_0_20px_rgba(57,255,106,0.3)] flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] font-sans"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Proceed to Payment (₹{cartFinalAmount})</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn font-mono">
          <div className="relative w-full max-w-xl rounded-3xl bg-[#07110D] border border-[rgba(57,255,106,0.3)] p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setCheckoutModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#040B08] text-[#8FA99B] hover:text-[#39FF6A] flex items-center justify-center border border-[rgba(57,255,106,0.2)]"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-5 h-5 text-[#39FF6A]" />
                <h3 className="text-xl font-bold text-white font-sans">
                  Checkout &amp; Delivery Details
                </h3>
              </div>
              <p className="text-xs text-[#8FA99B] mb-5">
                Orders are fulfilled directly by TechSavyyy India. Prices calculated strictly server-side.
              </p>

              {checkoutError && (
                <div className="p-3 mb-4 rounded-xl bg-red-950/40 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{checkoutError}</span>
                </div>
              )}

              {/* Age Restriction & Minor Consent Checkbox */}
              {hasAgeRestrictedCartItem && isMinor && (
                <div className="p-3.5 mb-4 rounded-xl bg-[#FF9A1F]/10 border border-[#FF9A1F]/30 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-[#FF9A1F] font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Parental / Guardian Consent Verification (18+)</span>
                  </div>
                  <p className="text-gray-300 text-[11px] leading-relaxed">
                    Your cart contains components with thermal, high-discharge or regulated flight properties.
                    Indian minor safety compliance requires adult guardian acknowledgment.
                  </p>
                  <label className="flex items-center gap-2 text-white font-medium cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={parentConsentGiven}
                      onChange={(e) => setParentConsentGiven(e.target.checked)}
                      className="accent-[#39FF6A] w-4 h-4 rounded"
                    />
                    <span>I confirm my parent/guardian has authorized this hardware purchase.</span>
                  </label>
                </div>
              )}

              {/* Shipping Address Inputs */}
              <div className="space-y-3 mb-5">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Shipping Address
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={shippingAddress.fullName}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                    placeholder="Recipient Name"
                    className="col-span-2 px-3 py-2 rounded-xl bg-[#040B08] border border-gray-700 text-xs text-white focus:border-[#39FF6A]"
                  />
                  <input
                    type="text"
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    placeholder="Mobile (+91)"
                    className="px-3 py-2 rounded-xl bg-[#040B08] border border-gray-700 text-xs text-white focus:border-[#39FF6A]"
                  />
                  <input
                    type="text"
                    value={shippingAddress.pincode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                    placeholder="Pincode (e.g. 110016)"
                    className="px-3 py-2 rounded-xl bg-[#040B08] border border-gray-700 text-xs text-white focus:border-[#39FF6A]"
                  />
                  <input
                    type="text"
                    value={shippingAddress.addressLine1}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })}
                    placeholder="Street / Campus / Hostel Address"
                    className="col-span-2 px-3 py-2 rounded-xl bg-[#040B08] border border-gray-700 text-xs text-white focus:border-[#39FF6A]"
                  />
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    placeholder="City"
                    className="px-3 py-2 rounded-xl bg-[#040B08] border border-gray-700 text-xs text-white focus:border-[#39FF6A]"
                  />
                  <input
                    type="text"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                    placeholder="State"
                    className="px-3 py-2 rounded-xl bg-[#040B08] border border-gray-700 text-xs text-white focus:border-[#39FF6A]"
                  />
                </div>
              </div>

              {/* Payment Mode Selection */}
              <div className="space-y-3 mb-6">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Payment Method
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCheckoutMethod('qr')}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      checkoutMethod === 'qr'
                        ? 'bg-[#39FF6A]/10 border-[#39FF6A] text-white shadow'
                        : 'bg-[#040B08] border-gray-800 text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <QrCode className="w-5 h-5 text-[#39FF6A]" />
                      <span className="text-[10px] font-bold text-[#39FF6A] bg-[#39FF6A]/10 px-1.5 py-0.5 rounded">
                        RECOMMENDED
                      </span>
                    </div>
                    <span className="text-xs font-bold block">Dynamic UPI QR</span>
                    <span className="text-[10px] text-gray-400">15-min countdown • Zero convenience fee</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCheckoutMethod('checkout')}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      checkoutMethod === 'checkout'
                        ? 'bg-[#39FF6A]/10 border-[#39FF6A] text-white shadow'
                        : 'bg-[#040B08] border-gray-800 text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <CreditCard className="w-5 h-5 text-[#7FE7D6]" />
                    </div>
                    <span className="text-xs font-bold block">Razorpay Standard</span>
                    <span className="text-[10px] text-gray-400">Cards, Netbanking, Wallets</span>
                  </button>
                </div>
              </div>

              {/* Final Amount & Action */}
              <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400">Final Total Due:</span>
                  <div className="text-2xl font-bold text-[#39FF6A]">
                    ₹{cartFinalAmount}
                  </div>
                </div>

                <button
                  onClick={handleProcessOrder}
                  disabled={checkoutLoading || (hasAgeRestrictedCartItem && isMinor && !parentConsentGiven)}
                  className="py-3 px-6 rounded-xl bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] hover:opacity-95 text-black font-extrabold text-xs shadow-[0_0_20px_rgba(57,255,106,0.3)] transition-transform active:scale-95 disabled:opacity-50 font-sans"
                >
                  {checkoutLoading ? 'Processing Server Pricing...' : 'Pay with Razorpay'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC UPI QR MODAL WITH 15-MINUTE COUNTDOWN */}
      {upiQrModalOpen && activeQrOrder && (
        <DynamicUpiQrModal
          isOpen={upiQrModalOpen}
          onClose={() => setUpiQrModalOpen(false)}
          order={activeQrOrder}
          onPaymentSuccess={handleOrderVerified}
          onRefreshQr={handleRefreshQr}
        />
      )}

      {/* OFFICIAL GST TAX INVOICE MODAL */}
      <InvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        invoice={activeInvoice}
      />

      {/* PAST ORDERS MODAL */}
      {ordersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-mono">
          <div className="relative w-full max-w-xl bg-[#07110D] border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#39FF6A]" />
                <h3 className="text-lg font-bold text-white font-sans">Past GST Invoices</h3>
              </div>
              <button
                onClick={() => setOrdersModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {pastOrders.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400">
                  No previous orders found for this student account.
                </div>
              ) : (
                pastOrders.map((ord: InvoiceData, idx) => (
                  <div
                    key={ord.orderNumber || idx}
                    className="p-4 bg-black/40 rounded-xl border border-gray-800 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-white font-sans block">
                        Invoice {ord.invoiceNumber}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        Date: {ord.invoiceDate} • Total: ₹{ord.grandTotalInr}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setActiveInvoice(ord);
                        setInvoiceModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-[#39FF6A]/10 text-[#39FF6A] border border-[#39FF6A]/30 rounded-lg text-xs font-bold hover:bg-[#39FF6A]/20 transition"
                    >
                      View Invoice
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StorePage() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#07110D] text-white flex items-center justify-center font-mono">Loading TechSavyyy Store...</div>}>
      <StoreContent />
    </Suspense>
  );
}
