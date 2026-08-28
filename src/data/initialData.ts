import { Product, Order } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-01',
    title: 'Maharani Polki Kundan Bridal Set',
    price_pkr: 42500,
    description: 'An opulent 22K antique gold-plated bridal set adorned with handcrafted uncut Polki stones, emerald quartz drops, and lustrous baroque pearls. Includes majestic choker, matching jhumkas, and intricate maang tikka.',
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=1000&q=80'
    ],
    stock_quantity: 3, // Low stock: triggers "Only 3 Left!"
    category: 'Bridal Sets',
    is_published: true,
    low_stock_threshold: 5,
    specs: {
      metalPurity: '22K Antique Gold Micro-Plating over Brass',
      stoneType: 'Hydro Emeralds, Uncut Polki, Basra Pearl Drops',
      weightGrams: 145,
      craftsmanship: 'Hand-strung with pure silk dori cord'
    }
  },
  {
    id: 'prod-02',
    title: 'Noor Emerald & Pearl Choker',
    price_pkr: 16800,
    description: 'Elegant Mughal-inspired collar choker featuring deep bottle-green emerald baguettes lined with delicate freshwater seed pearls. Perfect for festive soirees and mehndi occasions.',
    images: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=1000&q=80'
    ],
    stock_quantity: 4, // Low stock: triggers "Only 4 Left!"
    category: 'Necklaces & Chokers',
    is_published: true,
    low_stock_threshold: 5,
    specs: {
      metalPurity: '18K Yellow Gold Plating',
      stoneType: 'Faceted Emerald Simulants & Cultured Seed Pearls',
      weightGrams: 58,
      craftsmanship: 'Adjustable zari tassel closure'
    }
  },
  {
    id: 'prod-03',
    title: 'Chandbali Polki Jhumkas with Ruby Accents',
    price_pkr: 9500,
    description: 'Classic crescent Chandbali silhouette layered with intricate filigree, dangling pearls, and miniature cabochon ruby center stones. Lightweight yet dramatic statement earrings.',
    images: [
      'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1629224316810-9d8805b95e76?auto=format&fit=crop&w=1000&q=80'
    ],
    stock_quantity: 8, // Normal stock
    category: 'Earrings & Jhumkas',
    is_published: true,
    low_stock_threshold: 5,
    specs: {
      metalPurity: 'Brass with 24K Micron Gold Dip',
      stoneType: 'Kundan Glass, Ruby Quartz, Pearl Beads',
      weightGrams: 32,
      craftsmanship: 'Push-back clip mechanism with support loops'
    }
  },
  {
    id: 'prod-04',
    title: 'Gulrukh Meenakari Statement Ring',
    price_pkr: 5200,
    description: 'Cocktail oversized finger ring showcasing detailed Persian blue and crimson enamel Meenakari work on the reverse side with a radiant Moissanite polki centerpiece.',
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=1000&q=80'
    ],
    stock_quantity: 2, // Low stock: triggers "Only 2 Left!"
    category: 'Rings',
    is_published: true,
    low_stock_threshold: 5,
    specs: {
      metalPurity: 'Sterling Silver 925 Base',
      stoneType: 'Moissanite Polki & Hand Enamel (Meenakari)',
      weightGrams: 18,
      craftsmanship: 'Adjustable comfort-fit band'
    }
  },
  {
    id: 'prod-05',
    title: 'Zahra Filigree Kara Bangles (Pair)',
    price_pkr: 18500,
    description: 'A magnificent pair of traditional openable Karas embellished with open-cut lattice wirework, floral motifs, and bezel-set champagne zircon stones.',
    images: [
      'https://images.unsplash.com/photo-1611591477759-a29285223049?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1611591477840-025a1e7fce90?auto=format&fit=crop&w=1000&q=80'
    ],
    stock_quantity: 0, // SOLD OUT: triggers "Sold Out" tag and disabled add-to-cart
    category: 'Bangles & Bracelets',
    is_published: true,
    low_stock_threshold: 5,
    specs: {
      metalPurity: '22K Matte Gold Finish',
      stoneType: 'Champagne Cubic Zirconia',
      weightGrams: 74,
      craftsmanship: 'Screw clasp mechanism (Size 2.6 standard)'
    }
  },
  {
    id: 'prod-06',
    title: 'Afreen Solitaire Moissanite Pendant',
    price_pkr: 12900,
    description: 'A timeless 2.0 carat round brilliant Moissanite floating pendant nestled in a 6-prong platinum-plated silver cage, suspended on an Italian diamond-cut box chain.',
    images: [
      'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=1000&q=80'
    ],
    stock_quantity: 6, // Normal stock
    category: 'Pendants & Chains',
    is_published: true,
    low_stock_threshold: 5,
    specs: {
      metalPurity: '925 Sterling Silver with Rhodium Polish',
      stoneType: 'VVS1 Colorless Moissanite (GRA Certified)',
      weightGrams: 8.5,
      craftsmanship: '18-inch adjustable cable chain included'
    }
  },
  {
    id: 'prod-07',
    title: 'Daria Vintage Ghungroo Anklets (Payal)',
    price_pkr: 7800,
    description: 'Exquisite antique oxidized silver payal adorned with handcrafted tiny chime bells (ghungroos) and semi-precious turquoise stone inlays.',
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80'
    ],
    stock_quantity: 1, // Low stock: triggers "Only 1 Left!"
    category: 'Anklets',
    is_published: true,
    low_stock_threshold: 5,
    specs: {
      metalPurity: 'German Silver with Antique Patina',
      stoneType: 'Tibetan Turquoise Beads & Brass Bells',
      weightGrams: 45,
      craftsmanship: 'S-hook secure latch closure'
    }
  },
  {
    id: 'prod-08',
    title: 'Surayya Sapphire & Pearl Drop Mala',
    price_pkr: 24000,
    description: 'Multi-strand layered pearl mala necklace accented with royal blue sapphire cabochon connectors and delicate pearl fringe drops. Designed for royal wedding celebrations.',
    images: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=1000&q=80'
    ],
    stock_quantity: 5, // Low stock: triggers "Only 5 Left!"
    category: 'Necklaces & Chokers',
    is_published: true,
    low_stock_threshold: 5,
    specs: {
      metalPurity: '22K Gold Finish on Copper',
      stoneType: 'Royal Sapphire Simulants & Natural Oval Pearls',
      weightGrams: 90,
      craftsmanship: 'Hand-knotted triple thread strands'
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
    subtotal_pkr: 42500,
    shipping_fee_pkr: 0, // Free shipping on high value
    total_amount_pkr: 42500,
    payment_method: 'EasyPaisa',
    transaction_id: 'EP-984712039',
    receipt_image_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
    items: [
      {
        product_id: 'prod-01',
        title: 'Maharani Polki Kundan Bridal Set',
        price_pkr: 42500,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=300&q=80'
      }
    ],
    order_status: 'pending',
    created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    notes: 'Please double-check the necklace dori length before dispatching.',
    stock_decremented: false
  },
  {
    order_id: 'ORD-PK-2026-1079',
    customer_name: 'Bilal Farooq',
    whatsapp_phone: '+923219876543',
    address_line: 'Apartment 404, Clifton Block 2',
    city: 'Karachi',
    subtotal_pkr: 9500,
    shipping_fee_pkr: 250,
    total_amount_pkr: 9750,
    payment_method: 'COD',
    items: [
      {
        product_id: 'prod-03',
        title: 'Chandbali Polki Jhumkas with Ruby Accents',
        price_pkr: 9500,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=300&q=80'
      }
    ],
    order_status: 'payment_verified',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    stock_decremented: false
  }
];

