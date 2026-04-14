import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Modal,
  Alert,
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
  getCustomers,
  searchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerLevels,
  CustomerWithLevel,
} from '@/services/customerService';
import { CustomerLevel } from '@/services/database';

export default function CustomerScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();

  const [customers, setCustomers] = useState<CustomerWithLevel[]>([]);
  const [levels, setLevels] = useState<CustomerLevel[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerWithLevel | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [customersData, levelsData] = await Promise.all([
        getCustomers(),
        getCustomerLevels(),
      ]);
      setCustomers(customersData);
      setLevels(levelsData);
    } catch (error) {
      console.error('Load customers error:', error);
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

  const handleSearch = useCallback(async () => {
    if (!searchKeyword.trim()) {
      loadData();
      return;
    }
    try {
      const results = await searchCustomers(searchKeyword.trim());
      setCustomers(results);
    } catch (error) {
      console.error('Search error:', error);
    }
  }, [searchKeyword, loadData]);

  const handleDelete = useCallback((customer: CustomerWithLevel) => {
    Alert.alert(
      '确认删除',
      `确定要删除客户"${customer.name}"吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCustomer(customer.id);
              await loadData();
            } catch (error: any) {
              console.error('Delete error:', error);
              Alert.alert('错误', error.message || '删除失败');
            }
          },
        },
      ]
    );
  }, [loadData]);

  const renderCustomer = ({ item }: { item: CustomerWithLevel }) => (
    <TouchableOpacity
      style={styles.customerCard}
      onPress={() => {
        setEditingCustomer(item);
        setModalVisible(true);
      }}
    >
      <View style={styles.customerHeader}>
        <View style={styles.customerInfo}>
          <View style={styles.customerNameRow}>
            <ThemedText variant="h4" color={theme.textPrimary}>
              {item.name}
            </ThemedText>
            {item.level_name && (
              <View style={[styles.levelBadge, { backgroundColor: item.level_id === 3 ? '#8B5CF6' : item.level_id === 2 ? '#F59E0B' : '#6B7280' }]}>
                <ThemedText variant="small" color={theme.buttonPrimaryText}>
                  {item.level_name}
                </ThemedText>
              </View>
            )}
          </View>
          {item.phone && (
            <ThemedText variant="small" color={theme.textMuted}>
              {item.phone}
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

      <View style={styles.customerStats}>
        <View style={styles.customerStatItem}>
          <ThemedText variant="small" color={theme.textMuted}>消费总额</ThemedText>
          <ThemedText variant="bodyMedium" color={theme.primary}>
            ¥{(item.total_purchase || 0).toFixed(2)}
          </ThemedText>
        </View>
        <View style={styles.customerStatItem}>
          <ThemedText variant="small" color={theme.textMuted}>订单数</ThemedText>
          <ThemedText variant="bodyMedium" color={theme.textPrimary}>
            {item.total_orders || 0}
          </ThemedText>
        </View>
        <View style={styles.customerStatItem}>
          <ThemedText variant="small" color={theme.textMuted}>应收款</ThemedText>
          <ThemedText variant="bodyMedium" color={item.balance > 0 ? '#EF4444' : theme.textPrimary}>
            ¥{(item.balance || 0).toFixed(2)}
          </ThemedText>
        </View>
      </View>

      {item.last_purchase_date && (
        <View style={styles.lastPurchase}>
          <FontAwesome6 name="clock" size={12} color={theme.textMuted} />
          <ThemedText variant="small" color={theme.textMuted}>
            最近购买: {item.last_purchase_date}
          </ThemedText>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      {/* 搜索栏 */}
      <ThemedView level="default" style={styles.searchBar}>
        <View style={styles.searchInput}>
          <FontAwesome6 name="magnifying-glass" size={16} color={theme.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="搜索客户姓名/电话"
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
            setEditingCustomer(null);
            setModalVisible(true);
          }}
        >
          <FontAwesome6 name="plus" size={20} color={theme.buttonPrimaryText} />
        </TouchableOpacity>
      </ThemedView>

      {/* 客户等级说明 */}
      {levels.length > 0 && (
        <View style={styles.levelInfo}>
          {levels.map((level) => (
            <View key={level.id} style={styles.levelInfoItem}>
              <View style={[styles.levelDot, { backgroundColor: level.id === 3 ? '#8B5CF6' : level.id === 2 ? '#F59E0B' : '#6B7280' }]} />
              <ThemedText variant="small" color={theme.textSecondary}>
                {level.name} (折扣: {level.discount}%)
              </ThemedText>
            </View>
          ))}
        </View>
      )}

      {/* 客户列表 */}
      <FlatList
        data={customers}
        renderItem={renderCustomer}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome6 name="users" size={48} color={theme.textMuted} />
            <ThemedText variant="body" color={theme.textMuted}>
              暂无客户
            </ThemedText>
          </View>
        }
      />

      {/* 客户编辑弹窗 */}
      <CustomerModal
        visible={modalVisible}
        customer={editingCustomer}
        levels={levels}
        onClose={() => {
          setModalVisible(false);
          setEditingCustomer(null);
        }}
        onSave={async (data) => {
          try {
            if (editingCustomer) {
              await updateCustomer(editingCustomer.id, data);
            } else {
              await createCustomer(data);
            }
            setModalVisible(false);
            setEditingCustomer(null);
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

// 客户编辑弹窗组件
function CustomerModal({
  visible,
  customer,
  levels,
  onClose,
  onSave,
}: {
  visible: boolean;
  customer: CustomerWithLevel | null;
  levels: CustomerLevel[];
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}) {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [levelId, setLevelId] = useState<number>(1);
  const [creditLimit, setCreditLimit] = useState('0');
  const [remark, setRemark] = useState('');

  React.useEffect(() => {
    if (customer) {
      setName(customer.name);
      setPhone(customer.phone || '');
      setAddress(customer.address || '');
      setLevelId(customer.level_id || 1);
      setCreditLimit(customer.credit_limit?.toString() || '0');
      setRemark(customer.remark || '');
    } else {
      setName('');
      setPhone('');
      setAddress('');
      setLevelId(1);
      setCreditLimit('0');
      setRemark('');
    }
  }, [customer, visible]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('提示', '请输入客户名称');
      return;
    }

    onSave({
      name: name.trim(),
      phone: phone.trim() || null,
      address: address.trim() || null,
      level_id: levelId,
      credit_limit: parseFloat(creditLimit) || 0,
      remark: remark.trim() || null,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: theme.backgroundDefault, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border }}>
            <ThemedText variant="h4" color={theme.textPrimary}>
              {customer ? '编辑客户' : '新增客户'}
            </ThemedText>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome6 name="times" size={24} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={{ padding: 16, gap: 16 }}>
            <View>
              <ThemedText variant="smallMedium" color={theme.textSecondary}>客户名称 *</ThemedText>
              <TextInput
                style={{ backgroundColor: theme.backgroundTertiary, borderRadius: 8, padding: 12, marginTop: 8, color: theme.textPrimary }}
                placeholder="请输入客户名称"
                placeholderTextColor={theme.textMuted}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View>
              <ThemedText variant="smallMedium" color={theme.textSecondary}>联系电话</ThemedText>
              <TextInput
                style={{ backgroundColor: theme.backgroundTertiary, borderRadius: 8, padding: 12, marginTop: 8, color: theme.textPrimary }}
                placeholder="请输入联系电话"
                placeholderTextColor={theme.textMuted}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View>
              <ThemedText variant="smallMedium" color={theme.textSecondary}>客户地址</ThemedText>
              <TextInput
                style={{ backgroundColor: theme.backgroundTertiary, borderRadius: 8, padding: 12, marginTop: 8, color: theme.textPrimary }}
                placeholder="请输入客户地址"
                placeholderTextColor={theme.textMuted}
                value={address}
                onChangeText={setAddress}
              />
            </View>

            <View>
              <ThemedText variant="smallMedium" color={theme.textSecondary}>客户等级</ThemedText>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {levels.map(level => (
                  <TouchableOpacity
                    key={level.id}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 16,
                      backgroundColor: levelId === level.id ? theme.primary : theme.backgroundTertiary,
                    }}
                    onPress={() => setLevelId(level.id)}
                  >
                    <ThemedText variant="small" color={levelId === level.id ? theme.buttonPrimaryText : theme.textSecondary}>
                      {level.name}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <ThemedText variant="smallMedium" color={theme.textSecondary}>信用额度</ThemedText>
              <TextInput
                style={{ backgroundColor: theme.backgroundTertiary, borderRadius: 8, padding: 12, marginTop: 8, color: theme.textPrimary }}
                placeholder="请输入信用额度"
                placeholderTextColor={theme.textMuted}
                value={creditLimit}
                onChangeText={setCreditLimit}
                keyboardType="numeric"
              />
            </View>

            <View>
              <ThemedText variant="smallMedium" color={theme.textSecondary}>备注</ThemedText>
              <TextInput
                style={{ backgroundColor: theme.backgroundTertiary, borderRadius: 8, padding: 12, marginTop: 8, color: theme.textPrimary, minHeight: 80, textAlignVertical: 'top' }}
                placeholder="请输入备注"
                placeholderTextColor={theme.textMuted}
                value={remark}
                onChangeText={setRemark}
                multiline
              />
            </View>
          </View>

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
