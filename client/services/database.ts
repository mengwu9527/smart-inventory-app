/**
 * SQLite数据库服务 - 进销存完整版
 * 本地离线数据库，所有数据存储在本地设备
 * 支持多单位、客户分级、价格体系、往来账、操作日志等完整功能
 */
import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

// ==================== 类型定义 ====================

// 商品分类
export interface Category {
  id: number;
  name: string;
  description?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// 商品单位（支持无限层级）
export interface ProductUnit {
  id: number;
  product_id: number;
  unit_name: string;
  parent_unit_id?: number; // 父单位ID，用于多层级
  conversion_rate: number; // 换算比例（相对于基础单位）
  level: number; // 层级深度，0为基础单位
  purchase_price: number; // 进价
  sale_price: number; // 售价
  wholesale_price?: number; // 批发价
  vip_price?: number; // VIP价
  svip_price?: number; // 至尊VIP价
  min_stock: number; // 库存预警值
  is_default_sale: number; // 是否默认销售单位
  is_default_purchase: number; // 是否默认采购单位
  created_at: string;
}

// 商品
export interface Product {
  id: number;
  name: string;
  barcode?: string;
  category_id?: number;
  category_name?: string;
  base_unit: string; // 基础单位
  base_stock: number; // 基础单位库存
  image_url?: string;
  description?: string;
  status: number; // 1:正常 0:停用
  created_at: string;
  updated_at: string;
  // 关联数据
  units?: ProductUnit[];
}

// 客户等级
export interface CustomerLevel {
  id: number;
  name: string; // 等级名称：普通客户、VIP客户、至尊客户
  discount: number; // 折扣率（如0.95表示95折）
  min_amount: number; // 升级所需最低消费金额
  sort_order: number;
  is_default: number; // 是否默认等级
  created_at: string;
}

// 客户
export interface Customer {
  id: number;
  name: string;
  phone?: string;
  address?: string;
  email?: string;
  level_id: number; // 客户等级ID
  level_name?: string;
  credit_limit: number; // 信用额度
  balance: number; // 应收账款余额
  total_purchase: number; // 累计采购金额
  total_orders: number; // 累计订单数
  last_purchase_date?: string; // 最近采购日期
  remark?: string;
  status: number;
  created_at: string;
  updated_at: string;
}

// 供应商
export interface Supplier {
  id: number;
  name: string;
  contact?: string;
  phone?: string;
  address?: string;
  email?: string;
  bank_name?: string;
  bank_account?: string;
  balance: number; // 应付账款余额
  total_purchase: number; // 累计采购金额
  remark?: string;
  status: number;
  created_at: string;
  updated_at: string;
}

// 销售订单
export interface SalesOrder {
  id: number;
  order_no: string;
  customer_id?: number;
  customer_name?: string;
  customer_level?: number;
  total_amount: number; // 商品总金额
  discount_amount: number; // 优惠金额
  paid_amount: number; // 实付金额
  receivable_amount: number; // 应收金额（赊账）
  total_quantity: number;
  profit: number;
  payment_method: string;
  status: string; // completed, refunded, partial_refund, pending
  remark?: string;
  operator?: string; // 操作员
  created_at: string;
  updated_at: string;
}

// 销售订单明细
export interface SalesOrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  barcode?: string;
  unit_id: number;
  unit_name: string;
  quantity: number;
  original_price: number; // 原价
  unit_price: number; // 实际售价
  purchase_price: number; // 进价
  subtotal: number;
  profit: number;
  discount_rate: number; // 折扣率
  remark?: string;
}

// 改价记录
export interface PriceChangeLog {
  id: number;
  order_id: number;
  order_item_id: number;
  product_id: number;
  product_name: string;
  original_price: number;
  new_price: number;
  reason?: string;
  operator?: string;
  created_at: string;
}

// 退货单
export interface RefundOrder {
  id: number;
  refund_no: string;
  original_order_id: number;
  original_order_no: string;
  customer_id?: number;
  customer_name?: string;
  total_amount: number; // 退款总金额
  total_quantity: number;
  refund_type: string; // full:全额退款, partial:部分退款
  refund_reason?: string;
  status: string;
  operator?: string;
  created_at: string;
}

