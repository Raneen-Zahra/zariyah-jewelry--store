import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { CartItem } from '../types';
import { formatPKR } from '../utils/formatters';
import { MERCHANT_CONFIG } from '../data/initialData';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, newQty: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price_pkr * item.quantity, 0);
  const isFreeShipping = subtotal >= MERCHANT_CONFIG.freeShippingThreshold;
  const amountNeededForFreeShipping = Math.max(0, MERCHANT_CONFIG.freeShippingThreshold - subtotal);
  const shippingProgress = Math.min(100, (subtotal / MERCHANT_CONFIG.freeShippingThreshold) * 100);

  return (
    <div id="cart-drawer-overlay" className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-[#E5DFD5] animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5DFD5] bg-[#FAF8F5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#1A3636]" />
            <h2 className="font-serif-title font-bold text-lg text-[#1A3636]">
              Your Shopping Bag ({items.reduce((s, i) => s + i.quantity, 0)})
            </h2>
          </div>
          <button
            id="close-cart-drawer"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 hover:text-[#1A3636] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="px-6 py-2.5 bg-[#FAF8F5]/80 border-b border-[#E5DFD5] text-xs">
          {isFreeShipping ? (
            <div className="flex items-center gap-1.5 text-[#3E6259] font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>You have unlocked <strong>FREE Express Shipping</strong>!</span>
            </div>
          ) : (
            <div>
              <div className="flex justify-between text-[#5F6B6C] mb-1">
                <span>Add <strong>{formatPKR(amountNeededForFreeShipping)}</strong> for Free Shipping</span>
                <span className="font-semibold">{Math.round(shippingProgress)}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#C5A059] rounded-full transition-all duration-300"
                  style={{ width: `${shippingProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-12 text-[#5F6B6C]">
              <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#E5DFD5] flex items-center justify-center text-gray-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="font-serif-title text-lg text-[#1A3636]">Your bag is empty</p>
              <p className="text-xs max-w-xs text-[#5F6B6C]">
                Explore our handcrafted bridal and fine jewelry pieces to begin your order.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2 rounded-full bg-[#1A3636] text-white text-xs font-semibold hover:bg-[#0F2323] transition-colors"
              >
                Explore Catalogue
              </button>
            </div>
          ) : (
            items.map((item) => {
              const maxStock = item.product.stock_quantity;
              return (
                <div
                  key={item.product.id}
                  id={`cart-item-${item.product.id}`}
                  className="flex gap-3.5 p-3 rounded-xl border border-[#E5DFD5] bg-[#FAF8F5]/40 hover:bg-[#FAF8F5] transition-colors"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.title}
                    className="w-20 h-20 rounded-lg object-cover border border-[#E5DFD5] shrink-0 bg-white"
                    referrerPolicy="no-referrer"
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-serif-title font-bold text-sm text-[#1A3636] line-clamp-1">
                          {item.product.title}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-gray-400 hover:text-[#8C4A4A] p-0.5 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-xs font-semibold text-[#1A3636] mt-0.5">
                        {formatPKR(item.product.price_pkr)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200/60">
                      {/* Quantity Controller */}
                      <div className="flex items-center border border-[#E5DFD5] rounded-md bg-white">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="px-2.5 py-0.5 text-xs font-bold text-[#1A3636] hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 text-xs font-semibold min-w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, Math.min(maxStock, item.quantity + 1))}
                          disabled={item.quantity >= maxStock}
                          className="px-2.5 py-0.5 text-xs font-bold text-[#1A3636] hover:bg-gray-100 disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-xs font-bold text-[#1A3636]">
                        {formatPKR(item.product.price_pkr * item.quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Subtotal & Proceed to Checkout */}
        {items.length > 0 && (
          <div className="p-6 border-t border-[#E5DFD5] bg-[#FAF8F5] space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#5F6B6C]">
                <span>Items Subtotal</span>
                <span className="font-semibold text-[#2C3E50]">{formatPKR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#5F6B6C]">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-[#2C3E50]">
                  {isFreeShipping ? (
                    <span className="text-[#3E6259]">FREE</span>
                  ) : (
                    formatPKR(MERCHANT_CONFIG.shippingFlatRate)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#1A3636] pt-2 border-t border-[#E5DFD5]">
                <span>Estimated Total</span>
                <span>
                  {formatPKR(subtotal + (isFreeShipping ? 0 : MERCHANT_CONFIG.shippingFlatRate))}
                </span>
              </div>
            </div>

            <button
              id="proceed-checkout-btn"
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-[#1A3636] text-white hover:bg-[#0F2323] font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-transform active:scale-98"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 text-[#C5A059]" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#5F6B6C] pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#3E6259]" />
              <span>COD • EasyPaisa • JazzCash • Human Verification</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
