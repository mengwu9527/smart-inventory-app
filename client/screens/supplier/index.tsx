/**
 * 供应商管理页面
 */
import React, { useMemo, useState, useCallback } from 'react';
import { View, FlatList, TouchableOpacity, TextInput, RefreshControl, Modal, Alert } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FontAwesome6 } from '@expo/vector-icons';
import { createStyles } from './styles';
import { useFocusEffect } from 'expo-router';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier, searchSuppliers, Supplier } from '@/services/supplierService';

export default function SupplierScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [form, setForm] = useState({ name: '', contact: '', phone: '', address: '', remark: '' });

  const loadData = useCallback(async () => {
    try {
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error('Load suppliers error:', error);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleSearch = async () => {
    if (!searchKeyword.trim()) { loadData(); return; }
    const results = await searchSuppliers(searchKeyword.trim());
    setSuppliers(results);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { Alert.alert('提示', '请输入供应商名称'); return; }
    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, form);
      } else {
        await createSupplier(form);
      }
      setModalVisible(false);
      loadData();
    } catch (error) {
      Alert.alert('错误', '保存失败');
    }
  };

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      <ThemedView level="default" style={styles.searchBar}>
        <View style={styles.searchInput}>
          <FontAwesome6 name="magnifying-glass" size={16} color={theme.textMuted} />
          <TextInput
            style={{ flex: 1, marginLeft: 8, color: theme.textPrimary }}
            placeholder="搜索供应商"
            placeholderTextColor={theme.textMuted}
            value={searchKeyword}
            onChangeText={setSearchKeyword}
            onSubmitEditing={handleSearch}
          />
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => { setEditingSupplier(null); setForm({ name: '', contact: '', phone: '', address: '', remark: '' }); setModalVisible(true); }}>
          <FontAwesome6 name="plus" size={20} color={theme.buttonPrimaryText} />
        </TouchableOpacity>
      </ThemedView>

      <FlatList
        data={suppliers}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.itemCard} onPress={() => { setEditingSupplier(item); setForm({ name: item.name, contact: item.contact || '', phone: item.phone || '', address: item.address || '', remark: item.remark || '' }); setModalVisible(true); }}>
            <ThemedText variant="bodyMedium" color={theme.textPrimary}>{item.name}</ThemedText>
            {item.phone && <ThemedText variant="small" color={theme.textMuted}>{item.phone}</ThemedText>}
            {item.balance > 0 && <ThemedText variant="small" color="#F59E0B">应付款: ¥{item.balance.toFixed(2)}</ThemedText>}
          </TouchableOpacity>
        )}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: theme.backgroundDefault, borderRadius: 16, padding: 20, gap: 12 }}>
            <ThemedText variant="h4" color={theme.textPrimary}>{editingSupplier ? '编辑供应商' : '新增供应商'}</ThemedText>
            <TextInput style={{ backgroundColor: theme.backgroundTertiary, borderRadius: 8, padding: 12, color: theme.textPrimary }} placeholder="供应商名称" placeholderTextColor={theme.textMuted} value={form.name} onChangeText={(text) => setForm({ ...form, name: text })} />
            <TextInput style={{ backgroundColor: theme.backgroundTertiary, borderRadius: 8, padding: 12, color: theme.textPrimary }} placeholder="联系人" placeholderTextColor={theme.textMuted} value={form.contact} onChangeText={(text) => setForm({ ...form, contact: text })} />
            <TextInput style={{ backgroundColor: theme.backgroundTertiary, borderRadius: 8, padding: 12, color: theme.textPrimary }} placeholder="联系电话" placeholderTextColor={theme.textMuted} value={form.phone} onChangeText={(text) => setForm({ ...form, phone: text })} keyboardType="phone-pad" />
            <TextInput style={{ backgroundColor: theme.backgroundTertiary, borderRadius: 8, padding: 12, color: theme.textPrimary }} placeholder="地址" placeholderTextColor={theme.textMuted} value={form.address} onChangeText={(text) => setForm({ ...form, address: text })} />
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <TouchableOpacity style={{ flex: 1, padding: 12, borderRadius: 8, backgroundColor: theme.backgroundTertiary, alignItems: 'center' }} onPress={() => setModalVisible(false)}>
                <ThemedText color={theme.textSecondary}>取消</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1, padding: 12, borderRadius: 8, backgroundColor: theme.primary, alignItems: 'center' }} onPress={handleSave}>
                <ThemedText color={theme.buttonPrimaryText}>保存</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