export const MERCHANT_CONFIG = {
  storeName: 'Zariyah Fine Jewelry',
  storeTagline: 'Bespoke Handcrafted Pakistani Jewellery',
  whatsappNumber: '+923008765432', // Store Owner WhatsApp
  whatsappDisplay: '+92 300 8765432',
  currency: 'PKR',
  currencySymbol: 'Rs.',
  shippingFlatRate: 250,
  freeShippingThreshold: 15000,
  paymentAccounts: {
    easypaisa: {
      accountTitle: 'Zariyah Jewels Official',
      accountNumber: '0300-8765432',
      tillNumber: '549201',
      instructions: 'Open your EasyPaisa app -> Tap Send Money / Pay Till -> Enter 0300-8765432 or Till 549201 -> Enter total PKR -> Add Order ID in remarks -> Upload screenshot below.'
    },
    jazzcash: {
      accountTitle: 'Zariyah Jewels Official',
      accountNumber: '0301-8765432',
      tillNumber: '891044',
      instructions: 'Open your JazzCash app -> Tap Money Transfer / Merchant Pay -> Enter 0301-8765432 -> Enter exact PKR amount -> Capture screenshot with TID.'
    },
    cod: {
      description: 'Pay cash upon delivery to the courier rider at your doorstep. Please keep exact change ready for swift handover.'
    }
  },
  majorCities: [
    'Karachi',
    'Lahore',
    'Islamabad',
    'Rawalpindi',
    'Faisalabad',
    'Peshawar',
    'Multan',
    'Quetta',
    'Sialkot',
    'Gujranwala',
    'Hyderabad',
    'Abbottabad',
    'Bahawalpur',
    'Other Pakistan City'
  ]
};
