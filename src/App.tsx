/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { MobileStickyBar } from './components/MobileStickyBar';
import { CheckoutStepper } from './components/CheckoutStepper';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { AdminHub } from './components/AdminHub';
import { Product, ProductCategory, CartItem, Order, OrderStatus } from './types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS } from './data/initialData';
import { Sparkles, Heart, ShieldCheck, Truck, Phone, MessageCircle } from 'lucide-react';
import { MERCHANT_CONFIG } from './data/initialData';

export default function App() {
  // Core Data State
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Navigation & View States
  const [isAdminView, setIsAdminView] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Drawers
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Fetch Products & Orders from Backend
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
          setProducts(data.products);
        }
      }
    } catch (e) {
      console.warn('Using local products cache', e);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      }
    } catch (e) {
      console.warn('Using local orders cache', e);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, [fetchProducts, fetchOrders]);

  // Cart Handlers
  const handleAddToCart = (product: Product, quantityToAdd: number = 1) => {
    if (product.stock_quantity <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQty = Math.min(product.stock_quantity, existing.quantity + quantityToAdd);
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prev, { product, quantity: Math.min(product.stock_quantity, quantityToAdd) }];
    });

    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const maxStock = item.product.stock_quantity;
          return { ...item, quantity: Math.min(maxStock, newQty) };
        }
        return item;
      })
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Order Placement Handler
  const handleOrderSuccess = (order: Order) => {
    setCart([]);
    setIsCheckoutOpen(false);
    setCompletedOrder(order);
    fetchOrders();
  };

  // Admin Order Status Update (Triggers Stock Decrement on 'Confirmed' - FR-07)
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        await fetchOrders();
        await fetchProducts(); // Reload to reflect decremented stock
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  // Admin Product CRUD
  const handleAddProduct = async (productData: Partial<Product>) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      if (res.ok) {
        await fetchProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProduct = async (productId: string, updates: Partial<Product>) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        await fetchProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter Storefront Catalogue
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && product.is_published;
  });

  const totalCartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const pendingOrdersCount = orders.filter((o) => o.order_status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2C3E50] font-sans flex flex-col justify-between selection:bg-[#C5A059]/30 selection:text-[#1A3636]">
      {/* Header */}
      <Header
        currentCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        isAdminView={isAdminView}
        onToggleAdminView={() => setIsAdminView(!isAdminView)}
        pendingOrdersCount={pendingOrdersCount}
      />

      {/* Main Content Body */}
      <main className="flex-1 pb-16">
        {isAdminView ? (
          /* Administrative Management Hub View (FR-05, FR-06, FR-07, FR-08) */
          <AdminHub
            products={products}
            orders={orders}
            onRefreshOrders={fetchOrders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        ) : (
          /* Customer Storefront View */
          <div className="space-y-8">
            {/* Hero Editorial Banner */}
            <HeroBanner />

            {/* Catalogue Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Category & Results Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E5DFD5]">
                <div>
                  <h2 className="font-serif-title font-bold text-2xl text-[#1A3636] flex items-center gap-2">
                    <span>{selectedCategory === 'All' ? 'Bespoke Collections' : selectedCategory}</span>
                    <span className="text-xs font-normal text-[#5F6B6C] bg-white px-2 py-0.5 rounded-full border border-[#E5DFD5]">
                      {filteredProducts.length} pieces
                    </span>
                  </h2>
                  <p className="text-xs text-[#5F6B6C] mt-0.5">
                    Authentic Pakistani fine jewelry handcrafted with uncut Polki, 22K gold dip, and Basra pearls.
                  </p>
                </div>

                {searchQuery && (
                  <div className="text-xs text-[#5F6B6C]">
                    Showing results for "{searchQuery}"
                  </div>
                )}
              </div>

              {/* Products Grid */}
              {filteredProducts.length === 0 ? (
                <div className="py-20 text-center space-y-3 bg-white rounded-2xl border border-[#E5DFD5] my-6">
                  <Sparkles className="w-10 h-10 text-[#C5A059] mx-auto opacity-70" />
                  <h3 className="font-serif-title font-bold text-lg text-[#1A3636]">
                    No jewelry pieces found
                  </h3>
                  <p className="text-xs text-[#5F6B6C] max-w-sm mx-auto">
                    Try selecting a different category or clearing your search keywords.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('All');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 rounded-full bg-[#1A3636] text-white text-xs font-semibold hover:bg-[#0F2323]"
                  >
                    View All Collections
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onQuickView={(p) => setSelectedProduct(p)}
                      onAddToCart={(p) => handleAddToCart(p, 1)}
                      isItemInCart={cart.some((i) => i.product.id === product.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      {!isAdminView && (
        <footer className="bg-[#1A3636] text-[#FAF8F5] border-t border-[#C5A059]/30 pt-12 pb-16 md:pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Brand Col */}
              <div className="space-y-3 md:col-span-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#C5A059] text-[#1A3636] font-serif-title font-bold flex items-center justify-center text-base">
                    Z
                  </div>
                  <span className="font-serif-title text-xl font-bold tracking-tight text-white">
                    ZARIYAH FINE JEWELRY
                  </span>
                </div>
                <p className="text-xs text-gray-300 max-w-md leading-relaxed">
                  Bespoke handcrafted Pakistani bridal and artisanal jewellery. Every piece is human-verified before dispatch to ensure heirloom quality and flawless sizing.
                </p>
                <div className="flex items-center gap-4 text-xs text-[#C5A059] pt-1">
                  <span>Lahore</span>
                  <span>•</span>
                  <span>Karachi</span>
                  <span>•</span>
                  <span>Islamabad</span>
                  <span>•</span>
                  <span>Nationwide Express</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2 text-xs">
                <div className="font-serif-title font-bold text-sm text-[#C5A059]">
                  Verified Payment Options
                </div>
                <ul className="space-y-1.5 text-gray-300">
                  <li>• Cash on Delivery (COD) across Pakistan</li>
                  <li>• EasyPaisa Mobile Transfer & Till Pay</li>
                  <li>• JazzCash App & Direct Mobile Pay</li>
                  <li>• All prices strictly listed in PKR (Rs.)</li>
                </ul>
              </div>

              {/* WhatsApp Support */}
              <div className="space-y-2 text-xs">
                <div className="font-serif-title font-bold text-sm text-[#C5A059]">
                  Artisan & Order Support
                </div>
                <p className="text-gray-300">
                  Instant human verification via WhatsApp:
                </p>
                <a
                  href={`https://wa.me/${MERCHANT_CONFIG.whatsappNumber.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] font-semibold hover:bg-[#25D366]/30 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{MERCHANT_CONFIG.whatsappDisplay}</span>
                </a>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-400 gap-2">
              <p>© {new Date().getFullYear()} Zariyah Fine Jewelry. Zero-cost deployment architecture.</p>
              <div className="flex items-center gap-3">
                <span>Free-tier MongoDB Schema Ready</span>
                <span>•</span>
                <span>Node/Express Backend</span>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p, qty) => handleAddToCart(p, qty)}
        isItemInCart={Boolean(selectedProduct && cart.some((i) => i.product.id === selectedProduct.id))}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* 4-Step Guest Checkout Stepper */}
      <CheckoutStepper
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Order Success Screen with WhatsApp Fast-Track */}
      <OrderSuccessModal
        order={completedOrder}
        onClose={() => setCompletedOrder(null)}
      />

      {/* Sticky Mobile Anchor Bar */}
      {!isAdminView && (
        <MobileStickyBar
          items={cart}
          onOpenCart={() => setIsCartOpen(true)}
          onProceedToCheckout={() => setIsCheckoutOpen(true)}
        />
      )}
    </div>
  );
}
