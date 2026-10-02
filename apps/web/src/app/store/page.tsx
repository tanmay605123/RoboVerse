'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/landing/Navbar';
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
  const { user, profile, planTier, isAuthenticated } = useAuthStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Checkout modal
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    addressLine1: 'Hostel 4, Room 302, Tech Campus',
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
  const cartDiscountAmount = Math.round((cartSubtotal * discountPct) / 100);
  const cartFinalAmount = cartSubtotal - cartDiscountAmount;
  const taxableBaseAmount = Number((cartFinalAmount / 1.18).toFixed(2));
  const gstTotal = Number((cartFinalAmount - taxableBaseAmount).toFixed(2));

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

    // 1. Create order
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
      setOrderConfirmed(verifyRes.data);
      setCart([]);
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
    <div className="min-h-screen bg-[#05100B] text-robo-text font-sans selection:bg-robo-neon selection:text-black">
      <Navbar />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Top Header HUD */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B2117] via-[#071811] to-[#040C08] border border-robo-borderSubtle p-8 sm:p-12 mb-10 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-robo-neon/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-robo-surfaceRaised/80 border border-robo-neon/40 text-robo-neon text-xs font-mono mb-4">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>TECHSAVYYY OFFICIAL HARDWARE WAREHOUSE</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-3">
                TechSavyyy Components Store
              </h1>
              <p className="text-sm sm:text-base text-robo-textSecondary max-w-2xl leading-relaxed">
                Tested microcontrollers, sensor modules, robot chassis, and kits at student-friendly prices.
                All prices include 18% GST with downloadable tax invoices. Plus &amp; Pro students get up to 10% instant discount!
              </p>
            </div>

            {/* Cart & Orders Quick HUD */}
            <div className="flex items-center gap-3 shrink-0">
              {isAuthenticated && (
                <button
                  onClick={handleOpenOrdersModal}
                  className="px-4 py-2.5 rounded-xl bg-robo-surfaceRaised border border-robo-borderSubtle hover:border-robo-neon/50 text-xs font-mono font-bold text-white flex items-center gap-2 transition-colors"
                >
                  <FileText className="w-4 h-4 text-robo-teal" />
                  <span>My Invoices</span>
                </button>
              )}

              <button
                onClick={() => setCartOpen(true)}
                className="relative px-5 py-2.5 rounded-xl bg-robo-neon hover:bg-robo-neonHover text-black font-bold text-sm shadow-neon-glow flex items-center gap-2 transition-transform hover:scale-105"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Cart ({cartItemCount})</span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-black text-robo-neon text-xs flex items-center justify-center font-black border border-robo-neon shadow-sm">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Student Plan Discount Notice */}
          <div className="mt-8 pt-4 border-t border-robo-borderSubtle/60 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-robo-neon" />
              <span>
                Active Student Plan: <strong className="text-white">{planTier}</strong>
              </span>
              {discountPct > 0 ? (
                <span className="px-2 py-0.5 rounded bg-robo-neon/20 border border-robo-neon text-robo-neon font-bold">
                  {discountPct}% Store Discount Applied
                </span>
              ) : (
                <span className="text-robo-textSecondary">
                  (Upgrade to Plus for 5% off or Pro for 10% off store orders)
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-robo-textSecondary">
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-robo-teal" /> Free delivery across India on kits
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-robo-neon" /> 100% Genuine Tested ICs
              </span>
            </div>
          </div>
        </section>

        {/* Filter and Search Bar */}
        <section className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-robo-textSecondary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search robotics hardware (e.g. Starter Kit, ESP32, Servo, Ultrasonic)..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-robo-surfaceRaised/90 border border-robo-borderSubtle text-white placeholder-robo-textSecondary text-sm focus:outline-none focus:border-robo-neon transition-colors"
              />
            </div>

            {/* Sorter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-robo-textSecondary shrink-0">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3.5 py-3 rounded-2xl bg-robo-surfaceRaised border border-robo-borderSubtle text-white text-xs font-mono focus:outline-none focus:border-robo-neon"
              >
                <option value="popular">Most Popular</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl font-mono font-medium transition-all shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-robo-teal text-black font-bold shadow-neon-subtle'
                    : 'bg-black/40 text-robo-textSecondary border border-robo-borderSubtle hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* Product Grid */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block w-8 h-8 border-2 border-robo-neon border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-robo-textSecondary font-mono text-sm">Loading TechSavyyy hardware warehouse inventory...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-robo-surfaceRaised/50 border border-robo-borderSubtle p-8">
            <AlertCircle className="w-12 h-12 text-robo-textSecondary mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No Hardware Components Found</h3>
            <p className="text-sm text-robo-textSecondary mb-6">
              Try adjusting your search terms or selecting another category.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSearchQuery('');
              }}
              className="px-5 py-2.5 rounded-xl bg-robo-surfaceRaised border border-robo-neon text-robo-neon text-xs font-mono font-bold hover:bg-robo-neon hover:text-black transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const discountedPrice = Math.round(
                product.priceInr - (product.priceInr * discountPct) / 100
              );

              return (
                <div
                  key={product.id}
                  className="group relative rounded-3xl bg-gradient-to-b from-[#0B1E16] to-[#040F0A] border border-robo-borderSubtle hover:border-robo-neon/60 p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-neon-card"
                >
                  <div>
                    {/* Top Ribbon & Category */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-black/60 border border-robo-borderSubtle text-robo-teal">
                        {product.category}
                      </span>
                      {product.isKitOfMonth && (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-robo-neon/20 border border-robo-neon text-robo-neon flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Kit of the Month
                        </span>
                      )}
                    </div>

                    {/* Image Container */}
                    <div className="relative h-48 rounded-2xl bg-black/50 border border-robo-borderSubtle overflow-hidden mb-4 flex items-center justify-center group-hover:border-robo-neon/30 transition-colors">
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e: any) => {
                          e.target.src = 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-yellow-400 font-bold text-xs flex items-center gap-1 border border-yellow-400/20">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{product.rating}</span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-robo-neon transition-colors line-clamp-1">
                      {product.title}
                    </h3>
                    <p className="text-xs text-robo-textSecondary line-clamp-2 mb-4 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Specs Pills */}
                    {product.specs && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {Object.entries(product.specs).slice(0, 3).map(([key, val]) => (
                          <span
                            key={key}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-black/40 text-robo-textSecondary border border-robo-borderSubtle"
                          >
                            {key}: <strong className="text-white">{String(val)}</strong>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom Price & Add to Cart */}
                  <div className="pt-3 border-t border-robo-borderSubtle/60 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-white">
                          ₹{discountedPrice}
                        </span>
                        {discountPct > 0 && (
                          <span className="text-xs font-mono text-robo-textSecondary line-through">
                            ₹{product.priceInr}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-robo-textSecondary block">
                        incl. 18% GST
                      </span>
                    </div>

                    <button
                      onClick={() => addToCart(product)}
                      className="py-2.5 px-4 rounded-xl bg-robo-neon hover:bg-robo-neonHover text-black font-bold text-xs flex items-center gap-1.5 shadow-neon-subtle transition-all active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#081810] border-l border-robo-borderSubtle h-full flex flex-col justify-between shadow-2xl">
            {/* Drawer Header */}
            <div className="p-6 border-b border-robo-borderSubtle flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-robo-neon" />
                <h3 className="text-lg font-bold text-white">Your Hardware Cart</h3>
                <span className="px-2 py-0.5 rounded-full bg-robo-neon/20 text-robo-neon text-xs font-mono font-bold">
                  {cartItemCount}
                </span>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="p-1.5 text-robo-textSecondary hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              {cart.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <ShoppingBag className="w-12 h-12 text-robo-textSecondary mx-auto opacity-50" />
                  <p className="text-sm text-robo-textSecondary">Your cart is empty.</p>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="px-4 py-2 rounded-xl bg-robo-surfaceRaised border border-robo-borderSubtle text-xs font-mono font-bold text-white hover:border-robo-neon"
                  >
                    Continue Browsing
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-3 rounded-2xl bg-black/40 border border-robo-borderSubtle flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.title}
                        className="w-12 h-12 rounded-xl object-cover border border-robo-borderSubtle shrink-0"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-white line-clamp-1">
                          {item.product.title}
                        </h4>
                        <span className="text-xs font-mono text-robo-neon">
                          ₹{item.product.priceInr} each
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center rounded-lg bg-black border border-robo-borderSubtle">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="p-1.5 text-robo-textSecondary hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-mono font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="p-1.5 text-robo-textSecondary hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1.5 text-robo-textSecondary hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer & Tax Breakdown */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-robo-borderSubtle bg-black/40 space-y-4">
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-robo-textSecondary">
                    <span>Cart Subtotal</span>
                    <span>₹{cartSubtotal}</span>
                  </div>

                  {discountPct > 0 && (
                    <div className="flex justify-between text-robo-neon">
                      <span>{planTier} Plan Discount ({discountPct}%)</span>
                      <span>-₹{cartDiscountAmount}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-robo-textSecondary pt-1 border-t border-robo-borderSubtle/60">
                    <span>Taxable Base Value</span>
                    <span>₹{taxableBaseAmount}</span>
                  </div>

                  <div className="flex justify-between text-robo-textSecondary">
                    <span>18% GST (CGST 9% + SGST 9%)</span>
                    <span>₹{gstTotal}</span>
                  </div>

                  <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-robo-borderSubtle">
                    <span>Total Amount (incl. GST)</span>
                    <span className="text-robo-neon text-base">₹{cartFinalAmount}</span>
                  </div>
                </div>

                <button
                  onClick={handleInitiateCheckout}
                  className="w-full py-3.5 rounded-xl bg-robo-neon hover:bg-robo-neonHover text-black font-bold text-sm shadow-neon-glow flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Proceed to Checkout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout & Razorpay Simulation Modal */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#091D14] border border-robo-neon/50 p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setCheckoutModalOpen(false);
                setOrderConfirmed(null);
              }}
              className="absolute top-5 right-5 p-2 text-robo-textSecondary hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {orderConfirmed ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-robo-neon/20 border-2 border-robo-neon mx-auto flex items-center justify-center text-robo-neon shadow-neon-glow">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <h3 className="text-2xl font-black text-white">Hardware Order Confirmed!</h3>
                <p className="text-xs text-robo-textSecondary">
                  Your components have been dispatched from the TechSavyyy warehouse.
                </p>

                <div className="p-4 rounded-2xl bg-black/50 border border-robo-borderSubtle text-left space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-robo-textSecondary">Order ID:</span>
                    <span className="text-white font-bold">{orderConfirmed.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-robo-textSecondary">GST Invoice No:</span>
                    <span className="text-robo-teal font-bold">{orderConfirmed.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-robo-textSecondary">Status:</span>
                    <span className="text-robo-neon font-bold">{orderConfirmed.status}</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <a
                    href={orderConfirmed.invoicePdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 rounded-xl bg-robo-teal hover:bg-robo-teal/90 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Download Official 18% GST Tax Invoice</span>
                  </a>

                  <button
                    onClick={() => {
                      setCheckoutModalOpen(false);
                      setOrderConfirmed(null);
                      setCartOpen(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-robo-surfaceRaised border border-robo-borderSubtle text-white font-bold text-xs hover:border-robo-neon"
                  >
                    Return to Store
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 text-robo-neon text-xs font-mono mb-2">
                  <CreditCard className="w-4 h-4" />
                  <span>RAZORPAY 18% GST CHECKOUT GATEWAY</span>
                </div>

                <h3 className="text-xl font-bold text-white mb-4">
                  Confirm Shipping &amp; Payment
                </h3>

                {checkoutError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{checkoutError}</span>
                  </div>
                )}

                {/* Shipping Address Inputs */}
                <div className="space-y-3 mb-6">
                  <span className="text-xs font-mono text-robo-textSecondary block">
                    DELIVERY ADDRESS
                  </span>
                  <input
                    type="text"
                    value={shippingAddress.addressLine1}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })
                    }
                    placeholder="Hostel, Room, Street Address"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-robo-borderSubtle text-white text-xs focus:outline-none focus:border-robo-neon"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, city: e.target.value })
                      }
                      placeholder="City"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-robo-borderSubtle text-white text-xs focus:outline-none focus:border-robo-neon"
                    />
                    <input
                      type="text"
                      value={shippingAddress.state}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, state: e.target.value })
                      }
                      placeholder="State"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-robo-borderSubtle text-white text-xs focus:outline-none focus:border-robo-neon"
                    />
                    <input
                      type="text"
                      value={shippingAddress.pincode}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, pincode: e.target.value })
                      }
                      placeholder="Pincode"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-robo-borderSubtle text-white text-xs focus:outline-none focus:border-robo-neon"
                    />
                  </div>
                </div>

                {/* Payment Breakdown Card */}
                <div className="p-4 rounded-2xl bg-black/50 border border-robo-borderSubtle mb-6 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-robo-textSecondary">
                    <span>Items ({cartItemCount}):</span>
                    <span>₹{cartSubtotal}</span>
                  </div>
                  {discountPct > 0 && (
                    <div className="flex justify-between text-robo-neon">
                      <span>{planTier} Discount ({discountPct}%):</span>
                      <span>-₹{cartDiscountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white font-bold pt-2 border-t border-robo-borderSubtle">
                    <span>Payable via Razorpay:</span>
                    <span className="text-robo-neon text-sm">₹{cartFinalAmount}</span>
                  </div>
                </div>

                {/* Payment Methods Pill */}
                <div className="flex items-center justify-between text-[11px] font-mono text-robo-textSecondary mb-6 px-1">
                  <span>Supported: UPI (GPay, PhonePe), Cards, NetBanking</span>
                  <span className="text-robo-teal">18% GST Compliant</span>
                </div>

                <button
                  onClick={handleConfirmPayment}
                  disabled={checkoutLoading}
                  className="w-full py-3.5 rounded-xl bg-robo-neon hover:bg-robo-neonHover text-black font-bold text-sm shadow-neon-glow flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {checkoutLoading ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Pay ₹{cartFinalAmount} with Razorpay</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Past Invoices Modal */}
      {ordersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl bg-[#091D14] border border-robo-teal/50 p-6 sm:p-8 shadow-2xl max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setOrdersModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-robo-textSecondary hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-robo-teal text-xs font-mono mb-2">
              <FileText className="w-4 h-4" />
              <span>OFFICIAL 18% GST INVOICE ARCHIVE</span>
            </div>

            <h3 className="text-xl font-bold text-white mb-6">
              Your TechSavyyy Orders &amp; Tax Invoices
            </h3>

            {pastOrders.length === 0 ? (
              <div className="py-12 text-center text-robo-textSecondary text-xs">
                No past orders found for your Student ID.
              </div>
            ) : (
              <div className="space-y-4">
                {pastOrders.map((ord) => (
                  <div
                    key={ord.orderId}
                    className="p-4 rounded-2xl bg-black/50 border border-robo-borderSubtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-white mb-1 flex items-center gap-2">
                        <span>{ord.orderId}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-robo-neon/20 text-robo-neon">
                          {ord.status}
                        </span>
                      </div>
                      <div className="font-mono text-robo-textSecondary text-[11px]">
                        Amount: <strong className="text-white">₹{ord.taxBreakdown.finalAmountInr}</strong> | 
                        Invoice: <span className="text-robo-teal">{ord.invoice?.invoiceNumber || 'Pending'}</span>
                      </div>
                    </div>

                    {ord.invoice?.id && (
                      <a
                        href={`/api/v1/subscriptions/invoices/${ord.invoice.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-robo-surfaceRaised border border-robo-teal/40 hover:border-robo-teal text-robo-teal font-mono text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View GST Invoice</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
