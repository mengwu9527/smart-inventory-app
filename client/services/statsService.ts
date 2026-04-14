/**
 * 统计分析服务
 * 提供全维度的销售、采购、库存、客户、利润等统计分析
 */
import { getDatabase } from './database';

// ==================== 仪表盘概览统计 ====================

export interface DashboardStats {
  sales: {
    today_amount: number;
    today_orders: number;
    month_amount: number;
    month_orders: number;
    total_amount: number;
    total_orders: number;
  };
  purchase: {
    today_amount: number;
    month_amount: number;
    total_amount: number;
    total_payable: number;
  };
  inventory: {
    total_products: number;
    low_stock_count: number;
    out_stock_count: number;
    total_value: number;
  };
  customer: {
    total_count: number;
    vip_count: number;
    total_receivable: number;
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const db = getDatabase();

  // 今日销售
  const todaySales = await db.getFirstAsync<{
    amount: number;
    orders: number;
  }>(
    `SELECT 
       COALESCE(SUM(total_amount), 0) as amount,
       COUNT(*) as orders
     FROM sales_orders 
     WHERE date(created_at) = date('now') AND status != 'refunded'`
  );

  // 本月销售
  const monthSales = await db.getFirstAsync<{
    amount: number;
    orders: number;
  }>(
    `SELECT 
       COALESCE(SUM(total_amount), 0) as amount,
       COUNT(*) as orders
     FROM sales_orders 
     WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now') 
       AND status != 'refunded'`
  );

  // 总销售
  const totalSales = await db.getFirstAsync<{
    amount: number;
    orders: number;
  }>(
    `SELECT 
       COALESCE(SUM(total_amount), 0) as amount,
       COUNT(*) as orders
     FROM sales_orders 
     WHERE status != 'refunded'`
  );

  // 今日采购
  const todayPurchase = await db.getFirstAsync<{ amount: number }>(
    `SELECT COALESCE(SUM(total_amount), 0) as amount 
     FROM purchase_orders 
     WHERE date(created_at) = date('now')`
  );

  // 本月采购
  const monthPurchase = await db.getFirstAsync<{ amount: number }>(
    `SELECT COALESCE(SUM(total_amount), 0) as amount 
     FROM purchase_orders 
     WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')`
  );

  // 总采购
  const totalPurchase = await db.getFirstAsync<{ amount: number }>(
    `SELECT COALESCE(SUM(total_amount), 0) as amount FROM purchase_orders`
  );

  // 应付款
  const totalPayable = await db.getFirstAsync<{ total: number }>(
    `SELECT COALESCE(SUM(balance), 0) as total FROM suppliers WHERE status = 1`
  );

  // 库存统计
  const productStats = await db.getAllAsync<{
    id: number;
    base_stock: number;
    min_stock: number;
  }>(
    `SELECT p.id, p.base_stock, pu.min_stock 
     FROM products p 
     JOIN product_units pu ON p.id = pu.product_id 
     WHERE p.status = 1`
  );

  const totalProducts = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM products WHERE status = 1'
  );

  let lowStockCount = 0;
  let outStockCount = 0;
  let totalValue = 0;

  for (const p of productStats) {
    if (p.base_stock <= 0) {
      outStockCount++;
    } else if (p.min_stock > 0 && p.base_stock <= p.min_stock) {
      lowStockCount++;
    }
  }

  // 库存总值（使用基础单位的采购价）
  const stockValue = await db.getFirstAsync<{ total: number }>(
    `SELECT COALESCE(SUM(p.base_stock * pu.purchase_price), 0) as total
     FROM products p
     JOIN product_units pu ON p.id = pu.product_id
     WHERE p.status = 1 AND pu.level = 0`
  );

  // 客户统计
  const customerStats = await db.getFirstAsync<{
    total: number;
    vip: number;
    receivable: number;
  }>(
    `SELECT 
       COUNT(*) as total,
       SUM(CASE WHEN level_id > 1 THEN 1 ELSE 0 END) as vip,
       COALESCE(SUM(balance), 0) as receivable
     FROM customers WHERE status = 1`
  );

