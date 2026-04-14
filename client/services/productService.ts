/**
 * 商品多单位服务
 * 支持无限层级多单位管理、换算、价格设置
 */
import { getDatabase, generateOrderNo, logOperation } from './database';
import { Product, ProductUnit, Category } from './database';

export type { Product, ProductUnit, Category } from './database';

// ==================== 商品分类服务 ====================

export async function getCategories(): Promise<Category[]> {
  const db = getDatabase();
  return db.getAllAsync<Category>('SELECT * FROM categories ORDER BY sort_order, id');
}

export async function getCategoryById(id: number): Promise<Category | null> {
  const db = getDatabase();
  return db.getFirstAsync<Category>('SELECT * FROM categories WHERE id = ?', [id]);
}

export async function createCategory(data: { name: string; description?: string; sort_order?: number }): Promise<number> {
  const db = getDatabase();
  const result = await db.runAsync(
    `INSERT INTO categories (name, description, sort_order) VALUES (?, ?, ?)`,
    [data.name, data.description || null, data.sort_order || 0]
  );
  await logOperation('product', 'create', 'category', result.lastInsertRowId, data.name);
  return result.lastInsertRowId;
}

export async function updateCategory(id: number, data: Partial<Category>): Promise<void> {
  const db = getDatabase();
  const old = await getCategoryById(id);
  await db.runAsync(
    `UPDATE categories SET name = ?, description = ?, sort_order = ?, updated_at = datetime('now', 'localtime') WHERE id = ?`,
    [data.name ?? '', data.description ?? null, data.sort_order ?? 0, id]
  );
  await logOperation('product', 'update', 'category', id, data.name ?? '', old, data);
}

export async function deleteCategory(id: number): Promise<void> {
  const db = getDatabase();
  const old = await getCategoryById(id);
  await db.runAsync('DELETE FROM categories WHERE id = ?', [id]);
  await logOperation('product', 'delete', 'category', id, old?.name);
}

// ==================== 商品服务 ====================

export interface ProductWithUnits extends Product {
  units: ProductUnit[];
}

export async function getProducts(categoryId?: number): Promise<ProductWithUnits[]> {
  const db = getDatabase();
  let sql = `
    SELECT p.*, c.name as category_name 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
    WHERE p.status = 1
  `;
  const params: any[] = [];
  if (categoryId) {
    sql += ' AND p.category_id = ?';
    params.push(categoryId);
  }
  sql += ' ORDER BY p.id DESC';

  const products = await db.getAllAsync<Product>(sql, params);

  // 获取每个商品的单位
  const productsWithUnits: ProductWithUnits[] = [];
  for (const product of products) {
    const units = await db.getAllAsync<ProductUnit>(
      'SELECT * FROM product_units WHERE product_id = ? ORDER BY level, id',
      [product.id]
    );
    productsWithUnits.push({ ...product, units });
  }

  return productsWithUnits;
}

export async function getProductById(id: number): Promise<ProductWithUnits | null> {
  const db = getDatabase();
  const product = await db.getFirstAsync<Product>(
    `SELECT p.*, c.name as category_name 
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     WHERE p.id = ?`,
    [id]
  );

  if (!product) return null;

  const units = await db.getAllAsync<ProductUnit>(
    'SELECT * FROM product_units WHERE product_id = ? ORDER BY level, id',
    [id]
  );

  return { ...product, units };
}

export async function getProductByBarcode(barcode: string): Promise<ProductWithUnits | null> {
  const db = getDatabase();
  const product = await db.getFirstAsync<Product>(
    'SELECT * FROM products WHERE barcode = ? AND status = 1',
    [barcode]
  );

  if (!product) return null;

  const units = await db.getAllAsync<ProductUnit>(
    'SELECT * FROM product_units WHERE product_id = ? ORDER BY level, id',
    [product.id]
  );

  return { ...product, units };
}

export async function searchProducts(keyword: string): Promise<ProductWithUnits[]> {
  const db = getDatabase();
  const products = await db.getAllAsync<Product>(
    `SELECT p.*, c.name as category_name 
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     WHERE p.status = 1 AND (p.name LIKE ? OR p.barcode LIKE ?)
     ORDER BY p.id DESC`,
    [`%${keyword}%`, `%${keyword}%`]
  );

  const productsWithUnits: ProductWithUnits[] = [];
  for (const product of products) {
    const units = await db.getAllAsync<ProductUnit>(
      'SELECT * FROM product_units WHERE product_id = ? ORDER BY level, id',
      [product.id]
    );
    productsWithUnits.push({ ...product, units });
  }

  return productsWithUnits;
}

