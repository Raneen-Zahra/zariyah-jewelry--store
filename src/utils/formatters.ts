import { Order } from '../types';
import { MERCHANT_CONFIG } from '../data/initialData';

/**
 * Format currency strictly in PKR (Rs.) as mandated by PRD
 */
export function formatPKR(amount: number): string {
  if (isNaN(amount)) return 'Rs. 0';
  return `Rs. ${Math.round(amount).toLocaleString('en-PK')}`;
}

/**
 * Normalize Pakistani phone numbers for wa.me deep links
 * Handles 03001234567, +923001234567, 923001234567, 0300-1234567
 */
export function cleanPhoneNumberForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('92')) {
    return digits;
  }
  if (digits.startsWith('0')) {
    return `92${digits.slice(1)}`;
  }
  if (digits.length === 10 && digits.startsWith('3')) {
    return `92${digits}`;
  }
  return digits || '923000000000';
}

/**
 * Generate deep-link for Admin -> Customer Order Confirmation (FR-05)
 */
export function getAdminConfirmationWhatsAppLink(order: Order): string {
  const phone = cleanPhoneNumberForWhatsApp(order.whatsapp_phone);
  const itemsText = order.items
    .map((item) => `• ${item.title} (Qty: ${item.quantity}) - ${formatPKR(item.price_pkr * item.quantity)}`)
    .join('\n');

  const text = 
`✨ *${MERCHANT_CONFIG.storeName} - Order Verification* ✨

Salam *${order.customer_name}*,

Thank you for shopping with us! We have received your order *#${order.order_id}*.

🛍️ *Order Breakdown:*
${itemsText}
📦 Shipping: ${order.shipping_fee_pkr === 0 ? 'FREE' : formatPKR(order.shipping_fee_pkr)}
💰 *Grand Total:* *${formatPKR(order.total_amount_pkr)}*
💳 *Payment:* ${order.payment_method}${order.transaction_id ? ` (TID: ${order.transaction_id})` : ''}

📍 *Delivery Address:*
${order.address_line}, ${order.city}

👉 *Please reply with "CONFIRM"* if your delivery details are accurate so we can process and dispatch your handcrafted pieces.`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

/**
 * Generate deep-link for Admin -> Customer Stock Exceeded / Oversell Apology (Section 3.1)
 */
export function getAdminStockApologyWhatsAppLink(order: Order, customItemName?: string): string {
  const phone = cleanPhoneNumberForWhatsApp(order.whatsapp_phone);
  const itemName = customItemName || (order.items[0]?.title ?? 'an item from your cart');

  const text =
`✨ *${MERCHANT_CONFIG.storeName} - Stock Notification* ✨

Salam *${order.customer_name}*,

Thank you for choosing *${MERCHANT_CONFIG.storeName}* for your order *#${order.order_id}*.

We wanted to personally inform you that *${itemName}* experienced an unexpected rush and our available artisan inventory was claimed just before final confirmation.

We sincerely apologize for this inconvenience! We would love to make this right for you. Would you like to:
1️⃣ *Select an alternative* piece from our collection (with complimentary priority shipping)
2️⃣ *Pre-order for bespoke artisan crafting* (approx 4-6 days dispatch)
3️⃣ *Modify or cancel* this specific item?

Please let us know how you would prefer to proceed. We are here to assist you!`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

/**
 * Generate deep-link for Admin -> Customer Dispatch Notice
 */
export function getAdminDispatchWhatsAppLink(order: Order, trackingNumber: string = 'EXP-PK-7821'): string {
  const phone = cleanPhoneNumberForWhatsApp(order.whatsapp_phone);

  const text =
`✨ *${MERCHANT_CONFIG.storeName} - Order Dispatched!* 🚚

Salam *${order.customer_name}*,

Delighted to inform you that your handcrafted jewelry order *#${order.order_id}* has been securely packed and dispatched via Express Courier!

📦 *Tracking Number:* ${trackingNumber}
🏠 *Destination:* ${order.city}
💵 *Amount to Pay:* ${order.payment_method === 'COD' ? formatPKR(order.total_amount_pkr) : 'PAID (' + order.payment_method + ')'}

Expected delivery is within 24-48 hours. Please inspect the parcel upon arrival. Thank you for your trust!`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

/**
 * Generate deep-link for Customer -> Store Fast-Track / Edit CTA (Section 4)
 */
export function getCustomerFastTrackWhatsAppLink(order: Order): string {
  const storePhone = cleanPhoneNumberForWhatsApp(MERCHANT_CONFIG.whatsappNumber);

  const text =
`Salam *${MERCHANT_CONFIG.storeName}*! ✨

I just placed Order *#${order.order_id}* on your website for *${formatPKR(order.total_amount_pkr)}*.

👤 *Name:* ${order.customer_name}
📍 *City:* ${order.city}
💳 *Payment:* ${order.payment_method}

I would like to confirm my order and fast-track dispatch. Please let me know the status!`;

  return `https://wa.me/${storePhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Helper to generate order IDs like ORD-PK-2026-8492
 */
export function generateOrderId(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `ORD-PK-${year}-${randomNum}`;
}
