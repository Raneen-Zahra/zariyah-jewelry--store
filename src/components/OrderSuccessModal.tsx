import React from 'react';
import { CheckCircle2, MessageCircle, Package, ArrowRight, Sparkles, MapPin, Phone } from 'lucide-react';
import { Order } from '../types';
import { formatPKR, getCustomerFastTrackWhatsAppLink } from '../utils/formatters';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const whatsappFastTrackUrl = getCustomerFastTrackWhatsAppLink(order);

  return (
    <div id="order-success-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-[#E5DFD5] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header Ribbon */}
        <div className="bg-[#1A3636] p-6 text-center text-white relative">
          <div className="w-14 h-14 bg-[#C5A059]/20 border border-[#C5A059] rounded-full flex items-center justify-center mx-auto mb-3 text-[#C5A059]">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="font-serif-title font-bold text-2xl text-white">
            Order Placed Successfully!
          </h2>
          <p className="text-xs text-[#E5DFD5] mt-1">
            Status: <span className="font-semibold text-[#C5A059] uppercase tracking-wider">Pending Confirmation</span>
          </p>
          <div className="inline-block mt-3 px-3 py-1 rounded-full bg-white/10 text-xs font-mono border border-white/20">
            {order.order_id}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* WhatsApp Fast Track Card */}
          <div className="bg-[#25D366]/10 border border-[#25D366]/30 p-4 rounded-xl space-y-2.5">
            <div className="flex items-center gap-2 text-[#128C7E] font-bold text-sm">
              <MessageCircle className="w-5 h-5 shrink-0" />
              <span>Fast-Track / Edit Order via WhatsApp</span>
            </div>
            <p className="text-[#2C3E50] leading-relaxed">
              Need to modify your delivery address or want instant courier confirmation? Click below to chat directly with our store owner.
            </p>
            <a
              id="success-whatsapp-fast-track-cta"
              href={whatsappFastTrackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Connect on WhatsApp Now</span>
            </a>
          </div>

          {/* Order Breakdown */}
          <div className="border border-[#E5DFD5] rounded-xl p-4 bg-[#FAF8F5]/60 space-y-2.5">
            <div className="font-serif-title font-bold text-sm text-[#1A3636] flex items-center gap-1.5 pb-1 border-b border-[#E5DFD5]">
              <Package className="w-4 h-4 text-[#C5A059]" />
              <span>Ordered Jewelry Items ({order.items.length})</span>
            </div>

            <div className="space-y-2 max-h-36 overflow-y-auto">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-[#2C3E50]">
                  <div className="flex items-center gap-2">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-8 h-8 object-cover rounded border border-[#E5DFD5]"
                      referrerPolicy="no-referrer"
                    />
                    <span className="font-medium">{item.title} × {item.quantity}</span>
                  </div>
                  <span className="font-semibold">{formatPKR(item.price_pkr * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#E5DFD5] space-y-1 text-[#5F6B6C]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPKR(order.subtotal_pkr)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span>{order.shipping_fee_pkr === 0 ? 'FREE' : formatPKR(order.shipping_fee_pkr)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#1A3636] pt-1 border-t border-[#E5DFD5]">
                <span>Total Amount</span>
                <span>{formatPKR(order.total_amount_pkr)} ({order.payment_method})</span>
              </div>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="p-3 bg-white border border-[#E5DFD5] rounded-xl space-y-1 text-[#5F6B6C]">
            <div className="flex items-center gap-1.5 font-semibold text-[#1A3636]">
              <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Delivery Address</span>
            </div>
            <p className="text-[#2C3E50]">
              {order.customer_name} • {order.whatsapp_phone}
            </p>
            <p className="text-[#2C3E50]">
              {order.address_line}, {order.city}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E5DFD5] bg-[#FAF8F5] flex justify-end">
          <button
            id="success-continue-shopping"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#1A3636] hover:bg-[#0F2323] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <span>Continue Browsing</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#C5A059]" />
          </button>
        </div>
      </div>
    </div>
  );
};
