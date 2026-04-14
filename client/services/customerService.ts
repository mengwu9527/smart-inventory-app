/**
 * 客户服务 - 含客户分级管理
 */
import { getDatabase, generateOrderNo, logOperation } from './database';
import { Customer, CustomerLevel } from './database';

export type { Customer, CustomerLevel } from './database';

// ==================== 客户等级服务 ====================

export async function getCustomerLevels(): Promise<CustomerLevel[]> {
  const db = getDatabase();
  return db.getAllAsync<CustomerLevel>('SELECT * FROM customer_levels ORDER BY sort_order, id');
}

export async function getCustomerLevelById(id: number): Promise<CustomerLevel | null> {
  const db = getDatabase();
  return db.getFirstAsync<CustomerLevel>('SELECT * FROM customer_levels WHERE id = ?', [id]);
}

export async function createCustomerLevel(data: {
  name: string;
  discount: number;
  min_amount: number;
  sort_order?: number;
  is_default?: number;
}): Promise<number> {
  const db = getDatabase();
  const result = await db.runAsync(
    `INSERT INTO customer_levels (name, discount, min_amount, sort_order, is_default) 
     VALUES (?, ?, ?, ?, ?)`,
    [data.name, data.discount, data.min_amount, data.sort_order || 0, data.is_default || 0]
  );
  await logOperation('customer', 'create', 'customer_level', result.lastInsertRowId, data.name);
  return result.lastInsertRowId;
}

export async function updateCustomerLevel(id: number, data: Partial<CustomerLevel>): Promise<void> {
  const db = getDatabase();
  const old = await getCustomerLevelById(id);
  await db.runAsync(
    `UPDATE customer_levels SET name = ?, discount = ?, min_amount = ?, sort_order = ?, is_default = ? 
     WHERE id = ?`,
    [data.name ?? '', data.discount ?? 0, data.min_amount ?? 0, data.sort_order ?? 0, data.is_default ?? 0, id]
  );
  await logOperation('customer', 'update', 'customer_level', id, data.name ?? '', old, data);
}

export async function deleteCustomerLevel(id: number): Promise<void> {
  const db = getDatabase();
  const old = await getCustomerLevelById(id);
  
  // 检查是否有客户使用该等级
  const count = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM customers WHERE level_id = ?',
    [id]
  );
  
  if (count && count.count > 0) {
    throw new Error('该等级下存在客户，无法删除');
  }
  
  await db.runAsync('DELETE FROM customer_levels WHERE id = ?', [id]);
  await logOperation('customer', 'delete', 'customer_level', id, old?.name);
}

export async function getDefaultCustomerLevel(): Promise<CustomerLevel | null> {
  const db = getDatabase();
  return db.getFirstAsync<CustomerLevel>(
    'SELECT * FROM customer_levels WHERE is_default = 1 LIMIT 1'
  );
}

// 根据消费金额自动升级客户等级
export async function autoUpgradeCustomerLevel(customerId: number): Promise<void> {
  const db = getDatabase();
  
  const customer = await db.getFirstAsync<Customer>(
    'SELECT * FROM customers WHERE id = ?',
    [customerId]
  );
  
  if (!customer) return;
  
  const levels = await getCustomerLevels();
  
  // 找到符合当前消费金额的最高等级
  let newLevelId = customer.level_id;
  for (const level of levels) {
    if (customer.total_purchase >= level.min_amount && level.id > newLevelId) {
      newLevelId = level.id;
    }
  }
  
  if (newLevelId !== customer.level_id) {
    const oldLevel = await getCustomerLevelById(customer.level_id);
    const newLevel = await getCustomerLevelById(newLevelId);
    
    await db.runAsync(
      'UPDATE customers SET level_id = ?, updated_at = datetime(\'now\', \'localtime\') WHERE id = ?',
      [newLevelId, customerId]
    );
    
    await logOperation('customer', 'upgrade', 'customer', customerId, customer.name, 
      { level: oldLevel?.name }, { level: newLevel?.name });
  }
}

// ==================== 客户服务 ====================

export interface CustomerWithLevel extends Customer {
  level_name?: string;
  level_discount?: number;
}

export async function getCustomers(): Promise<CustomerWithLevel[]> {
  const db = getDatabase();
  return db.getAllAsync<CustomerWithLevel>(
    `SELECT c.*, cl.name as level_name, cl.discount as level_discount 
     FROM customers c 
     LEFT JOIN customer_levels cl ON c.level_id = cl.id 
     WHERE c.status = 1
     ORDER BY c.id DESC`
  );
}

export async function getCustomerById(id: number): Promise<CustomerWithLevel | null> {
  const db = getDatabase();
  return db.getFirstAsync<CustomerWithLevel>(
    `SELECT c.*, cl.name as level_name, cl.discount as level_discount 
     FROM customers c 
     LEFT JOIN customer_levels cl ON c.level_id = cl.id 
     WHERE c.id = ?`,
    [id]
  );
}

