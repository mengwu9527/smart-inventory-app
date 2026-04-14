import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  RefreshControl,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FontAwesome6 } from '@expo/vector-icons';
import { createStyles } from './styles';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useFocusEffect } from 'expo-router';
import {
  getProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  ProductWithUnits,
} from '@/services/productService';
import { Category } from '@/services/database';

export default function ProductScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();

  const [products, setProducts] = useState<ProductWithUnits[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithUnits | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        selectedCategory ? getProducts(selectedCategory) : getProducts(),
        getCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Load products error:', error);
    }
  }, [selectedCategory]);

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

  const handleSearch = useCallback(async () => {
    if (!searchKeyword.trim()) {
      loadData();
      return;
    }
    try {
      const results = await searchProducts(searchKeyword.trim());
      setProducts(results);
    } catch (error) {
      console.error('Search error:', error);
    }
  }, [searchKeyword, loadData]);

  const handleDelete = useCallback((product: ProductWithUnits) => {
    Alert.alert(
      '确认删除',
      `确定要删除商品"${product.name}"吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(product.id);
              await loadData();
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('错误', '删除失败');
            }
          },
        },
      ]
    );
  }, [loadData]);

  const renderProduct = ({ item }: { item: ProductWithUnits }) => {
    const defaultUnit = item.units.find(u => u.is_default_sale) || item.units[0];
    const stock = defaultUnit ? (item.base_stock / defaultUnit.conversion_rate).toFixed(2) : '0';

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => {
          setEditingProduct(item);
          setModalVisible(true);
        }}
      >
        <View style={styles.productHeader}>
          <View style={styles.productInfo}>
            <ThemedText variant="h4" color={theme.textPrimary} numberOfLines={1}>
              {item.name}
            </ThemedText>
            {item.category_name && (
              <ThemedText variant="small" color={theme.textMuted}>
                {item.category_name}
              </ThemedText>
            )}
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item)}
          >
            <FontAwesome6 name="trash" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <View style={styles.productDetails}>
          <View style={styles.productDetailItem}>
            <ThemedText variant="small" color={theme.textMuted}>售价</ThemedText>
            <ThemedText variant="bodyMedium" color={theme.primary}>
              ¥{defaultUnit?.sale_price.toFixed(2) || '0.00'}
            </ThemedText>
          </View>
          <View style={styles.productDetailItem}>
            <ThemedText variant="small" color={theme.textMuted}>库存</ThemedText>
            <ThemedText
              variant="bodyMedium"
              color={item.base_stock <= 0 ? '#EF4444' : theme.textPrimary}
            >
              {stock} {defaultUnit?.unit_name || '件'}
            </ThemedText>
          </View>
          <View style={styles.productDetailItem}>
            <ThemedText variant="small" color={theme.textMuted}>单位</ThemedText>
            <ThemedText variant="bodyMedium" color={theme.textPrimary}>
              {item.units.length > 1 ? `${item.units.length}级` : item.base_unit}
            </ThemedText>
          </View>
        </View>

        {item.units.length > 1 && (
          <View style={styles.unitsPreview}>
            {item.units.slice(0, 3).map((unit, index) => (
              <View key={unit.id} style={styles.unitTag}>
                <ThemedText variant="small" color={theme.textSecondary}>
                  {unit.unit_name} ({unit.conversion_rate}{item.base_unit})
                </ThemedText>
              </View>
            ))}
            {item.units.length > 3 && (
              <View style={styles.unitTag}>
                <ThemedText variant="small" color={theme.textMuted}>
                  +{item.units.length - 3}
                </ThemedText>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      {/* 搜索栏 */}
      <ThemedView level="default" style={styles.searchBar}>
        <View style={styles.searchInput}>
          <FontAwesome6 name="magnifying-glass" size={16} color={theme.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="搜索商品名称/条码"
            placeholderTextColor={theme.textMuted}
            value={searchKeyword}
            onChangeText={setSearchKeyword}
            onSubmitEditing={handleSearch}
          />
          {searchKeyword.length > 0 && (
            <TouchableOpacity onPress={() => {
              setSearchKeyword('');
              loadData();
            }}>
              <FontAwesome6 name="times-circle" size={16} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setEditingProduct(null);
            setModalVisible(true);
          }}
        >
          <FontAwesome6 name="plus" size={20} color={theme.buttonPrimaryText} />
        </TouchableOpacity>
      </ThemedView>

      {/* 分类标签 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
      >
        <TouchableOpacity
          style={[
            styles.categoryTag,
            selectedCategory === null && styles.categoryTagActive,
          ]}
          onPress={() => setSelectedCategory(null)}
        >
          <ThemedText
            variant="smallMedium"
            color={selectedCategory === null ? theme.buttonPrimaryText : theme.textSecondary}
          >
            全部
          </ThemedText>
        </TouchableOpacity>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryTag,
              selectedCategory === cat.id && styles.categoryTagActive,
            ]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <ThemedText
              variant="smallMedium"
              color={selectedCategory === cat.id ? theme.buttonPrimaryText : theme.textSecondary}
            >
              {cat.name}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 商品列表 */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome6 name="box-open" size={48} color={theme.textMuted} />
            <ThemedText variant="body" color={theme.textMuted}>
              暂无商品
            </ThemedText>
          </View>
        }
      />

      {/* 商品编辑弹窗 */}
      <ProductModal
        visible={modalVisible}
        product={editingProduct}
        categories={categories}
        onClose={() => {
          setModalVisible(false);
          setEditingProduct(null);
        }}
        onSave={async (data) => {
          try {
            if (editingProduct) {
              await updateProduct(editingProduct.id, data);
            } else {
              await createProduct(data as any);
            }
            setModalVisible(false);
            setEditingProduct(null);
            await loadData();
          } catch (error) {
            console.error('Save error:', error);
            Alert.alert('错误', '保存失败');
          }
        }}
      />
    </Screen>
  );
}

// 商品编辑弹窗组件
function ProductModal({
  visible,
  product,
  categories,
  onClose,
  onSave,
}: {
  visible: boolean;
  product: ProductWithUnits | null;
  categories: Category[];
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}) {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [baseUnit, setBaseUnit] = useState('件');
  const [units, setUnits] = useState<Array<{
    unit_name: string;
    conversion_rate: number;
    purchase_price: number;
    sale_price: number;
    level: number;
    is_default_sale: number;
  }>>([]);

  React.useEffect(() => {
    if (product) {
      setName(product.name);
      setBarcode(product.barcode || '');
      setCategoryId(product.category_id || null);
      setBaseUnit(product.base_unit);
      setUnits(product.units.map(u => ({
        unit_name: u.unit_name,
        conversion_rate: u.conversion_rate,
        purchase_price: u.purchase_price,
        sale_price: u.sale_price,
        level: u.level,
        is_default_sale: u.is_default_sale,
      })));
    } else {
      setName('');
      setBarcode('');
      setCategoryId(null);
      setBaseUnit('件');
      setUnits([{
        unit_name: '件',
        conversion_rate: 1,
        purchase_price: 0,
        sale_price: 0,
        level: 1,
        is_default_sale: 1,
      }]);
    }
  }, [product, visible]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('提示', '请输入商品名称');
      return;
    }
    if (units.length === 0) {
      Alert.alert('提示', '请至少添加一个单位');
      return;
    }

    onSave({
      name: name.trim(),
      barcode: barcode.trim() || null,
      category_id: categoryId,
      base_unit: baseUnit,
      units: units,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: theme.backgroundDefault, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border }}>
            <ThemedText variant="h4" color={theme.textPrimary}>
              {product ? '编辑商品' : '新增商品'}
            </ThemedText>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome6 name="times" size={24} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ padding: 16 }} keyboardShouldPersistTaps="handled">
            <View style={{ marginBottom: 16 }}>
              <ThemedText variant="smallMedium" color={theme.textSecondary}>商品名称 *</ThemedText>
              <TextInput
                style={{ backgroundColor: theme.backgroundTertiary, borderRadius: 8, padding: 12, marginTop: 8, color: theme.textPrimary }}
                placeholder="请输入商品名称"
                placeholderTextColor={theme.textMuted}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <ThemedText variant="smallMedium" color={theme.textSecondary}>商品条码</ThemedText>
              <TextInput
                style={{ backgroundColor: theme.backgroundTertiary, borderRadius: 8, padding: 12, marginTop: 8, color: theme.textPrimary }}
                placeholder="请输入或扫描条码"
                placeholderTextColor={theme.textMuted}
                value={barcode}
                onChangeText={setBarcode}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <ThemedText variant="smallMedium" color={theme.textSecondary}>商品分类</ThemedText>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 16,
                      backgroundColor: categoryId === cat.id ? theme.primary : theme.backgroundTertiary,
                    }}
                    onPress={() => setCategoryId(cat.id)}
                  >
                    <ThemedText variant="small" color={categoryId === cat.id ? theme.buttonPrimaryText : theme.textSecondary}>
                      {cat.name}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={{ marginBottom: 16 }}>
              <ThemedText variant="smallMedium" color={theme.textSecondary}>基础单位</ThemedText>
              <TextInput
                style={{ backgroundColor: theme.backgroundTertiary, borderRadius: 8, padding: 12, marginTop: 8, color: theme.textPrimary }}
                placeholder="如：件、个、kg"
                placeholderTextColor={theme.textMuted}
                value={baseUnit}
                onChangeText={setBaseUnit}
              />
            </View>

            {/* 单位列表 */}
            <View style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <ThemedText variant="smallMedium" color={theme.textSecondary}>多单位设置</ThemedText>
                <TouchableOpacity
                  onPress={() => setUnits([...units, {
                    unit_name: '',
                    conversion_rate: 1,
                    purchase_price: 0,
                    sale_price: 0,
                    level: units.length + 1,
                    is_default_sale: 0,
                  }])}
                >
                  <FontAwesome6 name="plus" size={16} color={theme.primary} />
                </TouchableOpacity>
              </View>

              {units.map((unit, index) => (
                <View key={index} style={{ backgroundColor: theme.backgroundTertiary, borderRadius: 8, padding: 12, marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <ThemedText variant="smallMedium" color={theme.textPrimary}>单位 {index + 1}</ThemedText>
                    {units.length > 1 && (
                      <TouchableOpacity onPress={() => setUnits(units.filter((_, i) => i !== index))}>
                        <FontAwesome6 name="trash" size={14} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                    <TextInput
                      style={{ flex: 1, backgroundColor: theme.backgroundDefault, borderRadius: 8, padding: 8, color: theme.textPrimary }}
                      placeholder="单位名称"
                      placeholderTextColor={theme.textMuted}
                      value={unit.unit_name}
                      onChangeText={(text) => setUnits(units.map((u, i) => i === index ? { ...u, unit_name: text } : u))}
                    />
                    <TextInput
                      style={{ flex: 1, backgroundColor: theme.backgroundDefault, borderRadius: 8, padding: 8, color: theme.textPrimary }}
                      placeholder="换算比例"
                      placeholderTextColor={theme.textMuted}
                      value={unit.conversion_rate.toString()}
                      onChangeText={(text) => setUnits(units.map((u, i) => i === index ? { ...u, conversion_rate: parseFloat(text) || 1 } : u))}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                    <TextInput
                      style={{ flex: 1, backgroundColor: theme.backgroundDefault, borderRadius: 8, padding: 8, color: theme.textPrimary }}
                      placeholder="进价"
                      placeholderTextColor={theme.textMuted}
                      value={unit.purchase_price.toString()}
                      onChangeText={(text) => setUnits(units.map((u, i) => i === index ? { ...u, purchase_price: parseFloat(text) || 0 } : u))}
                      keyboardType="numeric"
                    />
                    <TextInput
                      style={{ flex: 1, backgroundColor: theme.backgroundDefault, borderRadius: 8, padding: 8, color: theme.textPrimary }}
                      placeholder="售价"
                      placeholderTextColor={theme.textMuted}
                      value={unit.sale_price.toString()}
                      onChangeText={(text) => setUnits(units.map((u, i) => i === index ? { ...u, sale_price: parseFloat(text) || 0 } : u))}
                      keyboardType="numeric"
                    />
                  </View>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
                    onPress={() => setUnits(units.map((u, i) => ({ ...u, is_default_sale: i === index ? 1 : 0 })))}
                  >
                    <FontAwesome6
                      name={unit.is_default_sale ? 'check-circle' : 'circle'}
                      size={16}
                      color={unit.is_default_sale ? theme.primary : theme.textMuted}
                    />
                    <ThemedText variant="small" color={theme.textSecondary}>设为默认销售单位</ThemedText>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={{ flexDirection: 'row', gap: 12, padding: 16, borderTopWidth: 1, borderTopColor: theme.border }}>
            <TouchableOpacity
              style={{ flex: 1, padding: 12, borderRadius: 8, backgroundColor: theme.backgroundTertiary, alignItems: 'center' }}
              onPress={onClose}
            >
              <ThemedText variant="bodyMedium" color={theme.textPrimary}>取消</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, padding: 12, borderRadius: 8, backgroundColor: theme.primary, alignItems: 'center' }}
              onPress={handleSave}
            >
              <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText}>保存</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
