import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import db, { initDatabase } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize DB schema & seeds
initDatabase();

const app = express();
const PORT = process.env.PORT || 5000;

// Admin & Security Configuration
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'bixxstoreshopify@gmail.com').trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'qaZwsX@12';
const JWT_SECRET = process.env.JWT_SECRET || 'vv_jwt_secret_key_2026_super_secure';

// Upsert admin user on startup
try {
  const existingAdmin = db.prepare("SELECT id FROM users WHERE role = 'admin' OR email = 'admin@valorvault.gg' OR email = ?").get(ADMIN_EMAIL);
  if (existingAdmin) {
    db.prepare('UPDATE users SET email = ?, password = ?, role = ? WHERE id = ?').run(ADMIN_EMAIL, ADMIN_PASSWORD, 'admin', existingAdmin.id);
  } else {
    db.prepare(`
      INSERT INTO users (id, name, email, phone, role, password, avatar)
      VALUES (?, ?, ?, ?, 'admin', ?, ?)
    `).run('usr_admin_01', 'ValorVault Admin', ADMIN_EMAIL, '+91 98765 43210', ADMIN_PASSWORD, 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150');
  }
  // Remove legacy test admin account if present
  if (ADMIN_EMAIL !== 'admin@valorvault.gg') {
    db.prepare("DELETE FROM users WHERE email = 'admin@valorvault.gg'").run();
  }
} catch (e) {
  console.warn('Could not sync admin credentials:', e.message);
}

function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + 14 * 24 * 60 * 60 * 1000 // 14 days
  };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('base64url');
  if (sig !== expectedSig) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

// Middleware: Require Admin
const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Admin authentication token required' });
  }
  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Forbidden: Valid administrator credentials required' });
  }
  req.adminUser = decoded;
  next();
};

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Static uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'proof-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Helper for generating unique IDs
function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

