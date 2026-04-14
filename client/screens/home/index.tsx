import React, { useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FontAwesome6 } from '@expo/vector-icons';
import { createStyles } from './styles';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useFocusEffect } from 'expo-router';
import { getDashboardStats, DashboardStats } from '@/services/statsService';
import { getProductStats } from '@/services/productService';
import { getCustomerStats } from '@/services/customerService';
import { getSupplierStats } from '@/services/supplierService';
import { getSalesStats } from '@/services/salesService';

export default function HomeScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();
  
  const [refreshing, setRefreshing] = React.useState(false);
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [productStats, setProductStats] = React.useState({ total_count: 0, low_stock_count: 0, out_stock_count: 0 });
  const [salesStats, setSalesStats] = React.useState({ total_amount: 0, today_amount: 0, month_amount: 0 });

  const loadData = React.useCallback(async () => {
    try {
      const [dashboard, product, sales] = await Promise.all([
        getDashboardStats(),
        getProductStats(),
        getSalesStats(),
      ]);
      setStats(dashboard);
      setProductStats(product);
      setSalesStats({
        total_amount: sales.total_amount,
        today_amount: dashboard.sales.today_amount,
        month_amount: dashboard.sales.month_amount,
      });
    } catch (error) {
      console.error('Load data error:', error);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const quickActions = [
    { icon: 'cart-shopping', label: '销售开单', route: '/(tabs)/sale', color: theme.primary },
    { icon: 'receipt', label: '销售记录', route: '/sale-records', color: '#10B981' },
    { icon: 'box-open', label: '商品管理', route: '/(tabs)/product', color: '#F59E0B' },
    { icon: 'users', label: '客户管理', route: '/customer', color: '#8B5CF6' },
  ];

  const menuItems = [
    { icon: 'warehouse', label: '库存管理', route: '/(tabs)/inventory', color: '#EC4899' },
    { icon: 'building', label: '供应商管理', route: '/supplier', color: '#3B82F6' },
    { icon: 'truck-fast', label: '采购入库', route: '/purchase', color: '#10B981' },
    { icon: 'money-check-dollar', label: '往来账管理', route: '/finance', color: '#F59E0B' },
    { icon: 'chart-pie', label: '统计分析', route: '/stats', color: '#8B5CF6' },
    { icon: 'print', label: '打印管理', route: '/print', color: '#EC4899' },
    { icon: 'bluetooth', label: '蓝牙设置', route: '/bluetooth', color: '#3B82F6' },
    { icon: 'list-check', label: '操作日志', route: '/logs', color: '#6366F1' },
  ];

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 欢迎区域 */}
        <ThemedView level="root" style={styles.header}>
          <ThemedText variant="h2" color={theme.textPrimary}>
            智慧记进销存
          </ThemedText>
          <ThemedText variant="body" color={theme.textSecondary}>
            免费、强大、离线可用的进销存管理系统
          </ThemedText>
        </ThemedView>

        {/* 数据概览卡片 */}
        <ThemedView level="default" style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <ThemedText variant="h4" color={theme.textPrimary}>数据概览</ThemedText>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <ThemedText variant="h2" color={theme.primary}>
                ¥{(salesStats.today_amount || 0).toFixed(0)}
              </ThemedText>
              <ThemedText variant="small" color={theme.textMuted}>今日销售</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText variant="h2" color={theme.primary}>
                ¥{(salesStats.month_amount || 0).toFixed(0)}
              </ThemedText>
              <ThemedText variant="small" color={theme.textMuted}>本月销售</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText variant="h2" color={theme.textPrimary}>
                {productStats.total_count}
              </ThemedText>
              <ThemedText variant="small" color={theme.textMuted}>商品总数</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText variant="h2" color={productStats.low_stock_count > 0 ? '#EF4444' : theme.textPrimary}>
                {productStats.low_stock_count}
              </ThemedText>
              <ThemedText variant="small" color={theme.textMuted}>库存预警</ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* 快捷操作 */}
        <ThemedView level="default" style={styles.section}>
          <ThemedText variant="h4" color={theme.textPrimary} style={styles.sectionTitle}>
            快捷操作
          </ThemedText>
          <View style={styles.quickActions}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickActionItem}
                onPress={() => router.push(action.route)}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                  <FontAwesome6 name={action.icon} size={24} color={action.color} />
                </View>
                <ThemedText variant="smallMedium" color={theme.textPrimary}>
                  {action.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </ThemedView>

        {/* 功能菜单 */}
        <ThemedView level="default" style={styles.section}>
          <ThemedText variant="h4" color={theme.textPrimary} style={styles.sectionTitle}>
            功能菜单
          </ThemedText>
          <View style={styles.menuList}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => router.push(item.route)}
              >
                <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                  <FontAwesome6 name={item.icon} size={20} color={item.color} />
                </View>
                <ThemedText variant="body" color={theme.textPrimary} style={styles.menuLabel}>
                  {item.label}
                </ThemedText>
                <FontAwesome6 name="chevron-right" size={16} color={theme.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </ThemedView>

        {/* 库存预警 */}
        {(productStats.low_stock_count > 0 || productStats.out_stock_count > 0) && (
          <ThemedView level="default" style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <FontAwesome6 name="triangle-exclamation" size={20} color="#EF4444" />
              <ThemedText variant="h4" color="#EF4444">库存预警</ThemedText>
            </View>
            <View style={styles.alertContent}>
              {productStats.out_stock_count > 0 && (
                <ThemedText variant="body" color={theme.textSecondary}>
                  • {productStats.out_stock_count} 个商品已缺货
                </ThemedText>
              )}
              {productStats.low_stock_count > 0 && (
                <ThemedText variant="body" color={theme.textSecondary}>
                  • {productStats.low_stock_count} 个商品库存不足
                </ThemedText>
              )}
            </View>
            <TouchableOpacity 
              style={styles.alertButton}
              onPress={() => router.push('/(tabs)/inventory')}
            >
              <ThemedText variant="smallMedium" color={theme.primary}>查看详情</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}
      </ScrollView>
    </Screen>
  );
}
