import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { INITIAL_PRODUCTS, INITIAL_ORDERS } from './src/data/initialData';
import { Product, Order, OrderStatus } from './src/types';
import 'dotenv/config';
import bcrypt from 'bcrypt'; // which package did you install for hashing?

// In-Memory Database for local & MVP runtime (Schema matches MongoDB M0 Document Specification)
let productsDb: Product[] = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
let ordersDb: Order[] = JSON.parse(JSON.stringify(INITIAL_ORDERS));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API Route: Health
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // API Route: Products
  app.get('/api/products', (req: Request, res: Response) => {
    res.json({ success: true, products: productsDb });
  });

  app.post('/api/products', (req: Request, res: Response) => {
    try {
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        title: req.body.title || 'Untitled Jewelry Piece',
        price_pkr: Number(req.body.price_pkr) || 0,
        description: req.body.description || '',
        images: Array.isArray(req.body.images) && req.body.images.length > 0
          ? req.body.images
          : ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80'],
        stock_quantity: Number(req.body.stock_quantity) || 0,
        category: req.body.category || 'Necklaces & Chokers',
        is_published: req.body.is_published !== undefined ? req.body.is_published : true,
        low_stock_threshold: Number(req.body.low_stock_threshold) || 5,
        specs: req.body.specs || {}
      };

      productsDb.unshift(newProduct);
      res.status(201).json({ success: true, product: newProduct });
    } catch (error) {
      res.status(400).json({ success: false, message: 'Invalid product payload' });
    }
  });

  app.put('/api/products/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = productsDb.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    productsDb[index] = {
      ...productsDb[index],
      ...req.body,
      price_pkr: req.body.price_pkr !== undefined ? Number(req.body.price_pkr) : productsDb[index].price_pkr,
      stock_quantity: req.body.stock_quantity !== undefined ? Number(req.body.stock_quantity) : productsDb[index].stock_quantity,
    };

    res.json({ success: true, product: productsDb[index] });
  });

  app.delete('/api/products/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    productsDb = productsDb.filter((p) => p.id !== id);
    res.json({ success: true, message: 'Product deleted' });
  });

  // API Route: Orders
  app.get('/api/orders', (req: Request, res: Response) => {
    // Sort newest first
    const sorted = [...ordersDb].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    res.json({ success: true, orders: sorted });
  });

  app.post('/api/orders', (req: Request, res: Response) => {
    try {
      const {
        customer_name,
        whatsapp_phone,
        address_line,
        city,
        subtotal_pkr,
        shipping_fee_pkr,
        total_amount_pkr,
        payment_method,
        transaction_id,
        receipt_image_url,
        items,
        notes
      } = req.body;

      if (!customer_name || !whatsapp_phone || !address_line || !city || !items || !items.length) {
        return res.status(400).json({ success: false, message: 'Missing required order fields' });
      }

      const year = new Date().getFullYear();
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const newOrder: Order = {
        order_id: `ORD-PK-${year}-${randomNum}`,
        customer_name,
        whatsapp_phone,
        address_line,
        city,
        subtotal_pkr: Number(subtotal_pkr) || 0,
        shipping_fee_pkr: Number(shipping_fee_pkr) || 0,
        total_amount_pkr: Number(total_amount_pkr) || 0,
        payment_method: payment_method || 'COD',
        transaction_id: transaction_id || undefined,
        receipt_image_url: receipt_image_url || undefined,
        items,
        order_status: 'pending', // Starts as Pending Confirmation (FR-03 & Lifecycle)
        created_at: new Date().toISOString(),
        notes: notes || undefined,
        stock_decremented: false
      };

      ordersDb.unshift(newOrder);
      res.status(201).json({ success: true, order: newOrder });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to create order' });
    }
  });

  // API Route: Update Order Status & Decrement Stock on Confirmation (FR-07)
  app.put('/api/orders/:id/status', (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body as { status: OrderStatus };

    const orderIndex = ordersDb.findIndex((o) => o.order_id === id);
    if (orderIndex === -1) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const order = ordersDb[orderIndex];
    const prevStatus = order.order_status;

    // Stock decrement logic: Decrement stock ONLY when transition to 'confirmed'
    if (status === 'confirmed' && !order.stock_decremented) {
      order.items.forEach((item) => {
        const prod = productsDb.find((p) => p.id === item.product_id);
        if (prod) {
          prod.stock_quantity = Math.max(0, prod.stock_quantity - item.quantity);
        }
      });
      order.stock_decremented = true;
    }

    // If order is cancelled after being confirmed, restore stock
    if (status === 'cancelled' && order.stock_decremented) {
      order.items.forEach((item) => {
        const prod = productsDb.find((p) => p.id === item.product_id);
        if (prod) {
          prod.stock_quantity += item.quantity;
        }
      });
      order.stock_decremented = false;
    }

    order.order_status = status;
    ordersDb[orderIndex] = order;

    res.json({
      success: true,
      order,
      products: productsDb,
      message: `Status updated from ${prevStatus} to ${status}`
    });
  });

  // API Route: Admin Authentication (FR-08)
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    const { username, password } = req.body;

    const isUsernameValid = username === process.env.ADMIN_USERNAME; // which env variable holds the real username?

    const isPasswordValid = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH || '');
    // ^ which bcrypt method compares a plain password against a hash?
    // ^ which env variable holds the hash?
    console.log('DEBUG — env username:', JSON.stringify(process.env.ADMIN_USERNAME));
    console.log('DEBUG — received username:', JSON.stringify(username));
    console.log('DEBUG — username match:', isUsernameValid);
    console.log('DEBUG — password match:', isPasswordValid);

    if (isUsernameValid && isPasswordValid) {
      return res.json({
        success: true,
        user: {
          id: 'admin-owner-01',
          username: process.env.ADMIN_USERNAME, // reuse the same env var as above
          role: 'owner'
        },
        token: `temp-session-${Date.now()}` // what should replace the fake static token, for now?
      });
    }

    res.status(401).json({ success: false, message: 'Invalid admin username or password' });
  });

  // Vite middleware setup for Development vs Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Zariyah Jewelry Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