  return {
    sales: {
      today_amount: todaySales?.amount || 0,
      today_orders: todaySales?.orders || 0,
      month_amount: monthSales?.amount || 0,
      month_orders: monthSales?.orders || 0,
      total_amount: totalSales?.amount || 0,
      total_orders: totalSales?.orders || 0,
    },
    purchase: {
      today_amount: todayPurchase?.amount || 0,
      month_amount: monthPurchase?.amount || 0,
      total_amount: totalPurchase?.amount || 0,
      total_payable: totalPayable?.total || 0,
    },
    inventory: {
      total_products: totalProducts?.count || 0,
      low_stock_count: lowStockCount,
      out_stock_count: outStockCount,
      total_value: stockValue?.total || 0,
    },
    customer: {
      total_count: customerStats?.total || 0,
      vip_count: customerStats?.vip || 0,
      total_receivable: customerStats?.receivable || 0,
    },
  };
}

// ==================== 销售趋势分析 ====================

export interface SalesTrend {
  date: string;
  amount: number;
  profit: number;
  orders: number;
  quantity: number;
}

export async function getSalesTrend(days: number = 30): Promise<SalesTrend[]> {
  const db = getDatabase();

  return db.getAllAsync<SalesTrend>(
    `SELECT 
       date(created_at) as date,
       COALESCE(SUM(total_amount), 0) as amount,
       COALESCE(SUM(profit), 0) as profit,
       COUNT(*) as orders,
       COALESCE(SUM(total_quantity), 0) as quantity
     FROM sales_orders 
     WHERE date(created_at) >= date('now', '-' || ? || ' days')
       AND status != 'refunded'
     GROUP BY date(created_at)
     ORDER BY date ASC`,
    [days]
  );
}

// 按月统计
export async function getMonthlySalesTrend(months: number = 12): Promise<Array<{
  month: string;
  amount: number;
  profit: number;
  orders: number;
}>> {
  const db = getDatabase();

  return db.getAllAsync(
    `SELECT 
       strftime('%Y-%m', created_at) as month,
       COALESCE(SUM(total_amount), 0) as amount,
       COALESCE(SUM(profit), 0) as profit,
       COUNT(*) as orders
     FROM sales_orders 
     WHERE strftime('%Y-%m', created_at) >= strftime('%Y-%m', 'now', '-' || ? || ' months')
       AND status != 'refunded'
     GROUP BY strftime('%Y-%m', created_at)
     ORDER BY month ASC`,
    [months]
  );
}

// ==================== 商品销售排行 ====================

export interface ProductSalesRanking {
  product_id: number;
  product_name: string;
  category_name?: string;
  total_quantity: number;
  total_amount: number;
  total_profit: number;
  profit_rate: number;
  order_count: number;
}

export async function getProductSalesRanking(params?: {
  start_date?: string;
  end_date?: string;
  category_id?: number;
  order_by?: 'quantity' | 'amount' | 'profit';
  limit?: number;
}): Promise<ProductSalesRanking[]> {
  const db = getDatabase();

  let whereClause = 'so.status != \'refunded\'';
  const sqlParams: any[] = [];

  if (params?.start_date) {
    whereClause += ' AND date(so.created_at) >= ?';
    sqlParams.push(params.start_date);
  }
  if (params?.end_date) {
    whereClause += ' AND date(so.created_at) <= ?';
    sqlParams.push(params.end_date);
  }
  if (params?.category_id) {
    whereClause += ' AND p.category_id = ?';
    sqlParams.push(params.category_id);
  }

  const orderBy = params?.order_by || 'amount';
  const limit = params?.limit || 50;

  return db.getAllAsync<ProductSalesRanking>(
    `SELECT 
       soi.product_id,
       soi.product_name,
       c.name as category_name,
       SUM(soi.quantity) as total_quantity,
       SUM(soi.subtotal) as total_amount,
       SUM(soi.profit) as total_profit,
       CASE WHEN SUM(soi.subtotal) > 0 
         THEN ROUND(SUM(soi.profit) / SUM(soi.subtotal) * 100, 2) 
         ELSE 0 END as profit_rate,
       COUNT(DISTINCT so.id) as order_count
     FROM sales_order_items soi
     JOIN sales_orders so ON soi.order_id = so.id
     LEFT JOIN products p ON soi.product_id = p.id
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE ${whereClause}
     GROUP BY soi.product_id, soi.product_name, c.name
     ORDER BY total_${orderBy} DESC
     LIMIT ?`,
    [...sqlParams, limit]
  );
}

