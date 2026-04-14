/**
 * 销售开单页面 - 支持多单位、客户分级价格、改价审计
 */
import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  Modal,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FontAwesome6 } from '@expo/vector-icons';
import { createStyles } from './styles';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import {
  searchProducts,
  getProductById,
  getPriceByLevel,
  ProductWithUnits,
  ProductUnit,
} from '@/services/productService';
import {
  searchCustomers,
  getCustomerLevels,
  CustomerWithLevel,
} from '@/services/customerService';
import { createSalesOrder } from '@/services/salesService';
import { printSalesReceipt } from '@/services/bluetoothService';

interface CartItem {
  product: ProductWithUnits;
  unit: ProductUnit;
  quantity: number;
  originalPrice: number;
  unitPrice: number;
}

export default function SaleScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();

  const [customer, setCustomer] = useState<CustomerWithLevel | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [remark, setRemark] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'wechat' | 'alipay' | 'card'>('cash');

  const [productSearchVisible, setProductSearchVisible] = useState(false);
  const [customerSearchVisible, setCustomerSearchVisible] = useState(false);
  const [productKeyword, setProductKeyword] = useState('');
  const [customerKeyword, setCustomerKeyword] = useState('');
  const [productResults, setProductResults] = useState<ProductWithUnits[]>([]);
  const [customerResults, setCustomerResults] = useState<CustomerWithLevel[]>([]);

  const totalAmount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }, [cart]);

  const totalQuantity = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const handleSearchProduct = useCallback(async () => {
    if (!productKeyword.trim()) return;
    try {
      const results = await searchProducts(productKeyword.trim());
      setProductResults(results);
    } catch (error) {
      console.error('Search product error:', error);
    }
  }, [productKeyword]);

  const handleSearchCustomer = useCallback(async () => {
    if (!customerKeyword.trim()) return;
    try {
      const results = await searchCustomers(customerKeyword.trim());
      setCustomerResults(results);
    } catch (error) {
      console.error('Search customer error:', error);
    }
  }, [customerKeyword]);

  const handleAddToCart = useCallback((product: ProductWithUnits) => {
    const defaultUnit = product.units.find(u => u.is_default_sale) || product.units[0];
    if (!defaultUnit) return;

    // 根据客户等级获取价格
    const price = customer
      ? getPriceByLevel(defaultUnit, customer.level_id)
      : defaultUnit.sale_price;

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.unit.id === defaultUnit.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id && item.unit.id === defaultUnit.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        product,
        unit: defaultUnit,
        quantity: 1,
        originalPrice: price,
        unitPrice: price,
      }];
    });
    setProductSearchVisible(false);
    setProductKeyword('');
  }, [customer]);

  const handleUpdateQuantity = useCallback((index: number, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter((_, i) => i !== index));
    } else {
      setCart(prev => prev.map((item, i) => i === index ? { ...item, quantity } : item));
    }
  }, []);

  const handleUpdatePrice = useCallback((index: number, price: number) => {
    setCart(prev => prev.map((item, i) => i === index ? { ...item, unitPrice: price } : item));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (cart.length === 0) {
      Alert.alert('提示', '购物车为空');
      return;
    }

    try {
      const result = await createSalesOrder({
        customer_id: customer?.id,
        customer_name: customer?.name,
        items: cart.map(item => ({
          product_id: item.product.id,
          unit_id: item.unit.id,
          unit_name: item.unit.unit_name,
          quantity: item.quantity,
          original_price: item.originalPrice,
          unit_price: item.unitPrice,
          purchase_price: item.unit.purchase_price,
        })),
        payment_method: paymentMethod,
        paid_amount: parseFloat(paidAmount) || totalAmount,
        remark: remark || undefined,
      });

      Alert.alert('成功', `订单创建成功\n单号: ${result.orderNo}`, [
        { text: '确定', onPress: () => {
          setCart([]);
          setCustomer(null);
          setRemark('');
          setPaidAmount('');
        }},
      ]);
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('错误', '订单创建失败');
    }
  }, [cart, customer, paymentMethod, paidAmount, remark, totalAmount]);

  const renderCartItem = ({ item, index }: { item: CartItem; index: number }) => (
    <View style={styles.cartItem}>
      <View style={styles.cartItemHeader}>
        <ThemedText variant="bodyMedium" color={theme.textPrimary} numberOfLines={1}>
          {item.product.name}
        </ThemedText>
        <TouchableOpacity onPress={() => setCart(prev => prev.filter((_, i) => i !== index))}>
          <FontAwesome6 name="times" size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.cartItemDetails}>
        <View style={styles.cartItemInfo}>
          <ThemedText variant="small" color={theme.textMuted}>
            {item.unit.unit_name}
          </ThemedText>
          {item.unitPrice !== item.originalPrice && (
            <ThemedText variant="small" color={theme.textMuted}>
              原价: ¥{item.originalPrice.toFixed(2)}
            </ThemedText>
          )}
        </View>

        <View style={styles.cartItemActions}>
          <View style={styles.quantityControl}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleUpdateQuantity(index, item.quantity - 1)}
            >
              <FontAwesome6 name="minus" size={14} color={theme.textPrimary} />
            </TouchableOpacity>
            <TextInput
              style={styles.quantityInput}
              value={item.quantity.toString()}
              onChangeText={(text) => handleUpdateQuantity(index, parseInt(text) || 0)}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleUpdateQuantity(index, item.quantity + 1)}
            >
              <FontAwesome6 name="plus" size={14} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.priceInput}>
            <ThemedText variant="small" color={theme.textMuted}>¥</ThemedText>
            <TextInput
              style={styles.priceTextInput}
              value={item.unitPrice.toString()}
              onChangeText={(text) => handleUpdatePrice(index, parseFloat(text) || 0)}
              keyboardType="numeric"
            />
          </View>
        </View>

        <ThemedText variant="bodyMedium" color={theme.primary}>
          ¥{(item.unitPrice * item.quantity).toFixed(2)}
        </ThemedText>
      </View>
    </View>
  );

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      {/* 客户选择 */}
      <TouchableOpacity
        style={styles.customerBar}
        onPress={() => setCustomerSearchVisible(true)}
      >
        <FontAwesome6 name="user" size={20} color={theme.textMuted} />
        <ThemedText variant="body" color={customer ? theme.textPrimary : theme.textMuted}>
          {customer ? customer.name : '选择客户（可选）'}
        </ThemedText>
        {customer && (
          <View style={[styles.customerLevel, { backgroundColor: customer.level_id === 3 ? '#8B5CF6' : customer.level_id === 2 ? '#F59E0B' : '#6B7280' }]}>
            <ThemedText variant="small" color={theme.buttonPrimaryText}>
              {customer.level_name}
            </ThemedText>
          </View>
        )}
        <FontAwesome6 name="chevron-right" size={16} color={theme.textMuted} />
      </TouchableOpacity>

      {/* 购物车列表 */}
      <FlatList
        data={cart}
        renderItem={renderCartItem}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.cartList}
        ListEmptyComponent={
          <View style={styles.emptyCart}>
            <FontAwesome6 name="cart-shopping" size={48} color={theme.textMuted} />
            <ThemedText variant="body" color={theme.textMuted}>购物车为空</ThemedText>
          </View>
        }
      />

      {/* 底部操作栏 */}
      <ThemedView level="default" style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.addProductButton}
          onPress={() => setProductSearchVisible(true)}
        >
          <FontAwesome6 name="plus" size={20} color={theme.primary} />
          <ThemedText variant="bodyMedium" color={theme.primary}>添加商品</ThemedText>
        </TouchableOpacity>

        <View style={styles.totalInfo}>
          <ThemedText variant="small" color={theme.textMuted}>
            共 {totalQuantity} 件
          </ThemedText>
          <ThemedText variant="h3" color={theme.primary}>
            ¥{totalAmount.toFixed(2)}
          </ThemedText>
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={cart.length === 0}
        >
          <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText}>结算</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* 商品搜索弹窗 */}
      <Modal visible={productSearchVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText variant="h4" color={theme.textPrimary}>选择商品</ThemedText>
              <TouchableOpacity onPress={() => setProductSearchVisible(false)}>
                <FontAwesome6 name="times" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBar}>
              <FontAwesome6 name="magnifying-glass" size={16} color={theme.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="搜索商品名称/条码"
                placeholderTextColor={theme.textMuted}
                value={productKeyword}
                onChangeText={setProductKeyword}
                onSubmitEditing={handleSearchProduct}
              />
            </View>

            <FlatList
              data={productResults}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => {
                const defaultUnit = item.units.find(u => u.is_default_sale) || item.units[0];
                return (
                  <TouchableOpacity
                    style={styles.productItem}
                    onPress={() => handleAddToCart(item)}
                  >
                    <View style={{ flex: 1 }}>
                      <ThemedText variant="bodyMedium" color={theme.textPrimary}>
                        {item.name}
                      </ThemedText>
                      <ThemedText variant="small" color={theme.textMuted}>
                        ¥{defaultUnit?.sale_price.toFixed(2)}/{defaultUnit?.unit_name}
                      </ThemedText>
                    </View>
                    <FontAwesome6 name="plus" size={20} color={theme.primary} />
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>

      {/* 客户搜索弹窗 */}
      <Modal visible={customerSearchVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText variant="h4" color={theme.textPrimary}>选择客户</ThemedText>
              <TouchableOpacity onPress={() => setCustomerSearchVisible(false)}>
                <FontAwesome6 name="times" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBar}>
              <FontAwesome6 name="magnifying-glass" size={16} color={theme.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="搜索客户姓名/电话"
                placeholderTextColor={theme.textMuted}
                value={customerKeyword}
                onChangeText={setCustomerKeyword}
                onSubmitEditing={handleSearchCustomer}
              />
            </View>

            <FlatList
              data={customerResults}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.customerItem}
                  onPress={() => {
                    setCustomer(item);
                    setCustomerSearchVisible(false);
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <ThemedText variant="bodyMedium" color={theme.textPrimary}>
                        {item.name}
                      </ThemedText>
                      <View style={[styles.levelBadge, { backgroundColor: item.level_id === 3 ? '#8B5CF6' : item.level_id === 2 ? '#F59E0B' : '#6B7280' }]}>
                        <ThemedText variant="small" color={theme.buttonPrimaryText}>
                          {item.level_name}
                        </ThemedText>
                      </View>
                    </View>
                    {item.phone && (
                      <ThemedText variant="small" color={theme.textMuted}>
                        {item.phone}
                      </ThemedText>
                    )}
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
