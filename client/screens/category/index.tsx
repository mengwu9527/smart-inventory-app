/**
 * 商品分类管理页面
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
import { getCategories, createCategory, updateCategory, deleteCategory, Category } from '@/services/productService';

export default function CategoryScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');

  const loadData = useCallback(async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Load categories error:', error);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('提示', '请输入分类名称'); return; }
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, { name });
      } else {
        await createCategory({ name });
      }
      setModalVisible(false);
      loadData();
    } catch (error) {
      Alert.alert('错误', '保存失败');
    }
  };

  const handleDelete = (category: Category) => {
    Alert.alert('确认删除', `确定要删除分类"${category.name}"吗？`, [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: async () => { await deleteCategory(category.id); loadData(); } },
    ]);
  };

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      <ThemedView level="default" style={styles.header}>
        <TouchableOpacity style={styles.addButton} onPress={() => { setEditingCategory(null); setName(''); setModalVisible(true); }}>
          <FontAwesome6 name="plus" size={20} color={theme.buttonPrimaryText} />
          <ThemedText variant="smallMedium" color={theme.buttonPrimaryText}>添加分类</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.categoryCard}>
            <ThemedText variant="bodyMedium" color={theme.textPrimary}>{item.name}</ThemedText>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity onPress={() => { setEditingCategory(item); setName(item.name); setModalVisible(true); }}>
                <FontAwesome6 name="edit" size={16} color={theme.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item)}>
                <FontAwesome6 name="trash" size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: theme.backgroundDefault, borderRadius: 16, padding: 20, gap: 12 }}>
            <ThemedText variant="h4" color={theme.textPrimary}>{editingCategory ? '编辑分类' : '新增分类'}</ThemedText>
            <TextInput style={{ backgroundColor: theme.backgroundTertiary, borderRadius: 8, padding: 12, color: theme.textPrimary }} placeholder="分类名称" placeholderTextColor={theme.textMuted} value={name} onChangeText={setName} />
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