// ==================== 客户分析 ====================

export interface CustomerAnalysis {
  customer_id: number;
  customer_name: string;
  level_name: string;
  total_amount: number;
  total_profit: number;
  order_count: number;
  avg_order_amount: number;
  last_purchase_date: string;
  balance: number;
}

export async function getCustomerAnalysis(params?: {
  start_date?: string;
  end_date?: string;
  level_id?: number;
  order_by?: 'amount' | 'orders' | 'profit';
  limit?: number;
}): Promise<CustomerAnalysis[]> {
  const db = getDatabase();

  let whereClause = 'c.status = 1';
  const sqlParams: any[] = [];

  if (params?.level_id) {
    whereClause += ' AND c.level_id = ?';
    sqlParams.push(params.level_id);
  }

  const dateFilter = params?.start_date || params?.end_date 
    ? `AND so.status != 'refunded'` 
    : '';
  if (params?.start_date) {
    whereClause += ' AND date(so.created_at) >= ?';
    sqlParams.push(params.start_date);
  }
  if (params?.end_date) {
    whereClause += ' AND date(so.created_at) <= ?';
    sqlParams.push(params.end_date);
  }

  const orderBy = params?.order_by || 'amount';
  const limit = params?.limit || 50;

  return db.getAllAsync<CustomerAnalysis>(
    `SELECT 
       c.id as customer_id,
       c.name as customer_name,
       cl.name as level_name,
       COALESCE(SUM(so.total_amount), 0) as total_amount,
       COALESCE(SUM(so.profit), 0) as total_profit,
       COUNT(so.id) as order_count,
       CASE WHEN COUNT(so.id) > 0 
         THEN ROUND(SUM(so.total_amount) / COUNT(so.id), 2) 
         ELSE 0 END as avg_order_amount,
       c.last_purchase_date,
       c.balance
     FROM customers c
     LEFT JOIN customer_levels cl ON c.level_id = cl.id
     LEFT JOIN sales_orders so ON c.id = so.customer_id ${dateFilter}
     WHERE ${whereClause}
     GROUP BY c.id, c.name, cl.name, c.last_purchase_date, c.balance
     ORDER BY total_${orderBy} DESC
     LIMIT ?`,
    [...sqlParams, limit]
  );
}

// ==================== 利润分析 ====================

export interface ProfitAnalysis {
  total_revenue: number;
  total_cost: number;
  total_profit: number;
  profit_rate: number;
  by_category: Array<{
    category_name: string;
    revenue: number;
    cost: number;
    profit: number;
    profit_rate: number;
  }>;
}

