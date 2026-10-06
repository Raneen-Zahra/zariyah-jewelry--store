import { Product, Order } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-01',
    title: 'Sunburst Adjustable Ring',
    price_pkr: 950,
    description: 'A minimalist gold-tone adjustable ring with a subtle sunburst engraving. Fits most sizes and pairs easily with everyday outfits.',
    images: [
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1000&q=80'
    ],
    stock_quantity: 12,
    category: 'Rings',
    is_published: true,
    low_stock_threshold: 5,
    specs: {
      metalPurity: 'Gold-Plated Brass',
      stoneType: 'None',
      weightGrams: 4,
      craftsmanship: 'Adjustable open-back band'
    }
  },
  {
    id: 'prod-02',
    title: 'Pearl Duo Stacking Ring',
    price_pkr: 1200,
    description: 'Two slim bands finished with tiny faux-pearl accents, designed to be worn together or separately for a layered look.',
    images: [
      'https://images.unsplash.com/photo-1603561596112-0a132b757442?auto=format&fit=crop&w=1000&q=80'
    ],
    stock_quantity: 6, // Low stock: "Only 3 Left!"
    category: 'Rings',
    is_published: true,
    low_stock_threshold: 5,
    specs: {
      metalPurity: 'Stainless Steel, Gold Tone',
      stoneType: 'Faux Pearl',
      weightGrams: 3,
      craftsmanship: 'Sold as a set of 2 stacking bands'
    }
  },
  {
    id: 'prod-03',
    title: 'Golden Hoop Studs',
    price_pkr: 750,
    description: 'Small everyday hoop earrings with a smooth polished finish — lightweight enough for all-day wear.',
    images: [
      'https://images.unsplash.com/photo-1630019925601-99e00ae5b1a1?auto=format&fit=crop&w=1000&q=80'
    ],
    stock_quantity: 20,
    category: 'Earrings',
    is_published: true,
    low_stock_threshold: 5,
    specs: {
      metalPurity: 'Gold-Plated Stainless Steel',
      stoneType: 'None',
      weightGrams: 2,
      craftsmanship: 'Hinged snap closure'
    }
  },
  {
    id: 'prod-04',
    title: 'Dainty Pearl Drop Earrings',
    price_pkr: 890,
    description: 'A single freshwater-style pearl drop on a thin gold-tone hook — a simple, versatile everyday piece.',
    images: [
      'https://images.unsplash.com/photo-1633810542706-1f68be69ecb1?auto=format&fit=crop&w=1000&q=80'
    ],
    stock_quantity: 10, // Sold out
    category: 'Earrings',
    is_published: true,
    low_stock_threshold: 5,
    specs: {
      metalPurity: 'Gold-Plated Alloy',
      stoneType: 'Faux Pearl',
      weightGrams: 2,
      craftsmanship: 'Fish-hook backing'
    }
  },
  {
    id: 'prod-05',
    title: 'Heart Charm Locket Necklace',
    price_pkr: 1450,
    description: 'A dainty heart-shaped locket on a delicate chain, small enough to layer with other necklaces or wear alone.',
    images: [
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1000&q=80'
    ],
    stock_quantity: 15,
    category: 'Lockets',
    is_published: true,
    low_stock_threshold: 5,
    specs: {
      metalPurity: 'Gold-Plated Brass',
      stoneType: 'None',
      weightGrams: 6,
      craftsmanship: '18-inch chain with lobster clasp'
    }
  },
  {
    id: 'prod-06',
    title: 'Initial Letter Pendant Necklace',
    price_pkr: 1100,
    description: 'A single-letter pendant on a thin chain — a simple personal touch for everyday wear.',
    images: [
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1000&q=80'
    ],
    stock_quantity: 8, // Low stock: "Only 4 Left!"
    category: 'Lockets',
    is_published: true,
    low_stock_threshold: 5,
    specs: {
      metalPurity: 'Gold-Plated Alloy',
      stoneType: 'None',
      weightGrams: 3,
      craftsmanship: '16-inch adjustable chain'
    }
  },
  {
    id: 'prod-07',
    title: 'Stackable Thin Bangles (Set of 3)',
    price_pkr: 1650,
    description: 'Three slim stackable bangles in matching gold tone — easy to mix, match, and wear daily.',
    images: [
      'https://images.unsplash.com/photo-1611591477759-a29285223049?auto=format&fit=crop&w=1000&q=80'
    ],
    stock_quantity: 10,
    category: 'Bangles',
    is_published: true,
    low_stock_threshold: 5,
    specs: {
      metalPurity: 'Gold-Plated Brass',
      stoneType: 'None',
      weightGrams: 20,
      craftsmanship: 'Open-cuff, one-size-fits-most'
    }
  },
  {
    id: 'prod-08',
    title: 'Beaded Charm Bangle',
    price_pkr: 980,
    description: 'A single bangle with small beaded detailing and a tiny charm accent — a subtle everyday statement piece.',
    images: [
      'https://images.unsplash.com/photo-1611591477840-025a1e7fce90?auto=format&fit=crop&w=1000&q=80'
    ],
    stock_quantity: 9, // Low stock: "Only 2 Left!"
    category: 'Bangles',
    is_published: true,
    low_stock_threshold: 5,
    specs: {
      metalPurity: 'Stainless Steel, Gold Tone',
      stoneType: 'Glass Beads',
      weightGrams: 15,
      craftsmanship: 'Elastic stretch fit'
    }
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    order_id: 'ORD-PK-2026-1082',
    customer_name: 'Ayesha Tariq',
    whatsapp_phone: '+923001234567',
    address_line: 'House 42-B, Street 9, Phase 5 DHA',
    city: 'Lahore',
    subtotal_pkr: 950,
    shipping_fee_pkr: 250,
    total_amount_pkr: 1200,
    payment_method: 'EasyPaisa',
    transaction_id: 'EP-984712039',
    receipt_image_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
    items: [
      {
        product_id: 'prod-01',
        title: 'Sunburst Adjustable Ring',
        price_pkr: 950,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=300&q=80'
      }
    ],
    order_status: 'pending',
    created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    stock_decremented: false
  },
  {
    order_id: 'ORD-PK-2026-1079',
    customer_name: 'Bilal Farooq',
    whatsapp_phone: '+923219876543',
    address_line: 'Apartment 404, Clifton Block 2',
    city: 'Karachi',
    subtotal_pkr: 750,
    shipping_fee_pkr: 250,
    total_amount_pkr: 1000,
    payment_method: 'COD',
    items: [
      {
        product_id: 'prod-03',
        title: 'Golden Hoop Studs',
        price_pkr: 750,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1630019925601-99e00ae5b1a1?auto=format&fit=crop&w=300&q=80'
      }
    ],
    order_status: 'payment_verified',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    stock_decremented: false
  }
];

