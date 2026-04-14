/**
 * 服务层统一导出
 */
// 数据库类型
export * from './database';

// 分类服务（从 productService 中获取）
export { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from './productService';

// 商品服务
export { 
  getProducts, getProductById, getProductByBarcode, searchProducts, createProduct, updateProduct, deleteProduct,
  getProductUnits, buildUnitTree, convertToBaseQuantity, convertFromBaseQuantity,
  getProductBaseStock, getProductStockByUnit, updateProductStock, getProductStats,
  getPriceByLevel, getDefaultSaleUnit, getDefaultPurchaseUnit,
  ProductWithUnits, UnitTreeNode
} from './productService';

// 销售服务
export {
  createSalesOrder, getSalesOrders, getSalesOrderById, getPriceChangeLogs, updateSalesOrder,
  createRefundOrder, getRefundOrders, createPaymentRecord, getPaymentRecords,
  getSalesStats, getDailySalesStats, getProductSalesRanking, getSalesByCustomer,
  SalesOrderWithItems
} from './salesService';

// 采购服务
export {
  createPurchaseOrder, getPurchaseOrders, getPurchaseOrderById, createPurchasePayment, getPurchaseStats,
  PurchaseOrderWithItems
} from './purchaseService';

// 客户服务
export {
  getCustomerLevels, getCustomerLevelById, createCustomerLevel, updateCustomerLevel, deleteCustomerLevel,
  getDefaultCustomerLevel, autoUpgradeCustomerLevel, getCustomers, getCustomerById, searchCustomers,
  createCustomer, updateCustomer, deleteCustomer, updateCustomerStats, getCustomerStats,
  getCustomerReceivables, getCustomerRanking, CustomerWithLevel
} from './customerService';

// 供应商服务
export { getSuppliers, getSupplierById, searchSuppliers, createSupplier, updateSupplier, deleteSupplier, getSupplierStats } from './supplierService';

// 日志服务
export { getOperationLogs, getOperationLogStats, cleanOldLogs } from './logService';

// 统计服务
export {
  getDashboardStats, getSalesTrend, getMonthlySalesTrend, getProductSalesRanking as getProductRanking,
  getCustomerAnalysis, getProfitAnalysis, getInventoryAnalysis, getCustomerStatement,
  DashboardStats, SalesTrend, ProductSalesRanking as ProductRanking, ProfitAnalysis, InventoryAnalysis, Statement
} from './statsService';