export async function getProfitAnalysis(params?: {
  start_date?: string;
  end_date?: string;
}): Promise<ProfitAnalysis> {
  const db = getDatabase();

  let whereClause = 'so.status != \'refunded\'';
  const sqlParams: any[] = [];

  if (params?.start_date) {
    whereClause += ' AND date(so.created_at) >= ?';
    sqlParams.push(params.start_date);
  }
  if (params?.end_date) {
    whereClause += ' AND date(so.created_at) <= ?';
    sqlParams.push(params.end_date);
  }

  const total = await db.getFirstAsync<{
    revenue: number;
    cost: number;
    profit: number;
  }>(
    `SELECT 
       SUM(soi.subtotal) as revenue,
       SUM(soi.quantity * soi.purchase_price) as cost,
       SUM(soi.profit) as profit
     FROM sales_order_items soi
     JOIN sales_orders so ON soi.order_id = so.id
     WHERE ${whereClause}`,
    sqlParams
  );

  const byCategory = await db.getAllAsync<{
    category_name: string;
    revenue: number;
    cost: number;
    profit: number;
    profit_rate: number;
  }>(
    `SELECT 
       COALESCE(c.name, '未分类') as category_name,
       SUM(soi.subtotal) as revenue,
       SUM(soi.quantity * soi.purchase_price) as cost,
       SUM(soi.profit) as profit,
       CASE WHEN SUM(soi.subtotal) > 0 
         THEN ROUND(SUM(soi.profit) / SUM(soi.subtotal) * 100, 2) 
         ELSE 0 END as profit_rate
     FROM sales_order_items soi
     JOIN sales_orders so ON soi.order_id = so.id
     LEFT JOIN products p ON soi.product_id = p.id
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE ${whereClause}
     GROUP BY c.name
     ORDER BY profit DESC`,
    sqlParams
  );

  const revenue = total?.revenue || 0;
  const profit = total?.profit || 0;

  return {
    total_revenue: revenue,
    total_cost: total?.cost || 0,
    total_profit: profit,
    profit_rate: revenue > 0 ? (profit / revenue) * 100 : 0,
    by_category: byCategory,
  };
}

// ==================== 库存分析 ====================

export interface InventoryAnalysis {
  total_products: number;
  total_value: number;
  low_stock_products: Array<{
    product_id: number;
    product_name: string;
    current_stock: number;
    min_stock: number;
    unit_name: string;
  }>;
  out_stock_products: Array<{
    product_id: number;
    product_name: string;
    current_stock: number;
    unit_name: string;
  }>;
  slow_moving_products: Array<{
    product_id: number;
    product_name: string;
    current_stock: number;
    last_sale_date: string;
    days_without_sale: number;
  }>;
}

export async function getInventoryAnalysis(): Promise<InventoryAnalysis> {
  const db = getDatabase();

  const total = await db.getFirstAsync<{
    count: number;
    value: number;
  }>(
    `SELECT 
       COUNT(DISTINCT p.id) as count,
       COALESCE(SUM(p.base_stock * pu.purchase_price / pu.conversion_rate), 0) as value
     FROM products p
     JOIN product_units pu ON p.id = pu.product_id
     WHERE p.status = 1 AND pu.level = 1`
  );

  // 库存不足商品
  const lowStock = await db.getAllAsync<{
    product_id: number;
    product_name: string;
    current_stock: number;
    min_stock: number;
    unit_name: string;
  }>(
    `SELECT DISTINCT
       p.id as product_id,
       p.name as product_name,
       CAST(p.base_stock / pu.conversion_rate AS INTEGER) as current_stock,
       pu.min_stock,
       pu.unit_name
     FROM products p
     JOIN product_units pu ON p.id = pu.product_id
     WHERE p.status = 1 
       AND p.base_stock > 0 
       AND pu.min_stock > 0 
       AND p.base_stock <= pu.min_stock * pu.conversion_rate
     ORDER BY p.base_stock ASC`
  );

  // 缺货商品
  const outStock = await db.getAllAsync<{
    product_id: number;
    product_name: string;
    current_stock: number;
    unit_name: string;
  }>(
    `SELECT DISTINCT
       p.id as product_id,
       p.name as product_name,
       0 as current_stock,
       pu.unit_name
     FROM products p
     JOIN product_units pu ON p.id = pu.product_id
     WHERE p.status = 1 AND p.base_stock <= 0`
  );

  // 滞销商品 (30天未销售且有库存)
  const slowMoving = await db.getAllAsync<{
    product_id: number;
    product_name: string;
    current_stock: number;
    last_sale_date: string;
    days_without_sale: number;
  }>(
    `SELECT 
       p.id as product_id,
       p.name as product_name,
       CAST(p.base_stock / pu.conversion_rate AS INTEGER) as current_stock,
       COALESCE(MAX(so.created_at), '从未销售') as last_sale_date,
       CAST(julianday('now') - julianday(MAX(so.created_at)) AS INTEGER) as days_without_sale
     FROM products p
     JOIN product_units pu ON p.id = pu.product_id AND pu.level = 1
     LEFT JOIN sales_order_items soi ON p.id = soi.product_id
     LEFT JOIN sales_orders so ON soi.order_id = so.id AND so.status != 'refunded'
     WHERE p.status = 1 AND p.base_stock > 0
     GROUP BY p.id
     HAVING days_without_sale >= 30 OR MAX(so.created_at) IS NULL
     ORDER BY days_without_sale DESC`
  );

  return {
    total_products: total?.count || 0,
    total_value: total?.value || 0,
    low_stock_products: lowStock,
    out_stock_products: outStock,
    slow_moving_products: slowMoving,
  };
}

