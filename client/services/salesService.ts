/**
 * 销售服务 - 含改价审计、退货退款、往来账管理
 */
import { getDatabase, generateOrderNo, logOperation } from './database';
import { SalesOrder, SalesOrderItem, PriceChangeLog, RefundOrder, RefundOrderItem, PaymentRecord } from './database';
import { getProductById, updateProductStock, getPriceByLevel, getDefaultSaleUnit, ProductUnit } from './productService';
import { getCustomerById, updateCustomerStats } from './customerService';

// 重新导出类型供前端使用
export type { SalesOrder, SalesOrderItem, PriceChangeLog, RefundOrder, RefundOrderItem, PaymentRecord };

// ==================== 销售订单服务 ====================

export interface SalesOrderWithItems extends SalesOrder {
  items: SalesOrderItem[];
}

// 创建销售订单
export async function createSalesOrder(data: {
  customer_id?: number;
  customer_name?: string;
  items: Array<{
    product_id: number;
    unit_id: number;
    unit_name: string;
    quantity: number;
    original_price: number;
    unit_price: number;
    purchase_price: number;
    discount_rate?: number;
    remark?: string;
  }>;
  payment_method?: string;
  paid_amount?: number;
  remark?: string;
  operator?: string;
}): Promise<{ orderId: number; orderNo: string }> {
  const db = getDatabase();
  const orderNo = generateOrderNo('SO');

  await db.execAsync('BEGIN TRANSACTION');
  try {
    // 获取客户等级
    let customerLevel = 1;
    if (data.customer_id) {
      const customer = await getCustomerById(data.customer_id);
      customerLevel = customer?.level_id || 1;
    }

    // 计算金额
    let totalAmount = 0;
    let totalQuantity = 0;
    let totalProfit = 0;
    const items: SalesOrderItem[] = [];

    for (const item of data.items) {
      const product = await getProductById(item.product_id);
      if (!product) throw new Error(`商品不存在: ${item.product_id}`);

      const subtotal = item.unit_price * item.quantity;
      const profit = (item.unit_price - item.purchase_price) * item.quantity;

      totalAmount += subtotal;
      totalQuantity += item.quantity;
      totalProfit += profit;

      items.push({
        id: 0,
        order_id: 0,
        product_id: item.product_id,
        product_name: product.name,
        barcode: product.barcode,
        unit_id: item.unit_id,
        unit_name: item.unit_name,
        quantity: item.quantity,
        original_price: item.original_price,
        unit_price: item.unit_price,
        purchase_price: item.purchase_price,
        subtotal,
        profit,
        discount_rate: item.discount_rate || 1,
        remark: item.remark,
      });
    }

    // 计算支付金额
    const paidAmount = data.paid_amount || totalAmount;
    const receivableAmount = Math.max(0, totalAmount - paidAmount);

    // 插入订单
    const result = await db.runAsync(
      `INSERT INTO sales_orders 
       (order_no, customer_id, customer_name, customer_level, total_amount, discount_amount, 
        paid_amount, receivable_amount, total_quantity, profit, payment_method, status, remark, operator)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?)`,
      [orderNo, data.customer_id || null, data.customer_name || null, customerLevel, totalAmount, 0,
       paidAmount, receivableAmount, totalQuantity, totalProfit, data.payment_method || 'cash', data.remark || null, data.operator || null]
    );

    const orderId = result.lastInsertRowId;

    // 插入订单明细并扣减库存
    for (const item of items) {
      const itemResult = await db.runAsync(
        `INSERT INTO sales_order_items 
         (order_id, product_id, product_name, barcode, unit_id, unit_name, quantity, 
          original_price, unit_price, purchase_price, subtotal, profit, discount_rate, remark)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.product_name, item.barcode ?? null, item.unit_id, item.unit_name,
         item.quantity, item.original_price, item.unit_price, item.purchase_price, item.subtotal,
         item.profit, item.discount_rate, item.remark ?? null]
      );

      // 记录改价日志（如果有）
      if (item.unit_price !== item.original_price) {
        await db.runAsync(
          `INSERT INTO price_change_logs 
           (order_id, order_item_id, product_id, product_name, original_price, new_price, operator)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [orderId, itemResult.lastInsertRowId, item.product_id, item.product_name, item.original_price, item.unit_price, data.operator || null]
        );
      }

      // 扣减库存
      await updateProductStock(item.product_id, -item.quantity, item.unit_id, 'sale', orderNo, '销售出库', data.operator);
    }

    // 更新客户应收款
    if (data.customer_id && receivableAmount > 0) {
      await db.runAsync(
        'UPDATE customers SET balance = balance + ? WHERE id = ?',
        [receivableAmount, data.customer_id]
      );
    }

    // 更新客户消费统计
    if (data.customer_id) {
      await updateCustomerStats(data.customer_id, totalAmount);
    }

    await db.execAsync('COMMIT');
    await logOperation('sale', 'create', 'sales_order', orderId, orderNo);

    return { orderId, orderNo };
  } catch (error) {
    await db.execAsync('ROLLBACK');
    throw error;
  }
}

