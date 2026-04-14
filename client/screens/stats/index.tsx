/**
 * 统计分析页面 - 增强版
 * 支持日期范围选择、多维度统计分析
 */
import React, { useMemo, useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FontAwesome6 } from '@expo/vector-icons';
import { createStyles } from './styles';
import { useFocusEffect } from 'expo-router';
import {
  getDashboardStats,
  getSalesTrend,
  getProductSalesRanking,
  getProfitAnalysis,
  getCustomerAnalysis,
  getInventoryAnalysis,
  DashboardStats,
  SalesTrend,
  ProductSalesRanking,
  ProfitAnalysis,
  CustomerAnalysis,
  InventoryAnalysis,
} from '@/services/statsService';

type DateRange = 'today' | 'week' | 'month' | 'year';

export default function StatsScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>('month');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [salesTrend, setSalesTrend] = useState<SalesTrend[]>([]);
  const [productRanking, setProductRanking] = useState<ProductSalesRanking[]>([]);
  const [profitAnalysis, setProfitAnalysis] = useState<ProfitAnalysis | null>(null);
  const [customerAnalysis, setCustomerAnalysis] = useState<CustomerAnalysis[]>([]);
  const [inventoryAnalysis, setInventoryAnalysis] = useState<InventoryAnalysis | null>(null);

  const getDateRangeParams = useCallback((range: DateRange) => {
    const now = new Date();
    let startDate: string;
    
    switch (range) {
      case 'today':
        startDate = now.toISOString().split('T')[0];
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        startDate = weekAgo.toISOString().split('T')[0];
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        startDate = monthAgo.toISOString().split('T')[0];
        break;
      case 'year':
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        startDate = yearAgo.toISOString().split('T')[0];
        break;
    }
    
    return { start_date: startDate, end_date: now.toISOString().split('T')[0] };
  }, []);

  const loadData = useCallback(async () => {
    try {
      const dateParams = getDateRangeParams(dateRange);
      const days = dateRange === 'today' ? 1 : dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 365;

      const [dashboard, trend, ranking, profit, customer, inventory] = await Promise.all([
        getDashboardStats(),
        getSalesTrend(days),
        getProductSalesRanking({ ...dateParams, limit: 10 }),
        getProfitAnalysis(dateParams),
        getCustomerAnalysis({ ...dateParams, limit: 5 }),
        getInventoryAnalysis(),
      ]);

      setStats(dashboard);
      setSalesTrend(trend);
      setProductRanking(ranking);
      setProfitAnalysis(profit);
      setCustomerAnalysis(customer);
      setInventoryAnalysis(inventory);
    } catch (error) {
      console.error('Load stats error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateRange, getDateRangeParams]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
  }, [loadData]);

  const dateRangeOptions: Array<{ key: DateRange; label: string }> = [
    { key: 'today', label: '今日' },
    { key: 'week', label: '本周' },
    { key: 'month', label: '本月' },
    { key: 'year', label: '今年' },
  ];

  if (loading) {
    return (
      <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      {/* 日期范围选择 */}
      <View style={styles.dateRangeBar}>
        {dateRangeOptions.map(option => (
          <TouchableOpacity
            key={option.key}
            style={[styles.dateRangeItem, dateRange === option.key && styles.dateRangeItemActive]}
            onPress={() => setDateRange(option.key)}
          >
            <ThemedText
              variant="body"
              color={dateRange === option.key ? theme.primary : theme.textSecondary}
            >
              {option.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* 销售概览 */}
        <ThemedView level="default" style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText variant="h4" color={theme.textPrimary}>销售概览</ThemedText>
            <View style={styles.trendBadge}>
              <FontAwesome6 name="chart-line" size={14} color={theme.success} />
              <ThemedText variant="caption" color={theme.success}>实时</ThemedText>
            </View>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <ThemedText variant="small" color={theme.textMuted}>今日销售</ThemedText>
              <ThemedText variant="h2" color={theme.primary}>
                ¥{(stats?.sales.today_amount || 0).toFixed(0)}
              </ThemedText>
              <ThemedText variant="small" color={theme.textMuted}>
                {stats?.sales.today_orders || 0} 单
              </ThemedText>
            </View>
            <View style={styles.statCard}>
              <ThemedText variant="small" color={theme.textMuted}>本月销售</ThemedText>
              <ThemedText variant="h2" color={theme.primary}>
                ¥{(stats?.sales.month_amount || 0).toFixed(0)}
              </ThemedText>
              <ThemedText variant="small" color={theme.textMuted}>
                {stats?.sales.month_orders || 0} 单
              </ThemedText>
            </View>
          </View>
          
          {/* 销售趋势简图 */}
          <View style={styles.trendChart}>
            {salesTrend.slice(-7).map((item, index) => {
              const maxAmount = Math.max(...salesTrend.slice(-7).map(t => t.amount), 1);
              const height = (item.amount / maxAmount) * 100;
              return (
                <View key={index} style={styles.trendBar}>
                  <View style={[styles.trendBarInner, { height: `${Math.max(height, 5)}%` }]} />
                  <ThemedText variant="caption" color={theme.textMuted}>
                    {item.date.slice(5)}
                  </ThemedText>
                </View>
              );
            })}
          </View>
        </ThemedView>

        {/* 利润分析 */}
        <ThemedView level="default" style={styles.section}>
          <ThemedText variant="h4" color={theme.textPrimary}>利润分析</ThemedText>
          <View style={styles.profitRow}>
            <View style={styles.profitItem}>
              <ThemedText variant="small" color={theme.textMuted}>总收入</ThemedText>
              <ThemedText variant="h3" color={theme.textPrimary}>
                ¥{(profitAnalysis?.total_revenue || 0).toFixed(0)}
              </ThemedText>
            </View>
            <View style={styles.profitItem}>
              <ThemedText variant="small" color={theme.textMuted}>总利润</ThemedText>
              <ThemedText variant="h3" color={theme.primary}>
                ¥{(profitAnalysis?.total_profit || 0).toFixed(0)}
              </ThemedText>
            </View>
            <View style={styles.profitItem}>
              <ThemedText variant="small" color={theme.textMuted}>利润率</ThemedText>
              <ThemedText variant="h3" color={theme.primary}>
                {(profitAnalysis?.profit_rate || 0).toFixed(1)}%
              </ThemedText>
            </View>
          </View>

          {/* 分类利润 */}
          {profitAnalysis?.by_category && profitAnalysis.by_category.length > 0 && (
            <View style={styles.categoryProfit}>
              <ThemedText variant="body" color={theme.textSecondary}>分类利润</ThemedText>
              {profitAnalysis.by_category.slice(0, 3).map((cat, index) => (
                <View key={index} style={styles.categoryItem}>
                  <ThemedText variant="body" color={theme.textPrimary}>{cat.category_name}</ThemedText>
                  <View style={styles.categoryProfitBar}>
                    <View 
                      style={[
                        styles.categoryProfitFill, 
                        { width: `${Math.min((cat.profit / (profitAnalysis.total_profit || 1)) * 100, 100)}%` }
                      ]} 
                    />
                  </View>
                  <ThemedText variant="body" color={theme.primary}>¥{cat.profit.toFixed(0)}</ThemedText>
                </View>
              ))}
            </View>
          )}
        </ThemedView>

        {/* 商品排行 */}
        <ThemedView level="default" style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText variant="h4" color={theme.textPrimary}>商品销售排行</ThemedText>
            <ThemedText variant="caption" color={theme.textMuted}>TOP 5</ThemedText>
          </View>
          {productRanking.slice(0, 5).map((item, index) => (
            <View key={item.product_id} style={styles.rankingItem}>
              <View style={[styles.rankingBadge, index < 3 && styles.rankingBadgeTop]}>
                <ThemedText variant="small" color={index < 3 ? theme.buttonPrimaryText : theme.textSecondary}>
                  {index + 1}
                </ThemedText>
              </View>
              <View style={styles.rankingInfo}>
                <ThemedText variant="body" color={theme.textPrimary} numberOfLines={1}>
                  {item.product_name}
                </ThemedText>
                <ThemedText variant="small" color={theme.textMuted}>
                  销量: {item.total_quantity} | 利润率: {item.profit_rate.toFixed(1)}%
                </ThemedText>
              </View>
              <ThemedText variant="bodyMedium" color={theme.primary}>
                ¥{item.total_amount.toFixed(0)}
              </ThemedText>
            </View>
          ))}
        </ThemedView>

        {/* 客户分析 */}
        <ThemedView level="default" style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText variant="h4" color={theme.textPrimary}>客户购买排行</ThemedText>
            <ThemedText variant="caption" color={theme.textMuted}>TOP 5</ThemedText>
          </View>
          {customerAnalysis.slice(0, 5).map((item, index) => (
            <View key={item.customer_id} style={styles.rankingItem}>
              <View style={styles.customerIcon}>
                <FontAwesome6 name="user" size={16} color={theme.primary} />
              </View>
              <View style={styles.rankingInfo}>
                <View style={styles.customerNameRow}>
                  <ThemedText variant="body" color={theme.textPrimary}>{item.customer_name}</ThemedText>
                  {item.level_name && (
                    <View style={styles.levelTag}>
                      <ThemedText variant="caption" color={theme.primary}>{item.level_name}</ThemedText>
                    </View>
                  )}
                </View>
                <ThemedText variant="small" color={theme.textMuted}>
                  {item.order_count} 单 | 均价 ¥{item.avg_order_amount.toFixed(0)}
                </ThemedText>
              </View>
              <ThemedText variant="bodyMedium" color={theme.primary}>
                ¥{item.total_amount.toFixed(0)}
              </ThemedText>
            </View>
          ))}
        </ThemedView>

        {/* 库存概览 */}
        <ThemedView level="default" style={styles.section}>
          <ThemedText variant="h4" color={theme.textPrimary}>库存概览</ThemedText>
          <View style={styles.inventoryGrid}>
            <View style={styles.inventoryItem}>
              <FontAwesome6 name="box" size={20} color={theme.primary} />
              <View style={styles.inventoryInfo}>
                <ThemedText variant="small" color={theme.textMuted}>商品总数</ThemedText>
                <ThemedText variant="h4" color={theme.textPrimary}>
                  {inventoryAnalysis?.total_products || 0}
                </ThemedText>
              </View>
            </View>
            <View style={styles.inventoryItem}>
              <FontAwesome6 name="coins" size={20} color="#F59E0B" />
              <View style={styles.inventoryInfo}>
                <ThemedText variant="small" color={theme.textMuted}>库存总值</ThemedText>
                <ThemedText variant="h4" color={theme.textPrimary}>
                  ¥{(inventoryAnalysis?.total_value || 0).toFixed(0)}
                </ThemedText>
              </View>
            </View>
            <View style={styles.inventoryItem}>
              <FontAwesome6 name="triangle-exclamation" size={20} color="#EF4444" />
              <View style={styles.inventoryInfo}>
                <ThemedText variant="small" color={theme.textMuted}>库存不足</ThemedText>
                <ThemedText variant="h4" color="#EF4444">
                  {inventoryAnalysis?.low_stock_products.length || 0}
                </ThemedText>
              </View>
            </View>
            <View style={styles.inventoryItem}>
              <FontAwesome6 name="xmark" size={20} color={theme.textMuted} />
              <View style={styles.inventoryInfo}>
                <ThemedText variant="small" color={theme.textMuted}>缺货商品</ThemedText>
                <ThemedText variant="h4" color={theme.textPrimary}>
                  {inventoryAnalysis?.out_stock_products.length || 0}
                </ThemedText>
              </View>
            </View>
          </View>
        </ThemedView>

        {/* 应收应付 */}
        <ThemedView level="default" style={styles.section}>
          <ThemedText variant="h4" color={theme.textPrimary}>往来款项</ThemedText>
          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <ThemedText variant="body" color={theme.textMuted}>应收款</ThemedText>
              <ThemedText variant="h3" color="#EF4444">
                ¥{(stats?.customer.total_receivable || 0).toFixed(0)}
              </ThemedText>
              <ThemedText variant="small" color={theme.textMuted}>
                {stats?.customer.vip_count || 0} 位VIP客户
              </ThemedText>
            </View>
            <View style={styles.balanceItem}>
              <ThemedText variant="body" color={theme.textMuted}>应付款</ThemedText>
              <ThemedText variant="h3" color="#F59E0B">
                ¥{(stats?.purchase.total_payable || 0).toFixed(0)}
              </ThemedText>
              <ThemedText variant="small" color={theme.textMuted}>
                本月采购 ¥{(stats?.purchase.month_amount || 0).toFixed(0)}
              </ThemedText>
            </View>
          </View>
        </ThemedView>
      </ScrollView>
    </Screen>
  );
}
