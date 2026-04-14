/**
 * 采购服务
 */
import { getDatabase, generateOrderNo, logOperation } from './database';
import { PurchaseOrder, PurchaseOrderItem, PaymentRecord } from './database';

export type { PurchaseOrder, PurchaseOrderItem } from './database';
import { getProductById, updateProductStock } from './productService';
import { getSupplierById } from './supplierService';

export interface PurchaseOrderWithItems extends PurchaseOrder {
  items: PurchaseOrderItem[];
}

// 创建采购订单
export async function createPurchaseOrder(data: {
  supplier_id?: number;
  supplier_name?: string;
  items: Array<{
    product_id: number;
    unit_id: number;
    unit_name: string;
    quantity: number;
    unit_price: number;
    remark?: string;
  }>;
  paid_amount?: number;
  remark?: string;
  operator?: string;
}): Promise<{ orderId: number; orderNo: string }> {
  const db = getDatabase();
  const orderNo = generateOrderNo('PO');

  await db.execAsync('BEGIN TRANSACTION');
  try {
    // 计算金额
    let totalAmount = 0;
    let totalQuantity = 0;
    const items: PurchaseOrderItem[] = [];

    for (const item of data.items) {
      const product = await getProductById(item.product_id);
      if (!product) throw new Error(`商品不存在: ${item.product_id}`);

      const subtotal = item.unit_price * item.quantity;
      totalAmount += subtotal;
      totalQuantity += item.quantity;

      items.push({
        id: 0,
        order_id: 0,
        product_id: item.product_id,
        product_name: product.name,
        barcode: product.barcode,
        unit_id: item.unit_id,
        unit_name: item.unit_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal,
        remark: item.remark,
      });
    }

    const paidAmount = data.paid_amount || 0;
    const payableAmount = Math.max(0, totalAmount - paidAmount);

    // 插入订单
    const result = await db.runAsync(
      `INSERT INTO purchase_orders 
       (order_no, supplier_id, supplier_name, total_amount, paid_amount, payable_amount, 
        total_quantity, status, remark, operator)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?)`,
      [orderNo, data.supplier_id || null, data.supplier_name || null, totalAmount,
       paidAmount, payableAmount, totalQuantity, data.remark || null, data.operator || null]
    );

    const orderId = result.lastInsertRowId;

    // 插入明细并增加库存
    for (const item of items) {
      await db.runAsync(
        `INSERT INTO purchase_order_items 
         (order_id, product_id, product_name, barcode, unit_id, unit_name, quantity, unit_price, subtotal, remark)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.product_name, item.barcode ?? null, item.unit_id,
         item.unit_name, item.quantity, item.unit_price, item.subtotal, item.remark ?? null]
      );

      // 增加库存
      await updateProductStock(item.product_id, item.quantity, item.unit_id, 'purchase', orderNo, '采购入库', data.operator);
      
      // 更新商品采购价
      await db.runAsync(
        `UPDATE product_units SET purchase_price = ? WHERE id = ?`,
        [item.unit_price, item.unit_id]
      );
    }

    // 更新供应商应付款
    if (data.supplier_id && payableAmount > 0) {
      await db.runAsync(
        'UPDATE suppliers SET balance = balance + ? WHERE id = ?',
        [payableAmount, data.supplier_id]
      );
    }

    await db.execAsync('COMMIT');
    await logOperation('purchase', 'create', 'purchase_order', orderId, orderNo);

    return { orderId, orderNo };
  } catch (error) {
    await db.execAsync('ROLLBACK');
    throw error;
  }
}

// 获取采购订单列表
export async function getPurchaseOrders(params?: {
  supplier_id?: number;
  status?: string;
  start_date?: string;
  end_date?: string;
  keyword?: string;
}): Promise<PurchaseOrder[]> {
  const db = getDatabase();
  
  let sql = 'SELECT * FROM purchase_orders WHERE 1=1';
  const sqlParams: any[] = [];

  if (params?.supplier_id) {
    sql += ' AND supplier_id = ?';
    sqlParams.push(params.supplier_id);
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
    sql += ' AND (order_no LIKE ? OR supplier_name LIKE ?)';
    sqlParams.push(`%${params.keyword}%`, `%${params.keyword}%`);
  }

  sql += ' ORDER BY created_at DESC';

  return db.getAllAsync<PurchaseOrder>(sql, sqlParams);
}

// 获取采购订单详情
export async function getPurchaseOrderById(id: number): Promise<PurchaseOrderWithItems | null> {
  const db = getDatabase();
  
  const order = await db.getFirstAsync<PurchaseOrder>(
    'SELECT * FROM purchase_orders WHERE id = ?',
    [id]
  );
  
  if (!order) return null;

  const items = await db.getAllAsync<PurchaseOrderItem>(
    'SELECT * FROM purchase_order_items WHERE order_id = ?',
    [id]
  );

  return { ...order, items };
}

// 采购付款
export async function createPurchasePayment(data: {
  supplier_id: number;
  order_id?: number;
  amount: number;
  payment_method?: string;
  remark?: string;
  operator?: string;
}): Promise<number> {
  const db = getDatabase();

  await db.execAsync('BEGIN TRANSACTION');
  try {
    const supplier = await getSupplierById(data.supplier_id);
    if (!supplier) throw new Error('供应商不存在');

    // 更新供应商应付款
    await db.runAsync(
      'UPDATE suppliers SET balance = balance - ? WHERE id = ?',
      [data.amount, data.supplier_id]
    );

    // 更新订单应付款
    if (data.order_id) {
      await db.runAsync(
        'UPDATE purchase_orders SET paid_amount = paid_amount + ?, payable_amount = payable_amount - ? WHERE id = ?',
        [data.amount, data.amount, data.order_id]
      );
    }

    await db.execAsync('COMMIT');
    await logOperation('purchase', 'payment', 'supplier', data.supplier_id, `付款${data.amount}元`);

    return Date.now();
  } catch (error) {
    await db.execAsync('ROLLBACK');
    throw error;
  }
}

// 采购统计
export async function getPurchaseStats(startDate?: string, endDate?: string): Promise<{
  total_amount: number;
  total_orders: number;
  total_quantity: number;
  total_payable: number;
}> {
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

  const stats = await db.getFirstAsync<{
    total_amount: number;
    total_orders: number;
    total_quantity: number;
  }>(
    `SELECT 
       COALESCE(SUM(total_amount), 0) as total_amount,
       COUNT(*) as total_orders,
       COALESCE(SUM(total_quantity), 0) as total_quantity
     FROM purchase_orders WHERE ${whereClause}`,
    params
  );

  const payable = await db.getFirstAsync<{ total: number }>(
    'SELECT COALESCE(SUM(balance), 0) as total FROM suppliers WHERE status = 1'
  );

  return {
    total_amount: stats?.total_amount || 0,
    total_orders: stats?.total_orders || 0,
    total_quantity: stats?.total_quantity || 0,
    total_payable: payable?.total || 0,
  };
}