// 创建商品（含多单位）
export async function createProduct(data: {
  name: string;
  barcode?: string;
  category_id?: number;
  base_unit: string;
  image_url?: string;
  description?: string;
  units: Array<{
    unit_name: string;
    parent_unit_id?: number;
    conversion_rate: number;
    level: number;
    purchase_price: number;
    sale_price: number;
    wholesale_price?: number;
    vip_price?: number;
    svip_price?: number;
    min_stock?: number;
    is_default_sale?: number;
    is_default_purchase?: number;
  }>;
}): Promise<number> {
  const db = getDatabase();

  await db.execAsync('BEGIN TRANSACTION');
  try {
    // 插入商品
    const result = await db.runAsync(
      `INSERT INTO products (name, barcode, category_id, base_unit, image_url, description) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [data.name, data.barcode || null, data.category_id || null, data.base_unit, data.image_url || null, data.description || null]
    );

    const productId = result.lastInsertRowId;

    // 插入单位
    for (const unit of data.units) {
      await db.runAsync(
        `INSERT INTO product_units 
         (product_id, unit_name, parent_unit_id, conversion_rate, level, purchase_price, sale_price, 
          wholesale_price, vip_price, svip_price, min_stock, is_default_sale, is_default_purchase)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          productId, unit.unit_name, unit.parent_unit_id || null, unit.conversion_rate, unit.level,
          unit.purchase_price, unit.sale_price, unit.wholesale_price || 0,
          unit.vip_price || 0, unit.svip_price || 0, unit.min_stock || 0,
          unit.is_default_sale || 0, unit.is_default_purchase || 0
        ]
      );
    }

    await db.execAsync('COMMIT');
    await logOperation('product', 'create', 'product', productId, data.name);
    return productId;
  } catch (error) {
    await db.execAsync('ROLLBACK');
    throw error;
  }
}

