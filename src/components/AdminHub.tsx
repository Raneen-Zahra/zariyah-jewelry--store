import React, { useState, useEffect, useRef } from 'react';
import {
  Package,
  ShoppingBag,
  Bell,
  Volume2,
  VolumeX,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  Truck,
  Plus,
  Edit2,
  Trash2,
  Eye,
  RefreshCw,
  Search,
  Check,
  X,
  UserCheck,
  Shield,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { Order, Product, OrderStatus, AdminUser, ProductCategory } from '../types';
import {
  formatPKR,
  getAdminConfirmationWhatsAppLink,
  getAdminStockApologyWhatsAppLink,
  getAdminDispatchWhatsAppLink
} from '../utils/formatters';
import { playOrderAlertChime } from '../utils/audio';
import { AdminReceiptModal } from './AdminReceiptModal';
import atelierLogo from '../assets/LC_Atelier_By_Laraib_logo.jpeg';

interface AdminHubProps {
  products: Product[];
  orders: Order[];
  onRefreshOrders: () => void;
  onDeleteOrder: (orderId: string) => Promise<void>;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  onAddProduct: (product: Partial<Product>) => Promise<void>;
  onUpdateProduct: (productId: string, updates: Partial<Product>) => Promise<void>;
  onDeleteProduct: (productId: string) => Promise<void>;
}

const CATEGORIES: ProductCategory[] = [
  'All',
  'Lockets',
  'Earrings',
  'Rings',
  'Bangles'
];

export const AdminHub: React.FC<AdminHubProps> = ({
  products,
  orders,
  onRefreshOrders,
  onUpdateOrderStatus,
  onAddProduct,
  onUpdateProduct,
  onDeleteOrder,
  onDeleteProduct
}) => {
  // Admin Auth State (FR-08)
  const [currentUser, setCurrentUser] = useState<AdminUser | null>({
    id: 'admin-owner-01',
    username: 'atelier_owner',
    role: 'owner' // role field preserved for future staff accounts (FR-08)
  });

  const [loginUsername, setLoginUsername] = useState('atelier_owner');
  const [loginPassword, setLoginPassword] = useState('laraibCH');
  const [loginError, setLoginError] = useState('');

  // Tab State: Orders vs Inventory
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory'>('orders');

  // Polling & Audio Chime (FR-06)
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [isPollingActive, setIsPollingActive] = useState<boolean>(true);
  const previousPendingCountRef = useRef<number>(
    orders.filter((o) => o.order_status === 'pending').length
  );

  // Orders Filtering
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);

  // Inventory Filtering & Modals
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState<ProductCategory>('All');
  const [isAddProductOpen, setIsAddProductOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);

  // Product Form State
  const [productForm, setProductForm] = useState<Partial<Product>>({
    title: '',
    price_pkr: 250,
    description: '',
    category: 'Rings',
    stock_quantity: 5,
    low_stock_threshold: 5,
    images: [],
    is_published: true,
    specs: {
      metalPurity: '',
      stoneType: '',
      weightGrams: 0,
      craftsmanship: ''
    }
  });

  // Polling interval check for new orders (FR-06: 15-30s polling)
  useEffect(() => {
    if (!isPollingActive) return;

    const interval = setInterval(() => {
      onRefreshOrders();
    }, 15000); // 15 seconds fixed interval

    return () => clearInterval(interval);
  }, [isPollingActive, onRefreshOrders]);

  // Audio & badge trigger when new pending order arrives
  useEffect(() => {
    const currentPendingCount = orders.filter((o) => o.order_status === 'pending').length;
    if (currentPendingCount > previousPendingCountRef.current) {
      if (audioEnabled) {
        playOrderAlertChime();
      }
    }
    previousPendingCountRef.current = currentPendingCount;
  }, [orders, audioEnabled]);

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
      } else {
        setLoginError(data.message || 'Invalid username or password');
      }
    } catch {
      setLoginError('Login request failed');
    }
  };

  // Product Create/Edit Handlers
  const handleSaveProduct = async () => {
    if (!productForm.title || !productForm.price_pkr) {
      alert('Please provide product title and price');
      return;
    }

    if (editingProduct) {
      await onUpdateProduct(editingProduct.id, productForm);
      setEditingProduct(null);
    } else {
      await onAddProduct(productForm);
      setIsAddProductOpen(false);
    }

    // Reset
    setProductForm({
      title: '',
      price_pkr: 250,
      description: '',
      category: 'Lockets',
      stock_quantity: 5,
      low_stock_threshold: 5,
      images: [],
      is_published: true,
      specs: {
        metalPurity: '',
        stoneType: '',
        weightGrams: 0,
        craftsmanship: ''
      }
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        setProductForm({ ...productForm, images: [data.url] });
      } else {
        alert(data.message || 'Image upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Image upload failed, please try again');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const startEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm(JSON.parse(JSON.stringify(prod)));
  };

  // Filter Orders
  const pendingOrders = orders.filter((o) => o.order_status === 'pending');
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      orderStatusFilter === 'all' || order.order_status === orderStatusFilter;
    const matchesQuery =
      !orderSearchQuery ||
      order.order_id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      order.whatsapp_phone.includes(orderSearchQuery) ||
      order.city.toLowerCase().includes(orderSearchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  // Filter Products
  const filteredProducts = products.filter((p) => {
    return (
      inventoryCategoryFilter === 'All' || p.category === inventoryCategoryFilter
    );
  });

  // Unauthenticated Admin Login Screen
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-[#E5DFD5] shadow-xl text-xs space-y-5">
        <div className="text-center space-y-2">
          <img
            src={atelierLogo}
            alt="Atelier by Laraib Chouhdary"
            className="w-10 h-10 rounded-full object-cover border border-[#C5A059]"
          />
          <h2 className="font-serif-title text-xl font-bold text-[#1A3636]">
            Store Owner Authentication
          </h2>
          <p className="text-[#5F6B6C]">
            Sign in to access order verification, WhatsApp dispatch engine, and inventory.
          </p>
        </div>

        {loginError && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs font-medium">
            {loginError}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label className="block font-semibold text-[#2C3E50] mb-1">Username / Identifier</label>
            <input
              type="text"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5DFD5] text-xs focus:outline-none focus:border-[#C5A059]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#2C3E50] mb-1">Password</label>
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5DFD5] text-xs focus:outline-none focus:border-[#C5A059]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-[#1A3636] hover:bg-[#0F2323] text-white font-bold text-xs shadow-xs transition-colors"
          >
            Sign In to Admin Hub
          </button>
        </form>

        <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-400 text-center">
          Default credentials: <code className="text-[#1A3636] font-mono font-bold">owner</code> / <code className="text-[#1A3636] font-mono font-bold">admin123</code>
        </div>
      </div>
    );
  }

  return (
    <div id="admin-hub-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Admin Control Bar */}
      <div className="bg-white rounded-2xl border border-[#E5DFD5] p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src={atelierLogo}
            alt="Atelier by Laraib Chouhdary"
            className="w-10 h-10 rounded-xl object-cover border border-[#C5A059]"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif-title font-bold text-lg sm:text-xl text-[#1A3636]">
                Owner Administration Hub
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1A3636]/10 text-[#1A3636] border border-[#1A3636]/20">
                ROLE: {currentUser.role.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-[#5F6B6C]">
              Human-Verified Order Processing • WhatsApp Deep-Linking • Gentle Stock Controls
            </p>
          </div>
        </div>

        {/* Polling, Audio, & Status Tickers */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Polling Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#E5DFD5] text-xs">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
            <span className="text-[#5F6B6C]">Live Polling (15s)</span>
            <button
              onClick={onRefreshOrders}
              className="p-1 hover:text-[#1A3636] text-gray-400"
              title="Refresh now"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Audio Chime Toggle */}
          <button
            id="admin-audio-toggle"
            onClick={() => {
              const next = !audioEnabled;
              setAudioEnabled(next);
              if (next) playOrderAlertChime();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${audioEnabled
              ? 'bg-[#3E6259]/10 border-[#3E6259]/40 text-[#3E6259]'
              : 'bg-gray-100 border-gray-300 text-gray-400'
              }`}
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{audioEnabled ? 'Chime Alert On' : 'Chime Muted'}</span>
          </button>

          {/* Pending Orders Counter Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#B8860B]/15 border border-[#B8860B]/40 text-[#B8860B] text-xs font-bold">
            <Bell className="w-3.5 h-3.5" />
            <span>{pendingOrders.length} Pending Verification</span>
          </div>
        </div>
      </div>

      {/* Tabs: Orders Management vs Inventory Catalogue */}
      <div className="flex border-b border-[#E5DFD5] gap-4">
        <button
          id="admin-tab-orders"
          onClick={() => setActiveTab('orders')}
          className={`pb-3 font-serif-title font-bold text-sm sm:text-base flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'orders'
            ? 'border-[#1A3636] text-[#1A3636]'
            : 'border-transparent text-[#5F6B6C] hover:text-[#1A3636]'
            }`}
        >
          <Package className="w-4 h-4 text-[#C5A059]" />
          <span>Orders Management ({orders.length})</span>
          {pendingOrders.length > 0 && (
            <span className="bg-[#B8860B] text-white text-[10px] px-1.5 py-0.2 rounded-full font-sans">
              {pendingOrders.length}
            </span>
          )}
        </button>

        <button
          id="admin-tab-inventory"
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 font-serif-title font-bold text-sm sm:text-base flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'inventory'
            ? 'border-[#1A3636] text-[#1A3636]'
            : 'border-transparent text-[#5F6B6C] hover:text-[#1A3636]'
            }`}
        >
          <Layers className="w-4 h-4 text-[#C5A059]" />
          <span>Jewelry Inventory & Stock ({products.length})</span>
        </button>
      </div>

      {/* TAB 1: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#E5DFD5]">
            {/* Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'All Orders' },
                { id: 'pending', label: 'Pending Confirmation' },
                { id: 'payment_verified', label: 'Payment Verified' },
                { id: 'confirmed', label: 'Confirmed (Decremented)' },
                { id: 'dispatched', label: 'Dispatched' },
                { id: 'delivered', label: 'Delivered' }
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setOrderStatusFilter(st.id)}
                  className={`px-3 py-1 text-xs rounded-full font-medium whitespace-nowrap transition-colors ${orderStatusFilter === st.id
                    ? 'bg-[#1A3636] text-white font-bold'
                    : 'bg-[#FAF8F5] text-[#5F6B6C] hover:bg-gray-200'
                    }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <input
                type="text"
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                placeholder="Search ID, customer, city..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[#E5DFD5] text-xs focus:outline-none focus:border-[#C5A059]"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl border border-[#E5DFD5] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] border-b border-[#E5DFD5] text-[#5F6B6C] uppercase font-semibold text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Order ID & Date</th>
                    <th className="px-4 py-3">Customer & Location</th>
                    <th className="px-4 py-3">Items Ordered</th>
                    <th className="px-4 py-3">Payment & Total</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">1-Click WhatsApp Engine</th>
                    <th className="px-4 py-3 text-right">Update Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DFD5]/60 text-[#2C3E50]">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-[#5F6B6C]">
                        No orders match the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const confirmUrl = getAdminConfirmationWhatsAppLink(order);
                      const apologyUrl = getAdminStockApologyWhatsAppLink(order);
                      const dispatchUrl = getAdminDispatchWhatsAppLink(order);

                      return (
                        <tr
                          key={order.order_id}
                          id={`admin-order-row-${order.order_id}`}
                          className={`hover:bg-[#FAF8F5]/60 transition-colors ${order.order_status === 'pending' ? 'bg-[#FAF8F5]/40' : ''
                            }`}
                        >
                          {/* Order ID & Time */}
                          <td className="px-4 py-3.5 align-top">
                            <div className="font-mono font-bold text-[#1A3636]">
                              {order.order_id}
                            </div>
                            <div className="text-[10px] text-[#5F6B6C]">
                              {new Date(order.created_at).toLocaleString('en-PK', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </td>

                          {/* Customer & Location */}
                          <td className="px-4 py-3.5 align-top">
                            <div className="font-bold text-[#1A3636]">{order.customer_name}</div>
                            <div className="text-[11px] text-[#5F6B6C]">{order.whatsapp_phone}</div>
                            <div className="text-[11px] text-gray-500 line-clamp-1">
                              {order.address_line}, {order.city}
                            </div>
                          </td>

                          {/* Items Ordered */}
                          <td className="px-4 py-3.5 align-top">
                            <div className="space-y-1">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                                  <span className="font-medium">{item.title}</span>
                                  <span className="text-gray-400 font-mono">×{item.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </td>

                          {/* Payment & Total */}
                          <td className="px-4 py-3.5 align-top">
                            <div className="font-bold text-[#1A3636]">
                              {formatPKR(order.total_amount_pkr)}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="inline-block px-1.5 py-0.2 rounded bg-gray-100 font-semibold text-[10px]">
                                {order.payment_method}
                              </span>
                              {order.receipt_image_url && (
                                <button
                                  onClick={() => setSelectedReceiptOrder(order)}
                                  className="text-[10px] text-[#3E6259] hover:underline font-semibold flex items-center gap-0.5"
                                >
                                  <Eye className="w-3 h-3" />
                                  Proof
                                </button>
                              )}
                            </div>
                            {order.transaction_id && (
                              <div className="text-[10px] font-mono text-gray-400 mt-0.5">
                                TID: {order.transaction_id}
                              </div>
                            )}
                          </td>

                          {/* Status Badge */}
                          <td className="px-4 py-3.5 align-top">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.order_status === 'pending'
                                ? 'bg-[#A08961]/20 text-[#A08961] border border-[#A08961]/40 animate-pulse'
                                : order.order_status === 'payment_verified'
                                  ? 'bg-blue-100 text-blue-800'
                                  : order.order_status === 'confirmed'
                                    ? 'bg-[#3E6259]/20 text-[#3E6259] border border-[#3E6259]/40'
                                    : order.order_status === 'dispatched'
                                      ? 'bg-purple-100 text-purple-800'
                                      : order.order_status === 'delivered'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                              {order.order_status.replace('_', ' ')}
                            </span>
                            {order.stock_decremented && (
                              <div className="text-[9px] text-[#3E6259] font-medium mt-0.5">
                                ✓ Stock Decremented
                              </div>
                            )}
                          </td>

                          {/* 1-Click WhatsApp Engine Actions (FR-05, PRD 3.1) */}
                          <td className="px-4 py-3.5 align-top">
                            <div className="flex flex-col gap-1.5 min-w-[160px]">
                              {/* Order Confirmation Deep Link */}
                              <a
                                id={`whatsapp-confirm-${order.order_id}`}
                                href={confirmUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 rounded-md bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] font-semibold text-[11px] flex items-center gap-1 border border-[#25D366]/30 transition-colors"
                              >
                                <MessageCircle className="w-3 h-3" />
                                <span>Verify WhatsApp</span>
                              </a>

                              {/* Stock Apology Deep Link (Section 3.1) */}
                              <a
                                id={`whatsapp-apology-${order.order_id}`}
                                href={apologyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 rounded-md bg-[#8C4A4A]/10 hover:bg-[#8C4A4A]/20 text-[#8C4A4A] font-semibold text-[11px] flex items-center gap-1 border border-[#8C4A4A]/25 transition-colors"
                                title="Use if item is sold out or restock replacement is needed"
                              >
                                <AlertTriangle className="w-3 h-3" />
                                <span>Stock Apology Link</span>
                              </a>

                              {/* Dispatch Notice Deep Link */}
                              {order.order_status === 'confirmed' || order.order_status === 'dispatched' ? (
                                <a
                                  id={`whatsapp-dispatch-${order.order_id}`}
                                  href={dispatchUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 rounded-md bg-[#1A3636]/10 hover:bg-[#1A3636]/20 text-[#1A3636] font-semibold text-[11px] flex items-center gap-1 border border-[#1A3636]/20 transition-colors"
                                >
                                  <Truck className="w-3 h-3" />
                                  <span>Dispatch Notice</span>
                                </a>
                              ) : null}
                            </div>
                          </td>

                          {/* Update Status Selector (FR-07 Stock Decrement) */}
                          <td className="px-4 py-3.5 align-top text-right">
                            <select
                              value={order.order_status}
                              onChange={(e) =>
                                onUpdateOrderStatus(order.order_id, e.target.value as OrderStatus)
                              }
                              className="px-2 py-1 text-xs rounded-lg border border-[#E5DFD5] bg-white font-medium focus:outline-none focus:border-[#C5A059]"
                            >
                              <option value="pending">Pending Confirmation</option>
                              <option value="payment_verified">Payment Verified</option>
                              <option value="confirmed">Confirmed (Decrements Stock)</option>
                              <option value="dispatched">Dispatched</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          {/* Delete Order Action */}
                          <td className="px-4 py-3.5 align-top text-right">
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete order ${order.order_id}? This cannot be undone.`)) {
                                  onDeleteOrder(order.order_id);
                                }
                              }}
                              className="px-2.5 py-1 rounded-md bg-[#8C4A4A]/10 hover:bg-[#8C4A4A]/20 text-[#8C4A4A] font-semibold text-[11px] border border-[#8C4A4A]/25 transition-colors"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INVENTORY & STOCK MANAGEMENT */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#E5DFD5]">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setInventoryCategoryFilter(cat)}
                  className={`px-3 py-1 text-xs rounded-full font-medium whitespace-nowrap ${inventoryCategoryFilter === cat
                    ? 'bg-[#1A3636] text-white font-bold'
                    : 'bg-[#FAF8F5] text-[#5F6B6C] hover:bg-gray-200'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              id="admin-add-product-btn"
              onClick={() => {
                setEditingProduct(null);
                setIsAddProductOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#1A3636] hover:bg-[#0F2323] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4 text-[#C5A059]" />
              <span>Add New Jewelry Piece</span>
            </button>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => {
              const isSoldOut = product.stock_quantity === 0;
              const isLowStock =
                product.stock_quantity > 0 &&
                product.stock_quantity <= (product.low_stock_threshold || 5);

              return (
                <div
                  key={product.id}
                  id={`admin-product-card-${product.id}`}
                  className="bg-white rounded-xl border border-[#E5DFD5] p-4 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="flex gap-3">
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-20 h-20 rounded-lg object-cover border border-[#E5DFD5] shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-[#5F6B6C] font-semibold uppercase">
                          {product.category}
                        </span>
                        {isSoldOut ? (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#8C4A4A] text-white font-bold">
                            Sold Out
                          </span>
                        ) : isLowStock ? (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#B8860B] text-white font-bold">
                            Only {product.stock_quantity} Left!
                          </span>
                        ) : null}
                      </div>

                      <h4 className="font-serif-title font-bold text-sm text-[#1A3636] truncate">
                        {product.title}
                      </h4>
                      <div className="text-xs font-bold text-[#1A3636] mt-0.5">
                        {formatPKR(product.price_pkr)}
                      </div>
                    </div>
                  </div>

                  {/* Stock Quick-Adjust Stepper */}
                  <div className="bg-[#FAF8F5] p-2.5 rounded-lg border border-[#E5DFD5] flex items-center justify-between text-xs">
                    <span className="text-[#5F6B6C] font-medium">Live Inventory Stock:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          onUpdateProduct(product.id, {
                            stock_quantity: Math.max(0, product.stock_quantity - 1)
                          })
                        }
                        className="w-6 h-6 rounded bg-white border border-[#E5DFD5] font-bold text-[#1A3636] flex items-center justify-center hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold min-w-6 text-center text-[#1A3636]">
                        {product.stock_quantity}
                      </span>
                      <button
                        onClick={() =>
                          onUpdateProduct(product.id, {
                            stock_quantity: product.stock_quantity + 1
                          })
                        }
                        className="w-6 h-6 rounded bg-white border border-[#E5DFD5] font-bold text-[#1A3636] flex items-center justify-center hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5DFD5]/60">
                    <button
                      onClick={() => startEditProduct(product)}
                      className="p-1.5 text-xs text-[#1A3636] hover:bg-gray-100 rounded-lg flex items-center gap-1 font-semibold"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete ${product.title}?`)) {
                          onDeleteProduct(product.id);
                        }
                      }}
                      className="p-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {(isAddProductOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-2xl border border-[#E5DFD5] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-xs">
            <div className="px-6 py-4 border-b border-[#E5DFD5] bg-[#FAF8F5] flex items-center justify-between">
              <h3 className="font-serif-title font-bold text-base text-[#1A3636]">
                {editingProduct ? 'Edit Jewelry Piece' : 'Add New Handcrafted Piece'}
              </h3>
              <button
                onClick={() => {
                  setIsAddProductOpen(false);
                  setEditingProduct(null);
                }}
                className="p-1 text-gray-500 hover:text-[#1A3636]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3">
              <div>
                <label className="block font-semibold text-[#2C3E50] mb-1">Piece Title</label>
                <input
                  type="text"
                  value={productForm.title || ''}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  placeholder="e.g. Royal Emerald Kundan Choker"
                  className="w-full px-3.5 py-2 rounded-lg border border-[#E5DFD5] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#2C3E50] mb-1">Price (PKR)</label>
                  <input
                    type="number"
                    value={productForm.price_pkr || ''}
                    onChange={(e) =>
                      setProductForm({ ...productForm, price_pkr: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2 rounded-lg border border-[#E5DFD5] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2C3E50] mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={productForm.stock_quantity ?? 5}
                    onChange={(e) =>
                      setProductForm({ ...productForm, stock_quantity: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2 rounded-lg border border-[#E5DFD5] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#2C3E50] mb-1">Category</label>
                <select
                  value={productForm.category || 'Rings'}
                  onChange={(e) =>
                    setProductForm({ ...productForm, category: e.target.value as ProductCategory })
                  }
                  className="w-full px-3.5 py-2 rounded-lg border border-[#E5DFD5] bg-white focus:outline-none focus:border-[#C5A059]"
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#2C3E50] mb-1">Product Image</label>

                {productForm.images?.[0] && (
                  <img
                    src={productForm.images[0]}
                    alt="Preview"
                    className="w-20 h-20 rounded-lg object-cover border border-[#E5DFD5] mb-2"
                  />
                )}

                <div className="relative border-2 border-dashed border-[#E5DFD5] hover:border-[#C5A059] rounded-lg p-3 text-center bg-[#FAF8F5] transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <span className="text-[11px] text-[#5F6B6C]">
                    {isUploadingImage ? 'Uploading...' : 'Click to upload a photo from your device'}
                  </span>
                </div>

                <label className="block font-semibold text-[#2C3E50] mt-2 mb-1">Or paste an image URL</label>
                <input
                  type="text"
                  value={productForm.images?.[0] || ''}
                  onChange={(e) => setProductForm({ ...productForm, images: [e.target.value] })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 rounded-lg border border-[#E5DFD5] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2C3E50] mb-1">Description</label>
                <textarea
                  rows={3}
                  value={productForm.description || ''}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Artisanal details, stones, gold finish..."
                  className="w-full px-3.5 py-2 rounded-lg border border-[#E5DFD5] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              {/* Specs */}
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5DFD5] space-y-2">
                <div className="font-semibold text-[#1A3636]">Jewelry Specs</div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Metal purity (e.g. 22K Gold Finish)"
                    value={productForm.specs?.metalPurity || ''}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        specs: { ...productForm.specs, metalPurity: e.target.value }
                      })
                    }
                    className="p-2 border border-[#E5DFD5] rounded bg-white text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Stones (e.g. Uncut Polki)"
                    value={productForm.specs?.stoneType || ''}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        specs: { ...productForm.specs, stoneType: e.target.value }
                      })
                    }
                    className="p-2 border border-[#E5DFD5] rounded bg-white text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-3.5 border-t border-[#E5DFD5] bg-[#FAF8F5] flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsAddProductOpen(false);
                  setEditingProduct(null);
                }}
                className="px-4 py-2 rounded-lg border border-[#E5DFD5] bg-white font-semibold text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProduct}
                className="px-5 py-2 rounded-lg bg-[#1A3636] hover:bg-[#0F2323] text-white font-bold"
              >
                Save Piece
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Receipt Modal */}
      {selectedReceiptOrder && (
        <AdminReceiptModal
          order={selectedReceiptOrder}
          onClose={() => setSelectedReceiptOrder(null)}
        />
      )}
    </div>
  );
};
