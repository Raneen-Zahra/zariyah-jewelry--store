import React from 'react';
import { ShoppingBag, Search, Sparkles, ShieldCheck, Phone, LayoutDashboard, Store } from 'lucide-react';
import { ProductCategory } from '../types';
import { MERCHANT_CONFIG } from '../data/initialData';
import atelierLogo from '../assets/LC_Atelier_By_Laraib_logo.jpeg';

interface HeaderProps {
  currentCategory: ProductCategory;
  onSelectCategory: (category: ProductCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  isAdminView: boolean;
  onToggleAdminView: () => void;
  pendingOrdersCount: number;
}

const CATEGORIES: ProductCategory[] = [
  'All',
  'Rings',
  'Earrings',
  'Lockets',
  'Bangles'
];

export const Header: React.FC<HeaderProps> = ({
  currentCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  cartCount,
  onOpenCart,
  isAdminView,
  onToggleAdminView,
  pendingOrdersCount
}) => {
  return (
    <header id="main-header" className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E5DFD5] transition-all">
      {/* Top Announcement Bar */}
      <div id="announcement-bar" className="bg-[#1A3636] text-[#FAF8F5] text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-[11px] sm:text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[#C5A059] font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              Express Delivery Across Pakistan
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              id="header-whatsapp-direct"
              href={`https://wa.me/${MERCHANT_CONFIG.whatsappNumber.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[#C5A059] hover:underline"
            >
              <Phone className="w-3 h-3" />
              <span>WhatsApp: {MERCHANT_CONFIG.whatsappDisplay}</span>
            </a>
            
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div
            id="brand-logo"
            onClick={() => {
              if (isAdminView) onToggleAdminView();
              onSelectCategory('All');
            }}
            className="cursor-pointer flex items-center gap-2 group"
          >
            <img
              src={atelierLogo}
              alt="Atelier by Laraib Chouhdary"
              className="w-10 h-10 rounded-full object-cover border border-[#C5A059]"
            />
            <div>
              <span className="font-serif-title text-xl sm:text-2xl font-bold tracking-tight text-[#1A3636] block leading-none">
                LC ATELIER
              </span>
              <span className="text-[10px] tracking-widest uppercase text-[#5F6B6C] font-medium">
                by Laraib Chouhdary
              </span>
            </div>
          </div>
          {/* Search Bar */}
          {!isAdminView && (
            <div id="search-container" className="flex-1 max-w-md hidden sm:block relative">
              <input
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-white pl-9 pr-4 py-2 text-sm rounded-full border border-[#E5DFD5] focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-all text-[#2C3E50] placeholder:text-gray-400 shadow-xs"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            {!isAdminView && (
              <button
                id="header-cart-button"
                onClick={onOpenCart}
                className="relative flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#1A3636] text-white hover:bg-[#0F2323] transition-all shadow-xs"
                aria-label="View shopping cart"
              >
                <ShoppingBag className="w-4 h-4 text-[#C5A059]" />
                <span className="text-xs font-semibold hidden md:inline">Bag</span>
                {cartCount > 0 && (
                  <span className="bg-[#C5A059] text-[#1A3636] font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        {!isAdminView && (
          <div className="mt-2 sm:hidden relative">
            <input
              id="mobile-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search jewelry catalogue..."
              className="w-full bg-white pl-9 pr-4 py-2 text-xs rounded-full border border-[#E5DFD5] focus:outline-none focus:border-[#C5A059] text-[#2C3E50]"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
          </div>
        )}
      </div>

      {/* Category Pills Bar (Storefront view only) */}
      {!isAdminView && (
        <div id="category-pills-bar" className="bg-white/80 border-t border-[#E5DFD5] overflow-x-auto no-scrollbar">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-1.5 py-2 min-w-max">
            {CATEGORIES.map((cat) => {
              const isSelected = currentCategory === cat;
              return (
                <button
                  key={cat}
                  id={`category-pill-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  onClick={() => onSelectCategory(cat)}
                  className={`px-3.5 py-1 text-xs font-medium rounded-full transition-all whitespace-nowrap ${isSelected
                    ? 'bg-[#1A3636] text-[#FAF8F5] shadow-xs'
                    : 'text-[#5F6B6C] hover:text-[#1A3636] hover:bg-[#FAF8F5]'
                    }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