// 退货单明细
export interface RefundOrderItem {
  id: number;
  refund_id: number;
  original_item_id: number;
  product_id: number;
  product_name: string;
  unit_id: number;
  unit_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

// 收款记录
export interface PaymentRecord {
  id: number;
  payment_no: string;
  customer_id: number;
  customer_name?: string;
  order_id?: number; // 关联订单（可选）
  amount: number;
  payment_method: string;
  remark?: string;
  operator?: string;
  created_at: string;
}

// 入库单
export interface PurchaseOrder {
  id: number;
  order_no: string;
  supplier_id?: number;
  supplier_name?: string;
  total_amount: number;
  total_quantity: number;
  payable_amount: number; // 应付金额
  paid_amount: number; // 已付金额
  status: string;
  remark?: string;
  operator?: string;
  created_at: string;
  updated_at: string;
}

// 入库单明细
export interface PurchaseOrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  barcode?: string;
  unit_id: number;
  unit_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  remark?: string;
}

// 库存流水
export interface InventoryLog {
  id: number;
  product_id: number;
  product_name: string;
  unit_id: number;
  unit_name: string;
  type: string; // in, out, adjust, sale, refund, purchase
  quantity: number;
  before_stock: number;
  after_stock: number;
  order_no?: string;
  remark?: string;
  operator?: string;
  created_at: string;
}

// 操作日志
export interface OperationLog {
  id: number;
  module: string; // 模块：product, sale, purchase, customer, inventory, system
  action: string; // 操作：create, update, delete, price_change, refund
  target_type: string; // 目标类型
  target_id: number; // 目标ID
  target_name?: string; // 目标名称
  old_value?: string; // 修改前的值（JSON）
  new_value?: string; // 修改后的值（JSON）
  operator?: string;
  device_info?: string;
  ip_address?: string;
  created_at: string;
}

// 打印模板
export interface PrintTemplate {
  id: number;
  name: string;
  type: string; // sale, purchase, refund, inventory
  paper_size: string; // 58mm, 80mm, A4
  width: number;
  show_logo: number;
  show_cost: number;
  show_profit: number;
  show_customer_level: number;
  font_size: number;
  line_spacing: number;
  header_content?: string;
  footer_content?: string;
  copies: number; // 打印联数
  is_default: number;
  created_at: string;
  updated_at: string;
}

// 蓝牙设备
export interface BluetoothDevice {
  id: number;
  name: string;
  address: string;
  type: string; // printer, scanner
  brand?: string;
  is_default: number;
  last_connected_at?: string;
  created_at: string;
}

// 系统设置
export interface Settings {
  id: number;
  shop_name: string;
  shop_address?: string;
  shop_phone?: string;
  shop_logo?: string;
  receipt_header?: string;
  receipt_footer?: string;
  qr_code_url?: string; // 收款二维码
  decimal_places: number;
  default_payment_method: string;
  enable_voice: number; // 启用语音播报
  enable_print_auto: number; // 自动打印
  default_print_template_id?: number;
  new_customer_level_id: number; // 新客户默认等级
  created_at: string;
  updated_at: string;
}

