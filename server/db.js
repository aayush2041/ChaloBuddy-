import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'valorvault.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  // Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      role TEXT DEFAULT 'customer',
      password TEXT NOT NULL,
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Categories Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      icon TEXT NOT NULL,
      description TEXT,
      sub_label TEXT,
      badge TEXT,
      display_order INTEGER DEFAULT 0
    );
  `);

  // Products Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      short_desc TEXT,
      sub_label TEXT,
      price REAL NOT NULL,
      original_price REAL,
      discount_percent INTEGER DEFAULT 0,
      stock INTEGER DEFAULT 1,
      delivery_type TEXT NOT NULL, -- 'account', 'code', 'manual', 'currency'
      images TEXT NOT NULL, -- JSON string array
      specs TEXT NOT NULL, -- JSON string object {Rank, Level, Total Skins, Region, etc.}
      features TEXT, -- JSON string array of checklist items
      whats_included TEXT, -- JSON string array
      terms TEXT,
      refund_policy TEXT,
      status TEXT DEFAULT 'active',
      is_featured INTEGER DEFAULT 0,
      is_deal INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories (id)
    );
  `);

  // Inventory Vault
  db.exec(`
    CREATE TABLE IF NOT EXISTS inventory_vault (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      item_type TEXT NOT NULL,
      secret_data TEXT NOT NULL,
      is_allocated INTEGER DEFAULT 0,
      allocated_to_order_id TEXT,
      allocated_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products (id)
    );
  `);

  // Orders Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      user_id TEXT,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      subtotal_amount REAL NOT NULL,
      platform_fee REAL DEFAULT 0,
      discount_amount REAL DEFAULT 0,
      total_amount REAL NOT NULL,
      coupon_code TEXT,
      status TEXT NOT NULL,
      payment_status TEXT DEFAULT 'PENDING',
      payment_method TEXT DEFAULT 'UPI',
      rejection_reason TEXT,
      customer_notes TEXT,
      admin_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );
  `);

  // Order Items
  db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER DEFAULT 1,
      delivery_type TEXT NOT NULL,
      specs_snapshot TEXT,
      image_snapshot TEXT,
      FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products (id)
    );
  `);

  // Payments
  db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      method TEXT NOT NULL,
      amount REAL NOT NULL,
      utr TEXT,
      screenshot_url TEXT,
      status TEXT DEFAULT 'SUBMITTED',
      rejection_reason TEXT,
      verified_by TEXT,
      verified_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
    );
  `);

  // Payment Attempts
  db.exec(`
    CREATE TABLE IF NOT EXISTS payment_attempts (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      attempt_number INTEGER DEFAULT 1,
      method TEXT NOT NULL,
      amount REAL NOT NULL,
      utr TEXT,
      screenshot_url TEXT,
      status TEXT NOT NULL,
      rejection_reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
    );
  `);

  // Deliveries
  db.exec(`
    CREATE TABLE IF NOT EXISTS deliveries (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      delivery_type TEXT NOT NULL,
      delivery_data TEXT NOT NULL,
      delivery_notes TEXT,
      status TEXT DEFAULT 'DISPATCHED',
      delivered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      delivered_by TEXT DEFAULT 'SYSTEM',
      customer_acknowledged_at DATETIME,
      FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
    );
  `);

  // Support Tickets
  db.exec(`
    CREATE TABLE IF NOT EXISTS support_tickets (
      id TEXT PRIMARY KEY,
      ticket_number TEXT UNIQUE NOT NULL,
      user_id TEXT,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      order_id TEXT,
      issue_type TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      attachment_url TEXT,
      status TEXT DEFAULT 'OPEN',
      admin_reply TEXT,
      resolved_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Coupons
  db.exec(`
    CREATE TABLE IF NOT EXISTS coupons (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT NOT NULL,
      discount_value REAL NOT NULL,
      min_order_value REAL DEFAULT 0,
      max_uses INTEGER DEFAULT 100,
      uses_count INTEGER DEFAULT 0,
      expiry_date TEXT,
      applicable_category_id TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Reviews
  db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      user_id TEXT,
      customer_name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT NOT NULL,
      verified_purchase INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products (id)
    );
  `);

  // Audit Logs
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL,
      actor_name TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Settings
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      description TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedData();
}

