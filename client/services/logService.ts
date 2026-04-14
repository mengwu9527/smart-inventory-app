/**
 * 操作日志服务
 */
import { getDatabase } from './database';
import { OperationLog } from './database';

export type { OperationLog } from './database';

export async function getOperationLogs(params?: {
  module?: string;
  action?: string;
  target_type?: string;
  start_date?: string;
  end_date?: string;
  operator?: string;
  limit?: number;
  offset?: number;
}): Promise<OperationLog[]> {
  const db = getDatabase();
  
  let sql = 'SELECT * FROM operation_logs WHERE 1=1';
  const sqlParams: any[] = [];

  if (params?.module) {
    sql += ' AND module = ?';
    sqlParams.push(params.module);
  }
  if (params?.action) {
    sql += ' AND action = ?';
    sqlParams.push(params.action);
  }
  if (params?.target_type) {
    sql += ' AND target_type = ?';
    sqlParams.push(params.target_type);
  }
  if (params?.start_date) {
    sql += ' AND date(created_at) >= ?';
    sqlParams.push(params.start_date);
  }
  if (params?.end_date) {
    sql += ' AND date(created_at) <= ?';
    sqlParams.push(params.end_date);
  }
  if (params?.operator) {
    sql += ' AND operator LIKE ?';
    sqlParams.push(`%${params.operator}%`);
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

  return db.getAllAsync<OperationLog>(sql, sqlParams);
}

export async function getOperationLogStats(): Promise<{
  total_count: number;
  today_count: number;
  module_stats: Array<{ module: string; count: number }>;
}> {
  const db = getDatabase();
  
  const total = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM operation_logs'
  );
  
  const today = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM operation_logs 
     WHERE date(created_at) = date('now')`
  );
  
  const moduleStats = await db.getAllAsync<{ module: string; count: number }>(
    `SELECT module, COUNT(*) as count 
     FROM operation_logs 
     GROUP BY module 
     ORDER BY count DESC`
  );

  return {
    total_count: total?.count || 0,
    today_count: today?.count || 0,
    module_stats: moduleStats,
  };
}

// 清理旧日志（保留指定天数）
export async function cleanOldLogs(retentionDays: number = 90): Promise<number> {
  const db = getDatabase();
  const result = await db.runAsync(
    `DELETE FROM operation_logs 
     WHERE date(created_at) < date('now', '-' || ? || ' days')`,
    [retentionDays]
  );
  return result.changes;
}