// ==================== 数据库初始化 ====================

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  db = await SQLite.openDatabaseAsync('free_jxc_v2.db');

  // 创建所有表
  await db.execAsync(`
    -- 商品分类表
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    -- 商品表
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      barcode TEXT UNIQUE,
      category_id INTEGER,
      base_unit TEXT DEFAULT '件',
      base_stock REAL DEFAULT 0,
      image_url TEXT,
      description TEXT,
      status INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    -- 商品单位表（支持无限层级多单位）
    CREATE TABLE IF NOT EXISTS product_units (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      unit_name TEXT NOT NULL,
      parent_unit_id INTEGER,
      conversion_rate REAL DEFAULT 1,
      level INTEGER DEFAULT 0,
      purchase_price REAL DEFAULT 0,
      sale_price REAL DEFAULT 0,
      wholesale_price REAL DEFAULT 0,
      vip_price REAL DEFAULT 0,
      svip_price REAL DEFAULT 0,
      min_stock REAL DEFAULT 0,
      is_default_sale INTEGER DEFAULT 0,
      is_default_purchase INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_unit_id) REFERENCES product_units(id)
    );

    -- 客户等级表
    CREATE TABLE IF NOT EXISTS customer_levels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      discount REAL DEFAULT 1,
      min_amount REAL DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      is_default INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    -- 客户表
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      email TEXT,
      level_id INTEGER DEFAULT 1,
      credit_limit REAL DEFAULT 0,
      balance REAL DEFAULT 0,
      total_purchase REAL DEFAULT 0,
      total_orders INTEGER DEFAULT 0,
      last_purchase_date TEXT,
      remark TEXT,
      status INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (level_id) REFERENCES customer_levels(id)
    );

    -- 供应商表
    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      contact TEXT,
      phone TEXT,
      address TEXT,
      email TEXT,
      balance REAL DEFAULT 0,
      total_purchase REAL DEFAULT 0,
      remark TEXT,
      status INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    -- 销售订单表
    CREATE TABLE IF NOT EXISTS sales_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_no TEXT UNIQUE NOT NULL,
      customer_id INTEGER,
      customer_name TEXT,
      customer_level INTEGER,
      total_amount REAL NOT NULL DEFAULT 0,
      discount_amount REAL DEFAULT 0,
      paid_amount REAL DEFAULT 0,
      receivable_amount REAL DEFAULT 0,
      total_quantity REAL NOT NULL DEFAULT 0,
      profit REAL DEFAULT 0,
      payment_method TEXT DEFAULT 'cash',
      status TEXT DEFAULT 'completed',
      remark TEXT,
      operator TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );

    -- 销售订单明细表
    CREATE TABLE IF NOT EXISTS sales_order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      barcode TEXT,
      unit_id INTEGER NOT NULL,
      unit_name TEXT NOT NULL,
      quantity REAL NOT NULL,
      original_price REAL NOT NULL,
      unit_price REAL NOT NULL,
      purchase_price REAL DEFAULT 0,
      subtotal REAL NOT NULL,
      profit REAL DEFAULT 0,
      discount_rate REAL DEFAULT 1,
      remark TEXT,
      FOREIGN KEY (order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (unit_id) REFERENCES product_units(id)
    );

    -- 改价记录表
    CREATE TABLE IF NOT EXISTS price_change_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      order_item_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      original_price REAL NOT NULL,
      new_price REAL NOT NULL,
      reason TEXT,
      operator TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (order_id) REFERENCES sales_orders(id),
      FOREIGN KEY (order_item_id) REFERENCES sales_order_items(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    -- 退货单表
    CREATE TABLE IF NOT EXISTS refund_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      refund_no TEXT UNIQUE NOT NULL,
      original_order_id INTEGER NOT NULL,
      original_order_no TEXT NOT NULL,
      customer_id INTEGER,
      customer_name TEXT,
      total_amount REAL NOT NULL,
      total_quantity REAL NOT NULL,
      refund_type TEXT DEFAULT 'partial',
      refund_reason TEXT,
      status TEXT DEFAULT 'completed',
      operator TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (original_order_id) REFERENCES sales_orders(id),
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );

    -- 退货单明细表
    CREATE TABLE IF NOT EXISTS refund_order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      refund_id INTEGER NOT NULL,
      original_item_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      unit_id INTEGER NOT NULL,
      unit_name TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit_price REAL NOT NULL,
      subtotal REAL NOT NULL,
      FOREIGN KEY (refund_id) REFERENCES refund_orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    -- 收款记录表
    CREATE TABLE IF NOT EXISTS payment_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      payment_no TEXT UNIQUE NOT NULL,
      customer_id INTEGER NOT NULL,
      customer_name TEXT,
      order_id INTEGER,
      amount REAL NOT NULL,
      payment_method TEXT DEFAULT 'cash',
      remark TEXT,
      operator TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (order_id) REFERENCES sales_orders(id)
    );

    -- 入库单表
    CREATE TABLE IF NOT EXISTS purchase_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_no TEXT UNIQUE NOT NULL,
      supplier_id INTEGER,
      supplier_name TEXT,
      total_amount REAL NOT NULL DEFAULT 0,
      total_quantity REAL NOT NULL DEFAULT 0,
      payable_amount REAL DEFAULT 0,
      paid_amount REAL DEFAULT 0,
      status TEXT DEFAULT 'completed',
      remark TEXT,
      operator TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
    );

    -- 入库单明细表
    CREATE TABLE IF NOT EXISTS purchase_order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      unit_id INTEGER NOT NULL,
      unit_name TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit_price REAL NOT NULL,
      subtotal REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (unit_id) REFERENCES product_units(id)
    );

    -- 库存流水表
    CREATE TABLE IF NOT EXISTS inventory_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      unit_id INTEGER,
      unit_name TEXT,
      type TEXT NOT NULL,
      quantity REAL NOT NULL,
      before_stock REAL NOT NULL,
      after_stock REAL NOT NULL,
      order_no TEXT,
      remark TEXT,
      operator TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    -- 操作日志表
    CREATE TABLE IF NOT EXISTS operation_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module TEXT NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id INTEGER NOT NULL,
      target_name TEXT,
      old_value TEXT,
      new_value TEXT,
      operator TEXT,
      device_info TEXT,
      ip_address TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    -- 打印模板表
    CREATE TABLE IF NOT EXISTS print_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'sale',
      paper_size TEXT DEFAULT '80mm',
      width INTEGER DEFAULT 80,
      show_logo INTEGER DEFAULT 1,
      show_cost INTEGER DEFAULT 0,
      show_profit INTEGER DEFAULT 0,
      show_customer_level INTEGER DEFAULT 0,
      font_size INTEGER DEFAULT 12,
      line_spacing INTEGER DEFAULT 1,
      header_content TEXT,
      footer_content TEXT,
      copies INTEGER DEFAULT 1,
      is_default INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    -- 蓝牙设备表
    CREATE TABLE IF NOT EXISTS bluetooth_devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT UNIQUE NOT NULL,
      type TEXT DEFAULT 'printer',
      brand TEXT,
      is_default INTEGER DEFAULT 0,
      last_connected_at TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    -- 系统设置表
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shop_name TEXT DEFAULT '我的店铺',
      shop_address TEXT,
      shop_phone TEXT,
      shop_logo TEXT,
      receipt_header TEXT,
      receipt_footer TEXT,
      qr_code_url TEXT,
      decimal_places INTEGER DEFAULT 2,
      default_payment_method TEXT DEFAULT 'cash',
      enable_voice INTEGER DEFAULT 1,
      enable_print_auto INTEGER DEFAULT 0,
      default_print_template_id INTEGER,
      new_customer_level_id INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    -- 创建索引
    CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_product_units_product ON product_units(product_id);
    CREATE INDEX IF NOT EXISTS idx_customers_level ON customers(level_id);
    CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
    CREATE INDEX IF NOT EXISTS idx_sales_orders_customer ON sales_orders(customer_id);
    CREATE INDEX IF NOT EXISTS idx_sales_orders_date ON sales_orders(created_at);
    CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON sales_orders(status);
    CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON purchase_orders(supplier_id);
    CREATE INDEX IF NOT EXISTS idx_inventory_logs_product ON inventory_logs(product_id);
    CREATE INDEX IF NOT EXISTS idx_operation_logs_module ON operation_logs(module);
    CREATE INDEX IF NOT EXISTS idx_operation_logs_target ON operation_logs(target_type, target_id);
    CREATE INDEX IF NOT EXISTS idx_payment_records_customer ON payment_records(customer_id);
  `);

  // 初始化默认数据
  await initDefaultData();

  return db;
}

