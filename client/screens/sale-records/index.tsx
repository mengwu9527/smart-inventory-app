/**
 * 销售记录页面 - 销售单列表
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { createStyles } from './styles';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { getSalesOrders, SalesOrder } from '@/services/salesService';

type FilterStatus = 'all' | 'pending' | 'completed' | 'refunded';

export default function SaleRecordsScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();

  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>('all');

  const loadOrders = useCallback(async () => {
    try {
      const data = await getSalesOrders({
        status: filter === 'all' ? undefined : filter,
      });
      setOrders(data);
    } catch (error) {
      console.error('Load orders error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const handleOrderPress = (order: SalesOrder) => {
    router.push('/sale-detail', { id: order.id });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return theme.success;
      case 'pending': return '#F59E0B';
      case 'refunded': return theme.error;
      default: return theme.textMuted;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '已完成';
      case 'pending': return '待付款';
      case 'refunded': return '已退货';
      default: return status;
    }
  };

  const renderFilterItem = (key: FilterStatus, label: string) => (
    <TouchableOpacity
      key={key}
      style={[styles.filterItem, filter === key && styles.filterItemActive]}
      onPress={() => setFilter(key)}
    >
      <ThemedText
        variant="body"
        color={filter === key ? theme.primary : theme.textSecondary}
      >
        {label}
      </ThemedText>
    </TouchableOpacity>
  );

  const renderOrderItem = ({ item }: { item: SalesOrder }) => (
    <TouchableOpacity
      style={styles.orderItem}
      onPress={() => handleOrderPress(item)}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderNoContainer}>
          <FontAwesome6 name="receipt" size={16} color={theme.primary} />
          <ThemedText variant="body" color={theme.textPrimary}>
            {item.order_no}
          </ThemedText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
          <ThemedText variant="caption" color={getStatusColor(item.status)}>
            {getStatusText(item.status)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.orderBody}>
        <View style={styles.orderInfo}>
          <ThemedText variant="bodyMedium" color={theme.textSecondary}>
            {item.customer_name || '散客'}
          </ThemedText>
          <ThemedText variant="caption" color={theme.textMuted}>
            {formatTime(item.created_at)}
          </ThemedText>
        </View>

        <View style={styles.orderAmount}>
          <ThemedText variant="h4" color={theme.primary}>
            ¥{item.total_amount.toFixed(2)}
          </ThemedText>
          <ThemedText variant="caption" color={theme.textMuted}>
            {item.total_quantity} 件
          </ThemedText>
        </View>
      </View>

      {item.remark && (
        <View style={styles.orderRemark}>
          <FontAwesome6 name="note-sticky" size={12} color={theme.textMuted} />
          <ThemedText variant="caption" color={theme.textMuted} numberOfLines={1}>
            {item.remark}
          </ThemedText>
        </View>
      )}

      <View style={styles.orderFooter}>
        <FontAwesome6 name="chevron-right" size={16} color={theme.textMuted} />
      </View>
    </TouchableOpacity>
  );

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
      {/* 筛选栏 */}
      <View style={styles.filterBar}>
        {renderFilterItem('all', '全部')}
        {renderFilterItem('pending', '待付款')}
        {renderFilterItem('completed', '已完成')}
        {renderFilterItem('refunded', '已退货')}
      </View>

      {/* 统计信息 */}
      <View style={styles.statsBar}>
        <ThemedText variant="body" color={theme.textSecondary}>
          共 {orders.length} 笔订单
        </ThemedText>
        <ThemedText variant="body" color={theme.primary}>
          合计 ¥{orders.reduce((sum, o) => sum + o.total_amount, 0).toFixed(2)}
        </ThemedText>
      </View>

      {/* 订单列表 */}
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome6 name="receipt" size={48} color={theme.textMuted} />
            <ThemedText variant="body" color={theme.textMuted}>
              暂无销售记录
            </ThemedText>
          </View>
        }
      />
    </Screen>
  );
}
