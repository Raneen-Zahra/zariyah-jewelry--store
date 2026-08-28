export type ProductCategory =
  | 'All'
  | 'Bridal Sets'
  | 'Necklaces & Chokers'
  | 'Earrings & Jhumkas'
  | 'Rings'
  | 'Bangles & Bracelets'
  | 'Pendants & Chains'
  | 'Anklets';

export interface Product {
  id: string;
  title: string;
  price_pkr: number;
  description: string;
  images: string[];
  stock_quantity: number;
  category: ProductCategory;
  is_published: boolean;
  low_stock_threshold: number; // default 5
  // Additional jewelry specifications for luxury display
  specs?: {
    metalPurity?: string; // e.g. "22K Gold Plated Brass", "925 Sterling Silver"
    stoneType?: string; // e.g. "Polki & Zambian Emeralds", "Natural Pearls"
    weightGrams?: number;
    craftsmanship?: string;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItemSummary {
  product_id: string;
  title: string;
  price_pkr: number;
  quantity: number;
  image: string;
}

export type PaymentMethod = 'COD' | 'EasyPaisa' | 'JazzCash';

export type OrderStatus =
  | 'pending'            // Pending Confirmation (Awaiting initial merchant contact)
  | 'payment_verified'   // Payment Verification (Transaction ID / Screenshot checked)
  | 'confirmed'          // Confirmed (Stock Decremented upon reaching this stage)
  | 'dispatched'         // Dispatched (With rider / courier tracking)
  | 'delivered'          // Delivered (Completed)
  | 'cancelled';         // Cancelled (Restock if was confirmed)

export interface Order {
  order_id: string;
  customer_name: string;
  whatsapp_phone: string;
  address_line: string;
  city: string;
  subtotal_pkr: number;
  shipping_fee_pkr: number;
  total_amount_pkr: number;
  payment_method: PaymentMethod;
  transaction_id?: string;
  receipt_image_url?: string;
  items: OrderItemSummary[];
  order_status: OrderStatus;
  created_at: string;
  notes?: string;
  stock_decremented?: boolean;
}

export interface AdminUser {
  id: string;
  username: string;
  role: 'owner' | 'staff'; // role is stored from launch; "owner" active for v1
}

export interface CheckoutFormData {
  customer_name: string;
  whatsapp_phone: string;
  address_line: string;
  city: string;
  payment_method: PaymentMethod;
  transaction_id: string;
  receipt_image_file: File | null;
  receipt_image_preview: string;
  notes: string;
}