// 初始化默认数据
async function initDefaultData(): Promise<void> {
  const database = getDatabase();

  // 检查并初始化客户等级
  const levels = await database.getAllAsync<CustomerLevel>('SELECT * FROM customer_levels');
  if (levels.length === 0) {
    await database.execAsync(`
      INSERT INTO customer_levels (name, discount, min_amount, sort_order, is_default) VALUES
      ('普通客户', 1.00, 0, 1, 1),
      ('VIP客户', 0.95, 5000, 2, 0),
      ('至尊客户', 0.90, 20000, 3, 0)
    `);
  }

  // 检查并初始化系统设置
  const settings = await database.getFirstAsync<Settings>('SELECT * FROM settings WHERE id = 1');
  if (!settings) {
    await database.runAsync(
      `INSERT INTO settings (id, shop_name, receipt_header, receipt_footer, decimal_places) 
       VALUES (1, '我的店铺', '欢迎光临', '谢谢惠顾，欢迎再次光临！', 2)`
    );
  }

  // 检查并初始化默认打印模板
  const templates = await database.getAllAsync<PrintTemplate>('SELECT * FROM print_templates');
  if (templates.length === 0) {
    await database.execAsync(`
      INSERT INTO print_templates (name, type, paper_size, width, show_logo, font_size, copies, is_default) VALUES
      ('零售小票', 'sale', '80mm', 80, 1, 12, 1, 1),
      ('批发单', 'sale', '80mm', 80, 1, 12, 2, 0),
      ('入库单', 'purchase', '80mm', 80, 1, 12, 1, 0),
      ('退货单', 'refund', '80mm', 80, 1, 12, 1, 0)
    `);
  }

  // 检查并初始化示例数据（仅在首次安装时）
  const categories = await database.getAllAsync<Category>('SELECT * FROM categories');
  if (categories.length === 0) {
    // 初始化商品分类
    await database.execAsync(`
      INSERT INTO categories (name, description, sort_order) VALUES
      ('日用百货', '日常生活用品', 1),
      ('食品饮料', '食品和饮料类', 2),
      ('办公用品', '办公文具用品', 3)
    `);

    // 初始化示例商品（带多单位）
    await database.execAsync(`
      INSERT INTO products (name, barcode, category_id, base_unit, base_stock, status) VALUES
      ('清风抽纸', '6901234567890', 1, '包', 100, 1),
      ('农夫山泉矿泉水', '6901234567891', 2, '瓶', 200, 1),
      ('A4打印纸', '6901234567892', 3, '包', 50, 1)
    `);

    // 初始化商品单位（多单位示例）
    await database.execAsync(`
      INSERT INTO product_units (product_id, unit_name, parent_unit_id, conversion_rate, level, purchase_price, sale_price, wholesale_price, vip_price, svip_price, min_stock, is_default_sale, is_default_purchase) VALUES
      -- 清风抽纸：包(基础) -> 提(1提=3包) -> 箱(1箱=10提=30包)
      (1, '包', NULL, 1, 0, 3.5, 5.0, 4.5, 4.8, 4.6, 20, 1, 1),
      (1, '提', 1, 3, 1, 10.5, 14.0, 13.0, 13.5, 13.0, 0, 0, 0),
      (1, '箱', 2, 30, 2, 100.0, 130.0, 120.0, 125.0, 120.0, 0, 0, 0),
      -- 农夫山泉：瓶(基础) -> 件(1件=24瓶)
      (2, '瓶', NULL, 1, 0, 1.0, 2.0, 1.8, 1.9, 1.8, 50, 1, 1),
      (2, '件', 4, 24, 1, 22.0, 40.0, 38.0, 39.0, 38.0, 0, 0, 0),
      -- A4打印纸：包(基础) -> 箱(1箱=5包)
      (3, '包', NULL, 1, 0, 18.0, 25.0, 23.0, 24.0, 23.0, 10, 1, 1),
      (3, '箱', 6, 5, 1, 85.0, 110.0, 105.0, 108.0, 105.0, 0, 0, 0)
    `);

    // 更新商品库存为基础单位库存
    await database.execAsync(`
      UPDATE products SET base_stock = 100 WHERE id = 1;
      UPDATE products SET base_stock = 200 WHERE id = 2;
      UPDATE products SET base_stock = 50 WHERE id = 3;
    `);

    // 初始化示例客户
    await database.execAsync(`
      INSERT INTO customers (name, phone, address, level_id, balance, total_purchase, total_orders, status) VALUES
      ('张三', '13800138001', '北京市朝阳区xxx街道', 1, 0, 0, 0, 1),
      ('李四', '13800138002', '上海市浦东新区xxx路', 2, 500, 15000, 8, 1),
      ('王五', '13800138003', '广州市天河区xxx大道', 3, 200, 35000, 15, 1)
    `);

    // 初始化示例供应商
    await database.execAsync(`
      INSERT INTO suppliers (name, contact, phone, address, balance, total_purchase, status) VALUES
      ('清风纸业', '赵经理', '010-12345678', '北京市大兴区', 0, 5000, 1),
      ('农夫山泉经销商', '钱经理', '021-87654321', '上海市松江区', 2000, 8000, 1),
      ('办公用品批发商', '孙经理', '020-11112222', '广州市白云区', 0, 3000, 1)
    `);

    console.log('示例数据初始化完成');
  }
}