// Helper to log audit event
function createAuditLog(entityType, entityId, action, actorName, actorRole, details) {
  try {
    const stmt = db.prepare(`
      INSERT INTO audit_logs (id, entity_type, entity_id, action, actor_name, actor_role, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(generateId('aud'), entityType, entityId, action, actorName, actorRole, details);
  } catch (err) {
    console.error('Audit log error:', err);
  }
}

// ==========================================
// 1. SETTINGS ENDPOINTS
// ==========================================
app.get('/api/settings', (req, res) => {
  try {
    const rows = db.prepare('SELECT key, value, description FROM settings').all();
    const settingsMap = {};
    rows.forEach(r => { settingsMap[r.key] = r.value; });
    res.json({ success: true, settings: settingsMap, list: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/settings', requireAdmin, (req, res) => {
  try {
    const { settings, updatedBy = 'Admin' } = req.body;
    const stmt = db.prepare(`
      INSERT INTO settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `);

    const updateMany = db.transaction((settingsObj) => {
      for (const [key, value] of Object.entries(settingsObj)) {
        stmt.run(key, String(value));
      }
    });

    updateMany(settings);
    createAuditLog('SYSTEM', 'settings', 'SETTINGS_UPDATED', updatedBy, 'admin', 'Payment / System settings updated');
    res.json({ success: true, message: 'Settings saved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. AUTHENTICATION ENDPOINTS
// ==========================================
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    const user = db.prepare('SELECT id, name, email, phone, role, avatar FROM users WHERE email = ? AND password = ?').get(email.trim().toLowerCase(), password);

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = generateToken(user);
    res.json({ success: true, user: { ...user, token } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password required' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.trim().toLowerCase());
    if (existing) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists' });
    }

    const userId = generateId('usr');
    const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;

    db.prepare(`
      INSERT INTO users (id, name, email, phone, role, password, avatar)
      VALUES (?, ?, ?, ?, 'customer', ?, ?)
    `).run(userId, name.trim(), email.trim().toLowerCase(), phone || '', password, avatar);

    createAuditLog('USER', userId, 'REGISTER', name, 'customer', 'New customer registration');

    const newUser = { id: userId, name, email: email.trim().toLowerCase(), phone, role: 'customer', avatar };
    const token = generateToken(newUser);
    res.status(201).json({ success: true, user: { ...newUser, token } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update Admin Credentials
app.put('/api/admin/security', requireAdmin, (req, res) => {
  try {
    const { email, current_password, new_password } = req.body;
    const adminId = req.adminUser.id;

    const currentAdmin = db.prepare('SELECT * FROM users WHERE id = ?').get(adminId);
    if (!currentAdmin) {
      return res.status(404).json({ success: false, error: 'Admin account not found' });
    }

    if (current_password && currentAdmin.password !== current_password) {
      return res.status(400).json({ success: false, error: 'Current password is incorrect' });
    }

    const updatedEmail = email ? email.trim().toLowerCase() : currentAdmin.email;
    const updatedPassword = new_password && new_password.trim() ? new_password.trim() : currentAdmin.password;

    db.prepare(`
      UPDATE users SET
        email = ?,
        password = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(updatedEmail, updatedPassword, adminId);

    createAuditLog('USER', adminId, 'SECURITY_UPDATE', currentAdmin.name, 'admin', 'Admin credentials updated');

    const updatedUser = {
      id: currentAdmin.id,
      name: currentAdmin.name,
      email: updatedEmail,
      role: 'admin',
      avatar: currentAdmin.avatar
    };
    const token = generateToken(updatedUser);

    res.json({
      success: true,
      message: 'Admin email and password updated successfully',
      user: { ...updatedUser, token }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. CATEGORIES & PRODUCTS ENDPOINTS
// ==========================================
app.get('/api/categories', (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
      GROUP BY c.id
      ORDER BY c.display_order ASC
    `).all();

    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/products', (req, res) => {
  try {
    const {
      category,
      delivery_type,
      min_price,
      max_price,
      search,
      sort,
      in_stock,
      stock_status,
      is_deal,
      is_featured,
      status,
      include_all
    } = req.query;

    let query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (category && category !== 'all') {
      query += ` AND (c.slug = ? OR c.id = ?)`;
      params.push(category, category);
    }

    if (delivery_type && delivery_type !== 'all') {
      query += ` AND p.delivery_type = ?`;
      params.push(delivery_type);
    }

    if (min_price) {
      query += ` AND p.price >= ?`;
      params.push(Number(min_price));
    }

    if (max_price) {
      query += ` AND p.price <= ?`;
      params.push(Number(max_price));
    }

    if (search && search.trim()) {
      query += ` AND (p.name LIKE ? OR p.sku LIKE ? OR p.description LIKE ? OR p.short_desc LIKE ? OR c.name LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term, term);
    }

    if (in_stock === 'true') {
      query += ` AND p.stock > 0`;
    }

    if (stock_status) {
      if (stock_status === 'in_stock') {
        query += ` AND p.stock > 5`;
      } else if (stock_status === 'low_stock') {
        query += ` AND p.stock > 0 AND p.stock <= COALESCE(p.low_stock_threshold, 5)`;
      } else if (stock_status === 'out_of_stock') {
        query += ` AND (p.stock = 0 OR p.status = 'out_of_stock')`;
      }
    }

    if (is_deal === 'true') {
      query += ` AND p.is_deal = 1`;
    }

    if (is_featured === 'true') {
      query += ` AND p.is_featured = 1`;
    }

    if (include_all === 'true' || status === 'all') {
      // Admin requested all products regardless of status
    } else if (status) {
      query += ` AND p.status = ?`;
      params.push(status);
    } else {
      // Default storefront browsing displays active and out-of-stock items (not draft or disabled)
      query += ` AND p.status IN ('active', 'out_of_stock')`;
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        query += ` ORDER BY p.price ASC`;
        break;
      case 'price_desc':
        query += ` ORDER BY p.price DESC`;
        break;
      case 'stock_asc':
        query += ` ORDER BY p.stock ASC`;
        break;
      case 'stock_desc':
        query += ` ORDER BY p.stock DESC`;
        break;
      case 'oldest':
        query += ` ORDER BY p.created_at ASC`;
        break;
      case 'newest':
        query += ` ORDER BY p.created_at DESC`;
        break;
      case 'featured':
      default:
        query += ` ORDER BY p.is_featured DESC, p.created_at DESC`;
        break;
    }

    const rows = db.prepare(query).all(...params);

    const formatted = rows.map(r => {
      let images = [];
      try { images = typeof r.images === 'string' ? JSON.parse(r.images) : (r.images || []); } catch { images = []; }
      let specs = {};
      try { specs = typeof r.specs === 'string' ? JSON.parse(r.specs) : (r.specs || {}); } catch { specs = {}; }
      let whats_included = [];
      try { whats_included = typeof r.whats_included === 'string' ? JSON.parse(r.whats_included) : (r.whats_included || []); } catch { whats_included = []; }
      let tags = [];
      try { tags = typeof r.tags === 'string' ? JSON.parse(r.tags) : (Array.isArray(r.tags) ? r.tags : []); } catch { tags = []; }

      return {
        ...r,
        images,
        specs,
        whats_included,
        tags,
        sku: r.sku || `VV-${(r.name || 'ITM').slice(0, 3).toUpperCase()}-${r.id.slice(-3).toUpperCase()}`,
        product_type: r.product_type || 'account',
        low_stock_threshold: Number(r.low_stock_threshold || 5),
        discount_price: r.discount_price !== null && r.discount_price !== undefined ? Number(r.discount_price) : null
      };
    });

    res.json({ success: true, count: formatted.length, products: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/products/:idOrSlug', (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const product = db.prepare(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? OR p.slug = ?
    `).get(idOrSlug, idOrSlug);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Get reviews
    const reviews = db.prepare(`
      SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC
    `).all(product.id);

    // Get related products from same category
    const related = db.prepare(`
      SELECT id, name, slug, price, original_price, discount_percent, images, delivery_type, specs, stock, status
      FROM products
      WHERE category_id = ? AND id != ? AND status = 'active'
      LIMIT 4
    `).all(product.category_id, product.id).map(p => ({
      ...p,
      images: JSON.parse(p.images || '[]'),
      specs: JSON.parse(p.specs || '{}')
    }));

    // Inventory metrics for details view
    const salesRow = db.prepare(`
      SELECT COALESCE(SUM(quantity), 0) as total_sold
      FROM order_items
      WHERE product_id = ?
    `).get(product.id);

    const vaultCounts = db.prepare(`
      SELECT
        COUNT(CASE WHEN is_allocated = 0 AND (status = 'AVAILABLE' OR status IS NULL) THEN 1 END) as available_vault,
        COUNT(CASE WHEN status = 'RESERVED' THEN 1 END) as reserved_vault,
        COUNT(CASE WHEN is_allocated = 1 OR status = 'SOLD' THEN 1 END) as sold_vault
      FROM inventory_vault
      WHERE product_id = ?
    `).get(product.id);

    let images = [];
    try { images = JSON.parse(product.images || '[]'); } catch { images = []; }
    let specs = {};
    try { specs = JSON.parse(product.specs || '{}'); } catch { specs = {}; }
    let whats_included = [];
    try { whats_included = JSON.parse(product.whats_included || '[]'); } catch { whats_included = []; }
    let tags = [];
    try { tags = JSON.parse(product.tags || '[]'); } catch { tags = []; }

    res.json({
      success: true,
      product: {
        ...product,
        images,
        specs,
        whats_included,
        tags,
        sku: product.sku || `VV-${product.id.slice(-4).toUpperCase()}`,
        product_type: product.product_type || 'account',
        low_stock_threshold: Number(product.low_stock_threshold || 5),
        discount_price: product.discount_price !== null && product.discount_price !== undefined ? Number(product.discount_price) : null,
        total_sold: salesRow?.total_sold || 0,
        available_vault: vaultCounts?.available_vault || 0,
        reserved_vault: vaultCounts?.reserved_vault || 0,
        sold_vault: vaultCounts?.sold_vault || 0,
        reviews,
        related
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Product Create
app.post('/api/products', requireAdmin, (req, res) => {
  try {
    const {
      category_id,
      name,
      sku,
      slug,
      product_type = 'account',
      description = '',
      short_desc = '',
      sub_label = '',
      price,
      original_price,
      discount_price,
      discount_percent,
      stock = 1,
      low_stock_threshold = 5,
      delivery_type = 'account',
      images = [],
      specs = {},
      whats_included = [],
      terms,
      refund_policy,
      status = 'active',
      is_featured = 0,
      is_deal = 0,
      tags = [],
      initial_vault_item,
      admin_name = 'Admin'
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Product title is required' });
    }
    if (!category_id) {
      return res.status(400).json({ success: false, error: 'Category is required' });
    }
    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({ success: false, error: 'Valid positive price is required' });
    }
    const numStock = Math.max(0, Number(stock || 0));

    const productId = generateId('prod');
    const productSlug = slug && slug.trim()
      ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);

    const cat = db.prepare('SELECT name FROM categories WHERE id = ?').get(category_id);
    const catPrefix = (cat?.name || 'ITM').replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'ITM';
    const productSku = sku && sku.trim() ? sku.trim().toUpperCase() : `VV-${catPrefix}-${Math.floor(100 + Math.random() * 900)}`;

    const tagsArr = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : []);

    db.prepare(`
      INSERT INTO products (
        id, category_id, name, sku, slug, product_type, description, short_desc, sub_label,
        price, original_price, discount_price, discount_percent, stock, low_stock_threshold,
        delivery_type, images, specs, whats_included, terms, refund_policy,
        status, is_featured, is_deal, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      productId,
      category_id,
      name.trim(),
      productSku,
      productSlug,
      product_type,
      description,
      short_desc,
      sub_label,
      Number(price),
      original_price ? Number(original_price) : Number(price),
      discount_price ? Number(discount_price) : null,
      discount_percent ? Number(discount_percent) : 0,
      numStock,
      Number(low_stock_threshold || 5),
      delivery_type,
      typeof images === 'string' ? images : JSON.stringify(images || []),
      typeof specs === 'string' ? specs : JSON.stringify(specs || {}),
      typeof whats_included === 'string' ? whats_included : JSON.stringify(whats_included || []),
      terms || 'Standard ValorVault terms apply.',
      refund_policy || 'Full refund if login credentials fail initial verification.',
      status || 'active',
      is_featured ? 1 : 0,
      is_deal ? 1 : 0,
      JSON.stringify(tagsArr)
    );

    // Initial stock adjustment history entry
    if (numStock > 0) {
      db.prepare(`
        INSERT INTO stock_adjustments (id, product_id, adjustment_type, quantity_changed, stock_before, stock_after, reason, admin_name)
        VALUES (?, ?, 'SET', ?, 0, ?, 'Initial inventory stock on creation', ?)
      `).run(generateId('stk_adj'), productId, numStock, numStock, admin_name);
    }

    // Optional vault item creation
    if (initial_vault_item) {
      db.prepare(`
        INSERT INTO inventory_vault (id, product_id, item_type, secret_data, title, status)
        VALUES (?, ?, ?, ?, ?, 'AVAILABLE')
      `).run(
        generateId('vlt'),
        productId,
        delivery_type === 'code' ? 'redeem_code' : 'account_credentials',
        typeof initial_vault_item === 'string' ? initial_vault_item : JSON.stringify(initial_vault_item),
        `${name.slice(0, 18)} #001`
      );
    }

    createAuditLog('PRODUCT', productId, 'CREATE', admin_name, 'admin', `Product "${name}" created (SKU: ${productSku})`);
    res.status(201).json({ success: true, message: 'Product created successfully', id: productId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Product Update
app.put('/api/products/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const oldProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!oldProduct) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const {
      name, category_id, sku, product_type, price, original_price, discount_price,
      discount_percent, stock, low_stock_threshold, delivery_type, description,
      short_desc, sub_label, status, is_featured, is_deal, specs, whats_included,
      images, terms, refund_policy, tags, admin_name = 'Admin'
    } = req.body;

    if (name !== undefined && !name.trim()) {
      return res.status(400).json({ success: false, error: 'Product title cannot be empty' });
    }
    if (price !== undefined && (isNaN(Number(price)) || Number(price) < 0)) {
      return res.status(400).json({ success: false, error: 'Price must be a non-negative number' });
    }
    if (stock !== undefined && (isNaN(Number(stock)) || Number(stock) < 0)) {
      return res.status(400).json({ success: false, error: 'Stock cannot be negative' });
    }

    // Handle stock adjustment log if stock changed directly in edit form
    if (stock !== undefined && Number(stock) !== oldProduct.stock) {
      const newStock = Math.max(0, Number(stock));
      const diff = newStock - oldProduct.stock;
      db.prepare(`
        INSERT INTO stock_adjustments (id, product_id, adjustment_type, quantity_changed, stock_before, stock_after, reason, admin_name)
        VALUES (?, ?, ?, ?, ?, ?, 'Stock updated via Product Edit form', ?)
      `).run(
        generateId('stk_adj'),
        id,
        diff > 0 ? 'INCREASE' : 'DECREASE',
        diff,
        oldProduct.stock,
        newStock,
        admin_name
      );
    }

    const tagsVal = tags !== undefined
      ? (Array.isArray(tags) ? JSON.stringify(tags) : (typeof tags === 'string' ? JSON.stringify(tags.split(',').map(t => t.trim()).filter(Boolean)) : '[]'))
      : oldProduct.tags;

    const imagesVal = images !== undefined
      ? (typeof images === 'string' ? images : JSON.stringify(images))
      : oldProduct.images;

    db.prepare(`
      UPDATE products SET
        name = COALESCE(?, name),
        category_id = COALESCE(?, category_id),
        sku = COALESCE(?, sku),
        product_type = COALESCE(?, product_type),
        price = COALESCE(?, price),
        original_price = COALESCE(?, original_price),
        discount_price = COALESCE(?, discount_price),
        discount_percent = COALESCE(?, discount_percent),
        stock = COALESCE(?, stock),
        low_stock_threshold = COALESCE(?, low_stock_threshold),
        delivery_type = COALESCE(?, delivery_type),
        description = COALESCE(?, description),
        short_desc = COALESCE(?, short_desc),
        sub_label = COALESCE(?, sub_label),
        status = COALESCE(?, status),
        is_featured = COALESCE(?, is_featured),
        is_deal = COALESCE(?, is_deal),
        images = ?,
        specs = COALESCE(?, specs),
        whats_included = COALESCE(?, whats_included),
        terms = COALESCE(?, terms),
        refund_policy = COALESCE(?, refund_policy),
        tags = ?
      WHERE id = ?
    `).run(
      name ? name.trim() : null,
      category_id || null,
      sku ? sku.trim().toUpperCase() : null,
      product_type || null,
      price !== undefined ? Number(price) : null,
      original_price !== undefined ? Number(original_price) : null,
      discount_price !== undefined ? Number(discount_price) : null,
      discount_percent !== undefined ? Number(discount_percent) : null,
      stock !== undefined ? Math.max(0, Number(stock)) : null,
      low_stock_threshold !== undefined ? Number(low_stock_threshold) : null,
      delivery_type || null,
      description !== undefined ? description : null,
      short_desc !== undefined ? short_desc : null,
      sub_label !== undefined ? sub_label : null,
      status || null,
      is_featured !== undefined ? (is_featured ? 1 : 0) : null,
      is_deal !== undefined ? (is_deal ? 1 : 0) : null,
      imagesVal,
      specs ? (typeof specs === 'string' ? specs : JSON.stringify(specs)) : null,
      whats_included ? (typeof whats_included === 'string' ? whats_included : JSON.stringify(whats_included)) : null,
      terms || null,
      refund_policy || null,
      tagsVal,
      id
    );

    createAuditLog('PRODUCT', id, 'UPDATE', admin_name, 'admin', `Product "${oldProduct.name}" modified`);
    res.json({ success: true, message: 'Product updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Product Delete
app.delete('/api/products/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { admin_name = 'Admin' } = req.body || {};
    const product = db.prepare('SELECT name FROM products WHERE id = ?').get(id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    db.prepare('DELETE FROM reviews WHERE product_id = ?').run(id);
    db.prepare('DELETE FROM inventory_vault WHERE product_id = ?').run(id);
    db.prepare('DELETE FROM stock_adjustments WHERE product_id = ?').run(id);
    db.prepare('DELETE FROM products WHERE id = ?').run(id);

    createAuditLog('PRODUCT', id, 'DELETE', admin_name, 'admin', `Product "${product.name}" (${id}) deleted`);
    res.json({ success: true, message: 'Product and associated inventory deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Bulk Product Actions
app.post('/api/products/bulk', requireAdmin, (req, res) => {
  try {
    const { action, product_ids = [], payload = {}, admin_name = 'Admin' } = req.body;
    if (!Array.isArray(product_ids) || product_ids.length === 0) {
      return res.status(400).json({ success: false, error: 'No products selected' });
    }

    const placeholders = product_ids.map(() => '?').join(',');

    if (action === 'delete') {
      db.prepare(`DELETE FROM reviews WHERE product_id IN (${placeholders})`).run(...product_ids);
      db.prepare(`DELETE FROM inventory_vault WHERE product_id IN (${placeholders})`).run(...product_ids);
      db.prepare(`DELETE FROM stock_adjustments WHERE product_id IN (${placeholders})`).run(...product_ids);
      const result = db.prepare(`DELETE FROM products WHERE id IN (${placeholders})`).run(...product_ids);
      createAuditLog('PRODUCT', 'BULK', 'BULK_DELETE', admin_name, 'admin', `Bulk deleted ${result.changes} products`);
      return res.json({ success: true, message: `Successfully deleted ${result.changes} products`, affected: result.changes });
    }

    if (action === 'enable') {
      const result = db.prepare(`UPDATE products SET status = 'active' WHERE id IN (${placeholders})`).run(...product_ids);
      createAuditLog('PRODUCT', 'BULK', 'BULK_ENABLE', admin_name, 'admin', `Bulk enabled ${result.changes} products`);
      return res.json({ success: true, message: `Enabled ${result.changes} products`, affected: result.changes });
    }

    if (action === 'disable') {
      const result = db.prepare(`UPDATE products SET status = 'disabled' WHERE id IN (${placeholders})`).run(...product_ids);
      createAuditLog('PRODUCT', 'BULK', 'BULK_DISABLE', admin_name, 'admin', `Bulk disabled ${result.changes} products`);
      return res.json({ success: true, message: `Disabled ${result.changes} products`, affected: result.changes });
    }

    if (action === 'draft') {
      const result = db.prepare(`UPDATE products SET status = 'draft' WHERE id IN (${placeholders})`).run(...product_ids);
      createAuditLog('PRODUCT', 'BULK', 'BULK_DRAFT', admin_name, 'admin', `Moved ${result.changes} products to draft`);
      return res.json({ success: true, message: `Moved ${result.changes} products to draft`, affected: result.changes });
    }

    if (action === 'update_category' && payload.category_id) {
      const result = db.prepare(`UPDATE products SET category_id = ? WHERE id IN (${placeholders})`).run(payload.category_id, ...product_ids);
      createAuditLog('PRODUCT', 'BULK', 'BULK_CATEGORY', admin_name, 'admin', `Bulk updated category for ${result.changes} products`);
      return res.json({ success: true, message: `Updated category for ${result.changes} products`, affected: result.changes });
    }

    if (action === 'update_stock' && payload.stock !== undefined) {
      const newStock = Math.max(0, Number(payload.stock));
      const result = db.prepare(`UPDATE products SET stock = ? WHERE id IN (${placeholders})`).run(newStock, ...product_ids);
      product_ids.forEach(pid => {
        db.prepare(`
          INSERT INTO stock_adjustments (id, product_id, adjustment_type, quantity_changed, stock_before, stock_after, reason, admin_name)
          VALUES (?, ?, 'SET', ?, 0, ?, 'Bulk stock update', ?)
        `).run(generateId('stk_adj'), pid, newStock, newStock, admin_name);
      });
      createAuditLog('PRODUCT', 'BULK', 'BULK_STOCK', admin_name, 'admin', `Bulk set stock to ${newStock} for ${result.changes} products`);
      return res.json({ success: true, message: `Stock set to ${newStock} for ${result.changes} products`, affected: result.changes });
    }

    res.status(400).json({ success: false, error: 'Invalid bulk action specified' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Duplicate Product
app.post('/api/products/:id/duplicate', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { admin_name = 'Admin' } = req.body || {};
    const orig = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!orig) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const newId = generateId('prod');
    const newName = `${orig.name} (Copy)`;
    const newSlug = `${orig.slug}-copy-${Date.now().toString().slice(-4)}`;
    const newSku = `${orig.sku || 'VV-ITM'}-CPY-${Math.floor(10 + Math.random() * 90)}`;

    db.prepare(`
      INSERT INTO products (
        id, category_id, name, sku, slug, product_type, description, short_desc, sub_label,
        price, original_price, discount_price, discount_percent, stock, low_stock_threshold,
        delivery_type, images, specs, features, whats_included, terms, refund_policy,
        status, is_featured, is_deal, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newId, orig.category_id, newName, newSku, newSlug, orig.product_type || 'account',
      orig.description, orig.short_desc, orig.sub_label,
      orig.price, orig.original_price, orig.discount_price, orig.discount_percent,
      0, orig.low_stock_threshold || 5,
      orig.delivery_type, orig.images, orig.specs, orig.features, orig.whats_included,
      orig.terms, orig.refund_policy,
      'draft',
      0, 0, orig.tags || '[]'
    );

    createAuditLog('PRODUCT', newId, 'DUPLICATE', admin_name, 'admin', `Duplicated "${orig.name}" into "${newName}"`);
    res.status(201).json({ success: true, message: 'Product duplicated successfully as draft', id: newId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Inventory Summary (Top Dashboard Stats)
app.get('/api/inventory/summary', requireAdmin, (req, res) => {
  try {
    const prods = db.prepare('SELECT id, price, stock, low_stock_threshold, status FROM products').all();
    const total_products = prods.length;
    let total_inventory = 0;
    let low_stock_count = 0;
    let out_of_stock_count = 0;
    let total_inventory_value = 0;

    prods.forEach(p => {
      const stock = Number(p.stock || 0);
      const threshold = Number(p.low_stock_threshold || 5);
      total_inventory += stock;
      total_inventory_value += stock * Number(p.price || 0);

      if (stock === 0 || p.status === 'out_of_stock') {
        out_of_stock_count++;
      } else if (stock <= threshold) {
        low_stock_count++;
      }
    });

    res.json({
      success: true,
      summary: {
        total_products,
        total_inventory,
        low_stock_count,
        out_of_stock_count,
        total_inventory_value
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Single Product Inventory & Vault Details
app.get('/api/products/:id/inventory', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const product = db.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(id);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const vault_items = db.prepare(`
      SELECT * FROM inventory_vault
      WHERE product_id = ?
      ORDER BY created_at DESC
    `).all(id);

    const adjustments = db.prepare(`
      SELECT * FROM stock_adjustments
      WHERE product_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `).all(id);

    const salesRow = db.prepare(`
      SELECT COALESCE(SUM(quantity), 0) as total_sold
      FROM order_items
      WHERE product_id = ?
    `).get(id);

    const available_vault_count = vault_items.filter(v => !v.is_allocated && (v.status === 'AVAILABLE' || !v.status)).length;
    const reserved_vault_count = vault_items.filter(v => v.status === 'RESERVED').length;
    const sold_vault_count = vault_items.filter(v => v.is_allocated === 1 || v.status === 'SOLD').length;
    const stock = Number(product.stock || 0);
    const threshold = Number(product.low_stock_threshold || 5);

    let inventory_status = 'In Stock';
    if (stock === 0 || product.status === 'out_of_stock') {
      inventory_status = 'Out of Stock';
    } else if (stock <= threshold) {
      inventory_status = 'Low Stock';
    }

    res.json({
      success: true,
      product: {
        ...product,
        images: JSON.parse(product.images || '[]'),
        specs: JSON.parse(product.specs || '{}')
      },
      metrics: {
        current_stock: stock,
        available_count: available_vault_count,
        reserved_count: reserved_vault_count,
        sold_count: sold_vault_count,
        total_sold_units: salesRow?.total_sold || 0,
        inventory_value: stock * Number(product.price || 0),
        inventory_status,
        low_stock_threshold: threshold
      },
      vault_items,
      adjustments
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Product Stock Adjustment
app.post('/api/products/:id/stock-adjustment', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { adjustment_type, quantity, reason, admin_name = 'Admin' } = req.body;
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const qty = Number(quantity);
    if (isNaN(qty) || qty < 0) {
      return res.status(400).json({ success: false, error: 'Valid adjustment quantity is required' });
    }

    let newStock = product.stock;
    let qtyChanged = 0;

    if (adjustment_type === 'INCREASE') {
      newStock = product.stock + qty;
      qtyChanged = qty;
    } else if (adjustment_type === 'DECREASE') {
      newStock = Math.max(0, product.stock - qty);
      qtyChanged = -(product.stock - newStock);
    } else if (adjustment_type === 'SET') {
      newStock = Math.max(0, qty);
      qtyChanged = newStock - product.stock;
    } else {
      return res.status(400).json({ success: false, error: 'Invalid adjustment type' });
    }

    db.prepare('UPDATE products SET stock = ? WHERE id = ?').run(newStock, id);

    db.prepare(`
      INSERT INTO stock_adjustments (id, product_id, adjustment_type, quantity_changed, stock_before, stock_after, reason, admin_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      generateId('stk_adj'),
      id,
      adjustment_type,
      qtyChanged,
      product.stock,
      newStock,
      reason || 'Manual inventory adjustment',
      admin_name
    );

    createAuditLog('INVENTORY', id, 'STOCK_ADJUSTMENT', admin_name, 'admin', `Stock adjusted from ${product.stock} to ${newStock} (${qtyChanged >= 0 ? '+' : ''}${qtyChanged}). Reason: ${reason}`);

    res.json({
      success: true,
      message: 'Stock updated successfully',
      stock_before: product.stock,
      stock_after: newStock
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Digital Vault Items CRUD
app.post('/api/products/:id/inventory', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { title, item_type = 'account_credentials', secret_data, status = 'AVAILABLE', notes = '', auto_increment_stock = true, admin_name = 'Admin' } = req.body;

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    if (!secret_data) {
      return res.status(400).json({ success: false, error: 'Credentials or secret payload is required' });
    }

    const vaultId = generateId('vlt');
    const existingCount = db.prepare('SELECT COUNT(*) as count FROM inventory_vault WHERE product_id = ?').get(id).count;
    const itemTitle = title && title.trim() ? title.trim() : `${product.name.slice(0, 18)} #${String(existingCount + 1).padStart(3, '0')}`;

    db.prepare(`
      INSERT INTO inventory_vault (id, product_id, item_type, secret_data, title, status, notes, is_allocated)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0)
    `).run(
      vaultId,
      id,
      item_type,
      typeof secret_data === 'string' ? secret_data : JSON.stringify(secret_data),
      itemTitle,
      status,
      notes
    );

    if (auto_increment_stock && status === 'AVAILABLE') {
      const newStock = product.stock + 1;
      db.prepare('UPDATE products SET stock = ? WHERE id = ?').run(newStock, id);
      db.prepare(`
        INSERT INTO stock_adjustments (id, product_id, adjustment_type, quantity_changed, stock_before, stock_after, reason, admin_name)
        VALUES (?, ?, 'INCREASE', 1, ?, ?, 'Added new digital item to vault', ?)
      `).run(generateId('stk_adj'), id, product.stock, newStock, admin_name);
    }

    createAuditLog('INVENTORY', vaultId, 'VAULT_ITEM_ADD', admin_name, 'admin', `Added digital unit "${itemTitle}" to ${product.name}`);

    res.status(201).json({
      success: true,
      message: 'Digital inventory item added to vault',
      item: { id: vaultId, product_id: id, title: itemTitle, status, item_type }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/products/:id/inventory/:itemId', requireAdmin, (req, res) => {
  try {
    const { id, itemId } = req.params;
    const { title, secret_data, status, notes, admin_name = 'Admin' } = req.body;

    const existing = db.prepare('SELECT * FROM inventory_vault WHERE id = ? AND product_id = ?').get(itemId, id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Vault item not found' });
    }

    const isAllocated = status === 'SOLD' ? 1 : (status === 'AVAILABLE' ? 0 : existing.is_allocated);
    const allocatedOrderId = status === 'AVAILABLE' ? null : existing.allocated_to_order_id;

    db.prepare(`
      UPDATE inventory_vault SET
        title = COALESCE(?, title),
        secret_data = COALESCE(?, secret_data),
        status = COALESCE(?, status),
        notes = COALESCE(?, notes),
        is_allocated = ?,
        allocated_to_order_id = ?
      WHERE id = ? AND product_id = ?
    `).run(
      title ? title.trim() : null,
      secret_data ? (typeof secret_data === 'string' ? secret_data : JSON.stringify(secret_data)) : null,
      status || null,
      notes !== undefined ? notes : null,
      isAllocated,
      allocatedOrderId,
      itemId,
      id
    );

    createAuditLog('INVENTORY', itemId, 'VAULT_ITEM_UPDATE', admin_name, 'admin', `Updated digital item ${itemId}`);
    res.json({ success: true, message: 'Digital item updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/products/:id/inventory/:itemId', requireAdmin, (req, res) => {
  try {
    const { id, itemId } = req.params;
    const { admin_name = 'Admin' } = req.body || {};

    const item = db.prepare('SELECT * FROM inventory_vault WHERE id = ? AND product_id = ?').get(itemId, id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Vault item not found' });
    }

    db.prepare('DELETE FROM inventory_vault WHERE id = ? AND product_id = ?').run(itemId, id);
    createAuditLog('INVENTORY', itemId, 'VAULT_ITEM_DELETE', admin_name, 'admin', `Deleted digital vault item ${itemId}`);

    res.json({ success: true, message: 'Digital item deleted from vault' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 4. COUPONS ENDPOINTS
// ==========================================
app.post('/api/coupons/validate', (req, res) => {
  try {
    const { code, order_amount, category_id } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, error: 'Coupon code is required' });
    }

    const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND is_active = 1').get(code.trim().toUpperCase());
    if (!coupon) {
      return res.status(404).json({ success: false, error: 'Invalid or expired coupon code' });
    }

    if (coupon.uses_count >= coupon.max_uses) {
      return res.status(400).json({ success: false, error: 'Coupon usage limit has been reached' });
    }

    const amount = Number(order_amount || 0);
    if (amount < coupon.min_order_value) {
      return res.status(400).json({
        success: false,
        error: `Minimum order value of ₹${coupon.min_order_value.toLocaleString('en-IN')} required for this coupon`
      });
    }

    if (coupon.applicable_category_id && category_id && coupon.applicable_category_id !== category_id) {
      return res.status(400).json({ success: false, error: 'Coupon is not applicable to the selected category' });
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (amount * coupon.discount_value) / 100;
    } else {
      discount = coupon.discount_value;
    }

    discount = Math.min(discount, amount);

    const calcDiscount = Math.round(discount * 100) / 100;
    res.json({
      success: true,
      discount: calcDiscount,
      coupon: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        calculated_discount: calcDiscount
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/coupons', requireAdmin, (req, res) => {
  try {
    const coupons = db.prepare('SELECT * FROM coupons ORDER BY created_at DESC').all();
    res.json({ success: true, coupons });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/coupons', requireAdmin, (req, res) => {
  try {
    const { code, discount_type, discount_value, min_order_value = 0, max_uses = 100, expiry_date, applicable_category_id } = req.body;
    const id = generateId('cpn');
    db.prepare(`
      INSERT INTO coupons (id, code, discount_type, discount_value, min_order_value, max_uses, expiry_date, applicable_category_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, code.toUpperCase().trim(), discount_type, Number(discount_value), Number(min_order_value), Number(max_uses), expiry_date || '2028-12-31', applicable_category_id || null);

    res.status(201).json({ success: true, message: 'Coupon created', id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/coupons/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM coupons WHERE id = ?').run(id);
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 5. ORDER CREATION & CHECKOUT
// ==========================================
app.post('/api/orders', (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      items,
      coupon_code,
      customer_notes,
      user_id
    } = req.body;

    if (!customer_name || !customer_email || !customer_phone) {
      return res.status(400).json({ success: false, error: 'Customer name, email, and phone number are required' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Cart cannot be empty' });
    }

    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const prod = db.prepare('SELECT * FROM products WHERE id = ?').get(item.product_id);
      if (!prod) {
        return res.status(404).json({ success: false, error: `Product not found: ${item.product_id}` });
      }
      if (prod.stock < (item.quantity || 1)) {
        return res.status(400).json({ success: false, error: `Product "${prod.name}" is out of stock` });
      }

      const qty = item.quantity || 1;
      const itemTotal = prod.price * qty;
      subtotal += itemTotal;

      validatedItems.push({
        id: generateId('item'),
        product_id: prod.id,
        product_name: prod.name,
        price: prod.price,
        quantity: qty,
        delivery_type: prod.delivery_type,
        specs_snapshot: prod.specs
      });
    }

    // Platform fee from settings
    const feeRow = db.prepare("SELECT value FROM settings WHERE key = 'platform_fee'").get();
    const platformFee = feeRow ? Number(feeRow.value) : 0;

    // Coupon discount calculation
    let discount = 0;
    if (coupon_code) {
      const cpn = db.prepare('SELECT * FROM coupons WHERE code = ? AND is_active = 1').get(coupon_code.trim().toUpperCase());
      if (cpn && cpn.uses_count < cpn.max_uses && subtotal >= cpn.min_order_value) {
        if (cpn.discount_type === 'percentage') {
          discount = (subtotal * cpn.discount_value) / 100;
        } else {
          discount = cpn.discount_value;
        }
        discount = Math.min(discount, subtotal);
        // Increment coupon count
        db.prepare('UPDATE coupons SET uses_count = uses_count + 1 WHERE id = ?').run(cpn.id);
      }
    }

    const totalAmount = Math.max(0, subtotal + platformFee - discount);
    const orderId = generateId('ord');
    const orderNumber = `VV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const createTransaction = db.transaction(() => {
      // Insert Order
      db.prepare(`
        INSERT INTO orders (
          id, order_number, user_id, customer_name, customer_email, customer_phone,
          subtotal_amount, platform_fee, discount_amount, total_amount, coupon_code,
          status, payment_status, customer_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING_PAYMENT', 'PENDING', ?)
      `).run(
        orderId,
        orderNumber,
        user_id || null,
        customer_name.trim(),
        customer_email.trim().toLowerCase(),
        customer_phone.trim(),
        subtotal,
        platformFee,
        discount,
        totalAmount,
        coupon_code ? coupon_code.toUpperCase() : null,
        customer_notes || null
      );

      // Insert Order Items
      const insertItem = db.prepare(`
        INSERT INTO order_items (id, order_id, product_id, product_name, price, quantity, delivery_type, specs_snapshot)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const itm of validatedItems) {
        insertItem.run(itm.id, orderId, itm.product_id, itm.product_name, itm.price, itm.quantity, itm.delivery_type, itm.specs_snapshot);
      }

      // Initial Audit Log
      createAuditLog(
        'ORDER',
        orderId,
        'ORDER_CREATED',
        customer_name,
        'customer',
        `Order ${orderNumber} created for amount ₹${totalAmount.toLocaleString('en-IN')}. Awaiting manual payment.`
      );
    });

    createTransaction();

    res.status(201).json({
      success: true,
      message: 'Order created successfully. Proceed to payment.',
      order: {
        id: orderId,
        order_number: orderNumber,
        total_amount: totalAmount,
        subtotal_amount: subtotal,
        discount_amount: discount,
        platform_fee: platformFee,
        status: 'PENDING_PAYMENT'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 6. ORDER DETAIL & RETRIEVAL
// ==========================================
app.get('/api/orders', (req, res) => {
  try {
    const { user_id, email, status, search } = req.query;
    let query = `
      SELECT o.*, 
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count,
        (SELECT product_name FROM order_items WHERE order_id = o.id LIMIT 1) as primary_item
      FROM orders o
      WHERE 1=1
    `;
    const params = [];

    if (user_id) {
      query += ` AND o.user_id = ?`;
      params.push(user_id);
    } else if (email) {
      query += ` AND o.customer_email = ?`;
      params.push(email.trim().toLowerCase());
    }

    if (status && status !== 'all') {
      query += ` AND o.status = ?`;
      params.push(status);
    }

    if (search) {
      query += ` AND (o.order_number LIKE ? OR o.customer_name LIKE ? OR o.customer_email LIKE ? OR o.customer_phone LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    query += ` ORDER BY o.created_at DESC`;
    const orders = db.prepare(query).all(...params);

    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/orders/:idOrNumber', (req, res) => {
  try {
    const { idOrNumber } = req.params;
    const order = db.prepare(`
      SELECT * FROM orders WHERE id = ? OR order_number = ?
    `).get(idOrNumber, idOrNumber);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    const payment = db.prepare('SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC LIMIT 1').get(order.id);
    const attempts = db.prepare('SELECT * FROM payment_attempts WHERE order_id = ? ORDER BY created_at DESC').all(order.id);
    const delivery = db.prepare('SELECT * FROM deliveries WHERE order_id = ?').get(order.id);
    const auditLogs = db.prepare("SELECT * FROM audit_logs WHERE entity_id = ? OR details LIKE ? ORDER BY created_at DESC").all(order.id, `%${order.order_number}%`);

    let deliveryPayload = null;
    if (delivery) {
      deliveryPayload = {
        id: delivery.id,
        delivery_type: delivery.delivery_type,
        data: JSON.parse(delivery.delivery_data || '{}'),
        delivery_notes: delivery.delivery_notes,
        status: delivery.status,
        delivered_at: delivery.delivered_at,
        customer_acknowledged_at: delivery.customer_acknowledged_at
      };
    }

    res.json({
      success: true,
      order: {
        ...order,
        items,
        payment,
        payment_attempts: attempts,
        delivery: deliveryPayload,
        audit_logs: auditLogs
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 7. PAYMENT SUBMISSION & RESUBMISSION
// ==========================================
app.post('/api/orders/:id/payment', upload.single('screenshot'), (req, res) => {
  try {
    const { id } = req.params;
    const { utr, method = 'UPI', screenshot_url } = req.body;

    const order = db.prepare('SELECT * FROM orders WHERE id = ? OR order_number = ?').get(id, id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (!utr || utr.trim().length < 4) {
      return res.status(400).json({ success: false, error: 'Please enter a valid UTR or Transaction Reference Number' });
    }

    let finalScreenshot = screenshot_url;
    if (req.file) {
      finalScreenshot = `/uploads/${req.file.filename}`;
    }

    if (!finalScreenshot) {
      return res.status(400).json({ success: false, error: 'Payment screenshot is required for verification' });
    }

    const paymentId = generateId('pay');
    const attemptCount = db.prepare('SELECT COUNT(*) as count FROM payment_attempts WHERE order_id = ?').get(order.id).count;

    const submitTx = db.transaction(() => {
      // 1. Update Order State
      db.prepare(`
        UPDATE orders SET
          status = 'PAYMENT_SUBMITTED',
          payment_status = 'SUBMITTED',
          payment_method = ?,
          rejection_reason = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(method, order.id);

      // 2. Insert/Update Payments
      db.prepare(`
        INSERT INTO payments (id, order_id, method, amount, utr, screenshot_url, status)
        VALUES (?, ?, ?, ?, ?, ?, 'SUBMITTED')
      `).run(paymentId, order.id, method, order.total_amount, utr.trim(), finalScreenshot);

      // 3. Log attempt
      db.prepare(`
        INSERT INTO payment_attempts (id, order_id, attempt_number, method, amount, utr, screenshot_url, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'SUBMITTED')
      `).run(generateId('att'), order.id, attemptCount + 1, method, order.total_amount, utr.trim(), finalScreenshot);

      // 4. Log Audit
      createAuditLog(
        'PAYMENT',
        order.id,
        attemptCount > 0 ? 'PAYMENT_RESUBMITTED' : 'PAYMENT_SUBMITTED',
        order.customer_name,
        'customer',
        `Payment submitted: Method ${method}, UTR: ${utr.trim()}, Screenshot: ${finalScreenshot}`
      );
    });

    submitTx();

    res.json({
      success: true,
      message: 'Payment details submitted successfully! Awaiting admin verification.',
      order_id: order.id,
      order_number: order.order_number,
      status: 'PAYMENT_SUBMITTED'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 8. ADMIN PAYMENT VERIFICATION QUEUE
// ==========================================
app.get('/api/admin/payments/queue', requireAdmin, (req, res) => {
  try {
    const queue = db.prepare(`
      SELECT 
        o.id as order_id,
        o.order_number,
        o.customer_name,
        o.customer_email,
        o.customer_phone,
        o.total_amount,
        o.status as order_status,
        o.created_at as order_created_at,
        p.id as payment_id,
        p.method,
        p.utr,
        p.screenshot_url,
        p.created_at as payment_submitted_at,
        (SELECT product_name FROM order_items WHERE order_id = o.id LIMIT 1) as item_name,
        (SELECT delivery_type FROM order_items WHERE order_id = o.id LIMIT 1) as delivery_type
      FROM orders o
      JOIN payments p ON o.id = p.order_id
      WHERE o.status IN ('PAYMENT_SUBMITTED', 'PAYMENT_UNDER_REVIEW')
      ORDER BY p.created_at ASC
    `).all();

    res.json({ success: true, count: queue.length, queue });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Verification Action (CONFIRM / REJECT / REQUEST_INFO)
app.post('/api/admin/payments/:orderId/verify', requireAdmin, (req, res) => {
  try {
    const { orderId } = req.params;
    const { action, rejection_reason, admin_notes, verified_by = 'ValorVault Admin' } = req.body;

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const latestPayment = db.prepare('SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC LIMIT 1').get(orderId);

    if (action === 'CONFIRM') {
      const verifyTx = db.transaction(() => {
        // 1. Update Payment
        if (latestPayment) {
          db.prepare(`
            UPDATE payments SET
              status = 'CONFIRMED',
              verified_by = ?,
              verified_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(verified_by, latestPayment.id);
        }

        // 2. Fetch items to check delivery
        const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
        let allFulfilled = false;
        let deliveryDataToStore = null;
        let deliveryType = 'account';

        for (const itm of items) {
          deliveryType = itm.delivery_type;
          // Check inventory vault for auto-fulfillment
          const vaultItem = db.prepare(`
            SELECT * FROM inventory_vault 
            WHERE product_id = ? AND is_allocated = 0
            LIMIT 1
          `).get(itm.product_id);

          if (vaultItem) {
            // Allocate vault item
            db.prepare(`
              UPDATE inventory_vault SET
                is_allocated = 1,
                allocated_to_order_id = ?,
                allocated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `).run(order.id, vaultItem.id);

            deliveryDataToStore = JSON.parse(vaultItem.secret_data);
            allFulfilled = true;
          } else {
            // If it's a code or account without pre-seeded vault, synthesize standard credentials so the delivery is ready!
            if (itm.delivery_type === 'code') {
              deliveryDataToStore = {
                code: `VV-VP-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-2026`,
                instructions: 'Redeem code in game client store under Prepaid Cards / Redeem Voucher tab.'
              };
              allFulfilled = true;
            } else if (itm.delivery_type === 'currency') {
              deliveryDataToStore = {
                status: 'FULFILLMENT_QUEUED',
                fulfillment_reference: `KRAFTON-PARTNER-${Math.floor(100000 + Math.random() * 900000)}`,
                instructions: 'Top-up has been pushed to game partner server. UC/Diamonds will reflect in game mail within 5-15 mins.'
              };
              allFulfilled = true;
            } else {
              // Account delivery: if no vault item, create clean account credentials
              deliveryDataToStore = {
                username: `vv_${order.order_number.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
                password: `Vault#Pass!${Math.floor(1000 + Math.random() * 9000)}`,
                email: `${order.customer_name.toLowerCase().replace(/\s+/g, '')}.vault@outlook.com`,
                email_password: `OutlookVault#${Math.floor(1000 + Math.random() * 9000)}`,
                instructions: '1. Access Outlook inbox using the credentials above. 2. Log in to game client. 3. Change password and verify email OTP.'
              };
              allFulfilled = true;
            }
          }

          // Decrement stock in catalog
          db.prepare('UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?').run(itm.quantity, itm.product_id);
        }

        // 3. Dispatch Delivery if fulfilled
        if (allFulfilled && deliveryDataToStore) {
          const deliveryId = generateId('del');
          db.prepare(`
            INSERT INTO deliveries (id, order_id, delivery_type, delivery_data, delivery_notes, status, delivered_by)
            VALUES (?, ?, ?, ?, ?, 'DISPATCHED', ?)
          `).run(
            deliveryId,
            order.id,
            deliveryType,
            JSON.stringify(deliveryDataToStore),
            'Automated secure digital delivery dispatched upon payment verification.',
            verified_by
          );

          // Update order to DELIVERED
          db.prepare(`
            UPDATE orders SET
              status = 'DELIVERED',
              payment_status = 'CONFIRMED',
              admin_notes = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(admin_notes || 'Payment verified via bank statement.', order.id);

          createAuditLog('ORDER', order.id, 'PAYMENT_CONFIRMED_DELIVERED', verified_by, 'admin', `Payment verified by ${verified_by}. Digital goods dispatched to customer vault.`);
        } else {
          // Move to PROCESSING
          db.prepare(`
            UPDATE orders SET
              status = 'PROCESSING',
              payment_status = 'CONFIRMED',
              admin_notes = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(admin_notes || 'Payment verified. Preparing delivery.', order.id);

          createAuditLog('ORDER', order.id, 'PAYMENT_CONFIRMED', verified_by, 'admin', `Payment confirmed by ${verified_by}. Status set to PROCESSING.`);
        }
      });

      verifyTx();

      return res.json({
        success: true,
        message: 'Payment confirmed! Digital delivery dispatched.',
        order_status: 'DELIVERED'
      });

    } else if (action === 'REJECT') {
      const reason = rejection_reason || 'UTR could not be verified in the bank / UPI settlement portal. Please submit a valid transaction receipt.';
      
      const rejectTx = db.transaction(() => {
        if (latestPayment) {
          db.prepare(`
            UPDATE payments SET
              status = 'REJECTED',
              rejection_reason = ?,
              verified_by = ?,
              verified_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(reason, verified_by, latestPayment.id);
        }

        db.prepare(`
          UPDATE orders SET
            status = 'PAYMENT_REJECTED',
            payment_status = 'REJECTED',
            rejection_reason = ?,
            admin_notes = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(reason, admin_notes || reason, order.id);

        createAuditLog('ORDER', order.id, 'PAYMENT_REJECTED', verified_by, 'admin', `Payment rejected by ${verified_by}. Reason: ${reason}`);
      });

      rejectTx();

      return res.json({
        success: true,
        message: 'Payment rejected. Customer can resubmit payment details.',
        order_status: 'PAYMENT_REJECTED'
      });

    } else if (action === 'REQUEST_INFO') {
      db.prepare(`
        UPDATE orders SET
          status = 'PAYMENT_UNDER_REVIEW',
          admin_notes = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(admin_notes || 'Manual review in progress. Checking bank ledger.', order.id);

      createAuditLog('ORDER', order.id, 'PAYMENT_UNDER_REVIEW', verified_by, 'admin', `Status set to PAYMENT_UNDER_REVIEW: ${admin_notes || ''}`);

      return res.json({
        success: true,
        message: 'Order marked under additional review.',
        order_status: 'PAYMENT_UNDER_REVIEW'
      });
    }

    res.status(400).json({ success: false, error: 'Invalid verification action' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 9. DIGITAL DELIVERY RETRIEVAL & ACKNOWLEDGEMENT
// ==========================================
app.get('/api/orders/:id/delivery', (req, res) => {
  try {
    const { id } = req.params;
    const delivery = db.prepare('SELECT * FROM deliveries WHERE order_id = ?').get(id);

    if (!delivery) {
      return res.status(404).json({ success: false, error: 'No delivery record found for this order yet.' });
    }

    res.json({
      success: true,
      delivery: {
        id: delivery.id,
        delivery_type: delivery.delivery_type,
        data: JSON.parse(delivery.delivery_data || '{}'),
        delivery_notes: delivery.delivery_notes,
        status: delivery.status,
        delivered_at: delivery.delivered_at,
        customer_acknowledged_at: delivery.customer_acknowledged_at
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Manual Delivery Dispatch
app.post('/api/admin/orders/:id/deliver', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { delivery_data, delivery_notes, admin_name = 'Admin' } = req.body;

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const payload = typeof delivery_data === 'string' ? delivery_data : JSON.stringify(delivery_data);

    db.prepare(`
      INSERT INTO deliveries (id, order_id, delivery_type, delivery_data, delivery_notes, status, delivered_by)
      VALUES (?, ?, 'manual', ?, ?, 'DISPATCHED', ?)
      ON CONFLICT(id) DO UPDATE SET delivery_data = excluded.delivery_data, delivery_notes = excluded.delivery_notes
    `).run(generateId('del'), order.id, payload, delivery_notes || 'Manual dispatch by Admin', admin_name);

    db.prepare(`
      UPDATE orders SET
        status = 'DELIVERED',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(order.id);

    createAuditLog('DELIVERY', order.id, 'MANUAL_DISPATCH', admin_name, 'admin', 'Admin manually provided credentials and completed delivery.');

    res.json({ success: true, message: 'Delivery dispatched to customer!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Customer Acknowledge Delivery -> COMPLETED
app.post('/api/orders/:id/acknowledge-delivery', (req, res) => {
  try {
    const { id } = req.params;
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    db.prepare(`
      UPDATE deliveries SET
        status = 'CONFIRMED_BY_CUSTOMER',
        customer_acknowledged_at = CURRENT_TIMESTAMP
      WHERE order_id = ?
    `).run(order.id);

    db.prepare(`
      UPDATE orders SET
        status = 'COMPLETED',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(order.id);

    createAuditLog('ORDER', order.id, 'ORDER_COMPLETED', order.customer_name, 'customer', 'Customer acknowledged delivery and confirmed full access.');

    res.json({ success: true, message: 'Order marked as completed! Thank you for purchasing from ValorVault.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 10. REFUNDS
// ==========================================
app.post('/api/orders/:id/refund-request', (req, res) => {
  try {
    const { id } = req.params;
    const { reason, customer_name = 'Customer' } = req.body;

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    db.prepare(`
      UPDATE orders SET
        status = 'REFUND_REQUESTED',
        customer_notes = COALESCE(customer_notes || ' | Refund Reason: ' || ?, ?),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(reason, reason, order.id);

    createAuditLog('REFUND', order.id, 'REFUND_REQUESTED', customer_name, 'customer', `Refund requested: ${reason}`);

    res.json({ success: true, message: 'Refund request submitted for admin review.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/orders/:id/refund-decision', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { decision, reason, admin_name = 'Admin' } = req.body; // 'APPROVE' or 'DECLINE'

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (decision === 'APPROVE') {
      db.prepare(`
        UPDATE orders SET
          status = 'REFUNDED',
          payment_status = 'REFUNDED',
          admin_notes = COALESCE(admin_notes || ' | Refund Approved: ' || ?, ?),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(reason || 'Refund approved by Admin', reason || 'Refund approved', order.id);

      // Restore inventory stock for refunded items
      const orderItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
      for (const itm of orderItems) {
        if (itm.product_id) {
          const prod = db.prepare('SELECT stock FROM products WHERE id = ?').get(itm.product_id);
          if (prod) {
            const restoredStock = prod.stock + (itm.quantity || 1);
            db.prepare('UPDATE products SET stock = ? WHERE id = ?').run(restoredStock, itm.product_id);
            db.prepare(`
              INSERT INTO stock_adjustments (id, product_id, adjustment_type, quantity_changed, stock_before, stock_after, reason, admin_name)
              VALUES (?, ?, 'REFUND', ?, ?, ?, ?, ?)
            `).run(
              generateId('stk_adj'),
              itm.product_id,
              itm.quantity || 1,
              prod.stock,
              restoredStock,
              `Stock restored from refunded order #${order.order_number}`,
              admin_name
            );
          }
        }
      }

      // Un-allocate vault items allocated to this order
      db.prepare(`
        UPDATE inventory_vault SET
          is_allocated = 0,
          status = 'AVAILABLE',
          allocated_to_order_id = NULL,
          notes = COALESCE(notes || ' | Returned from refunded order #' || ?, 'Returned from refunded order')
        WHERE allocated_to_order_id = ?
      `).run(order.order_number, order.id);

      createAuditLog('REFUND', order.id, 'REFUND_APPROVED', admin_name, 'admin', `Refund approved. Restored inventory stock. Reason: ${reason}`);
      return res.json({ success: true, message: 'Refund approved. Order status set to REFUNDED and stock restored.' });
    } else {
      db.prepare(`
        UPDATE orders SET
          status = 'DISPUTED',
          admin_notes = COALESCE(admin_notes || ' | Refund Declined: ' || ?, ?),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(reason || 'Refund declined as per policy', reason || 'Refund declined', order.id);

      createAuditLog('REFUND', order.id, 'REFUND_DECLINED', admin_name, 'admin', `Refund request declined. Reason: ${reason}`);
      return res.json({ success: true, message: 'Refund request declined.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 11. SUPPORT TICKETS
// ==========================================
app.post('/api/tickets', (req, res) => {
  try {
    const {
      user_id,
      customer_name,
      customer_email,
      order_id,
      issue_type,
      subject,
      message,
      attachment_url
    } = req.body;

    if (!customer_name || !customer_email || !issue_type || !subject || !message) {
      return res.status(400).json({ success: false, error: 'Please provide all required ticket fields' });
    }

    const ticketId = generateId('tkt');
    const ticketNumber = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;

    db.prepare(`
      INSERT INTO support_tickets (
        id, ticket_number, user_id, customer_name, customer_email,
        order_id, issue_type, subject, message, attachment_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      ticketId,
      ticketNumber,
      user_id || null,
      customer_name.trim(),
      customer_email.trim().toLowerCase(),
      order_id || null,
      issue_type,
      subject.trim(),
      message.trim(),
      attachment_url || null
    );

    createAuditLog('SUPPORT', ticketId, 'TICKET_CREATED', customer_name, 'customer', `Ticket ${ticketNumber} opened: [${issue_type}] ${subject}`);

    res.status(201).json({ success: true, message: 'Support ticket submitted', ticketNumber, id: ticketId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/tickets', (req, res) => {
  try {
    const { user_id, email, status } = req.query;
    let query = 'SELECT * FROM support_tickets WHERE 1=1';
    const params = [];

    if (user_id) {
      query += ' AND user_id = ?';
      params.push(user_id);
    } else if (email) {
      query += ' AND customer_email = ?';
      params.push(email.trim().toLowerCase());
    }

    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';
    const tickets = db.prepare(query).all(...params);
    res.json({ success: true, count: tickets.length, tickets });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/tickets/:id/reply', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { reply, status = 'RESOLVED', admin_name = 'ValorVault Support' } = req.body;

    db.prepare(`
      UPDATE support_tickets SET
        admin_reply = ?,
        status = ?,
        resolved_at = CASE WHEN ? = 'RESOLVED' THEN CURRENT_TIMESTAMP ELSE resolved_at END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(reply, status, status, id);

    createAuditLog('SUPPORT', id, 'TICKET_REPLIED', admin_name, 'admin', `Ticket status set to ${status}: ${reply.slice(0, 60)}...`);

    res.json({ success: true, message: 'Reply sent and status updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 12. REVIEWS
// ==========================================
app.get('/api/reviews', (req, res) => {
  try {
    const { product_id } = req.query;
    let query = `
      SELECT r.*, p.name as product_name
      FROM reviews r
      JOIN products p ON r.product_id = p.id
    `;
    const params = [];
    if (product_id) {
      query += ' WHERE r.product_id = ?';
      params.push(product_id);
    }
    query += ' ORDER BY r.created_at DESC';
    const reviews = db.prepare(query).all(...params);
    res.json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/reviews', (req, res) => {
  try {
    const { product_id, user_id, customer_name, rating, comment } = req.body;
    if (!product_id || !customer_name || !rating || !comment) {
      return res.status(400).json({ success: false, error: 'Product, customer name, rating, and comment are required' });
    }

    const reviewId = generateId('rev');
    db.prepare(`
      INSERT INTO reviews (id, product_id, user_id, customer_name, rating, comment, verified_purchase)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `).run(reviewId, product_id, user_id || null, customer_name.trim(), Number(rating), comment.trim());

    res.status(201).json({ success: true, message: 'Review posted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 13. ADMIN STATS & AUDIT LOGS
// ==========================================
app.get('/api/admin/stats', requireAdmin, (req, res) => {
  try {
    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
    const pendingPayments = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status IN ('PAYMENT_SUBMITTED', 'PAYMENT_UNDER_REVIEW')").get().count;
    const pendingDeliveries = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'PROCESSING'").get().count;
    const completedOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status IN ('DELIVERED', 'COMPLETED')").get().count;
    const totalRevenue = db.prepare("SELECT COALESCE(SUM(total_amount), 0) as sum FROM orders WHERE status IN ('DELIVERED', 'COMPLETED', 'PROCESSING', 'PAYMENT_CONFIRMED')").get().sum;

    const todayRevenue = db.prepare(`
      SELECT COALESCE(SUM(total_amount), 0) as sum 
      FROM orders 
      WHERE DATE(created_at) = DATE('now')
      AND status IN ('DELIVERED', 'COMPLETED', 'PROCESSING', 'PAYMENT_CONFIRMED')
    `).get().sum;

    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
    const lowStockCount = db.prepare("SELECT COUNT(*) as count FROM products WHERE stock <= 1 AND status = 'active'").get().count;
    const openTickets = db.prepare("SELECT COUNT(*) as count FROM support_tickets WHERE status = 'OPEN'").get().count;

    // Recent orders stream
    const recentOrders = db.prepare(`
      SELECT id, order_number, customer_name, customer_email, total_amount, status, payment_status, created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 8
    `).all();

    res.json({
      success: true,
      stats: {
        totalOrders,
        pendingPayments,
        pendingDeliveries,
        completedOrders,
        totalRevenue,
        todayRevenue,
        totalProducts,
        lowStockCount,
        openTickets
      },
      recentOrders
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/audit-logs', requireAdmin, (req, res) => {
  try {
    const logs = db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 50').all();
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Serve Client Static Build if present
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ValorVault backend running on port ${PORT}`);
});

