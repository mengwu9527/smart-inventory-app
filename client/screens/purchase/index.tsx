/**
 * 采购入库页面
 */
import React, { useMemo, useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Modal, TextInput, FlatList } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FontAwesome6 } from '@expo/vector-icons';
import { createStyles } from './styles';
import { useFocusEffect } from 'expo-router';
import { createPurchaseOrder, getPurchaseOrders, PurchaseOrder } from '@/services/purchaseService';
import { getSuppliers, Supplier } from '@/services/supplierService';
import { searchProducts, ProductWithUnits } from '@/services/productService';

export default function PurchaseScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [productResults, setProductResults] = useState<ProductWithUnits[]>([]);
  const [cart, setCart] = useState<Array<{ product: ProductWithUnits; unitId: number; unitName: string; quantity: number; unitPrice: number }>>([]);

  const loadData = useCallback(async () => {
    try {
      const [ordersData, suppliersData] = await Promise.all([
        getPurchaseOrders(),
        getSuppliers(),
      ]);
      setOrders(ordersData);
      setSuppliers(suppliersData);
    } catch (error) {
      console.error('Load data error:', error);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleSearchProduct = async () => {
    if (!searchKeyword.trim()) return;
    const results = await searchProducts(searchKeyword.trim());
    setProductResults(results);
  };

  const handleAddToCart = (product: ProductWithUnits) => {
    const unit = product.units[0];
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, unitId: unit.id, unitName: unit.unit_name, quantity: 1, unitPrice: unit.purchase_price }];
    });
  };

  const handleSubmit = async () => {
    if (cart.length === 0) { Alert.alert('提示', '请添加商品'); return; }
    try {
      await createPurchaseOrder({
        supplier_id: selectedSupplier?.id,
        supplier_name: selectedSupplier?.name,
        items: cart.map(item => ({
          product_id: item.product.id,
          unit_id: item.unitId,
          unit_name: item.unitName,
          quantity: item.quantity,
          unit_price: item.unitPrice,
        })),
      });
      Alert.alert('成功', '采购入库成功');
      setModalVisible(false);
      setCart([]);
      loadData();
    } catch (error) {
      Alert.alert('错误', '采购入库失败');
    }
  };

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      <ThemedView level="default" style={styles.header}>
        <ThemedText variant="h3" color={theme.textPrimary}>采购入库</ThemedText>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <FontAwesome6 name="plus" size={20} color={theme.buttonPrimaryText} />
          <ThemedText variant="smallMedium" color={theme.buttonPrimaryText}>新建</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <ThemedText variant="bodyMedium" color={theme.textPrimary}>{item.order_no}</ThemedText>
              <ThemedText variant="h4" color={theme.primary}>¥{item.total_amount.toFixed(2)}</ThemedText>
            </View>
            {item.supplier_name && <ThemedText variant="small" color={theme.textMuted}>供应商: {item.supplier_name}</ThemedText>}
            <ThemedText variant="small" color={theme.textMuted}>{item.created_at}</ThemedText>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome6 name="truck-fast" size={48} color={theme.textMuted} />
            <ThemedText variant="body" color={theme.textMuted}>暂无采购记录</ThemedText>
          </View>
        }
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText variant="h4" color={theme.textPrimary}>新建采购单</ThemedText>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <FontAwesome6 name="times" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.selectButton} onPress={() => Alert.alert('选择供应商', '', suppliers.map(s => ({ text: s.name, onPress: () => setSelectedSupplier(s) })))}>
              <ThemedText variant="body" color={selectedSupplier ? theme.textPrimary : theme.textMuted}>
                {selectedSupplier ? selectedSupplier.name : '选择供应商（可选）'}
              </ThemedText>
            </TouchableOpacity>

            <View style={styles.searchBar}>
              <TextInput
                style={{ flex: 1, color: theme.textPrimary }}
                placeholder="搜索商品"
                placeholderTextColor={theme.textMuted}
                value={searchKeyword}
                onChangeText={setSearchKeyword}
                onSubmitEditing={handleSearchProduct}
              />
            </View>

            <FlatList
              data={productResults.slice(0, 5)}
              keyExtractor={(item) => item.id.toString()}
              style={{ maxHeight: 150 }}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.productItem} onPress={() => handleAddToCart(item)}>
                  <ThemedText variant="body" color={theme.textPrimary}>{item.name}</ThemedText>
                  <FontAwesome6 name="plus" size={16} color={theme.primary} />
                </TouchableOpacity>
              )}
            />

            <ThemedText variant="smallMedium" color={theme.textSecondary}>已选商品: {cart.length}</ThemedText>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText}>确认入库</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