// 获取数据库实例
export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    throw new Error('数据库未初始化，请先调用 initDatabase()');
  }
  return db;
}

// 生成订单号
export function generateOrderNo(prefix: string = 'SO'): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `${prefix}${year}${month}${day}${hour}${minute}${second}${random}`;
}

// 记录操作日志
export async function logOperation(
  module: string,
  action: string,
  targetType: string,
  targetId: number,
  targetName?: string,
  oldValue?: any,
  newValue?: any,
  operator?: string
): Promise<void> {
  const database = getDatabase();
  await database.runAsync(
    `INSERT INTO operation_logs (module, action, target_type, target_id, target_name, old_value, new_value, operator, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))`,
    [module, action, targetType, targetId, targetName || null, oldValue ? JSON.stringify(oldValue) : null, newValue ? JSON.stringify(newValue) : null, operator || null]
  );
}

// 数据库备份（导出为JSON）
export async function exportDatabase(): Promise<string> {
  const database = getDatabase();

  const tables = [
    'categories', 'products', 'product_units', 'customer_levels', 'customers',
    'suppliers', 'sales_orders', 'sales_order_items', 'price_change_logs',
    'refund_orders', 'refund_order_items', 'payment_records',
    'purchase_orders', 'purchase_order_items', 'inventory_logs',
    'operation_logs', 'print_templates', 'bluetooth_devices', 'settings'
  ];

  const data: any = { exportTime: new Date().toISOString() };

  for (const table of tables) {
    data[table] = await database.getAllAsync(`SELECT * FROM ${table}`);
  }

  return JSON.stringify(data, null, 2);
}

// 数据库恢复（从JSON导入）
export async function importDatabase(jsonData: string): Promise<void> {
  const database = getDatabase();
  const data = JSON.parse(jsonData);

  await database.execAsync('BEGIN TRANSACTION');

  try {
    // 清空所有表
    const tables = [
      'sales_order_items', 'sales_orders', 'refund_order_items', 'refund_orders',
      'payment_records', 'purchase_order_items', 'purchase_orders',
      'price_change_logs', 'inventory_logs', 'operation_logs',
      'product_units', 'products', 'categories',
      'customers', 'customer_levels', 'suppliers',
      'bluetooth_devices', 'print_templates', 'settings'
    ];

    for (const table of tables) {
      await database.execAsync(`DELETE FROM ${table}`);
    }

    // 恢复数据...（简化版，实际需要遍历每个表插入数据）

    await database.execAsync('COMMIT');
  } catch (error) {
    await database.execAsync('ROLLBACK');
    throw error;
  }
}
