/**
 * 客户等级管理页面
 */
import React, { useMemo, useState, useCallback } from 'react';
import { View, FlatList, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FontAwesome6 } from '@expo/vector-icons';
import { createStyles } from './styles';
import { useFocusEffect } from 'expo-router';
import { getCustomerLevels, createCustomerLevel, updateCustomerLevel, deleteCustomerLevel, CustomerLevel } from '@/services/customerService';

export default function CustomerLevelScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [levels, setLevels] = useState<CustomerLevel[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLevel, setEditingLevel] = useState<CustomerLevel | null>(null);
  const [form, setForm] = useState({ name: '', discount: '100', min_amount: '0' });

  const loadData = useCallback(async () => {
    try {
      const data = await getCustomerLevels();
      setLevels(data);
    } catch (error) {
      console.error('Load levels error:', error);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleSave = async () => {
    if (!form.name.trim()) { Alert.alert('提示', '请输入等级名称'); return; }
    try {
      if (editingLevel) {
        await updateCustomerLevel(editingLevel.id, { name: form.name, discount: parseFloat(form.discount), min_amount: parseFloat(form.min_amount) });
      } else {
        await createCustomerLevel({ name: form.name, discount: parseFloat(form.discount), min_amount: parseFloat(form.min_amount) });
      }
      setModalVisible(false);
      loadData();
    } catch (error) {
      Alert.alert('错误', '保存失败');
    }
  };

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      <FlatList
        data={levels}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <TouchableOpacity style={styles.addButton} onPress={() => { setEditingLevel(null); setForm({ name: '', discount: '100', min_amount: '0' }); setModalVisible(true); }}>
            <FontAwesome6 name="plus" size={20} color={theme.buttonPrimaryText} />
            <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText}>添加等级</ThemedText>
          </TouchableOpacity>
        }
        renderItem={({ item, index }) => (
          <TouchableOpacity style={styles.levelCard} onPress={() => { setEditingLevel(item); setForm({ name: item.name, discount: item.discount.toString(), min_amount: item.min_amount.toString() }); setModalVisible(true); }}>
            <View style={[styles.levelBadge, { backgroundColor: index === 0 ? '#6B7280' : index === 1 ? '#F59E0B' : '#8B5CF6' }]}>
              <ThemedText variant="h4" color={theme.buttonPrimaryText}>{index + 1}</ThemedText>
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText variant="bodyMedium" color={theme.textPrimary}>{item.name}</ThemedText>
              <ThemedText variant="small" color={theme.textMuted}>折扣: {item.discount}% | 消费满: ¥{item.min_amount}</ThemedText>
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: theme.backgroundDefault, borderRadius: 16, padding: 20, gap: 12 }}>
            <ThemedText variant="h4" color={theme.textPrimary}>{editingLevel ? '编辑等级' : '新增等级'}</ThemedText>
            <TextInput style={{ backgroundColor: theme.backgroundTertiary, borderRadius: 8, padding: 12, color: theme.textPrimary }} placeholder="等级名称" placeholderTextColor={theme.textMuted} value={form.name} onChangeText={(text) => setForm({ ...form, name: text })} />
            <TextInput style={{ backgroundColor: theme.backgroundTertiary, borderRadius: 8, padding: 12, color: theme.textPrimary }} placeholder="折扣百分比" placeholderTextColor={theme.textMuted} value={form.discount} onChangeText={(text) => setForm({ ...form, discount: text })} keyboardType="numeric" />
            <TextInput style={{ backgroundColor: theme.backgroundTertiary, borderRadius: 8, padding: 12, color: theme.textPrimary }} placeholder="升级所需金额" placeholderTextColor={theme.textMuted} value={form.min_amount} onChangeText={(text) => setForm({ ...form, min_amount: text })} keyboardType="numeric" />
            <View style={{ flexDirection: 'row', gap: 12 }}>
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
