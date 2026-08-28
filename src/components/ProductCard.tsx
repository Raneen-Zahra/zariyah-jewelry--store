import React from 'react';
import { ShoppingBag, Eye, AlertCircle, Check } from 'lucide-react';
import { Product } from '../types';
import { formatPKR } from '../utils/formatters';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  isItemInCart: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickView,
  onAddToCart,
  isItemInCart
}) => {
  const isSoldOut = product.stock_quantity === 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= (product.low_stock_threshold || 5);

  return (
    <div
      id={`product-card-${product.id}`}
      className="group relative bg-white rounded-xl border border-[#E5DFD5] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full bg-[#FAF8F5] overflow-hidden">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80'}
          alt={product.title}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            isSoldOut ? 'grayscale-40 opacity-80' : ''
          }`}
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Live Stock Urgency Badges (FR-02) */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {isSoldOut ? (
            <span
              id={`badge-sold-out-${product.id}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#8C4A4A] text-white shadow-xs tracking-wide uppercase"
            >
              Sold Out
            </span>
          ) : isLowStock ? (
            <span
              id={`badge-low-stock-${product.id}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#B8860B] text-white shadow-xs animate-pulse"
            >
              <AlertCircle className="w-3 h-3" />
              Only {product.stock_quantity} Left!
            </span>
          ) : null}

          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/60 text-white backdrop-blur-xs">
            {product.category}
          </span>
        </div>

        {/* Quick View Button Hover Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
          <button
            id={`quick-view-btn-${product.id}`}
            onClick={() => onQuickView(product)}
            className="px-3.5 py-2 rounded-full bg-white text-[#1A3636] font-semibold text-xs flex items-center gap-1.5 shadow-md hover:bg-[#FAF8F5] transition-transform active:scale-95"
          >
            <Eye className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Quick Details</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3
            onClick={() => onQuickView(product)}
            className="font-serif-title font-bold text-base sm:text-lg text-[#1A3636] line-clamp-1 hover:text-[#C5A059] cursor-pointer transition-colors"
            title={product.title}
          >
            {product.title}
          </h3>

          <p className="text-xs text-[#5F6B6C] line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-[#E5DFD5]/60 flex items-center justify-between gap-2">
          {/* Price formatted in PKR */}
          <div>
            <div className="text-[10px] uppercase font-semibold text-[#5F6B6C] tracking-wider">Price (PKR)</div>
            <div id={`product-price-${product.id}`} className="font-bold text-base sm:text-lg text-[#1A3636]">
              {formatPKR(product.price_pkr)}
            </div>
          </div>

          {/* Add to Cart CTA */}
          <button
            id={`add-to-cart-btn-${product.id}`}
            onClick={() => onAddToCart(product)}
            disabled={isSoldOut}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isSoldOut
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
                : isItemInCart
                ? 'bg-[#3E6259] text-white hover:bg-[#2C4942]'
                : 'bg-[#1A3636] text-white hover:bg-[#0F2323] active:scale-95 shadow-xs'
            }`}
          >
            {isSoldOut ? (
              <span>Sold Out</span>
            ) : isItemInCart ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>In Bag</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Add to Bag</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
