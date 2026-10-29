'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppSidebar } from '../../components/layout/AppSidebar';
import { AppTopBar } from '../../components/layout/AppTopBar';
import { apiRequest } from '../../lib/apiClient';
import { useAuthStore } from '../../store/useAuthStore';
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
} from 'lucide-react';

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  priceInr: number;
  stockQuantity: number;
  images: string[];
  specs?: Record<string, any>;
  rating: number;
  isKitOfMonth?: boolean;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const CATEGORIES = [
  { id: 'ALL', label: 'All Components' },
  { id: 'ROBOT_KITS', label: 'Robot Kits' },
  { id: 'MICROCONTROLLERS', label: 'Microcontrollers' },
  { id: 'ACTUATORS', label: 'Motors & Servos' },
  { id: 'SENSORS', label: 'Sensors' },
  { id: 'MECHANICAL', label: 'Chassis & Wheels' },
  { id: 'TOOLS', label: 'Tools & Soldering' },
];

export default function StorePage() {
  const { user, profile, studentIdCard, planTier, isAuthenticated } = useAuthStore();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
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

  // Quick Specs Modal
  const [activeSpecsProduct, setActiveSpecsProduct] = useState<Product | null>(null);

  // Checkout modal
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [upiId, setUpiId] = useState('student@oksbi');
  const [shippingAddress, setShippingAddress] = useState({
    fullName: profile?.fullName || 'Tanmay Chawda',
    phone: '+91 98765 43210',
    addressLine1: 'Hostel 4, Room 302, IIT Delhi Campus',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110016',
  });
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [orderConfirmed, setOrderConfirmed] = useState<any | null>(null);

  // Past Orders modal
  const [ordersModalOpen, setOrdersModalOpen] = useState(false);
  const [pastOrders, setPastOrders] = useState<any[]>([]);

  // Fetch products
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'ALL') params.append('category', selectedCategory);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (sortBy === 'price_asc') params.append('sort', 'price_asc');
      if (sortBy === 'price_desc') params.append('sort', 'price_desc');

      const res = await apiRequest(`/store/products?${params.toString()}`);
      if (res.success && res.data) {
        setProducts(res.data.products || []);
      }
      setLoading(false);
    }

    loadProducts();
  }, [selectedCategory, searchQuery, sortBy]);

  // Plan discount: Pro = 10%, Plus = 5%, Free = 0%
  const discountPct = planTier === 'PRO' ? 10 : planTier === 'PLUS' ? 5 : 0;

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
    if (!isAuthenticated) {
      setCheckoutError('Please log in with your Student ID to proceed with checkout.');
      setCheckoutModalOpen(true);
      return;
    }

    setCheckoutError(null);
    setCheckoutModalOpen(true);
  };

  const handleConfirmPayment = async () => {
    setCheckoutLoading(true);
    setCheckoutError(null);

    // 1. Create order in backend
    const checkoutRes = await apiRequest('/store/checkout', {
      method: 'POST',
      body: JSON.stringify({
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.product.priceInr,
          title: item.product.title,
        })),
        shippingAddress,
      }),
    });

    if (!checkoutRes.success || !checkoutRes.data) {
      setCheckoutError(checkoutRes.error?.message || 'Checkout creation failed.');
      setCheckoutLoading(false);
      return;
    }

    const { razorpayOrderId } = checkoutRes.data;

    // 2. Verify payment (Razorpay Mock / Sandbox)
    const verifyRes = await apiRequest('/store/verify-order', {
      method: 'POST',
      body: JSON.stringify({
        razorpayOrderId,
        razorpayPaymentId: `pay_mock_${Date.now()}`,
        razorpaySignature: 'mock_signature_valid_for_dev_mode',
      }),
    });

    setCheckoutLoading(false);

    if (verifyRes.success && verifyRes.data) {
      setOrderConfirmed({
        ...verifyRes.data,
        items: [...cart],
        shippingAddress: { ...shippingAddress },
        taxBreakdown: {
          subtotal: cartSubtotal,
          discount: cartPlanDiscountAmount + couponDiscountAmount,
          taxableBase: taxableBaseAmount,
          cgst,
          sgst,
          total: cartFinalAmount,
        },
      });
      setCart([]);
      setCouponApplied(null);
    } else {
      setCheckoutError(verifyRes.error?.message || 'Payment verification failed.');
    }
  };

  // Fetch Past Orders
  const handleOpenOrdersModal = async () => {
    if (!isAuthenticated) return;
    const res = await apiRequest('/store/orders');
    if (res.success && res.data) {
      setPastOrders(res.data.orders || []);
    }
    setOrdersModalOpen(true);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#07110D] text-[#EAF7EF] font-sans selection:bg-[#39FF6A] selection:text-black">
      {/* Slim Vertical Icon Rail */}
      <AppSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Sticky Bar */}
        <AppTopBar
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Page Content Body */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Top Hero Banner - Dark Futuristic Style */}
          <section className="relative overflow-hidden rounded-3xl bg-[rgba(255,255,255,0.03)] border border-[rgba(57,255,106,0.2)] p-6 sm:p-10 backdrop-blur-xl shadow-[0_0_35px_rgba(7,17,13,0.8)]">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[rgba(57,255,106,0.1)] border border-[rgba(57,255,106,0.3)] text-[#39FF6A] text-xs font-mono font-bold tracking-wider mb-3 shadow-[0_0_15px_rgba(57,255,106,0.15)]">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>TECHSAVYYY OFFICIAL HARDWARE WAREHOUSE</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold text-[#EAF7EF] tracking-tight mb-2">
                  TechSavyyy Components Store
                </h1>
                <p className="text-sm sm:text-base text-[#8FA99B] max-w-2xl leading-relaxed font-mono text-xs">
                  Tested microcontrollers, sensor breakout modules, chassis, and robotics kits at student-first prices.
                  All items include 18% GST with downloadable tax invoices. Plus &amp; Pro students receive up to 10% instant discount!
                </p>
              </div>

              {/* Cart & Past Invoices Quick Actions */}
              <div className="flex items-center gap-3 shrink-0">
                {isAuthenticated && (
                  <button
                    onClick={handleOpenOrdersModal}
                    className="px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(57,255,106,0.1)] text-xs font-bold text-[#EAF7EF] border border-[rgba(57,255,106,0.2)] flex items-center gap-2 transition-colors font-mono"
                  >
                    <FileText className="w-4 h-4 text-[#7FE7D6]" />
                    <span>My Invoices</span>
                  </button>
                )}

                <button
                  onClick={() => setCartOpen(true)}
                  className="relative px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] hover:opacity-95 text-black font-extrabold text-xs shadow-[0_0_20px_rgba(57,255,106,0.3)] flex items-center gap-2 transition-transform hover:scale-[1.02] font-mono"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Hardware Cart ({cartItemCount})</span>
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-black text-[#39FF6A] text-[10px] flex items-center justify-center font-bold border-2 border-[#39FF6A] shadow-sm">
                      {cartItemCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Plan Discount & Guarantees Strip */}
            <div className="mt-8 pt-5 border-t border-[rgba(57,255,106,0.12)] flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#39FF6A]" />
                <span className="text-[#8FA99B]">
                  Active Student Tier: <strong className="text-[#EAF7EF]">{planTier}</strong>
                </span>
                {discountPct > 0 ? (
                  <span className="px-2 py-0.5 rounded-md bg-[rgba(57,255,106,0.15)] text-[#39FF6A] font-bold border border-[#39FF6A]/40">
                    {discountPct}% Store Discount Applied
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
                  placeholder="Search hardware by name, keyword (e.g. Starter Kit, ESP32, Servo, Ultrasonic, L298N)..."
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

          {/* Products Grid */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#EAF7EF] flex items-center gap-2">
                <span>Hardware Catalog</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[rgba(57,255,106,0.1)] text-[#39FF6A] border border-[#39FF6A]/30 text-xs font-mono font-bold">
                  {products.length} Products
                </span>
              </h2>
              <span className="text-xs text-[#8FA99B] font-mono">All prices inclusive of 18% GST</span>
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
              <div className="rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(57,255,106,0.15)] p-12 text-center backdrop-blur-xl">
                <AlertCircle className="w-10 h-10 text-[#FF9A1F] mx-auto mb-3" />
                <h3 className="text-lg font-bold text-[#EAF7EF] mb-1">
                  No Hardware Components Found
                </h3>
                <p className="text-sm text-[#8FA99B] mb-4 max-w-md mx-auto font-mono text-xs">
                  Try adjusting your search terms or choosing &quot;All Components&quot; to see our full inventory.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('ALL');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl bg-[rgba(57,255,106,0.15)] text-[#39FF6A] border border-[#39FF6A]/40 text-xs font-mono font-bold"
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
                        {/* Top Category & Kit Badge */}
                        <div className="flex items-center justify-between gap-2 mb-3 font-mono">
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#040B08] text-[#7FE7D6] border border-[rgba(57,255,106,0.15)] uppercase">
                            {product.category}
                          </span>
                          {product.isKitOfMonth && (
                            <span className="px-2 py-0.5 rounded-full bg-[rgba(57,255,106,0.1)] text-[#39FF6A] border border-[#39FF6A]/30 font-bold text-[10px] flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              Kit of the Month
                            </span>
                          )}
                        </div>

                        {/* Image Container */}
                        <div className="relative h-44 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.15)] overflow-hidden mb-4 flex items-center justify-center">
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                            onError={(e: any) => {
                              e.target.src = 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=400&q=80';
                            }}
                          />
                          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-[#040B08]/90 backdrop-blur-sm text-[#7FE7D6] font-bold text-xs flex items-center gap-1 border border-[#7FE7D6]/40 shadow-sm font-mono">
                            <Star className="w-3 h-3 fill-current" />
                            <span>{product.rating}</span>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <h3 className="text-base font-bold text-[#EAF7EF] group-hover:text-[#39FF6A] transition-colors mb-1 line-clamp-1">
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
        </main>
      </div>

      {/* QUICK SPECS MODAL */}
      {activeSpecsProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn font-mono">
          <div className="bg-[#07110D] rounded-3xl border border-[rgba(57,255,106,0.3)] shadow-[0_0_50px_rgba(7,17,13,0.9)] max-w-lg w-full p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(57,255,106,0.15)]">
              <div>
                <span className="text-[10px] font-bold text-[#39FF6A] uppercase tracking-wider">SPECIFICATION SHEET</span>
                <h3 className="text-lg font-bold text-[#EAF7EF]">
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

            {/* Cart Footer: Coupon & 18% GST Breakdown */}
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
                      <span>{planTier} Student Discount ({discountPct}%)</span>
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
                  <span>Proceed to Razorpay Checkout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHECKOUT & RAZORPAY PAYMENT SIMULATION MODAL */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn font-mono">
          <div className="relative w-full max-w-xl rounded-3xl bg-[#07110D] border border-[rgba(57,255,106,0.3)] p-6 sm:p-8 shadow-[0_0_50px_rgba(7,17,13,0.9)] max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setCheckoutModalOpen(false);
                setOrderConfirmed(null);
              }}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#040B08] text-[#8FA99B] hover:text-[#39FF6A] flex items-center justify-center border border-[rgba(57,255,106,0.2)]"
            >
              <X className="w-4 h-4" />
            </button>

            {orderConfirmed ? (
              /* Order Confirmed & Official 18% GST Tax Invoice Display */
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-full bg-[rgba(57,255,106,0.1)] text-[#39FF6A] mx-auto flex items-center justify-center border-2 border-[#39FF6A] shadow-[0_0_15px_rgba(57,255,106,0.3)]">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-black text-[#EAF7EF] font-sans">
                    Hardware Order Confirmed!
                  </h3>
                  <p className="text-xs text-[#8FA99B] max-w-md mx-auto">
                    Your parts are allocated at the TechSavyyy Delhi warehouse. Delhivery Express dispatch initiated.
                  </p>
                </div>

                {/* Printable Official 18% GST Tax Invoice Container (Print friendly) */}
                <div
                  id="printable-gst-invoice"
                  className="rounded-2xl border-2 border-gray-200 bg-white p-5 text-gray-800 font-sans shadow-sm text-xs space-y-4"
                >
                  {/* Invoice Header */}
                  <div className="flex justify-between items-start border-b border-gray-200 pb-3">
                    <div>
                      <div className="font-black text-sm text-slate-900">RoboVerse Logistics Pvt. Ltd.</div>
                      <div className="text-[11px] text-gray-500">TechSavyyy Hardware Division</div>
                      <div className="text-[10px] text-gray-400">Plot 42, Okhla Industrial Area Phase-III, New Delhi 110020</div>
                      <div className="text-[11px] font-bold text-emerald-700 mt-1">
                        GSTIN: 07AAAAA0000A1Z5
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        TAX INVOICE (ORIGINAL)
                      </span>
                      <div className="font-mono text-xs font-bold text-slate-900 mt-1">
                        {orderConfirmed.invoiceNumber}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        Date: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  {/* Billed To */}
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-xl text-[11px]">
                    <div>
                      <span className="font-bold text-gray-700 block">BILLED TO (STUDENT):</span>
                      <div className="font-bold text-slate-900">{orderConfirmed.shippingAddress?.fullName || 'Student Builder'}</div>
                      <div>Student ID: <strong>{studentIdCard?.studentId || 'RV-2026-STUDENT'}</strong></div>
                      <div>{orderConfirmed.shippingAddress?.addressLine1}</div>
                      <div>{orderConfirmed.shippingAddress?.city}, {orderConfirmed.shippingAddress?.state} - {orderConfirmed.shippingAddress?.pincode}</div>
                    </div>
                    <div>
                      <span className="font-bold text-gray-700 block">DISPATCH DETAILS:</span>
                      <div>Order Reference: <strong>{orderConfirmed.orderId}</strong></div>
                      <div>Courier: <strong>Delhivery Robotics Surface</strong></div>
                      <div>Payment Mode: <strong>Razorpay UPI Instant</strong></div>
                      <div>Place of Supply: <strong>{orderConfirmed.shippingAddress?.state} (State Code 07)</strong></div>
                    </div>
                  </div>

                  {/* Itemized Table */}
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-500 font-semibold">
                        <th className="py-1">Item Description</th>
                        <th className="py-1">HSN Code</th>
                        <th className="py-1 text-center">Qty</th>
                        <th className="py-1 text-right">Taxable</th>
                        <th className="py-1 text-right">GST (18%)</th>
                        <th className="py-1 text-right">Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orderConfirmed.items?.map((item: CartItem, idx: number) => {
                        const itemTotal = item.product.priceInr * item.quantity;
                        const itemTaxable = Number((itemTotal / 1.18).toFixed(2));
                        const itemGst = Number((itemTotal - itemTaxable).toFixed(2));

                        return (
                          <tr key={idx} className="text-gray-700">
                            <td className="py-1.5 font-medium">{item.product.title}</td>
                            <td className="py-1.5 font-mono text-[10px]">8542.31</td>
                            <td className="py-1.5 text-center">{item.quantity}</td>
                            <td className="py-1.5 text-right font-mono">₹{itemTaxable}</td>
                            <td className="py-1.5 text-right font-mono">₹{itemGst}</td>
                            <td className="py-1.5 text-right font-bold font-mono">₹{itemTotal}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Summary Totals */}
                  <div className="pt-2 border-t border-gray-200 flex justify-end">
                    <div className="w-64 space-y-1 text-[11px]">
                      <div className="flex justify-between text-gray-500">
                        <span>Taxable Amount:</span>
                        <span className="font-mono">₹{orderConfirmed.taxBreakdown?.taxableBase}</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>CGST (9%):</span>
                        <span className="font-mono">₹{orderConfirmed.taxBreakdown?.cgst}</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>SGST (9%):</span>
                        <span className="font-mono">₹{orderConfirmed.taxBreakdown?.sgst}</span>
                      </div>
                      <div className="flex justify-between font-black text-sm text-slate-900 pt-1 border-t border-gray-200">
                        <span>Total Paid (INR):</span>
                        <span className="font-mono text-emerald-700 font-extrabold">₹{orderConfirmed.taxBreakdown?.total}</span>
                      </div>
                    </div>
                  </div>

                  {/* Digital Signature Stamp */}
                  <div className="flex justify-between items-end pt-3 border-t border-gray-200 text-[10px] text-gray-400">
                    <div>
                      This is a digitally generated 18% GST tax invoice under section 31 of CGST Act, 2017.
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-700">For RoboVerse Logistics Pvt. Ltd.</div>
                      <div className="font-mono text-[9px] text-emerald-600 font-bold">DIGITALLY SIGNED &amp; SEALED</div>
                    </div>
                  </div>
                </div>

                {/* Post Order Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 py-2.5 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.3)] text-[#EAF7EF] hover:border-[#39FF6A] text-xs font-bold flex items-center justify-center gap-2 font-mono"
                  >
                    <Printer className="w-4 h-4 text-[#39FF6A]" />
                    <span>Print / Save Tax Invoice PDF</span>
                  </button>

                  <button
                    onClick={() => {
                      setCheckoutModalOpen(false);
                      setOrderConfirmed(null);
                      setCartOpen(false);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] hover:opacity-95 text-black text-xs font-extrabold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(57,255,106,0.25)] font-sans"
                  >
                    <span>Continue Hardware Shopping</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Razorpay Simulated Checkout Form */
              <div>
                <div className="flex items-center gap-2 text-[#39FF6A] text-xs font-bold mb-1">
                  <CreditCard className="w-4 h-4" />
                  <span>RAZORPAY 18% GST PAYMENT GATEWAY</span>
                </div>
                <h3 className="text-xl font-bold text-[#EAF7EF] mb-4 font-sans">
                  Confirm Shipping &amp; Payment
                </h3>

                {checkoutError && (
                  <div className="mb-4 p-3 rounded-xl bg-[rgba(255,107,107,0.1)] text-[#FF6B6B] border border-[rgba(255,107,107,0.3)] text-xs flex items-center gap-2 font-mono">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{checkoutError}</span>
                  </div>
                )}

                {/* Delivery Address Form */}
                <div className="space-y-3 mb-6">
                  <span className="text-xs font-bold text-[#8FA99B] block font-sans">
                    DELIVERY ADDRESS &amp; RECIPIENT
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={shippingAddress.fullName}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                      placeholder="Student Full Name"
                      className="px-3.5 py-2 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] text-xs text-[#EAF7EF] focus:outline-none focus:border-[#39FF6A]"
                    />
                    <input
                      type="text"
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                      placeholder="Mobile Phone"
                      className="px-3.5 py-2 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] text-xs text-[#EAF7EF] focus:outline-none focus:border-[#39FF6A]"
                    />
                  </div>
                  <input
                    type="text"
                    value={shippingAddress.addressLine1}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })}
                    placeholder="Hostel, Room / Street Address"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] text-xs text-[#EAF7EF] focus:outline-none focus:border-[#39FF6A]"
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      placeholder="City"
                      className="px-3 py-2 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] text-xs text-[#EAF7EF] focus:outline-none focus:border-[#39FF6A]"
                    />
                    <input
                      type="text"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      placeholder="State"
                      className="px-3 py-2 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] text-xs text-[#EAF7EF] focus:outline-none focus:border-[#39FF6A]"
                    />
                    <input
                      type="text"
                      value={shippingAddress.pincode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                      placeholder="Pincode"
                      className="px-3 py-2 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] text-xs text-[#EAF7EF] focus:outline-none focus:border-[#39FF6A]"
                    />
                  </div>
                </div>

                {/* Razorpay Authentic Payment Method Selection */}
                <div className="space-y-3 mb-6">
                  <span className="text-xs font-bold text-[#8FA99B] block font-sans">
                    PAYMENT METHOD (POWERED BY RAZORPAY)
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('UPI')}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === 'UPI'
                          ? 'border-[#39FF6A] bg-[rgba(57,255,106,0.12)] text-[#39FF6A] shadow-[0_0_12px_rgba(57,255,106,0.2)]'
                          : 'border-[rgba(57,255,106,0.15)] bg-[#040B08] text-[#8FA99B] hover:text-[#EAF7EF]'
                      }`}
                    >
                      <QrCode className="w-5 h-5" />
                      <span>UPI / QR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CARD')}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === 'CARD'
                          ? 'border-[#39FF6A] bg-[rgba(57,255,106,0.12)] text-[#39FF6A] shadow-[0_0_12px_rgba(57,255,106,0.2)]'
                          : 'border-[rgba(57,255,106,0.15)] bg-[#040B08] text-[#8FA99B] hover:text-[#EAF7EF]'
                      }`}
                    >
                      <CreditCard className="w-5 h-5" />
                      <span>Cards</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('NETBANKING')}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === 'NETBANKING'
                          ? 'border-[#39FF6A] bg-[rgba(57,255,106,0.12)] text-[#39FF6A] shadow-[0_0_12px_rgba(57,255,106,0.2)]'
                          : 'border-[rgba(57,255,106,0.15)] bg-[#040B08] text-[#8FA99B] hover:text-[#EAF7EF]'
                      }`}
                    >
                      <Tag className="w-5 h-5" />
                      <span>NetBanking</span>
                    </button>
                  </div>

                  {paymentMethod === 'UPI' && (
                    <div className="p-3 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] space-y-2">
                      <label className="text-[11px] font-semibold text-[#8FA99B]">Virtual Payment Address (VPA)</label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@okhdfcbank"
                        className="w-full px-3 py-1.5 rounded-lg bg-[#07110D] border border-[rgba(57,255,106,0.2)] text-xs font-mono text-[#EAF7EF] focus:outline-none focus:border-[#39FF6A]"
                      />
                      <div className="text-[10px] text-[#8FA99B]">Instant AutoPay verification supported for Google Pay, PhonePe, Paytm, and BHIM UPI.</div>
                    </div>
                  )}
                </div>

                {/* Final Order Price Box */}
                <div className="p-4 rounded-2xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] mb-6 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#8FA99B] block">Total Payable (18% GST Included):</span>
                    <span className="text-2xl font-black text-[#39FF6A]">
                      ₹{cartFinalAmount}
                    </span>
                  </div>
                  <div className="text-right text-xs text-[#8FA99B]">
                    <div>Taxable: ₹{taxableBaseAmount}</div>
                    <div className="text-[#39FF6A] font-semibold">GST (18%): ₹{gstTotal}</div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 font-mono">
                  <button
                    onClick={() => setCheckoutModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-[#8FA99B] hover:text-[#EAF7EF]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmPayment}
                    disabled={checkoutLoading}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] hover:opacity-95 text-black font-extrabold text-xs shadow-[0_0_20px_rgba(57,255,106,0.3)] flex items-center gap-2 disabled:opacity-50 font-sans"
                  >
                    {checkoutLoading ? (
                      <span>Verifying with Razorpay...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Pay ₹{cartFinalAmount} &amp; Issue GST Invoice</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PAST ORDERS & GST INVOICES MODAL */}
      {ordersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn font-mono">
          <div className="bg-[#07110D] rounded-3xl border border-[rgba(57,255,106,0.3)] shadow-[0_0_50px_rgba(7,17,13,0.9)] max-w-2xl w-full p-6 sm:p-8 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(57,255,106,0.15)]">
              <div>
                <span className="text-xs font-bold text-[#39FF6A] mb-1">PURCHASE HISTORY</span>
                <h3 className="text-xl font-bold text-[#EAF7EF] font-sans">
                  My Orders &amp; 18% GST Invoices
                </h3>
              </div>
              <button
                onClick={() => setOrdersModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#040B08] text-[#8FA99B] hover:text-[#39FF6A] flex items-center justify-center border border-[rgba(57,255,106,0.2)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              {pastOrders.length === 0 ? (
                <div className="py-12 text-center text-[#8FA99B] space-y-2">
                  <FileText className="w-10 h-10 mx-auto opacity-40 text-[#39FF6A]" />
                  <p className="text-xs">No completed hardware orders yet.</p>
                </div>
              ) : (
                pastOrders.map((ord: any) => (
                  <div
                    key={ord.orderId}
                    className="p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(57,255,106,0.15)] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs text-[#EAF7EF]">
                        Order #{ord.orderId}
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-[rgba(57,255,106,0.1)] text-[#39FF6A] border border-[#39FF6A]/30 text-[10px] font-bold">
                        {ord.status}
                      </span>
                    </div>

                    <div className="text-xs text-[#8FA99B] flex justify-between">
                      <span>Total Paid: ₹{ord.taxBreakdown?.finalAmountInr}</span>
                      <span className="text-[#39FF6A]">GST (18%): ₹{ord.taxBreakdown?.totalGstInr}</span>
                    </div>

                    <div className="pt-2 flex justify-end">
                      {ord.invoice && (
                        <a
                          href={`/api/v1/subscriptions/invoices/${ord.invoice.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-1.5 rounded-lg bg-[rgba(57,255,106,0.1)] border border-[#39FF6A]/40 text-[#39FF6A] font-bold text-xs flex items-center gap-1.5 hover:bg-[rgba(57,255,106,0.2)] transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Official GST Invoice ({ord.invoice.invoiceNumber})</span>
                        </a>
                      )}
                    </div>
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