export function seedData(force = false) {
  const usersCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (usersCount > 0 && !force) return;

  console.log('⚡ Populating Mockup-Accurate ValorVault Catalog & State...');

  db.pragma('foreign_keys = OFF');

  // Clear existing catalog for clean mockup alignment
  db.exec(`
    DELETE FROM inventory_vault;
    DELETE FROM order_items;
    DELETE FROM products;
    DELETE FROM categories;
  `);

  db.pragma('foreign_keys = ON');

  // 1. Seed Users
  db.prepare(`
    INSERT OR REPLACE INTO users (id, name, email, phone, role, password, avatar)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    'usr_admin_01',
    'ValorVault Admin',
    'bixxstoreshopify@gmail.com',
    '+91 98765 43210',
    'admin',
    'qaZwsX@12',
    'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80'
  );

  db.prepare(`
    INSERT OR REPLACE INTO users (id, name, email, phone, role, password, avatar)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    'usr_cust_01',
    'Aayush Sharma',
    'player@gmail.com',
    '+91 98112 23344',
    'customer',
    'player123',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  );

  // 2. Settings (Matching screen 05)
  const insertSetting = db.prepare(`
    INSERT OR REPLACE INTO settings (key, value, description)
    VALUES (?, ?, ?)
  `);
  insertSetting.run('upi_id', 'valorvault@upi', 'Official UPI ID');
  insertSetting.run('upi_merchant_name', 'VALORVAULT DIGITAL ENTERPRISES', 'Payee Name');
  insertSetting.run('bank_name', 'State Bank of India', 'Official Bank');
  insertSetting.run('bank_account_holder', 'ValorVault', 'Account Holder');
  insertSetting.run('bank_account_number', '3982019482910', 'Account Number');
  insertSetting.run('bank_ifsc', 'SBIN0004821', 'IFSC Code');
  insertSetting.run('support_phone', '', 'Helpline Phone');
  insertSetting.run('support_email', 'iushyt12@gmail.com', 'Support Email');
  insertSetting.run('support_hours', '09:00 AM – 11:30 PM IST (7 Days/Week)', 'Operating Hours');
  insertSetting.run('platform_fee', '0', 'Processing Fee');

  // 3. Categories (Exact 5 cards from screen 01 & screen 02)
  const insertCat = db.prepare(`
    INSERT INTO categories (id, name, slug, icon, description, sub_label, badge, display_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertCat.run(
    'cat_val',
    'VALORANT',
    'valorant',
    'ShieldAlert',
    'Accounts, VP and more digital products',
    'Accounts • VP',
    'HOT',
    1
  );
  insertCat.run(
    'cat_bgmi',
    'BGMI',
    'bgmi',
    'Crosshair',
    'Glacier M416 accounts, UC packs and mythic outfits',
    'Accounts • UC',
    'POPULAR',
    2
  );
  insertCat.run(
    'cat_pubg',
    'PUBG MOBILE',
    'pubg-mobile',
    'Flame',
    'Global version mythic outfits, X-Suits and UC',
    'Accounts • UC',
    'GLOBAL',
    3
  );
  insertCat.run(
    'cat_ff',
    'FREE FIRE',
    'free-fire',
    'Zap',
    'Max Evo guns, Sakura bundles and Diamond vouchers',
    'Accounts • Diamonds',
    'INSTANT',
    4
  );
  insertCat.run(
    'cat_yt',
    'YOUTUBE',
    'youtube',
    'PlaySquare',
    'Monetized creator channels, organic audience & community assets',
    'Channels • Accounts',
    'VERIFIED',
    5
  );

  // 4. Products (Matches Screen 01, 02, 03 exactly!)
  const insertProd = db.prepare(`
    INSERT INTO products (
      id, category_id, name, slug, description, short_desc, sub_label, price, original_price,
      discount_percent, stock, delivery_type, images, specs, features, whats_included,
      terms, refund_policy, status, is_featured, is_deal
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Product 1: Ascendant Account (Screen 01, 02, 03)
  insertProd.run(
    'prod_ascendant_01',
    'cat_val',
    'Ascendant Account',
    'ascendant-valorant-account',
    'High quality Valorant account with premium skins and exclusive collection. Perfect for players looking for a competitive and stylish account.',
    '42 Skins | Level 180',
    '42 Skins | Level 180',
    2499,
    3299,
    24,
    5,
    'account',
    JSON.stringify([
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80'
    ]),
    JSON.stringify({
      Rank: 'Ascendant',
      Level: '180',
      'Total Skins': '42',
      'Premium Skins': '18',
      Region: 'India',
      'Account Type': 'Full Access'
    }),
    JSON.stringify([
      'Full access account',
      'Ranked ready',
      'Email changeable',
      'Includes all shown skins',
      'Non-linked to third party',
      '100% safe & verified'
    ]),
    JSON.stringify([
      'Riot Games Username and Password',
      'First email transfer confirmation',
      'Warranty certificate'
    ]),
    'Strictly for personal gameplay. Change credentials upon delivery.',
    'Full refund if credentials cannot be accessed upon initial delivery.',
    'active',
    1,
    1
  );

  // Product 2: Immortal Account (Screen 02)
  insertProd.run(
    'prod_immortal_01',
    'cat_val',
    'Immortal Account',
    'immortal-valorant-account',
    'Top tier competitive high MMR account. Episode 8/9 peak elo with maxed prime animation skins.',
    '28 Skins | Level 150',
    '28 Skins | Level 150',
    1999,
    2599,
    23,
    3,
    'account',
    JSON.stringify([
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80'
    ]),
    JSON.stringify({
      Rank: 'Immortal',
      Level: '150',
      'Total Skins': '28',
      'Premium Skins': '12',
      Region: 'India',
      'Account Type': 'Full Access'
    }),
    JSON.stringify([
      'Full access account',
      'Ranked ready',
      'Email changeable',
      'Includes all shown skins',
      '100% safe & verified'
    ]),
    JSON.stringify(['Riot Login Credentials', 'Linked Mailbox Access']),
    'Standard ValorVault terms apply.',
    'Replacement guarantee for first-login inspection within 48h.',
    'active',
    1,
    0
  );

  // Product 3: Diamond Account (Screen 02)
  insertProd.run(
    'prod_diamond_01',
    'cat_val',
    'Diamond Account',
    'diamond-valorant-account',
    'Solid diamond elo account with great weapon finishes and high win-rate MMR.',
    '35 Skins | Level 120',
    '35 Skins | Level 120',
    1599,
    1999,
    20,
    4,
    'account',
    JSON.stringify([
      'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80'
    ]),
    JSON.stringify({
      Rank: 'Diamond',
      Level: '120',
      'Total Skins': '35',
      'Premium Skins': '10',
      Region: 'India',
      'Account Type': 'Full Access'
    }),
    JSON.stringify(['Full access account', 'Ranked ready', 'Email changeable', '100% safe & verified']),
    JSON.stringify(['Riot Login Credentials']),
    'Standard terms apply.',
    'Replacement guarantee within 48 hours.',
    'active',
    1,
    0
  );

  // Product 4: Gold Account (Screen 02)
  insertProd.run(
    'prod_gold_01',
    'cat_val',
    'Gold Account',
    'gold-valorant-account',
    'Clean unpenalized gold rank account ready for 5-stack competitive queues.',
    '18 Skins | Level 90',
    '18 Skins | Level 90',
    999,
    1299,
    23,
    6,
    'account',
    JSON.stringify([
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80'
    ]),
    JSON.stringify({
      Rank: 'Gold',
      Level: '90',
      'Total Skins': '18',
      Region: 'India',
      'Account Type': 'Full Access'
    }),
    JSON.stringify(['Full access account', 'Ranked ready', '100% safe & verified']),
    JSON.stringify(['Riot Credentials']),
    'Terms apply.',
    'Full inspection warranty.',
    'active',
    0,
    0
  );

  // Product 5: Platinum Account (Screen 02)
  insertProd.run(
    'prod_plat_01',
    'cat_val',
    'Platinum Account',
    'platinum-valorant-account',
    'Platinum 3 account with popular Vandal and Operator skin skins.',
    '22 Skins | Level 100',
    '22 Skins | Level 100',
    1199,
    1499,
    20,
    4,
    'account',
    JSON.stringify([
      'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80'
    ]),
    JSON.stringify({
      Rank: 'Platinum',
      Level: '100',
      'Total Skins': '22',
      Region: 'India',
      'Account Type': 'Full Access'
    }),
    JSON.stringify(['Full access account', 'Ranked ready', '100% safe & verified']),
    JSON.stringify(['Riot Credentials']),
    'Terms apply.',
    'Inspection warranty.',
    'active',
    0,
    0
  );

  // Product 6: Radiant Account (Screen 02)
  insertProd.run(
    'prod_radiant_01',
    'cat_val',
    'Radiant Account',
    'radiant-valorant-account',
    'Top 500 Radiant badge account with stacked knives and champion collection.',
    '50+ Skins | Level 200',
    '50+ Skins | Level 200',
    3999,
    4999,
    20,
    2,
    'account',
    JSON.stringify([
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80'
    ]),
    JSON.stringify({
      Rank: 'Radiant',
      Level: '200',
      'Total Skins': '50+',
      'Premium Skins': '25',
      Region: 'India',
      'Account Type': 'Full Access'
    }),
    JSON.stringify(['Radiant Peak Badge', 'Full access account', 'Ranked ready', '100% safe & verified']),
    JSON.stringify(['Riot Credentials & Mailbox']),
    'Terms apply.',
    'Inspection warranty.',
    'active',
    1,
    1
  );

  // Product 7: Valorant Points (VP) (Screen 02)
  insertProd.run(
    'prod_vp_1500',
    'cat_val',
    'Valorant Points (VP)',
    'valorant-points-1500-vp',
    'Official Riot Prepaid Code for 1,500 Valorant Points. Instant code delivery inside your vault.',
    '1500 VP',
    '1500 VP',
    499,
    599,
    16,
    50,
    'code',
    JSON.stringify([
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80'
    ]),
    JSON.stringify({
      Points: '1,500 VP',
      Platform: 'Riot Games Client (PC)',
      Region: 'India / AP'
    }),
    JSON.stringify(['Instant code dispatch', 'No expiry date', '100% official Riot key']),
    JSON.stringify(['16-Digit Riot Code']),
    'Prepaid codes are non-refundable once redeemed.',
    'Replacement if code reports invalid upon initial claim.',
    'active',
    1,
    0
  );

  // Product 8: Prime Vandal Skin (Screen 02)
  insertProd.run(
    'prod_prime_vandal',
    'cat_val',
    'Prime Vandal Skin',
    'prime-vandal-skin-account',
    'Account featuring maxed Prime Vandal with all reload and laser finisher upgrades.',
    'Individual Skin',
    'Individual Skin',
    1299,
    1599,
    18,
    3,
    'account',
    JSON.stringify([
      'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80'
    ]),
    JSON.stringify({
      Skin: 'Prime Vandal (Level 4 Max)',
      Rank: 'Gold 2',
      Region: 'India'
    }),
    JSON.stringify(['Maxed animation & finisher', 'Full access', '100% verified']),
    JSON.stringify(['Riot Credentials']),
    'Terms apply.',
    'Inspection warranty.',
    'active',
    0,
    1
  );

  // Product 9: Reaver Bundle (Screen 02)
  insertProd.run(
    'prod_reaver_bundle',
    'cat_val',
    'Reaver Bundle',
    'reaver-bundle-account',
    'Account equipped with full Reaver Bundle (Vandal, Operator, Sheriff, and Reaver Karambit).',
    'Full Bundle',
    'Full Bundle',
    2999,
    3699,
    19,
    2,
    'account',
    JSON.stringify([
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80'
    ]),
    JSON.stringify({
      Bundle: 'Reaver 2.0 Complete',
      Rank: 'Platinum 1',
      Region: 'India'
    }),
    JSON.stringify(['Full Reaver collection', 'Full access', '100% verified']),
    JSON.stringify(['Riot Credentials']),
    'Terms apply.',
    'Inspection warranty.',
    'active',
    1,
    0
  );

  // Product 10: BGMI Account (Screen 01 & 04)
  insertProd.run(
    'prod_bgmi_account',
    'cat_bgmi',
    'BGMI Account',
    'bgmi-glacier-m416-level-72',
    'Iconic BGMI account with Glacier M416 and Mythic Fashion title.',
    'Mythic Fashion | Level 72',
    'Mythic Fashion | Level 72',
    1799,
    2299,
    21,
    2,
    'account',
    JSON.stringify([
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80'
    ]),
    JSON.stringify({
      'Glacier M416': 'Level 4 (Hit Effect)',
      Level: '72',
      Title: 'Mythic Fashion',
      Region: 'India'
    }),
    JSON.stringify(['Twitter / Gmail login', 'Changeable phone number', '100% verified']),
    JSON.stringify(['Twitter / Gmail Credentials']),
    'Terms apply.',
    'Inspection warranty.',
    'active',
    1,
    0
  );

  // Product 11: BGMI UC - 8100 UC (Screen 04)
  insertProd.run(
    'prod_bgmi_uc',
    'cat_bgmi',
    'BGMI UC - 8100 UC',
    'bgmi-uc-8100-pack',
    'Direct Unknown Cash top-up credited to your BGMI Character ID.',
    'In-game Currency',
    'In-game Currency',
    799,
    999,
    20,
    50,
    'currency',
    JSON.stringify([
      'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=800&auto=format&fit=crop&q=80'
    ]),
    JSON.stringify({
      Amount: '8,100 UC Total',
      Delivery: 'Character ID Topup',
      Speed: '5-15 Minutes'
    }),
    JSON.stringify(['Direct in-game mailbox credit', 'Safe Krafton partner fulfillment']),
    JSON.stringify(['Krafton Partner API confirmation']),
    'Ensure UID is correct.',
    'Refund if fulfillment fails within 2 hours.',
    'active',
    1,
    1
  );

  // Product 12: PUBG Account (Screen 01)
  insertProd.run(
    'prod_pubg_account',
    'cat_pubg',
    'PUBG Account',
    'pubg-mobile-mythic-fashion-68',
    'Global version PUBG Mobile account with Pharaoh outfit and Godzilla AWM.',
    'Mythic Fashion | Level 68',
    'Mythic Fashion | Level 68',
    2099,
    2699,
    22,
    2,
    'account',
    JSON.stringify([
      'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80'
    ]),
    JSON.stringify({
      Version: 'Global Version',
      Level: '68',
      Mythics: '24 Mythic Items',
      X_Suit: 'Golden Pharaoh'
    }),
    JSON.stringify(['Global client account', 'Full access', '100% verified']),
    JSON.stringify(['Play Games / Twitter Login']),
    'Terms apply.',
    'Inspection warranty.',
    'active',
    1,
    0
  );

  // Product 13: Free Fire Account (Screen 01)
  insertProd.run(
    'prod_ff_account',
    'cat_ff',
    'Free Fire Account',
    'free-fire-evo-skins-level-70',
    'Free Fire Max stacked account with Blue Flame Draco AK and Cobra MP40.',
    'Evo Skins | Level 70',
    'Evo Skins | Level 70',
    1299,
    1699,
    23,
    3,
    'account',
    JSON.stringify([
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80'
    ]),
    JSON.stringify({
      'Evo Guns': 'Draco AK & Cobra MP40',
      Level: '70',
      Bundles: 'Sakura & Hip Hop'
    }),
    JSON.stringify(['Google login', 'Full access', '100% verified']),
    JSON.stringify(['Google Account Credentials']),
    'Terms apply.',
    'Inspection warranty.',
    'active',
    1,
    0
  );

  // Product 14: YouTube Creator Channel (Screen 01)
  insertProd.run(
    'prod_yt_channel',
    'cat_yt',
    'YouTube Gaming Channel',
    'monetized-youtube-gaming-channel-124k',
    'Monetized creator channel with active AdSense and clean copyright status.',
    '124K Subscribers',
    '124K Subscribers',
    24999,
    29999,
    16,
    1,
    'account',
    JSON.stringify([
      'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=80'
    ]),
    JSON.stringify({
      Subscribers: '124,000+',
      Monetization: 'Active YPP (AdSense ready)',
      Strikes: 'Clean (0 Strikes)',
      Niche: 'FPS Gaming'
    }),
    JSON.stringify(['Primary Owner Escrow transfer', 'AdSense linking support', '100% organic audience']),
    JSON.stringify(['Brand Account Primary Owner Transfer']),
    'Google 7-day manager to owner transfer rules apply.',
    'Escrow protection until primary ownership finalized.',
    'active',
    1,
    0
  );

  // 5. Seed Inventory Vault Items for these accounts/codes
  const insertVault = db.prepare(`
    INSERT INTO inventory_vault (id, product_id, item_type, secret_data)
    VALUES (?, ?, ?, ?)
  `);

  insertVault.run(
    'vlt_asc_01',
    'prod_ascendant_01',
    'account_credentials',
    JSON.stringify({
      username: 'VV_Ascendant_God24',
      password: 'Ascendant#Vault!8821',
      email: 'vv_ascendant_player@outlook.com',
      email_password: 'OutlookPass#2026',
      riot_id: 'Ascendant#ACE1',
      instructions: '1. Log into Riot Client with username & password. 2. Access Outlook inbox to verify email change OTP. 3. Enable personal 2-Factor Authentication.'
    })
  );

  insertVault.run(
    'vlt_vp_code_1500',
    'prod_vp_1500',
    'redeem_code',
    JSON.stringify({
      code: 'RA-VP-9982-1142-7841',
      pin: '5521',
      instructions: 'Open Valorant Client -> Click VP icon at top right -> Select Prepaid Cards & Codes -> Enter code.'
    })
  );

  // 6. Pre-seed Order VV-10248 (as shown in Screen 05, 06, 07 mockup!)
  db.prepare(`
    INSERT OR REPLACE INTO orders (
      id, order_number, user_id, customer_name, customer_email, customer_phone,
      subtotal_amount, platform_fee, discount_amount, total_amount, coupon_code,
      status, payment_status, payment_method, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'ord_mockup_10248',
    'VV-10248',
    'usr_cust_01',
    'Aayush Sharma',
    'player@gmail.com',
    '+91 98112 23344',
    2499,
    0,
    0,
    2499,
    null,
    'PAYMENT_SUBMITTED',
    'SUBMITTED',
    'UPI',
    '2026-09-28 12:00:00',
    '2026-09-28 12:05:00'
  );

  db.prepare(`
    INSERT OR REPLACE INTO order_items (id, order_id, product_id, product_name, price, quantity, delivery_type)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    'item_mockup_01',
    'ord_mockup_10248',
    'prod_ascendant_01',
    'Ascendant Account',
    2499,
    1,
    'account'
  );

  db.prepare(`
    INSERT OR REPLACE INTO payments (id, order_id, method, amount, utr, screenshot_url, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'pay_mockup_01',
    'ord_mockup_10248',
    'UPI',
    2499,
    '429182390192',
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600',
    'SUBMITTED',
    '2026-09-28 12:05:00'
  );

  // Reviews
  db.prepare(`
    INSERT OR REPLACE INTO reviews (id, product_id, customer_name, rating, comment, verified_purchase)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('rev_mockup_01', 'prod_ascendant_01', 'Rohan V.', 5, 'Clean account with Prime Vandal! Verified in 5 minutes.', 1);

  // Coupons
  db.prepare(`
    INSERT OR REPLACE INTO coupons (id, code, discount_type, discount_value, min_order_value, max_uses, uses_count, expiry_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('cpn_mock_01', 'VALOR10', 'percentage', 10, 500, 100, 5, '2028-12-31');

  console.log('✅ Mockup data seed completed.');
}

export default db;