// 更新商品
export async function updateProduct(id: number, data: Partial<Product> & { units?: ProductUnit[] }): Promise<void> {
  const db = getDatabase();
  const old = await getProductById(id);

  await db.execAsync('BEGIN TRANSACTION');
  try {
    await db.runAsync(
      `UPDATE products SET name = ?, barcode = ?, category_id = ?, base_unit = ?, 
       image_url = ?, description = ?, status = ?, updated_at = datetime('now', 'localtime') 
       WHERE id = ?`,
      [data.name ?? '', data.barcode ?? null, data.category_id ?? null, data.base_unit ?? '件', data.image_url ?? null, data.description ?? null, data.status ?? 1, id]
    );

    // 更新单位（如果提供了）
    if (data.units) {
      // 先删除旧单位
      await db.runAsync('DELETE FROM product_units WHERE product_id = ?', [id]);

      // 插入新单位
      for (const unit of data.units) {
        await db.runAsync(
          `INSERT INTO product_units 
           (product_id, unit_name, parent_unit_id, conversion_rate, level, purchase_price, sale_price, 
            wholesale_price, vip_price, svip_price, min_stock, is_default_sale, is_default_purchase)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id, unit.unit_name, unit.parent_unit_id || null, unit.conversion_rate, unit.level,
            unit.purchase_price, unit.sale_price, unit.wholesale_price || 0,
            unit.vip_price || 0, unit.svip_price || 0, unit.min_stock || 0,
            unit.is_default_sale || 0, unit.is_default_purchase || 0
          ]
        );
      }
    }

    await db.execAsync('COMMIT');
    await logOperation('product', 'update', 'product', id, data.name, old, data);
  } catch (error) {
    await db.execAsync('ROLLBACK');
    throw error;
  }
}

// 删除商品（软删除）
export async function deleteProduct(id: number): Promise<void> {
  const db = getDatabase();
  const old = await getProductById(id);
  await db.runAsync('UPDATE products SET status = 0, updated_at = datetime(\'now\', \'localtime\') WHERE id = ?', [id]);
  await logOperation('product', 'delete', 'product', id, old?.name);
}

// ==================== 商品单位服务 ====================

// 获取商品的所有单位（按层级排列）
export async function getProductUnits(productId: number): Promise<ProductUnit[]> {
  const db = getDatabase();
  return db.getAllAsync<ProductUnit>(
    'SELECT * FROM product_units WHERE product_id = ? ORDER BY level, id',
    [productId]
  );
}

// 获取单位层级树结构
export interface UnitTreeNode extends ProductUnit {
  children: UnitTreeNode[];
}

export function buildUnitTree(units: ProductUnit[]): UnitTreeNode[] {
  const map = new Map<number, UnitTreeNode>();
  const roots: UnitTreeNode[] = [];

  // 创建节点映射
  for (const unit of units) {
    map.set(unit.id, { ...unit, children: [] });
  }

  // 构建树
  for (const unit of units) {
    const node = map.get(unit.id)!;
    if (unit.parent_unit_id && map.has(unit.parent_unit_id)) {
      map.get(unit.parent_unit_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

// 换算数量到基础单位
export function convertToBaseQuantity(quantity: number, unit: ProductUnit): number {
  return quantity * unit.conversion_rate;
}

// 从基础单位换算到目标单位
export function convertFromBaseQuantity(baseQuantity: number, unit: ProductUnit): number {
  return baseQuantity / unit.conversion_rate;
}

// 获取商品库存（基础单位）
export async function getProductBaseStock(productId: number): Promise<number> {
  const db = getDatabase();
  const product = await db.getFirstAsync<Product>('SELECT base_stock FROM products WHERE id = ?', [productId]);
  return product?.base_stock || 0;
}

// 获取商品在指定单位的库存
export async function getProductStockByUnit(productId: number, unitId: number): Promise<number> {
  const db = getDatabase();
  const [product, unit] = await Promise.all([
    db.getFirstAsync<Product>('SELECT base_stock FROM products WHERE id = ?', [productId]),
    db.getFirstAsync<ProductUnit>('SELECT * FROM product_units WHERE id = ?', [unitId])
  ]);

  if (!product || !unit) return 0;

  return convertFromBaseQuantity(product.base_stock, unit);
}

// 更新商品库存（基础单位）
export async function updateProductStock(
  productId: number,
  quantityChange: number,
  unitId: number | null,
  type: string,
  orderNo?: string,
  remark?: string,
  operator?: string
): Promise<void> {
  const db = getDatabase();

  // 获取商品信息
  const product = await db.getFirstAsync<Product>('SELECT * FROM products WHERE id = ?', [productId]);
  if (!product) throw new Error('商品不存在');

  // 获取单位信息，如果没有指定单位，使用基础单位
  let unit: ProductUnit | null = null;
  if (unitId) {
    unit = await db.getFirstAsync<ProductUnit>('SELECT * FROM product_units WHERE id = ?', [unitId]);
  }
  if (!unit) {
    // 使用基础单位（level = 0）
    unit = await db.getFirstAsync<ProductUnit>('SELECT * FROM product_units WHERE product_id = ? AND level = 0 LIMIT 1', [productId]);
  }
  if (!unit) throw new Error('商品单位不存在');

  // 换算到基础单位
  const baseQuantityChange = convertToBaseQuantity(quantityChange, unit);
  const beforeStock = product.base_stock;
  const afterStock = beforeStock + baseQuantityChange;

  // 更新库存
  await db.runAsync(
    'UPDATE products SET base_stock = ?, updated_at = datetime(\'now\', \'localtime\') WHERE id = ?',
    [afterStock, productId]
  );

  // 记录库存流水
  await db.runAsync(
    `INSERT INTO inventory_logs 
     (product_id, product_name, unit_id, unit_name, type, quantity, before_stock, after_stock, order_no, remark, operator)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [productId, product.name, unitId, unit.unit_name, type, quantityChange, beforeStock, afterStock, orderNo || null, remark || null, operator || null]
  );
}

// 获取商品统计信息
export async function getProductStats(): Promise<{
  total_count: number;
  low_stock_count: number;
  out_stock_count: number;
}> {
  const db = getDatabase();

  const total = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM products WHERE status = 1'
  );

  const lowStock = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(DISTINCT p.id) as count 
     FROM products p 
     JOIN product_units pu ON p.id = pu.product_id 
     WHERE p.status = 1 AND p.base_stock <= pu.min_stock AND pu.min_stock > 0`
  );

  const outStock = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM products WHERE status = 1 AND base_stock <= 0'
  );

  return {
    total_count: total?.count || 0,
    low_stock_count: lowStock?.count || 0,
    out_stock_count: outStock?.count || 0,
  };
}

// 根据客户等级获取商品价格
export function getPriceByLevel(unit: ProductUnit, levelId: number): number {
  // 价格优先级：手动改价 > 客户等级价格 > 商品默认售价
  // levelId: 1=普通, 2=VIP, 3=至尊VIP
  switch (levelId) {
    case 3: // 至尊VIP
      return unit.svip_price || unit.vip_price || unit.sale_price;
    case 2: // VIP
      return unit.vip_price || unit.sale_price;
    default: // 普通
      return unit.sale_price;
  }
}

// 获取默认销售单位
export function getDefaultSaleUnit(productId: number): Promise<ProductUnit | null> {
  const db = getDatabase();
  return db.getFirstAsync<ProductUnit>(
    'SELECT * FROM product_units WHERE product_id = ? AND is_default_sale = 1',
    [productId]
  );
}

// 获取默认采购单位
export function getDefaultPurchaseUnit(productId: number): Promise<ProductUnit | null> {
  const db = getDatabase();
  return db.getFirstAsync<ProductUnit>(
    'SELECT * FROM product_units WHERE product_id = ? AND is_default_purchase = 1',
    [productId]
  );
}
