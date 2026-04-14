/**
 * 销售单详情页面
 * 支持查看详情、编辑、退货、打印
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { createStyles } from './styles';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import {
  getSalesOrderById,
  updateSalesOrder,
  createRefundOrder,
  SalesOrderWithItems,
} from '@/services/salesService';
import { printSalesReceipt, getPrinterStatus } from '@/services/bluetoothService';
import { logOperation } from '@/services/database';

export default function SaleDetailScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();
  const params = useSafeSearchParams<{ id: number }>();

  const [order, setOrder] = useState<SalesOrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [refundModalVisible, setRefundModalVisible] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refundItems, setRefundItems] = useState<Array<{ id: number; quantity: number }>>([]);

  const orderId = params.id;

  const loadOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      const data = await getSalesOrderById(orderId);
      setOrder(data);
    } catch (error) {
      console.error('Load order error:', error);
      Alert.alert('错误', '加载订单失败');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handlePrint = async () => {
    if (!order) return;

    const printerStatus = getPrinterStatus();
    if (!printerStatus.connected) {
      Alert.alert('提示', '请先连接打印机', [
        { text: '取消', style: 'cancel' },
        { text: '去设置', onPress: () => router.push('/bluetooth') },
      ]);
      return;
    }

    try {
      await printSalesReceipt({
        orderNo: order.order_no,
        customerName: order.customer_name,
        items: order.items.map(item => ({
          productName: item.product_name,
          quantity: item.quantity,
          unitName: item.unit_name,
          unitPrice: item.unit_price,
          subtotal: item.subtotal,
        })),
        totalAmount: order.total_amount,
        paidAmount: order.paid_amount,
        receivableAmount: order.receivable_amount,
        paymentMethod: order.payment_method,
        remark: order.remark,
      });
      Alert.alert('成功', '打印已发送');
    } catch (error) {
      console.error('Print error:', error);
      Alert.alert('错误', '打印失败');
    }
  };

  const handleRefund = async () => {
    if (!order || refundItems.length === 0) {
      Alert.alert('提示', '请选择退货商品');
      return;
    }

    const selectedItems = order.items
      .filter(item => refundItems.find(r => r.id === item.id))
      .map(item => ({
        ...item,
        quantity: refundItems.find(r => r.id === item.id)?.quantity || 0,
      }))
      .filter(item => item.quantity > 0);

    if (selectedItems.length === 0) {
      Alert.alert('提示', '请输入退货数量');
      return;
    }

    Alert.alert(
      '确认退货',
      `确定要退货 ${selectedItems.length} 种商品吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          onPress: async () => {
            try {
              await createRefundOrder({
                original_order_id: order.id,
                items: selectedItems.map(item => ({
                  original_item_id: item.id,
                  product_id: item.product_id,
                  unit_id: item.unit_id,
                  unit_name: item.unit_name,
                  quantity: item.quantity,
                  unit_price: item.unit_price,
                })),
                refund_reason: refundReason,
              });

              await logOperation('refund', 'sales', 'order', order.id, order.order_no, 
                `退货: ${selectedItems.map(i => `${i.product_name}x${i.quantity}`).join(', ')}`);

              Alert.alert('成功', '退货成功', [
                { text: '确定', onPress: () => router.back() },
              ]);
            } catch (error) {
              console.error('Refund error:', error);
              Alert.alert('错误', '退货失败');
            }
          },
        },
      ]
    );
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
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

  if (loading) {
    return (
      <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </Screen>
    );
  }

  if (!order) {
    return (
      <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
        <View style={styles.errorContainer}>
          <FontAwesome6 name="exclamation-circle" size={48} color={theme.error} />
          <ThemedText variant="body" color={theme.textSecondary}>
            订单不存在
          </ThemedText>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ThemedText variant="body" color={theme.primary}>返回</ThemedText>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 订单信息 */}
        <ThemedView level="default" style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText variant="h4" color={theme.textPrimary}>订单信息</ThemedText>
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(order.status)}20` }]}>
              <ThemedText variant="caption" color={getStatusColor(order.status)}>
                {getStatusText(order.status)}
              </ThemedText>
            </View>
          </View>

          <View style={styles.infoRow}>
            <ThemedText variant="body" color={theme.textMuted}>订单编号</ThemedText>
            <ThemedText variant="body" color={theme.textPrimary}>{order.order_no}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText variant="body" color={theme.textMuted}>客户</ThemedText>
            <ThemedText variant="body" color={theme.textPrimary}>{order.customer_name || '散客'}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText variant="body" color={theme.textMuted}>下单时间</ThemedText>
            <ThemedText variant="body" color={theme.textPrimary}>{formatTime(order.created_at)}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText variant="body" color={theme.textMuted}>支付方式</ThemedText>
            <ThemedText variant="body" color={theme.textPrimary}>
              {order.payment_method === 'cash' ? '现金' :
               order.payment_method === 'wechat' ? '微信' :
               order.payment_method === 'alipay' ? '支付宝' : '银行卡'}
            </ThemedText>
          </View>
          {order.remark && (
            <View style={styles.infoRow}>
              <ThemedText variant="body" color={theme.textMuted}>备注</ThemedText>
              <ThemedText variant="body" color={theme.textPrimary}>{order.remark}</ThemedText>
            </View>
          )}
        </ThemedView>

        {/* 商品明细 */}
        <ThemedView level="default" style={styles.section}>
          <ThemedText variant="h4" color={theme.textPrimary}>商品明细</ThemedText>
          
          {order.items.map((item, index) => (
            <View key={item.id || index} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <ThemedText variant="body" color={theme.textPrimary}>{item.product_name}</ThemedText>
                <ThemedText variant="caption" color={theme.textMuted}>
                  {item.unit_name} · ¥{item.unit_price.toFixed(2)}
                </ThemedText>
              </View>
              <View style={styles.itemRight}>
                <ThemedText variant="body" color={theme.textSecondary}>x{item.quantity}</ThemedText>
                <ThemedText variant="bodyMedium" color={theme.primary}>
                  ¥{item.subtotal.toFixed(2)}
                </ThemedText>
              </View>
            </View>
          ))}
        </ThemedView>

        {/* 金额汇总 */}
        <ThemedView level="default" style={styles.section}>
          <ThemedText variant="h4" color={theme.textPrimary}>金额汇总</ThemedText>
          
          <View style={styles.amountRow}>
            <ThemedText variant="body" color={theme.textSecondary}>商品金额</ThemedText>
            <ThemedText variant="body" color={theme.textPrimary}>
              ¥{order.items.reduce((sum, item) => sum + item.original_price * item.quantity, 0).toFixed(2)}
            </ThemedText>
          </View>
          
          {order.discount_amount > 0 && (
            <View style={styles.amountRow}>
              <ThemedText variant="body" color={theme.textSecondary}>优惠金额</ThemedText>
              <ThemedText variant="body" color={theme.error}>
                -¥{order.discount_amount.toFixed(2)}
              </ThemedText>
            </View>
          )}
          
          <View style={[styles.amountRow, styles.totalRow]}>
            <ThemedText variant="bodyMedium" color={theme.textPrimary}>实付金额</ThemedText>
            <ThemedText variant="h3" color={theme.primary}>
              ¥{order.total_amount.toFixed(2)}
            </ThemedText>
          </View>

          {order.paid_amount < order.total_amount && (
            <View style={styles.amountRow}>
              <ThemedText variant="body" color={theme.textSecondary}>待收款</ThemedText>
              <ThemedText variant="bodyMedium" color={theme.error}>
                ¥{(order.total_amount - order.paid_amount).toFixed(2)}
              </ThemedText>
            </View>
          )}
        </ThemedView>
      </ScrollView>

      {/* 底部操作栏 */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.actionButton} onPress={handlePrint}>
          <FontAwesome6 name="print" size={20} color={theme.primary} />
          <ThemedText variant="body" color={theme.primary}>打印</ThemedText>
        </TouchableOpacity>

        {order.status === 'completed' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.refundButton]}
            onPress={() => {
              setRefundItems(order.items.map(item => ({ id: item.id, quantity: 0 })));
              setRefundModalVisible(true);
            }}
          >
            <FontAwesome6 name="rotate-left" size={20} color={theme.error} />
            <ThemedText variant="body" color={theme.error}>退货</ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {/* 退货弹窗 */}
      <Modal visible={refundModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText variant="h4" color={theme.textPrimary}>选择退货商品</ThemedText>
              <TouchableOpacity onPress={() => setRefundModalVisible(false)}>
                <FontAwesome6 name="times" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {order.items.map((item, index) => {
                const refundItem = refundItems.find(r => r.id === item.id);
                const currentQty = refundItem?.quantity || 0;

                return (
                  <View key={item.id || index} style={styles.refundItemRow}>
                    <View style={styles.refundItemInfo}>
                      <ThemedText variant="body" color={theme.textPrimary}>{item.product_name}</ThemedText>
                      <ThemedText variant="caption" color={theme.textMuted}>
                        可退: {item.quantity} {item.unit_name}
                      </ThemedText>
                    </View>
                    <View style={styles.quantityControl}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => {
                          setRefundItems(prev =>
                            prev.map(r =>
                              r.id === item.id
                                ? { ...r, quantity: Math.max(0, r.quantity - 1) }
                                : r
                            )
                          );
                        }}
                      >
                        <FontAwesome6 name="minus" size={14} color={theme.textPrimary} />
                      </TouchableOpacity>
                      <TextInput
                        style={styles.quantityInput}
                        value={currentQty.toString()}
                        onChangeText={(text) => {
                          const qty = parseInt(text) || 0;
                          setRefundItems(prev =>
                            prev.map(r =>
                              r.id === item.id
                                ? { ...r, quantity: Math.min(item.quantity, qty) }
                                : r
                            )
                          );
                        }}
                        keyboardType="numeric"
                      />
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => {
                          setRefundItems(prev =>
                            prev.map(r =>
                              r.id === item.id
                                ? { ...r, quantity: Math.min(item.quantity, r.quantity + 1) }
                                : r
                            )
                          );
                        }}
                      >
                        <FontAwesome6 name="plus" size={14} color={theme.textPrimary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}

              <View style={styles.remarkInput}>
                <ThemedText variant="body" color={theme.textSecondary}>退货原因（选填）</ThemedText>
                <TextInput
                  style={styles.textInput}
                  placeholder="请输入退货原因"
                  placeholderTextColor={theme.textMuted}
                  value={refundReason}
                  onChangeText={setRefundReason}
                  multiline
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setRefundModalVisible(false)}
              >
                <ThemedText variant="body" color={theme.textSecondary}>取消</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleRefund}>
                <ThemedText variant="body" color="#fff">确认退货</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
