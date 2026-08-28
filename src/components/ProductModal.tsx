import React, { useState } from 'react';
import { X, ShoppingBag, AlertCircle, Phone, Check, Shield, Truck, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { formatPKR } from '../utils/formatters';
import { MERCHANT_CONFIG } from '../data/initialData';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  isItemInCart: boolean;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
  isItemInCart
}) => {
  if (!product) return null;

  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);

  const isSoldOut = product.stock_quantity === 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= (product.low_stock_threshold || 5);
  const maxAvailable = Math.max(1, product.stock_quantity);

  const handleWhatsAppInquiry = () => {
    const text = `Salam ${MERCHANT_CONFIG.storeName}! ✨ I am interested in *${product.title}* (${formatPKR(product.price_pkr)}). Could you please share more details/custom sizing options?`;
    window.open(`https://wa.me/${MERCHANT_CONFIG.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div id="product-detail-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl border border-[#E5DFD5] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#E5DFD5] bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5F6B6C]">
              {product.category}
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-xs text-[#5F6B6C] font-mono">SKU: {product.id}</span>
          </div>

          <button
            id="close-product-modal"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 hover:text-[#1A3636] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Gallery */}
          <div className="md:col-span-6 space-y-3">
            <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-[#E5DFD5] bg-[#FAF8F5]">
              <img
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />

              {/* Status Badge */}
              <div className="absolute top-3 left-3">
                {isSoldOut ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#8C4A4A] text-white shadow-xs uppercase">
                    Sold Out
                  </span>
                ) : isLowStock ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#B8860B] text-white shadow-xs flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Only {product.stock_quantity} Left in Stock
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#1A3636] text-white shadow-xs">
                    In Stock ({product.stock_quantity} available)
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Row */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImageIndex === idx ? 'border-[#C5A059] ring-2 ring-[#C5A059]/30' : 'border-[#E5DFD5] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Product Details */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#1A3636] leading-tight">
                  {product.title}
                </h2>
                <div className="mt-2 text-2xl font-bold text-[#1A3636] flex items-baseline gap-2">
                  <span>{formatPKR(product.price_pkr)}</span>
                  <span className="text-xs text-[#5F6B6C] font-normal">PKR (Taxes included)</span>
                </div>
              </div>

              <p className="text-sm text-[#5F6B6C] leading-relaxed">
                {product.description}
              </p>

              {/* Jewelry Technical Specifications */}
              {product.specs && (
                <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E5DFD5] space-y-2 text-xs">
                  <div className="font-semibold text-[#1A3636] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Artisanal Specifications</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[#2C3E50]">
                    {product.specs.metalPurity && (
                      <div>
                        <span className="text-[#5F6B6C] block">Purity & Finish:</span>
                        <span className="font-medium">{product.specs.metalPurity}</span>
                      </div>
                    )}
                    {product.specs.stoneType && (
                      <div>
                        <span className="text-[#5F6B6C] block">Stones:</span>
                        <span className="font-medium">{product.specs.stoneType}</span>
                      </div>
                    )}
                    {product.specs.weightGrams && (
                      <div>
                        <span className="text-[#5F6B6C] block">Approx Weight:</span>
                        <span className="font-medium">{product.specs.weightGrams} grams</span>
                      </div>
                    )}
                    {product.specs.craftsmanship && (
                      <div>
                        <span className="text-[#5F6B6C] block">Setting:</span>
                        <span className="font-medium">{product.specs.craftsmanship}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-[#5F6B6C]">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#1A3636]" />
                  <span>Nationwide Express Courier</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#1A3636]" />
                  <span>100% Authentic Handcraft</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-[#E5DFD5]">
              {!isSoldOut && (
                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold text-[#2C3E50]">Quantity:</span>
                  <div className="flex items-center border border-[#E5DFD5] rounded-lg overflow-hidden bg-white">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="px-3 py-1.5 text-sm font-bold text-[#1A3636] hover:bg-gray-100 disabled:opacity-30"
                    >
                      -
                    </button>
                    <span className="px-3 py-1.5 text-xs font-semibold min-w-8 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                      disabled={quantity >= product.stock_quantity}
                      className="px-3 py-1.5 text-sm font-bold text-[#1A3636] hover:bg-gray-100 disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                  {isLowStock && (
                    <span className="text-[11px] text-[#B8860B] font-medium">
                      (Max {product.stock_quantity} available)
                    </span>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  id="modal-add-to-cart"
                  onClick={() => {
                    onAddToCart(product, quantity);
                    onClose();
                  }}
                  disabled={isSoldOut}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    isSoldOut
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-[#1A3636] text-white hover:bg-[#0F2323] shadow-md active:scale-98'
                  }`}
                >
                  {isSoldOut ? (
                    <span>Currently Sold Out</span>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-[#C5A059]" />
                      <span>Add to Bag • {formatPKR(product.price_pkr * quantity)}</span>
                    </>
                  )}
                </button>

                <button
                  id="modal-whatsapp-inquire"
                  onClick={handleWhatsAppInquiry}
                  className="py-3 px-4 rounded-xl border border-[#25D366]/40 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>Inquire via WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
