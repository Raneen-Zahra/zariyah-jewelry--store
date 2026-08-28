import React from 'react';
import { X, ExternalLink, ShieldCheck } from 'lucide-react';
import { Order } from '../types';
import { formatPKR } from '../utils/formatters';

interface AdminReceiptModalProps {
  order: Order | null;
  onClose: () => void;
}

export const AdminReceiptModal: React.FC<AdminReceiptModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div id="admin-receipt-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-[#E5DFD5] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5DFD5] bg-[#FAF8F5] flex items-center justify-between">
          <div>
            <h3 className="font-serif-title font-bold text-base text-[#1A3636] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#3E6259]" />
              <span>Payment Proof Receipt</span>
            </h3>
            <p className="text-xs text-[#5F6B6C]">
              Order #{order.order_id} • {order.payment_method}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 hover:text-[#1A3636]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E5DFD5] text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-[#5F6B6C]">Customer:</span>
              <span className="font-bold text-[#1A3636]">{order.customer_name} ({order.whatsapp_phone})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5F6B6C]">Total Expected:</span>
              <span className="font-bold text-[#1A3636]">{formatPKR(order.total_amount_pkr)}</span>
            </div>
            {order.transaction_id && (
              <div className="flex justify-between">
                <span className="text-[#5F6B6C]">Transaction ID (TID):</span>
                <span className="font-mono font-bold text-[#3E6259]">{order.transaction_id}</span>
              </div>
            )}
          </div>

          {order.receipt_image_url ? (
            <div className="space-y-2">
              <div className="rounded-xl overflow-hidden border border-[#E5DFD5] bg-gray-50 flex items-center justify-center max-h-96">
                <img
                  src={order.receipt_image_url}
                  alt="Receipt Screenshot"
                  className="w-full h-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="text-center">
                <a
                  href={order.receipt_image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#1A3636] hover:underline font-semibold inline-flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Full Size Image</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-[#E5DFD5] text-xs text-[#5F6B6C]">
              No image screenshot attached for this order. Customer provided Transaction ID or selected Cash on Delivery.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#E5DFD5] bg-[#FAF8F5] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#1A3636] text-white text-xs font-semibold hover:bg-[#0F2323]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