export const MERCHANT_CONFIG = {
  storeName: 'LC Atelier by Laraib Chouhdary',
  storeTagline: 'Adorn Yourself in Sparkle',
  whatsappNumber: '+923188942100',
  whatsappDisplay: '+92 318 8942100',
  currency: 'PKR',
  currencySymbol: 'Rs.',
  shippingFlatRate: 500,
  freeShippingThreshold: 5000, 
  paymentAccounts: {
    easypaisa: {
      accountTitle: 'Laraib Chouhdary',
      accountNumber: '0318 8942100',
      instructions: 'Open your EasyPaisa app -> Tap Send Money / Pay Till -> Enter 0318 8942100 or Till 549201 -> Enter total PKR -> Add Order ID in remarks -> Upload screenshot below.'
    },
    jazzcash: {
      accountTitle: 'Laraib Chouhdary',
      accountNumber: '0318 8942100',
      instructions: 'Open your JazzCash app -> Tap Money Transfer / Merchant Pay -> Enter 0318 8942100 -> Enter exact PKR amount -> Capture screenshot with TID.'
    }
  },
  majorCities: [
    'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
    'Peshawar', 'Multan', 'Quetta', 'Sialkot', 'Gujranwala',
    'Hyderabad', 'Abbottabad', 'Bahawalpur', 'Other Pakistan City','Mianwali','Bhakkar','Daryakhan'
  ]
};