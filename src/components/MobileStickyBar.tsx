import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { CartItem } from '../types';
import { formatPKR } from '../utils/formatters';

interface MobileStickyBarProps {
  items: CartItem[];
  onOpenCart: () => void;
  onProceedToCheckout: () => void;
}

export const MobileStickyBar: React.FC<MobileStickyBarProps> = ({
  items,
  onOpenCart,
  onProceedToCheckout
}) => {
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price_pkr * item.quantity, 0);

  if (totalCount === 0) return null;

  return (
    <div
      id="mobile-sticky-anchor-bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1A3636] text-white p-3 border-t border-[#C5A059]/40 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom duration-300"
    >
      <div className="flex items-center justify-between gap-3">
        <div onClick={onOpenCart} className="cursor-pointer">
          <div className="flex items-center gap-2">
            <span className="bg-[#C5A059] text-[#1A3636] font-bold text-xs px-2 py-0.5 rounded-full">
              {totalCount} {totalCount === 1 ? 'item' : 'items'}
            </span>
            <span className="text-xs text-gray-300">Total:</span>
          </div>
          <div className="font-bold text-base text-white">{formatPKR(subtotal)}</div>
        </div>

        <button
          id="mobile-sticky-checkout-btn"
          onClick={onProceedToCheckout}
          className="flex-1 max-w-[200px] py-2.5 px-4 rounded-xl bg-[#C5A059] text-[#1A3636] hover:bg-[#b08e4d] font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all"
        >
          <span>Checkout</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
