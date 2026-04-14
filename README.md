# 智慧记AI进销存

一款**完全免费、无会员限制、离线可用**的安卓进销存管理APP。

## 项目简介

基于 **Expo 54 + React Native + TypeScript** 开发的全功能进销存管理系统，专为小微企业、个体商户设计。

### 核心特点

- ✅ **完全免费** - 无会员限制，无广告打扰，所有功能永久免费
- ✅ **离线可用** - 所有数据本地SQLite存储，无需联网
- ✅ **多单位管理** - 支持无限层级单位换算（箱→件→盒→个）
- ✅ **客户分级** - 自动客户等级管理，不同等级不同价格
- ✅ **智能分析** - 多维度统计分析，经营数据一目了然
- ✅ **蓝牙打印** - 支持蓝牙小票打印机
- ✅ **操作审计** - 所有关键操作可追溯

---

## 功能模块

| 模块 | 功能 |
|------|------|
| **首页** | 快捷入口、今日统计、待办提醒、最近销售 |
| **商品管理** | 商品信息、多单位价格、库存预警、条码管理 |
| **销售开单** | 快速开单、扫码添加、改价、赊账、退货退款 |
| **库存管理** | 实时库存、库存流水、库存盘点、成本核算 |
| **客户管理** | 客户信息、分级价格、应收账款、消费统计 |
| **供应商管理** | 供应商信息、采购记录、应付账款 |
| **统计分析** | 销售趋势、利润分析、商品排行、客户分析 |
| **系统设置** | 店铺信息、打印设置、数据备份恢复 |

---

## 技术架构

```
├── client/                     # React Native 前端 (Expo 54)
│   ├── app/                    # Expo Router 路由目录
│   ├── screens/                # 页面实现
│   ├── components/             # 可复用组件
│   ├── services/               # 数据服务层
│   ├── hooks/                  # 自定义 Hooks
│   └── constants/              # 常量和主题配置
│
├── server/                     # Express.js 后端
│   ├── src/
│   │   └── index.ts            # Express 入口
│   └── package.json
│
├── scripts/                    # 构建脚本
│   └── build-apk.sh            # APK构建脚本
│
├── BUILD.md                    # APK构建指南
├── USER_GUIDE.md               # 用户使用指南
└── package.json
```

---

## 快速开始

### 开发环境

```bash
# 安装依赖
pnpm install

# 启动开发服务
pnpm dev

# 前端: http://localhost:5000
# 后端: http://localhost:9091
```

### 静态检查

```bash
# 检查全部代码
npm run lint

# 仅检查前端
npm run lint:client

# 仅检查后端
npm run lint:server
```

### APK构建

```bash
# 本地构建（需要JDK17和Android SDK）
pnpm build:apk

# EAS云构建（推荐）
cd client && eas build --profile preview --platform android
```

详细构建步骤请参考 [BUILD.md](./BUILD.md)

---

## 依赖管理

**禁止**使用 `npm` 或 `yarn`：

| 目录 | 安装命令 |
|------|----------|
| `client/` | `npx expo install <package>` |
| `server/` | `pnpm add <package>` |

---

## 路径别名

Expo 配置了 `@/` 路径别名指向 `client/` 目录：

```tsx
// ✅ 正确
import { Screen } from '@/components/Screen';

// ❌ 避免
import { Screen } from '../../../components/Screen';
```

---

## 数据库结构

使用 SQLite 本地数据库，主要表结构：

| 表名 | 说明 |
|------|------|
| `products` | 商品信息 |
| `product_units` | 商品多单位 |
| `categories` | 商品分类 |
| `customers` | 客户信息 |
| `customer_levels` | 客户等级 |
| `suppliers` | 供应商 |
| `sales_orders` | 销售订单 |
| `sales_order_items` | 销售明细 |
| `purchase_orders` | 采购入库单 |
| `inventory_logs` | 库存流水 |
| `operation_logs` | 操作日志 |
| `settings` | 系统设置 |

---

## 应用信息

- **应用名称**: 智慧记AI进销存
- **包名**: com.free.jxc.app
- **版本**: 1.0.0
- **最低安卓版本**: Android 10 (API 29)
- **目标安卓版本**: Android 14 (API 34)

---

## 文档

- [APK构建指南](./BUILD.md)
- [用户使用指南](./USER_GUIDE.md)

---

## License

MIT License - 完全免费，可商用