export async function searchCustomers(keyword: string): Promise<CustomerWithLevel[]> {
  const db = getDatabase();
  return db.getAllAsync<CustomerWithLevel>(
    `SELECT c.*, cl.name as level_name, cl.discount as level_discount 
     FROM customers c 
     LEFT JOIN customer_levels cl ON c.level_id = cl.id 
     WHERE c.status = 1 AND (c.name LIKE ? OR c.phone LIKE ?)
     ORDER BY c.id DESC`,
    [`%${keyword}%`, `%${keyword}%`]
  );
}

export async function createCustomer(data: {
  name: string;
  phone?: string;
  address?: string;
  email?: string;
  level_id?: number;
  credit_limit?: number;
  remark?: string;
}): Promise<number> {
  const db = getDatabase();
  
  // 获取默认等级
  let levelId = data.level_id;
  if (!levelId) {
    const defaultLevel = await getDefaultCustomerLevel();
    levelId = defaultLevel?.id || 1;
  }
  
  const result = await db.runAsync(
    `INSERT INTO customers (name, phone, address, email, level_id, credit_limit, remark) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [data.name, data.phone || null, data.address || null, data.email || null, levelId, data.credit_limit || 0, data.remark || null]
  );
  
  await logOperation('customer', 'create', 'customer', result.lastInsertRowId, data.name);
  return result.lastInsertRowId;
}

export async function updateCustomer(id: number, data: Partial<Customer>): Promise<void> {
  const db = getDatabase();
  const old = await getCustomerById(id);
  
  await db.runAsync(
    `UPDATE customers SET name = ?, phone = ?, address = ?, email = ?, level_id = ?, 
     credit_limit = ?, remark = ?, updated_at = datetime('now', 'localtime') 
     WHERE id = ?`,
    [data.name ?? '', data.phone ?? null, data.address ?? null, data.email ?? null, data.level_id ?? 1, data.credit_limit ?? 0, data.remark ?? null, id]
  );
  
  await logOperation('customer', 'update', 'customer', id, data.name ?? '', old, data);
}

export async function deleteCustomer(id: number): Promise<void> {
  const db = getDatabase();
  const old = await getCustomerById(id);
  
  // 检查是否有未结清的应收款
  if (old && old.balance > 0) {
    throw new Error('该客户有未结清的应收款，无法删除');
  }
  
  await db.runAsync('UPDATE customers SET status = 0 WHERE id = ?', [id]);
  await logOperation('customer', 'delete', 'customer', id, old?.name);
}

// 更新客户消费统计
export async function updateCustomerStats(customerId: number, amount: number): Promise<void> {
  const db = getDatabase();
  
  await db.runAsync(
    `UPDATE customers SET 
     total_purchase = total_purchase + ?,
     total_orders = total_orders + 1,
     last_purchase_date = date('now'),
     updated_at = datetime('now', 'localtime')
     WHERE id = ?`,
    [amount, customerId]
  );
  
  // 自动检查升级
  await autoUpgradeCustomerLevel(customerId);
}

// 获取客户统计信息
export async function getCustomerStats(): Promise<{
  total_count: number;
  total_receivable: number;
  vip_count: number;
}> {
  const db = getDatabase();
  
  const total = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM customers WHERE status = 1'
  );
  
  const receivable = await db.getFirstAsync<{ total: number }>(
    'SELECT SUM(balance) as total FROM customers WHERE status = 1 AND balance > 0'
  );
  
  const vip = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM customers c 
     JOIN customer_levels cl ON c.level_id = cl.id 
     WHERE c.status = 1 AND cl.id > 1`
  );
  
  return {
    total_count: total?.count || 0,
    total_receivable: receivable?.total || 0,
    vip_count: vip?.count || 0,
  };
}

// 获取客户应收款明细
export async function getCustomerReceivables(customerId?: number): Promise<any[]> {
  const db = getDatabase();
  
  let sql = `
    SELECT so.*, c.name as customer_name, cl.name as level_name
    FROM sales_orders so
    JOIN customers c ON so.customer_id = c.id
    LEFT JOIN customer_levels cl ON c.level_id = cl.id
    WHERE so.receivable_amount > 0
  `;
  const params: any[] = [];
  
  if (customerId) {
    sql += ' AND so.customer_id = ?';
    params.push(customerId);
  }
  
  sql += ' ORDER BY so.created_at DESC';
  
  return db.getAllAsync(sql, params);
}

// 获取客户消费排行
export async function getCustomerRanking(limit: number = 10): Promise<CustomerWithLevel[]> {
  const db = getDatabase();
  return db.getAllAsync<CustomerWithLevel>(
    `SELECT c.*, cl.name as level_name, cl.discount as level_discount 
     FROM customers c 
     LEFT JOIN customer_levels cl ON c.level_id = cl.id 
     WHERE c.status = 1
     ORDER BY c.total_purchase DESC
     LIMIT ?`,
    [limit]
  );
}
