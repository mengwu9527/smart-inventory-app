/**
 * 往来账管理页面
 */
import React, { useMemo, useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl, Alert, Modal, TextInput } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FontAwesome6 } from '@expo/vector-icons';
import { createStyles } from './styles';
import { useFocusEffect } from 'expo-router';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { getCustomers, CustomerWithLevel } from '@/services/customerService';
import { createPaymentRecord } from '@/services/salesService';
import { getSuppliers, Supplier, getSupplierStats } from '@/services/supplierService';

export default function FinanceScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();

  const [activeTab, setActiveTab] = useState<'receivable' | 'payable'>('receivable');
  const [customers, setCustomers] = useState<CustomerWithLevel[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithLevel | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [customersData, suppliersData] = await Promise.all([
        getCustomers(),
        getSuppliers(),
      ]);
      setCustomers(customersData.filter(c => c.balance > 0));
      setSuppliers(suppliersData.filter(s => s.balance > 0));
    } catch (error) {
      console.error('Load data error:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handlePayment = async () => {
    if (!selectedCustomer || !paymentAmount) return;
    
    try {
      await createPaymentRecord({
        customer_id: selectedCustomer.id,
        amount: parseFloat(paymentAmount),
        payment_method: 'cash',
      });
      setPaymentModalVisible(false);
      setSelectedCustomer(null);
      setPaymentAmount('');
      await loadData();
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('错误', '收款失败');
    }
  };

  const totalReceivable = customers.reduce((sum, c) => sum + (c.balance || 0), 0);
  const totalPayable = suppliers.reduce((sum, s) => sum + (s.balance || 0), 0);

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      {/* Tab切换 */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'receivable' && styles.tabActive]}
          onPress={() => setActiveTab('receivable')}
        >
          <ThemedText variant="bodyMedium" color={activeTab === 'receivable' ? theme.primary : theme.textSecondary}>
            应收款
          </ThemedText>
          <ThemedText variant="h4" color={activeTab === 'receivable' ? theme.primary : theme.textPrimary}>
            ¥{totalReceivable.toFixed(0)}
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'payable' && styles.tabActive]}
          onPress={() => setActiveTab('payable')}
        >
          <ThemedText variant="bodyMedium" color={activeTab === 'payable' ? theme.primary : theme.textSecondary}>
            应付款
          </ThemedText>
          <ThemedText variant="h4" color={activeTab === 'payable' ? theme.primary : theme.textPrimary}>
            ¥{totalPayable.toFixed(0)}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* 列表 */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeTab === 'receivable' ? (
          customers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <FontAwesome6 name="check-circle" size={48} color={theme.textMuted} />
              <ThemedText variant="body" color={theme.textMuted}>暂无应收款</ThemedText>
            </View>
          ) : (
            customers.map(customer => (
              <TouchableOpacity
                key={customer.id}
                style={styles.itemCard}
                onPress={() => router.push('/finance-detail', { id: customer.id, type: 'customer' })}
              >
                <View style={styles.itemHeader}>
                  <ThemedText variant="bodyMedium" color={theme.textPrimary}>{customer.name}</ThemedText>
                  <ThemedText variant="h4" color="#EF4444">¥{customer.balance.toFixed(2)}</ThemedText>
                </View>
                {customer.phone && (
                  <ThemedText variant="small" color={theme.textMuted}>{customer.phone}</ThemedText>
                )}
                <View style={styles.itemFooter}>
                  <FontAwesome6 name="chevron-right" size={14} color={theme.textMuted} />
                </View>
              </TouchableOpacity>
            ))
          )
        ) : (
          suppliers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <FontAwesome6 name="check-circle" size={48} color={theme.textMuted} />
              <ThemedText variant="body" color={theme.textMuted}>暂无应付款</ThemedText>
            </View>
          ) : (
            suppliers.map(supplier => (
              <TouchableOpacity
                key={supplier.id}
                style={styles.itemCard}
                onPress={() => router.push('/finance-detail', { id: supplier.id, type: 'supplier' })}
              >
                <View style={styles.itemHeader}>
                  <ThemedText variant="bodyMedium" color={theme.textPrimary}>{supplier.name}</ThemedText>
                  <ThemedText variant="h4" color="#F59E0B">¥{supplier.balance.toFixed(2)}</ThemedText>
                </View>
                {supplier.phone && (
                  <ThemedText variant="small" color={theme.textMuted}>{supplier.phone}</ThemedText>
                )}
                <View style={styles.itemFooter}>
                  <FontAwesome6 name="chevron-right" size={14} color={theme.textMuted} />
                </View>
              </TouchableOpacity>
            ))
          )
        )}
      </ScrollView>

      {/* 收款弹窗 */}
      <Modal visible={paymentModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ThemedText variant="h4" color={theme.textPrimary}>登记收款</ThemedText>
            <ThemedText variant="body" color={theme.textSecondary}>
              客户: {selectedCustomer?.name}
            </ThemedText>
            <ThemedText variant="small" color={theme.textMuted}>
              应收: ¥{selectedCustomer?.balance.toFixed(2)}
            </ThemedText>
            <TextInput
              style={styles.input}
              placeholder="输入收款金额"
              placeholderTextColor={theme.textMuted}
              value={paymentAmount}
              onChangeText={setPaymentAmount}
              keyboardType="numeric"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setPaymentModalVisible(false);
                  setSelectedCustomer(null);
                  setPaymentAmount('');
                }}
              >
                <ThemedText variant="body" color={theme.textSecondary}>取消</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonPrimary} onPress={handlePayment}>
                <ThemedText variant="body" color={theme.buttonPrimaryText}>确认收款</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
