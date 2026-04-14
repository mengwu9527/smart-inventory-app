/**
 * 库存管理页面
 */
import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FontAwesome6 } from '@expo/vector-icons';
import { createStyles } from './styles';
import { useFocusEffect } from 'expo-router';
import { getProducts, ProductWithUnits } from '@/services/productService';

export default function InventoryScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [products, setProducts] = useState<ProductWithUnits[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');

  const loadData = useCallback(async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Load inventory error:', error);
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

  const filteredProducts = useMemo(() => {
    if (filter === 'all') return products;
    
    return products.filter(p => {
      const defaultUnit = p.units.find(u => u.is_default_sale) || p.units[0];
      const stock = defaultUnit ? p.base_stock / defaultUnit.conversion_rate : 0;
      
      if (filter === 'out') return stock <= 0;
      if (filter === 'low') return stock > 0 && defaultUnit && stock <= defaultUnit.min_stock;
      return true;
    });
  }, [products, filter]);

  const renderProduct = ({ item }: { item: ProductWithUnits }) => {
    const defaultUnit = item.units.find(u => u.is_default_sale) || item.units[0];
    const stock = defaultUnit ? (item.base_stock / defaultUnit.conversion_rate).toFixed(2) : '0';
    const isLow = defaultUnit && item.base_stock > 0 && item.base_stock <= defaultUnit.min_stock * defaultUnit.conversion_rate;
    const isOut = item.base_stock <= 0;

    return (
      <View style={styles.productCard}>
        <View style={styles.productHeader}>
          <ThemedText variant="bodyMedium" color={theme.textPrimary} numberOfLines={1}>
            {item.name}
          </ThemedText>
          <View style={[
            styles.stockBadge,
            isOut && styles.outStockBadge,
            isLow && styles.lowStockBadge,
          ]}>
            <ThemedText variant="small" color={isOut || isLow ? theme.buttonPrimaryText : theme.textSecondary}>
              {isOut ? '缺货' : isLow ? '库存不足' : '正常'}
            </ThemedText>
          </View>
        </View>

        <View style={styles.productDetails}>
          <View style={styles.productDetailItem}>
            <ThemedText variant="small" color={theme.textMuted}>当前库存</ThemedText>
            <ThemedText variant="h4" color={isOut ? '#EF4444' : isLow ? '#F59E0B' : theme.textPrimary}>
              {stock} {defaultUnit?.unit_name || ''}
            </ThemedText>
          </View>
          
          {defaultUnit && defaultUnit.min_stock > 0 && (
            <View style={styles.productDetailItem}>
              <ThemedText variant="small" color={theme.textMuted}>预警值</ThemedText>
              <ThemedText variant="body" color={theme.textPrimary}>
                {defaultUnit.min_stock} {defaultUnit.unit_name}
              </ThemedText>
            </View>
          )}
        </View>

        {item.units.length > 1 && (
          <View style={styles.unitsInfo}>
            <ThemedText variant="small" color={theme.textMuted}>多单位: </ThemedText>
            {item.units.map((unit, index) => (
              <ThemedText key={unit.id} variant="small" color={theme.textSecondary}>
                {unit.unit_name}({unit.conversion_rate}){index < item.units.length - 1 ? ' → ' : ''}
              </ThemedText>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      {/* 筛选标签 */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <ThemedText variant="smallMedium" color={filter === 'all' ? theme.buttonPrimaryText : theme.textSecondary}>
            全部
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'low' && styles.filterButtonActive]}
          onPress={() => setFilter('low')}
        >
          <ThemedText variant="smallMedium" color={filter === 'low' ? theme.buttonPrimaryText : theme.textSecondary}>
            库存不足
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'out' && styles.filterButtonActive]}
          onPress={() => setFilter('out')}
        >
          <ThemedText variant="smallMedium" color={filter === 'out' ? theme.buttonPrimaryText : theme.textSecondary}>
            缺货
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* 商品列表 */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome6 name="box-open" size={48} color={theme.textMuted} />
            <ThemedText variant="body" color={theme.textMuted}>暂无数据</ThemedText>
          </View>
        }
      />
    </Screen>
  );
}