// 获取销售订单列表
export async function getSalesOrders(params?: {
  customer_id?: number;
  status?: string;
  start_date?: string;
  end_date?: string;
  keyword?: string;
  limit?: number;
  offset?: number;
}): Promise<SalesOrder[]> {
  const db = getDatabase();
  
  let sql = 'SELECT * FROM sales_orders WHERE 1=1';
  const sqlParams: any[] = [];

  if (params?.customer_id) {
    sql += ' AND customer_id = ?';
    sqlParams.push(params.customer_id);
  }
  if (params?.status) {
    sql += ' AND status = ?';
    sqlParams.push(params.status);
  }
  if (params?.start_date) {
    sql += ' AND date(created_at) >= ?';
    sqlParams.push(params.start_date);
  }
  if (params?.end_date) {
    sql += ' AND date(created_at) <= ?';
    sqlParams.push(params.end_date);
  }
  if (params?.keyword) {
    sql += ' AND (order_no LIKE ? OR customer_name LIKE ?)';
    sqlParams.push(`%${params.keyword}%`, `%${params.keyword}%`);
  }

  sql += ' ORDER BY created_at DESC';

  if (params?.limit) {
    sql += ' LIMIT ?';
    sqlParams.push(params.limit);
    if (params?.offset) {
      sql += ' OFFSET ?';
      sqlParams.push(params.offset);
    }
  }

  return db.getAllAsync<SalesOrder>(sql, sqlParams);
}

// 获取销售订单详情
export async function getSalesOrderById(id: number): Promise<SalesOrderWithItems | null> {
  const db = getDatabase();
  
  const order = await db.getFirstAsync<SalesOrder>('SELECT * FROM sales_orders WHERE id = ?', [id]);
  if (!order) return null;

  const items = await db.getAllAsync<SalesOrderItem>(
    'SELECT * FROM sales_order_items WHERE order_id = ?',
    [id]
  );

  return { ...order, items };
}

// 获取订单的改价记录
export async function getPriceChangeLogs(orderId: number): Promise<PriceChangeLog[]> {
  const db = getDatabase();
  return db.getAllAsync<PriceChangeLog>(
    'SELECT * FROM price_change_logs WHERE order_id = ? ORDER BY created_at',
    [orderId]
  );
}

