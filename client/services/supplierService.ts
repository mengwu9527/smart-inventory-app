/**
 * 供应商服务
 */
import { getDatabase, logOperation } from './database';
import { Supplier } from './database';

export type { Supplier } from './database';

export interface SupplierWithStats extends Supplier {
  total_orders?: number;
  total_amount?: number;
}

export async function getSuppliers(): Promise<Supplier[]> {
  const db = getDatabase();
  return db.getAllAsync<Supplier>(
    'SELECT * FROM suppliers WHERE status = 1 ORDER BY id DESC'
  );
}

export async function getSupplierById(id: number): Promise<Supplier | null> {
  const db = getDatabase();
  return db.getFirstAsync<Supplier>(
    'SELECT * FROM suppliers WHERE id = ?',
    [id]
  );
}

export async function searchSuppliers(keyword: string): Promise<Supplier[]> {
  const db = getDatabase();
  return db.getAllAsync<Supplier>(
    `SELECT * FROM suppliers 
     WHERE status = 1 AND (name LIKE ? OR contact LIKE ? OR phone LIKE ?)
     ORDER BY id DESC`,
    [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
  );
}

export async function createSupplier(data: {
  name: string;
  contact?: string;
  phone?: string;
  address?: string;
  email?: string;
  bank_name?: string;
  bank_account?: string;
  remark?: string;
}): Promise<number> {
  const db = getDatabase();
  const result = await db.runAsync(
    `INSERT INTO suppliers (name, contact, phone, address, email, bank_name, bank_account, remark)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.name, data.contact || null, data.phone || null, data.address || null,
     data.email || null, data.bank_name || null, data.bank_account || null, data.remark || null]
  );
  
  await logOperation('supplier', 'create', 'supplier', result.lastInsertRowId, data.name);
  return result.lastInsertRowId;
}

export async function updateSupplier(id: number, data: Partial<Supplier>): Promise<void> {
  const db = getDatabase();
  const old = await getSupplierById(id);
  
  await db.runAsync(
    `UPDATE suppliers SET name = ?, contact = ?, phone = ?, address = ?, email = ?,
     bank_name = ?, bank_account = ?, remark = ?, updated_at = datetime('now', 'localtime')
     WHERE id = ?`,
    [data.name ?? '', data.contact ?? null, data.phone ?? null, data.address ?? null, data.email ?? null,
     data.bank_name ?? null, data.bank_account ?? null, data.remark ?? null, id]
  );
  
  await logOperation('supplier', 'update', 'supplier', id, data.name ?? '', old, data);
}

export async function deleteSupplier(id: number): Promise<void> {
  const db = getDatabase();
  const old = await getSupplierById(id);
  
  // 检查是否有未结清的应付款
  if (old && old.balance > 0) {
    throw new Error('该供应商有未结清的应付款，无法删除');
  }
  
  await db.runAsync('UPDATE suppliers SET status = 0 WHERE id = ?', [id]);
  await logOperation('supplier', 'delete', 'supplier', id, old?.name);
}

export async function getSupplierStats(): Promise<{
  total_count: number;
  total_payable: number;
}> {
  const db = getDatabase();
  
  const total = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM suppliers WHERE status = 1'
  );
  
  const payable = await db.getFirstAsync<{ total: number }>(
    'SELECT SUM(balance) as total FROM suppliers WHERE status = 1 AND balance > 0'
  );
  
  return {
    total_count: total?.count || 0,
    total_payable: payable?.total || 0,
  };
}
