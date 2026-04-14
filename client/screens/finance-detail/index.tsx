/**
 * 往来账详情页面
 * 展示客户或供应商的完整账单流水
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { createStyles } from './styles';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { getCustomerById, CustomerWithLevel } from '@/services/customerService';
import { getSupplierById, Supplier } from '@/services/supplierService';
import { getPaymentRecords, createPaymentRecord, PaymentRecord } from '@/services/salesService';
import { getDatabase } from '@/services/database';

interface TransactionRecord {
  id: number;
  type: 'sale' | 'purchase' | 'payment' | 'receipt';
  order_no: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  created_at: string;
  remark?: string;
}

export default function FinanceDetailScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();
  const params = useSafeSearchParams<{ id: number; type: 'customer' | 'supplier' }>();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [customer, setCustomer] = useState<CustomerWithLevel | null>(null);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'wechat' | 'alipay' | 'card'>('cash');

  const targetId = params.id;
  const targetType = params.type;

  const loadData = useCallback(async () => {
    if (!targetId || !targetType) return;

    try {
      const db = getDatabase();

      if (targetType === 'customer') {
        const customerData = await getCustomerById(targetId);
        setCustomer(customerData || null);

        // 获取销售订单作为往来记录
        const orders = await db.getAllAsync<any>(
          `SELECT id, order_no, total_amount, paid_amount, receivable_amount, created_at, status
           FROM sales_orders WHERE customer_id = ? ORDER BY created_at DESC`,
          [targetId]
        );

        // 获取收款记录
        const payments = await db.getAllAsync<any>(
          `SELECT id, order_no, amount, payment_method, created_at
           FROM payment_records WHERE customer_id = ? ORDER BY created_at DESC`,
          [targetId]
        );

        // 合并并转换为交易记录
        const records: TransactionRecord[] = [];
        
        orders.forEach((order: any) => {
          records.push({
            id: order.id,
            type: 'sale',
            order_no: order.order_no,
            amount: order.total_amount,
            balance_before: 0,
            balance_after: order.receivable_amount,
            created_at: order.created_at,
          });
        });

        payments.forEach((payment: any) => {
          records.push({
            id: payment.id,
            type: 'receipt',
            order_no: payment.order_no || '',
            amount: payment.amount,
            balance_before: 0,
            balance_after: 0,
            created_at: payment.created_at,
          });
        });

        // 按时间排序
        records.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setTransactions(records);
      } else {
        const supplierData = await getSupplierById(targetId);
        setSupplier(supplierData || null);

        // 获取采购订单作为往来记录
        const orders = await db.getAllAsync<any>(
          `SELECT id, order_no, total_amount, paid_amount, created_at
           FROM purchase_orders WHERE supplier_id = ? ORDER BY created_at DESC`,
          [targetId]
        );

        const records: TransactionRecord[] = orders.map((order: any) => ({
          id: order.id,
          type: 'purchase' as const,
          order_no: order.order_no,
          amount: order.total_amount,
          balance_before: 0,
          balance_after: order.total_amount - (order.paid_amount || 0),
          created_at: order.created_at,
        }));

        records.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setTransactions(records);
      }
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [targetId, targetType]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handlePayment = async () => {
    if (!targetId || !targetType || !paymentAmount) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('提示', '请输入有效金额');
      return;
    }

    try {
      if (targetType === 'customer') {
        await createPaymentRecord({
          customer_id: targetId,
          amount,
          payment_method: paymentMethod,
        });
      } else {
        // 供应商付款逻辑类似
        const db = getDatabase();
        await db.runAsync(
          `INSERT INTO payment_records (order_no, supplier_id, amount, payment_method, status)
           VALUES (?, ?, ?, ?, 'completed')`,
          [`PAY${Date.now()}`, targetId, amount, paymentMethod]
        );

        // 更新供应商余额
        await db.runAsync(
          `UPDATE suppliers SET balance = balance - ? WHERE id = ?`,
          [amount, targetId]
        );
      }

      setPaymentModalVisible(false);
      setPaymentAmount('');
      Alert.alert('成功', '登记成功');
      loadData();
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('错误', '登记失败');
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sale': return 'cart-shopping';
      case 'purchase': return 'truck-fast';
      case 'payment': return 'arrow-up';
      case 'receipt': return 'arrow-down';
      default: return 'receipt';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'sale': return '销售';
      case 'purchase': return '采购';
      case 'payment': return '付款';
      case 'receipt': return '收款';
      default: return type;
    }
  };

  if (loading) {
    return (
      <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </Screen>
    );
  }

  const name = customer?.name || supplier?.name || '';
  const balance = customer?.balance || supplier?.balance || 0;
  const phone = customer?.phone || supplier?.phone || '';

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      {/* 顶部信息卡片 */}
      <ThemedView level="default" style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View style={styles.avatar}>
            <FontAwesome6
              name={targetType === 'customer' ? 'user' : 'building'}
              size={24}
              color={theme.primary}
            />
          </View>
          <View style={styles.headerInfo}>
            <ThemedText variant="h4" color={theme.textPrimary}>{name}</ThemedText>
            {phone && (
              <ThemedText variant="body" color={theme.textSecondary}>{phone}</ThemedText>
            )}
            {customer?.level_name && (
              <View style={styles.levelBadge}>
                <ThemedText variant="caption" color={theme.primary}>{customer.level_name}</ThemedText>
              </View>
            )}
          </View>
        </View>

        <View style={styles.balanceRow}>
          <View style={styles.balanceItem}>
            <ThemedText variant="body" color={theme.textSecondary}>
              {targetType === 'customer' ? '应收余额' : '应付余额'}
            </ThemedText>
            <ThemedText variant="h2" color={targetType === 'customer' ? '#EF4444' : '#F59E0B'}>
              ¥{balance.toFixed(2)}
            </ThemedText>
          </View>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setPaymentModalVisible(true)}
          >
            <FontAwesome6
              name={targetType === 'customer' ? 'hand-holding-dollar' : 'money-bill-transfer'}
              size={20}
              color="#fff"
            />
            <ThemedText variant="body" color="#fff">
              {targetType === 'customer' ? '收款' : '付款'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>

      {/* 交易流水 */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.primary]} />
        }
      >
        <ThemedText variant="h4" color={theme.textPrimary} style={styles.sectionTitle}>
          交易流水
        </ThemedText>

        {transactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome6 name="receipt" size={48} color={theme.textMuted} />
            <ThemedText variant="body" color={theme.textMuted}>暂无交易记录</ThemedText>
          </View>
        ) : (
          transactions.map((item, index) => (
            <View key={item.id || index} style={styles.transactionItem}>
              <View style={[
                styles.transactionIcon,
                { backgroundColor: item.type === 'sale' || item.type === 'purchase' ? `${theme.primary}15` : `${theme.success}15` }
              ]}>
                <FontAwesome6
                  name={getTypeIcon(item.type)}
                  size={16}
                  color={item.type === 'sale' || item.type === 'purchase' ? theme.primary : theme.success}
                />
              </View>
              <View style={styles.transactionInfo}>
                <View style={styles.transactionHeader}>
                  <ThemedText variant="body" color={theme.textPrimary}>
                    {getTypeText(item.type)}
                  </ThemedText>
                  <ThemedText
                    variant="bodyMedium"
                    color={item.type === 'receipt' || item.type === 'payment' ? theme.success : theme.textPrimary}
                  >
                    {item.type === 'receipt' || item.type === 'payment' ? '-' : '+'}¥{item.amount.toFixed(2)}
                  </ThemedText>
                </View>
                <ThemedText variant="caption" color={theme.textMuted}>
                  {item.order_no} · {formatTime(item.created_at)}
                </ThemedText>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* 收款/付款弹窗 */}
      <Modal visible={paymentModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText variant="h4" color={theme.textPrimary}>
                {targetType === 'customer' ? '登记收款' : '登记付款'}
              </ThemedText>
              <TouchableOpacity onPress={() => setPaymentModalVisible(false)}>
                <FontAwesome6 name="times" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.infoRow}>
                <ThemedText variant="body" color={theme.textSecondary}>
                  {targetType === 'customer' ? '应收余额' : '应付余额'}
                </ThemedText>
                <ThemedText variant="h4" color={targetType === 'customer' ? '#EF4444' : '#F59E0B'}>
                  ¥{balance.toFixed(2)}
                </ThemedText>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText variant="body" color={theme.textSecondary}>收款金额</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="请输入金额"
                  placeholderTextColor={theme.textMuted}
                  value={paymentAmount}
                  onChangeText={setPaymentAmount}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.paymentMethods}>
                {[
                  { key: 'cash', label: '现金', icon: 'money-bill' },
                  { key: 'wechat', label: '微信', icon: 'comments' },
                  { key: 'alipay', label: '支付宝', icon: 'credit-card' },
                  { key: 'card', label: '银行卡', icon: 'building-columns' },
                ].map(method => (
                  <TouchableOpacity
                    key={method.key}
                    style={[styles.methodButton, paymentMethod === method.key && styles.methodButtonActive]}
                    onPress={() => setPaymentMethod(method.key as any)}
                  >
                    <FontAwesome6
                      name={method.icon}
                      size={16}
                      color={paymentMethod === method.key ? theme.primary : theme.textMuted}
                    />
                    <ThemedText
                      variant="caption"
                      color={paymentMethod === method.key ? theme.primary : theme.textMuted}
                    >
                      {method.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setPaymentModalVisible(false);
                  setPaymentAmount('');
                }}
              >
                <ThemedText variant="body" color={theme.textSecondary}>取消</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handlePayment}>
                <ThemedText variant="body" color="#fff">确认</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