// 修改销售订单
export async function updateSalesOrder(id: number, data: {
  items?: Array<{
    id?: number;
    product_id: number;
    unit_id?: number;
    unit_name?: string;
    quantity: number;
    unit_price: number;
    purchase_price?: number;
  }>;
  remark?: string;
  operator?: string;
}): Promise<void> {
  const db = getDatabase();
  const oldOrder = await getSalesOrderById(id);
  if (!oldOrder) throw new Error('订单不存在');

  await db.execAsync('BEGIN TRANSACTION');
  try {
    if (data.items) {
      // 计算新的金额
      let totalAmount = 0;
      let totalQuantity = 0;
      let totalProfit = 0;

      for (const item of data.items) {
        const product = await getProductById(item.product_id);
        if (!product) continue;

        const subtotal = item.unit_price * item.quantity;
        const profit = (item.unit_price - (item.purchase_price ?? 0)) * item.quantity;

        totalAmount += subtotal;
        totalQuantity += item.quantity;
        totalProfit += profit;
      }

      // 更新订单金额
      await db.runAsync(
        `UPDATE sales_orders SET 
         total_amount = ?, total_quantity = ?, profit = ?, remark = ?, 
         updated_at = datetime('now', 'localtime')
         WHERE id = ?`,
        [totalAmount, totalQuantity, totalProfit, data.remark ?? oldOrder.remark ?? null, id]
      );

      // 处理库存变化
      for (const newItem of data.items) {
        const oldItem = oldOrder.items.find(i => i.id === newItem.id);
        
        if (oldItem) {
          // 计算数量变化
          const quantityDiff = newItem.quantity - oldItem.quantity;
          
          if (quantityDiff !== 0) {
            // 更新库存
            await updateProductStock(
              newItem.product_id, 
              -quantityDiff, 
              newItem.unit_id ?? null, 
              'adjust',
              oldOrder.order_no,
              `订单修改: ${quantityDiff > 0 ? '增加' : '减少'} ${Math.abs(quantityDiff)}`,
              data.operator ?? undefined
            );

            // 更新明细
            const subtotal = newItem.unit_price * newItem.quantity;
            const profit = (newItem.unit_price - (newItem.purchase_price ?? 0)) * newItem.quantity;
            
            if (newItem.id) {
              await db.runAsync(
                `UPDATE sales_order_items SET 
                 quantity = ?, unit_price = ?, purchase_price = ?, subtotal = ?, profit = ?
                 WHERE id = ?`,
                [newItem.quantity, newItem.unit_price, newItem.purchase_price ?? 0, subtotal, profit, newItem.id]
              );
            }
          }
        } else {
          // 新增商品
          const product = await getProductById(newItem.product_id);
          if (!product) continue;

          const subtotal = newItem.unit_price * newItem.quantity;
          const profit = (newItem.unit_price - (newItem.purchase_price ?? 0)) * newItem.quantity;

          await db.runAsync(
            `INSERT INTO sales_order_items 
             (order_id, product_id, product_name, barcode, unit_id, unit_name, quantity, 
              original_price, unit_price, purchase_price, subtotal, profit)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, newItem.product_id, product.name, product.barcode ?? null, newItem.unit_id ?? null, newItem.unit_name ?? '',
             newItem.quantity, newItem.unit_price, newItem.unit_price, newItem.purchase_price ?? 0, subtotal, profit]
          );

          // 扣减库存
          await updateProductStock(newItem.product_id, -newItem.quantity, newItem.unit_id ?? null, 'sale', oldOrder.order_no, '订单增加商品', data.operator ?? undefined);
        }
      }

      // 检查删除的商品
      for (const oldItem of oldOrder.items) {
        const exists = data.items.find(i => i.id === oldItem.id);
        if (!exists) {
          // 回补库存
          await updateProductStock(oldItem.product_id, oldItem.quantity, oldItem.unit_id, 'adjust', oldOrder.order_no, '订单删除商品', data.operator);
          
          // 删除明细
          await db.runAsync('DELETE FROM sales_order_items WHERE id = ?', [oldItem.id]);
        }
      }
    } else if (data.remark) {
      await db.runAsync('UPDATE sales_orders SET remark = ? WHERE id = ?', [data.remark, id]);
    }

    await db.execAsync('COMMIT');
    await logOperation('sale', 'update', 'sales_order', id, oldOrder.order_no, oldOrder, data);
  } catch (error) {
    await db.execAsync('ROLLBACK');
    throw error;
  }
}

// ==================== 退货退款服务 ====================

// 创建退货单
export async function createRefundOrder(data: {
  original_order_id: number;
  items: Array<{
    original_item_id: number;
    product_id: number;
    unit_id: number;
    unit_name: string;
    quantity: number;
    unit_price: number;
  }>;
  refund_reason?: string;
  operator?: string;
}): Promise<{ refundId: number; refundNo: string }> {
  const db = getDatabase();
  const refundNo = generateOrderNo('RF');

  await db.execAsync('BEGIN TRANSACTION');
  try {
    const originalOrder = await getSalesOrderById(data.original_order_id);
    if (!originalOrder) throw new Error('原订单不存在');

    let totalAmount = 0;
    let totalQuantity = 0;

    for (const item of data.items) {
      const subtotal = item.unit_price * item.quantity;
      totalAmount += subtotal;
      totalQuantity += item.quantity;
    }

    const refundType = totalAmount >= originalOrder.total_amount ? 'full' : 'partial';

    // 创建退货单
    const result = await db.runAsync(
      `INSERT INTO refund_orders 
       (refund_no, original_order_id, original_order_no, customer_id, customer_name, 
        total_amount, total_quantity, refund_type, refund_reason, status, operator)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?)`,
      [refundNo, data.original_order_id, originalOrder.order_no, originalOrder.customer_id ?? null,
       originalOrder.customer_name ?? '', totalAmount, totalQuantity, refundType, data.refund_reason ?? null, data.operator ?? null]
    );

    const refundId = result.lastInsertRowId;

    // 创建退货明细并回补库存
    for (const item of data.items) {
      const product = await getProductById(item.product_id);
      if (!product) continue;

      const subtotal = item.unit_price * item.quantity;

      await db.runAsync(
        `INSERT INTO refund_order_items 
         (refund_id, original_item_id, product_id, product_name, unit_id, unit_name, quantity, unit_price, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [refundId, item.original_item_id ?? null, item.product_id, product.name, item.unit_id ?? null, item.unit_name ?? '',
         item.quantity, item.unit_price, subtotal]
      );

      // 回补库存
      await updateProductStock(item.product_id, item.quantity, item.unit_id, 'refund', refundNo, '退货入库', data.operator);
    }

    // 更新原订单状态
    const newStatus = refundType === 'full' ? 'refunded' : 'partial_refund';
    await db.runAsync(
      'UPDATE sales_orders SET status = ?, updated_at = datetime(\'now\', \'localtime\') WHERE id = ?',
      [newStatus, data.original_order_id]
    );

    // 更新客户应收款
    if (originalOrder.customer_id && originalOrder.receivable_amount > 0) {
      await db.runAsync(
        'UPDATE customers SET balance = balance - ? WHERE id = ?',
        [Math.min(totalAmount, originalOrder.receivable_amount), originalOrder.customer_id]
      );
    }

    await db.execAsync('COMMIT');
    await logOperation('sale', 'refund', 'refund_order', refundId, refundNo);

    return { refundId, refundNo };
  } catch (error) {
    await db.execAsync('ROLLBACK');
    throw error;
  }
}

// 获取退货单列表
export async function getRefundOrders(params?: {
  original_order_id?: number;
  customer_id?: number;
  start_date?: string;
  end_date?: string;
}): Promise<RefundOrder[]> {
  const db = getDatabase();
  
  let sql = 'SELECT * FROM refund_orders WHERE 1=1';
  const sqlParams: any[] = [];

  if (params?.original_order_id) {
    sql += ' AND original_order_id = ?';
    sqlParams.push(params.original_order_id);
  }
  if (params?.customer_id) {
    sql += ' AND customer_id = ?';
    sqlParams.push(params.customer_id);
  }
  if (params?.start_date) {
    sql += ' AND date(created_at) >= ?';
    sqlParams.push(params.start_date);
  }
  if (params?.end_date) {
    sql += ' AND date(created_at) <= ?';
    sqlParams.push(params.end_date);
  }

  sql += ' ORDER BY created_at DESC';

  return db.getAllAsync<RefundOrder>(sql, sqlParams);
}

// ==================== 收款记录服务 ====================

// 创建收款记录
export async function createPaymentRecord(data: {
  customer_id: number;
  order_id?: number;
  amount: number;
  payment_method?: string;
  remark?: string;
  operator?: string;
}): Promise<number> {
  const db = getDatabase();
  const paymentNo = generateOrderNo('PAY');

  await db.execAsync('BEGIN TRANSACTION');
  try {
    const customer = await getCustomerById(data.customer_id);
    if (!customer) throw new Error('客户不存在');

    const result = await db.runAsync(
      `INSERT INTO payment_records 
       (payment_no, customer_id, customer_name, order_id, amount, payment_method, remark, operator)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [paymentNo, data.customer_id, customer.name, data.order_id || null, data.amount, 
       data.payment_method || 'cash', data.remark || null, data.operator || null]
    );

    // 更新客户应收款
    await db.runAsync(
      'UPDATE customers SET balance = balance - ? WHERE id = ?',
      [data.amount, data.customer_id]
    );

    // 更新订单应收款
    if (data.order_id) {
      await db.runAsync(
        'UPDATE sales_orders SET receivable_amount = receivable_amount - ? WHERE id = ?',
        [data.amount, data.order_id]
      );
    }

    await db.execAsync('COMMIT');
    await logOperation('payment', 'create', 'payment_record', result.lastInsertRowId, paymentNo);

    return result.lastInsertRowId;
  } catch (error) {
    await db.execAsync('ROLLBACK');
    throw error;
  }
}

// 获取收款记录列表
export async function getPaymentRecords(customerId?: number): Promise<PaymentRecord[]> {
  const db = getDatabase();
  
  let sql = 'SELECT * FROM payment_records WHERE 1=1';
  const params: any[] = [];

  if (customerId) {
    sql += ' AND customer_id = ?';
    params.push(customerId);
  }

  sql += ' ORDER BY created_at DESC';

  return db.getAllAsync<PaymentRecord>(sql, params);
}

// ==================== 销售统计服务 ====================

export interface SalesStats {
  total_amount: number;
  total_profit: number;
  total_orders: number;
  total_quantity: number;
  refund_amount: number;
  avg_order_amount: number;
  profit_rate: number;
}

export async function getSalesStats(startDate?: string, endDate?: string): Promise<SalesStats> {
  const db = getDatabase();
  
  let whereClause = '1=1';
  const params: any[] = [];

  if (startDate) {
    whereClause += ' AND date(created_at) >= ?';
    params.push(startDate);
  }
  if (endDate) {
    whereClause += ' AND date(created_at) <= ?';
    params.push(endDate);
  }

  const sales = await db.getFirstAsync<{
    total_amount: number;
    total_profit: number;
    total_orders: number;
    total_quantity: number;
  }>(
    `SELECT 
       COALESCE(SUM(total_amount), 0) as total_amount,
       COALESCE(SUM(profit), 0) as total_profit,
       COUNT(*) as total_orders,
       COALESCE(SUM(total_quantity), 0) as total_quantity
     FROM sales_orders WHERE ${whereClause} AND status != 'refunded'`,
    params
  );

  const refunds = await db.getFirstAsync<{ total: number }>(
    `SELECT COALESCE(SUM(total_amount), 0) as total 
     FROM refund_orders WHERE ${whereClause}`,
    params
  );

  const totalAmount = sales?.total_amount || 0;
  const totalProfit = sales?.total_profit || 0;
  const totalOrders = sales?.total_orders || 0;

  return {
    total_amount: totalAmount,
    total_profit: totalProfit,
    total_orders: totalOrders,
    total_quantity: sales?.total_quantity || 0,
    refund_amount: refunds?.total || 0,
    avg_order_amount: totalOrders > 0 ? totalAmount / totalOrders : 0,
    profit_rate: totalAmount > 0 ? (totalProfit / totalAmount) * 100 : 0,
  };
}

// 按日期统计
export async function getDailySalesStats(days: number = 30): Promise<Array<{
  date: string;
  total_amount: number;
  total_profit: number;
  total_orders: number;
}>> {
  const db = getDatabase();
  
  return db.getAllAsync(
    `SELECT 
       date(created_at) as date,
       COALESCE(SUM(total_amount), 0) as total_amount,
       COALESCE(SUM(profit), 0) as total_profit,
       COUNT(*) as total_orders
     FROM sales_orders 
     WHERE date(created_at) >= date('now', '-' || ? || ' days')
       AND status != 'refunded'
     GROUP BY date(created_at)
     ORDER BY date DESC`,
    [days]
  );
}

// 商品销售排行
export async function getProductSalesRanking(params?: {
  start_date?: string;
  end_date?: string;
  limit?: number;
  order_by?: 'quantity' | 'amount' | 'profit';
}): Promise<Array<{
  product_id: number;
  product_name: string;
  total_quantity: number;
  total_amount: number;
  total_profit: number;
}>> {
  const db = getDatabase();
  
  let whereClause = '1=1';
  const sqlParams: any[] = [];

  if (params?.start_date) {
    whereClause += ' AND date(so.created_at) >= ?';
    sqlParams.push(params.start_date);
  }
  if (params?.end_date) {
    whereClause += ' AND date(so.created_at) <= ?';
    sqlParams.push(params.end_date);
  }

  const orderBy = params?.order_by || 'amount';
  const limit = params?.limit || 20;

  return db.getAllAsync(
    `SELECT 
       soi.product_id,
       soi.product_name,
       SUM(soi.quantity) as total_quantity,
       SUM(soi.subtotal) as total_amount,
       SUM(soi.profit) as total_profit
     FROM sales_order_items soi
     JOIN sales_orders so ON soi.order_id = so.id
     WHERE ${whereClause} AND so.status != 'refunded'
     GROUP BY soi.product_id, soi.product_name
     ORDER BY total_${orderBy} DESC
     LIMIT ?`,
    [...sqlParams, limit]
  );
}

// 按客户统计
export async function getSalesByCustomer(params?: {
  start_date?: string;
  end_date?: string;
  limit?: number;
}): Promise<Array<{
  customer_id: number;
  customer_name: string;
  total_amount: number;
  total_profit: number;
  total_orders: number;
}>> {
  const db = getDatabase();
  
  let whereClause = '1=1';
  const sqlParams: any[] = [];

  if (params?.start_date) {
    whereClause += ' AND date(created_at) >= ?';
    sqlParams.push(params.start_date);
  }
  if (params?.end_date) {
    whereClause += ' AND date(created_at) <= ?';
    sqlParams.push(params.end_date);
  }

  return db.getAllAsync(
    `SELECT 
       customer_id,
       customer_name,
       SUM(total_amount) as total_amount,
       SUM(profit) as total_profit,
       COUNT(*) as total_orders
     FROM sales_orders
     WHERE ${whereClause} AND customer_id IS NOT NULL AND status != 'refunded'
     GROUP BY customer_id, customer_name
     ORDER BY total_amount DESC
     LIMIT ?`,
    [...sqlParams, params?.limit || 20]
  );
}
