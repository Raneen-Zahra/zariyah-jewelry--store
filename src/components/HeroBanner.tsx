import React from 'react';
import { ShieldCheck, Truck, MessageCircle, Gem } from 'lucide-react';
export const HeroBanner: React.FC = () => {
  return (
    <div id="hero-banner-section" className="relative overflow-hidden bg-gradient-to-b from-[#FAF8F5] to-white border-b border-[#E5DFD5] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Editorial Copy */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A3636]/5 border border-[#1A3636]/10 text-[#1A3636] text-xs font-semibold">
              <Gem className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Everyday Jewelry, Made Affordable</span>
            </div>

            <h1 className="font-serif-title text-3xl sm:text-4xl md:text-5xl font-bold text-[#1A3636] tracking-tight leading-tight">
              Adorn Yourself in Sparkle.
            </h1>

            <p className="text-[#5F6B6C] text-sm sm:text-base max-w-2xl leading-relaxed">
              Explore Atelier's curated collection of casual, everyday jewelry — designed to elevate your look without the luxury price tag. Direct human verification via WhatsApp ensures a smooth, trustworthy order every time.
            </p>

            {/* Value Props Row */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E5DFD5]/70">
                <Truck className="w-4 h-4 text-[#1A3636] shrink-0" />
                <div>
                  <div className="text-xs font-bold text-[#1A3636]">Express Dispatch</div>
<div className="text-[11px] text-[#5F6B6C]">Nationwide Delivery</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E5DFD5]/70">
                <ShieldCheck className="w-4 h-4 text-[#1A3636] shrink-0" />
                <div>
                  <div className="text-xs font-bold text-[#1A3636]">Flexible Payments</div>
                  <div className="text-[11px] text-[#5F6B6C]">EasyPaisa</div>
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 flex items-center gap-2.5 p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E5DFD5]/70">
                <MessageCircle className="w-4 h-4 text-[#1A3636] shrink-0" />
                <div>
                  <div className="text-xs font-bold text-[#1A3636]">WhatsApp Verified</div>
                  <div className="text-[11px] text-[#5F6B6C]">Human order confirmation</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Featured Visual Badge */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-[#E5DFD5] aspect-4/3 bg-gray-100">
              <img
                src=""
                alt="Occasional Sets"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                <span className="text-[#C5A059] text-xs uppercase tracking-widest font-semibold"></span>
                <p className="text-sm font-serif-title font-bold"></p>
                <p className="text-xs text-gray-200"></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