// ==================== 对账单 ====================

export interface Statement {
  customer_id?: number;
  supplier_id?: number;
  name: string;
  type: 'customer' | 'supplier';
  opening_balance: number;
  transactions: Array<{
    date: string;
    type: string;
    order_no: string;
    amount: number;
    balance: number;
    remark?: string;
  }>;
  closing_balance: number;
}

export async function getCustomerStatement(
  customerId: number,
  startDate?: string,
  endDate?: string
): Promise<Statement | null> {
  const db = getDatabase();

  const customer = await db.getFirstAsync<{ id: number; name: string }>(
    'SELECT id, name FROM customers WHERE id = ?',
    [customerId]
  );

  if (!customer) return null;

  // 获取期初余额 (startDate之前)
  let openingBalance = 0;
  if (startDate) {
    const opening = await db.getFirstAsync<{ balance: number }>(
      `SELECT SUM(receivable_amount - paid_amount) as balance
       FROM (
         SELECT 
           COALESCE(SUM(total_amount - paid_amount), 0) as receivable_amount,
           0 as paid_amount
         FROM sales_orders 
         WHERE customer_id = ? AND date(created_at) < ?
         
         UNION ALL
         
         SELECT 
           0 as receivable_amount,
           COALESCE(SUM(amount), 0) as paid_amount
         FROM payment_records
         WHERE customer_id = ? AND date(created_at) < ?
       )`,
      [customerId, startDate, customerId, startDate]
    );
    openingBalance = opening?.balance || 0;
  }

  // 获取交易明细
  let transactionSql = `
    SELECT 
      date(created_at) as date,
      type,
      order_no,
      amount,
      remark
    FROM (
      SELECT 
        created_at,
        'sales' as type,
        order_no,
        total_amount - paid_amount as amount,
        remark
      FROM sales_orders 
      WHERE customer_id = ? AND total_amount - paid_amount != 0
      
      UNION ALL
      
      SELECT 
        created_at,
        'payment' as type,
        payment_no as order_no,
        -amount,
        remark
      FROM payment_records
      WHERE customer_id = ?
    )
  `;
  
  const params: any[] = [customerId, customerId];
  
  if (startDate) {
    transactionSql += ' WHERE date(created_at) >= ?';
    params.push(startDate);
    if (endDate) {
      transactionSql += ' AND date(created_at) <= ?';
      params.push(endDate);
    }
  } else if (endDate) {
    transactionSql += ' WHERE date(created_at) <= ?';
    params.push(endDate);
  }
  
  transactionSql += ' ORDER BY created_at';

  const transactions = await db.getAllAsync<{
    date: string;
    type: string;
    order_no: string;
    amount: number;
    remark?: string;
  }>(transactionSql, params);

  // 计算余额流水
  let balance = openingBalance;
  const transactionsWithBalance = transactions.map(t => {
    balance += t.amount;
    return { ...t, balance };
  });

  return {
    customer_id: customerId,
    name: customer.name,
    type: 'customer',
    opening_balance: openingBalance,
    transactions: transactionsWithBalance,
    closing_balance: balance,
  };
}
