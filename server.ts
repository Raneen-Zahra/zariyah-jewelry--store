import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { INITIAL_PRODUCTS, INITIAL_ORDERS } from './src/data/initialData';
import { Product, Order, OrderStatus } from './src/types';
import 'dotenv/config';
import bcrypt from 'bcrypt'; // which package did you install for hashing?
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { MongoClient, Db } from 'mongodb';
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setServers(['1.1.1.1', '1.0.0.1']);
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

let db: Db;

async function connectToDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI || '');
  await client.connect();
  db = client.db(); // uses the database name from your connection string, or a default
  console.log('Connected to MongoDB Atlas');
}
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage() });

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
 app.get('/api/products', async (req: Request, res: Response) => {
  const products = await db.collection('products').find({}).toArray();
  res.json({ success: true, products });
});

  app.post('/api/products', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      title: req.body.title || 'Untitled Jewelry Piece',
      price_pkr: Number(req.body.price_pkr) || 0,
      description: req.body.description || '',
      images: Array.isArray(req.body.images) && req.body.images.length > 0
        ? req.body.images
        : [],
      stock_quantity: Number(req.body.stock_quantity) || 0,
      category: req.body.category || 'Rings',
      is_published: req.body.is_published !== undefined ? req.body.is_published : true,
      low_stock_threshold: Number(req.body.low_stock_threshold) || 5,
      specs: req.body.specs || {}
    };

    await db.collection('products').insertOne(newProduct);
    res.status(201).json({ success: true, product: newProduct });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid product payload' });
  }
});

app.post('/api/upload-image', requireAdminAuth, upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'atelier-products',
    });

    res.json({ success: true, url: result.secure_url });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload image' });
  }
});

  app.put('/api/products/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await db.collection('products').findOne({ id });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updatedFields = {
      ...req.body,
      price_pkr: req.body.price_pkr !== undefined ? Number(req.body.price_pkr) : existing.price_pkr,
      stock_quantity: req.body.stock_quantity !== undefined ? Number(req.body.stock_quantity) : existing.stock_quantity,
    };
    delete updatedFields._id; // MongoDB's internal ID can never be modified

    await db.collection('products').updateOne({ id }, { $set: updatedFields });
    const updatedProduct = await db.collection('products').findOne({ id });

    res.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
});

 app.delete('/api/products/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await db.collection('products').deleteOne({ id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
});
  // API Route: Orders
  app.get('/api/orders', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const orders = await db.collection('orders').find({}).sort({ created_at: -1 }).toArray();
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

  app.post('/api/orders', async (req: Request, res: Response) => {
  try {
    const {
      customer_name, whatsapp_phone, address_line, city,
      subtotal_pkr, shipping_fee_pkr, total_amount_pkr,
      payment_method, transaction_id, receipt_image_url, items, notes
    } = req.body;

    if (!customer_name || !whatsapp_phone || !address_line || !city || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'Missing required order fields' });
    }

    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newOrder: Order = {
      order_id: `ORD-PK-${year}-${randomNum}`,
      customer_name, whatsapp_phone, address_line, city,
      subtotal_pkr: Number(subtotal_pkr) || 0,
      shipping_fee_pkr: Number(shipping_fee_pkr) || 0,
      total_amount_pkr: Number(total_amount_pkr) || 0,
      payment_method: payment_method || 'COD',
      transaction_id: transaction_id || undefined,
      receipt_image_url: receipt_image_url || undefined,
      items,
      order_status: 'pending',
      created_at: new Date().toISOString(),
      notes: notes || undefined,
      stock_decremented: false
    };

    await db.collection('orders').insertOne(newOrder);
    res.status(201).json({ success: true, order: newOrder });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
});

  // API Route: Update Order Status & Decrement Stock on Confirmation (FR-07)
  app.put('/api/orders/:id/status', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: OrderStatus };

    const order = await db.collection('orders').findOne({ order_id: id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const prevStatus = order.order_status;
    let stockDecremented = order.stock_decremented;

    if (status === 'confirmed' && !order.stock_decremented) {
      for (const item of order.items) {
        await db.collection('products').updateOne(
          { id: item.product_id },
          { $inc: { stock_quantity: -item.quantity } }
        );
      }
      stockDecremented = true;
    }

    if (status === 'cancelled' && order.stock_decremented) {
      for (const item of order.items) {
        await db.collection('products').updateOne(
          { id: item.product_id },
          { $inc: { stock_quantity: item.quantity } }
        );
      }
      stockDecremented = false;
    }

    await db.collection('orders').updateOne(
      { order_id: id },
      { $set: { order_status: status, stock_decremented: stockDecremented } }
    );

    const updatedOrder = await db.collection('orders').findOne({ order_id: id });
    const products = await db.collection('products').find({}).toArray();

    res.json({
      success: true,
      order: updatedOrder,
      products,
      message: `Status updated from ${prevStatus} to ${status}`
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
});
  app.delete('/api/orders/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await db.collection('orders').deleteOne({ order_id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, message: 'Order deleted' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete order' });
  }
});

  // API Route: Admin Authentication (FR-08)
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per IP per window
    message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.post('/api/auth/login', loginLimiter, async (req: Request, res: Response) => {
    const { username, password } = req.body;

    const isUsernameValid = username === process.env.ADMIN_USERNAME; // which env variable holds the real username?

    const isPasswordValid = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH || '');
    if (isUsernameValid && isPasswordValid) {
      return res.json({
        success: true,
        user: {
          id: 'admin-owner-01',
          username: process.env.ADMIN_USERNAME, // reuse the same env var as above
          role: 'owner'
        },
        token: jwt.sign(
          { username: process.env.ADMIN_USERNAME, role: 'owner' },
          process.env.JWT_SECRET || '',
          { expiresIn: '8h' }
        ) // what should replace the fake static token, for now?
      });
    }

    res.status(401).json({ success: false, message: 'Invalid admin username or password' });
  });

  function requireAdminAuth(req: Request, res: Response, next: () => void) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
      jwt.verify(token, process.env.JWT_SECRET || '');
      next(); // Token is valid — let the request continue to the actual route
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
  }
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

    await connectToDatabase();
  console.log('Database name:', db.databaseName);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Zariyah Jewelry Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
