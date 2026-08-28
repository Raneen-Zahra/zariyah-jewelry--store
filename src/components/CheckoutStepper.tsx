import React, { useState } from 'react';
import {
  X,
  ArrowLeft,
  ArrowRight,
  Check,
  Truck,
  CreditCard,
  FileCheck,
  ShoppingBag,
  Upload,
  AlertCircle,
  ShieldCheck,
  Copy,
  CheckCheck
} from 'lucide-react';
import { CartItem, CheckoutFormData, PaymentMethod, Order } from '../types';
import { formatPKR } from '../utils/formatters';
import { MERCHANT_CONFIG } from '../data/initialData';

interface CheckoutStepperProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, newQty: number) => void;
  onRemoveItem: (productId: string) => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutStepper: React.FC<CheckoutStepperProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onOrderSuccess
}) => {
  if (!isOpen) return null;

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<CheckoutFormData>({
    customer_name: '',
    whatsapp_phone: '',
    address_line: '',
    city: 'Lahore',
    payment_method: 'EasyPaisa',
    transaction_id: '',
    receipt_image_file: null,
    receipt_image_preview: '',
    notes: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const subtotal = items.reduce((sum, item) => sum + item.product.price_pkr * item.quantity, 0);
  const isFreeShipping = subtotal >= MERCHANT_CONFIG.freeShippingThreshold;
  const shippingFee = isFreeShipping ? 0 : MERCHANT_CONFIG.shippingFlatRate;
  const grandTotal = subtotal + shippingFee;

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Image Upload with Strict Client-Side Validation (FR-04: <= 5MB, JPG/PNG only)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check mime type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setFormErrors((prev) => ({
        ...prev,
        receipt: 'Only JPG and PNG images are allowed for security.'
      }));
      return;
    }

    // Check size limit: 5MB = 5 * 1024 * 1024 bytes
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setFormErrors((prev) => ({
        ...prev,
        receipt: `Image size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the strict 5MB limit.`
      }));
      return;
    }

    // Clear error & create preview
    setFormErrors((prev) => {
      const rest = { ...prev };
      delete rest.receipt;
      return rest;
    });

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        receipt_image_file: file,
        receipt_image_preview: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  // Step Validation Logic
  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string> = {};

    if (currentStep === 1) {
      if (items.length === 0) {
        errors.cart = 'Your shopping bag is empty.';
      }
    } else if (currentStep === 2) {
      if (!formData.customer_name.trim()) {
        errors.customer_name = 'Please provide your full name.';
      }
      const cleanedPhone = formData.whatsapp_phone.replace(/\D/g, '');
      if (!cleanedPhone || cleanedPhone.length < 10) {
        errors.whatsapp_phone = 'Please enter a valid Pakistani WhatsApp number (e.g. 0300 1234567).';
      }
      if (!formData.address_line.trim()) {
        errors.address_line = 'Please provide your complete street/house delivery address.';
      }
      if (!formData.city.trim()) {
        errors.city = 'Please select your delivery city.';
      }
    } else if (currentStep === 3) {
      if (!formData.payment_method) {
        errors.payment_method = 'Please select a payment method.';
      }
    } else if (currentStep === 4) {
      // For digital wallets, require TID
      if (formData.payment_method !== 'COD') {
        if (!formData.transaction_id.trim()) {
          errors.transaction_id = 'Please enter your EasyPaisa / JazzCash Transaction ID (TID).';
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(4, prev + 1));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmitOrder = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        customer_name: formData.customer_name,
        whatsapp_phone: formData.whatsapp_phone,
        address_line: formData.address_line,
        city: formData.city,
        subtotal_pkr: subtotal,
        shipping_fee_pkr: shippingFee,
        total_amount_pkr: grandTotal,
        payment_method: formData.payment_method,
        transaction_id: formData.transaction_id || undefined,
        receipt_image_url: formData.receipt_image_preview || undefined,
        items: items.map((i) => ({
          product_id: i.product.id,
          title: i.product.title,
          price_pkr: i.product.price_pkr,
          quantity: i.quantity,
          image: i.product.images[0]
        })),
        notes: formData.notes || undefined
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success && data.order) {
        onOrderSuccess(data.order);
      } else {
        alert(data.message || 'Failed to submit order');
      }
    } catch (err) {
      console.error(err);
      alert('Network error placing order. Please try again or message our WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="checkout-stepper-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-[#E5DFD5] shadow-2xl overflow-hidden max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5DFD5] bg-[#FAF8F5] flex items-center justify-between">
          <div>
            <h2 className="font-serif-title font-bold text-xl text-[#1A3636]">
              Secure Guest Checkout
            </h2>
            <p className="text-xs text-[#5F6B6C]">
              Human-Verified Order Processing in PKR (Rs.)
            </p>
          </div>
          <button
            id="close-checkout"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 hover:text-[#1A3636] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4-Step Visual Indicator */}
        <div id="checkout-stepper-bar" className="bg-[#FAF8F5]/50 px-6 py-3 border-b border-[#E5DFD5]">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            {[
              { num: 1, label: 'Cart Review', icon: ShoppingBag },
              { num: 2, label: 'Delivery', icon: Truck },
              { num: 3, label: 'Payment', icon: CreditCard },
              { num: 4, label: 'Verification', icon: FileCheck }
            ].map((step) => {
              const Icon = step.icon;
              const isDone = currentStep > step.num;
              const isCurrent = currentStep === step.num;
              return (
                <div key={step.num} className="flex items-center gap-1.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isDone
                        ? 'bg-[#3E6259] text-white'
                        : isCurrent
                        ? 'bg-[#1A3636] text-[#C5A059] ring-2 ring-[#C5A059]/40'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isDone ? <Check className="w-4 h-4" /> : step.num}
                  </div>
                  <span
                    className={`text-xs hidden sm:inline font-medium ${
                      isCurrent ? 'text-[#1A3636] font-bold' : 'text-[#5F6B6C]'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Body Steps */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* STEP 1: CART REVIEW */}
          {currentStep === 1 && (
            <div id="checkout-step-1" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif-title font-bold text-base text-[#1A3636]">
                  Review Your Selected Pieces
                </h3>
                <span className="text-xs text-[#5F6B6C]">{items.length} items</span>
              </div>

              {formErrors.cart && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formErrors.cart}</span>
                </div>
              )}

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-[#E5DFD5] bg-[#FAF8F5]/50"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-16 h-16 rounded-lg object-cover border border-[#E5DFD5] bg-white shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1">
                      <h4 className="font-serif-title font-bold text-xs sm:text-sm text-[#1A3636] line-clamp-1">
                        {item.product.title}
                      </h4>
                      <div className="text-xs text-[#5F6B6C] mt-0.5">
                        {formatPKR(item.product.price_pkr)} each
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex items-center border border-[#E5DFD5] rounded bg-white text-xs">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                            className="px-2 py-0.5 font-bold hover:bg-gray-100"
                          >
                            -
                          </button>
                          <span className="px-2 py-0.5 font-semibold min-w-5 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              onUpdateQuantity(
                                item.product.id,
                                Math.min(item.product.stock_quantity, item.quantity + 1)
                              )
                            }
                            disabled={item.quantity >= item.product.stock_quantity}
                            className="px-2 py-0.5 font-bold hover:bg-gray-100 disabled:opacity-30"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-[11px] text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-[#1A3636]">
                        {formatPKR(item.product.price_pkr * item.quantity)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Subtotal preview */}
              <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E5DFD5] space-y-1.5 text-xs">
                <div className="flex justify-between text-[#5F6B6C]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#1A3636]">{formatPKR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#5F6B6C]">
                  <span>Shipping ({formData.city})</span>
                  <span className="font-semibold text-[#1A3636]">
                    {shippingFee === 0 ? <span className="text-[#3E6259]">FREE</span> : formatPKR(shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#1A3636] pt-1.5 border-t border-[#E5DFD5]">
                  <span>Total Amount</span>
                  <span>{formatPKR(grandTotal)}</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: DELIVERY DETAILS */}
          {currentStep === 2 && (
            <div id="checkout-step-2" className="space-y-4">
              <h3 className="font-serif-title font-bold text-base text-[#1A3636]">
                Delivery Information
              </h3>
              <p className="text-xs text-[#5F6B6C]">
                We use WhatsApp for 1-click order confirmation before courier dispatch.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#2C3E50] mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    placeholder="e.g. Ayesha Tariq"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5DFD5] text-xs focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]"
                  />
                  {formErrors.customer_name && (
                    <p className="text-[11px] text-red-600 mt-1">{formErrors.customer_name}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#2C3E50] mb-1">
                      WhatsApp Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.whatsapp_phone}
                      onChange={(e) => setFormData({ ...formData, whatsapp_phone: e.target.value })}
                      placeholder="0300-1234567"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5DFD5] text-xs focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]"
                    />
                    {formErrors.whatsapp_phone && (
                      <p className="text-[11px] text-red-600 mt-1">{formErrors.whatsapp_phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2C3E50] mb-1">
                      Destination City <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5DFD5] text-xs bg-white focus:outline-none focus:border-[#C5A059]"
                    >
                      {MERCHANT_CONFIG.majorCities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                    {formErrors.city && (
                      <p className="text-[11px] text-red-600 mt-1">{formErrors.city}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2C3E50] mb-1">
                    Complete Street / House Delivery Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formData.address_line}
                    onChange={(e) => setFormData({ ...formData, address_line: e.target.value })}
                    placeholder="House #, Street #, Sector / Colony / Area..."
                    className="w-full px-3.5 py-2 rounded-lg border border-[#E5DFD5] text-xs focus:outline-none focus:border-[#C5A059]"
                  />
                  {formErrors.address_line && (
                    <p className="text-[11px] text-red-600 mt-1">{formErrors.address_line}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2C3E50] mb-1">
                    Order Notes / Special Sizing (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="e.g. Ring size 16, or please deliver after 2 PM"
                    className="w-full px-3.5 py-2 rounded-lg border border-[#E5DFD5] text-xs focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT METHOD */}
          {currentStep === 3 && (
            <div id="checkout-step-3" className="space-y-4">
              <div>
                <h3 className="font-serif-title font-bold text-base text-[#1A3636]">
                  Select Payment Method
                </h3>
                <p className="text-xs text-[#5F6B6C]">
                  All prices and transactions are strictly in PKR (Rs.)
                </p>
              </div>

              {/* Payment Method Cards */}
              <div className="space-y-2.5">
                {/* EasyPaisa */}
                <div
                  onClick={() => setFormData({ ...formData, payment_method: 'EasyPaisa' })}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    formData.payment_method === 'EasyPaisa'
                      ? 'border-[#1A3636] bg-[#FAF8F5] ring-2 ring-[#C5A059]/40'
                      : 'border-[#E5DFD5] hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#00A859]/15 text-[#00A859] font-bold text-xs flex items-center justify-center border border-[#00A859]/30">
                        EP
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-[#1A3636]">EasyPaisa Wallet / Till</div>
                        <div className="text-[11px] text-[#5F6B6C]">Instant direct mobile transfer</div>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.payment_method === 'EasyPaisa' ? 'border-[#1A3636] bg-[#1A3636]' : 'border-gray-300'}`}>
                      {formData.payment_method === 'EasyPaisa' && <div className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />}
                    </div>
                  </div>

                  {formData.payment_method === 'EasyPaisa' && (
                    <div className="mt-3 pt-3 border-t border-[#E5DFD5] text-xs space-y-2 text-[#2C3E50] bg-white/70 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-[#5F6B6C]">Account Title:</span>
                        <span className="font-bold">{MERCHANT_CONFIG.paymentAccounts.easypaisa.accountTitle}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#5F6B6C]">EasyPaisa Number:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-[#1A3636]">{MERCHANT_CONFIG.paymentAccounts.easypaisa.accountNumber}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(MERCHANT_CONFIG.paymentAccounts.easypaisa.accountNumber, 'ep_acc');
                            }}
                            className="p-1 text-gray-400 hover:text-[#1A3636]"
                          >
                            {copiedField === 'ep_acc' ? <CheckCheck className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#5F6B6C]">Till ID:</span>
                        <span className="font-mono font-bold">{MERCHANT_CONFIG.paymentAccounts.easypaisa.tillNumber}</span>
                      </div>
                      <p className="text-[11px] text-[#5F6B6C] italic pt-1">
                        {MERCHANT_CONFIG.paymentAccounts.easypaisa.instructions}
                      </p>
                    </div>
                  )}
                </div>

                {/* JazzCash */}
                <div
                  onClick={() => setFormData({ ...formData, payment_method: 'JazzCash' })}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    formData.payment_method === 'JazzCash'
                      ? 'border-[#1A3636] bg-[#FAF8F5] ring-2 ring-[#C5A059]/40'
                      : 'border-[#E5DFD5] hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#E31B23]/15 text-[#E31B23] font-bold text-xs flex items-center justify-center border border-[#E31B23]/30">
                        JC
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-[#1A3636]">JazzCash Mobile Account</div>
                        <div className="text-[11px] text-[#5F6B6C]">JazzCash app or *786# transfer</div>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.payment_method === 'JazzCash' ? 'border-[#1A3636] bg-[#1A3636]' : 'border-gray-300'}`}>
                      {formData.payment_method === 'JazzCash' && <div className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />}
                    </div>
                  </div>

                  {formData.payment_method === 'JazzCash' && (
                    <div className="mt-3 pt-3 border-t border-[#E5DFD5] text-xs space-y-2 text-[#2C3E50] bg-white/70 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-[#5F6B6C]">Account Title:</span>
                        <span className="font-bold">{MERCHANT_CONFIG.paymentAccounts.jazzcash.accountTitle}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#5F6B6C]">JazzCash Number:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-[#1A3636]">{MERCHANT_CONFIG.paymentAccounts.jazzcash.accountNumber}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(MERCHANT_CONFIG.paymentAccounts.jazzcash.accountNumber, 'jc_acc');
                            }}
                            className="p-1 text-gray-400 hover:text-[#1A3636]"
                          >
                            {copiedField === 'jc_acc' ? <CheckCheck className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-[#5F6B6C] italic pt-1">
                        {MERCHANT_CONFIG.paymentAccounts.jazzcash.instructions}
                      </p>
                    </div>
                  )}
                </div>

                {/* Cash on Delivery */}
                <div
                  onClick={() => setFormData({ ...formData, payment_method: 'COD' })}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    formData.payment_method === 'COD'
                      ? 'border-[#1A3636] bg-[#FAF8F5] ring-2 ring-[#C5A059]/40'
                      : 'border-[#E5DFD5] hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#1A3636]/15 text-[#1A3636] font-bold text-xs flex items-center justify-center border border-[#1A3636]/30">
                        COD
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-[#1A3636]">Cash on Delivery (COD)</div>
                        <div className="text-[11px] text-[#5F6B6C]">Pay rider when parcel reaches your doorstep</div>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.payment_method === 'COD' ? 'border-[#1A3636] bg-[#1A3636]' : 'border-gray-300'}`}>
                      {formData.payment_method === 'COD' && <div className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: VERIFICATION & PAYMENT PROOF UPLOAD (FR-04) */}
          {currentStep === 4 && (
            <div id="checkout-step-4" className="space-y-4">
              <div>
                <h3 className="font-serif-title font-bold text-base text-[#1A3636]">
                  Order Summary & Payment Verification
                </h3>
                <p className="text-xs text-[#5F6B6C]">
                  {formData.payment_method === 'COD'
                    ? 'Review your final order details before placement.'
                    : 'Enter your transaction ID and attach proof screenshot.'}
                </p>
              </div>

              {/* Digital Wallet Transaction Verification */}
              {formData.payment_method !== 'COD' && (
                <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E5DFD5] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1A3636]">
                    <ShieldCheck className="w-4 h-4 text-[#3E6259]" />
                    <span>{formData.payment_method} Proof of Payment</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2C3E50] mb-1">
                      Transaction ID (TID) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.transaction_id}
                      onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                      placeholder="e.g. EP-98421045 or JC-38472910"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5DFD5] text-xs font-mono bg-white focus:outline-none focus:border-[#C5A059]"
                    />
                    {formErrors.transaction_id && (
                      <p className="text-[11px] text-red-600 mt-1">{formErrors.transaction_id}</p>
                    )}
                  </div>

                  {/* Receipt Screenshot Upload (FR-04: Strict ≤5MB, JPG/PNG) */}
                  <div>
                    <label className="block text-xs font-semibold text-[#2C3E50] mb-1">
                      Receipt Screenshot (JPG/PNG ≤ 5MB)
                    </label>

                    <div className="relative border-2 border-dashed border-[#E5DFD5] hover:border-[#C5A059] rounded-xl p-4 text-center bg-white transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleImageFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />

                      {formData.receipt_image_preview ? (
                        <div className="flex items-center gap-3 justify-center">
                          <img
                            src={formData.receipt_image_preview}
                            alt="Receipt Preview"
                            className="w-14 h-14 object-cover rounded-lg border border-[#E5DFD5]"
                          />
                          <div className="text-left text-xs">
                            <div className="font-semibold text-[#3E6259] flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              Receipt Attached
                            </div>
                            <div className="text-[11px] text-gray-500">
                              Click to change screenshot
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <Upload className="w-6 h-6 text-gray-400 mx-auto" />
                          <div className="text-xs text-[#2C3E50] font-medium">
                            Upload EasyPaisa / JazzCash confirmation screenshot
                          </div>
                          <div className="text-[10px] text-gray-400">
                            Strict client validation: JPG or PNG under 5MB
                          </div>
                        </div>
                      )}
                    </div>

                    {formErrors.receipt && (
                      <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {formErrors.receipt}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Final Breakdown Table */}
              <div className="border border-[#E5DFD5] rounded-xl p-4 bg-white space-y-2 text-xs">
                <div className="font-semibold text-sm text-[#1A3636] pb-1 border-b border-gray-100">
                  Order Breakdown
                </div>
                <div className="flex justify-between text-[#5F6B6C]">
                  <span>Customer:</span>
                  <span className="font-medium text-[#2C3E50]">{formData.customer_name} ({formData.whatsapp_phone})</span>
                </div>
                <div className="flex justify-between text-[#5F6B6C]">
                  <span>Delivery Address:</span>
                  <span className="font-medium text-[#2C3E50] text-right">{formData.address_line}, {formData.city}</span>
                </div>
                <div className="flex justify-between text-[#5F6B6C]">
                  <span>Payment Mode:</span>
                  <span className="font-bold text-[#1A3636]">{formData.payment_method}</span>
                </div>
                <div className="flex justify-between text-[#5F6B6C] pt-2 border-t border-gray-100">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-[#2C3E50]">{formatPKR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#5F6B6C]">
                  <span>Shipping Fee:</span>
                  <span className="font-semibold text-[#2C3E50]">
                    {shippingFee === 0 ? <span className="text-[#3E6259]">FREE</span> : formatPKR(shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#1A3636] pt-2 border-t border-[#E5DFD5]">
                  <span>Total Amount (PKR):</span>
                  <span className="text-lg text-[#1A3636]">{formatPKR(grandTotal)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Stepper Buttons */}
        <div className="px-6 py-4 border-t border-[#E5DFD5] bg-[#FAF8F5] flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-[#E5DFD5] bg-white text-[#2C3E50] text-xs font-semibold hover:bg-gray-100 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#E5DFD5] bg-white text-[#5F6B6C] text-xs font-semibold hover:bg-gray-100"
            >
              Cancel
            </button>
          )}

          {currentStep < 4 ? (
            <button
              id="checkout-next-btn"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-[#1A3636] text-white hover:bg-[#0F2323] text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C5A059]" />
            </button>
          ) : (
            <button
              id="checkout-submit-btn"
              onClick={handleSubmitOrder}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#1A3636] text-white hover:bg-[#0F2323] text-xs font-bold flex items-center gap-2 shadow-md disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Placing Order...</span>
              ) : (
                <>
                  <Check className="w-4 h-4 text-[#C5A059]" />
                  <span>Place Order • {formatPKR(grandTotal)}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
