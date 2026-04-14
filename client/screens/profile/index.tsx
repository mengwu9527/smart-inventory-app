/**
 * 我的页面 - 系统设置、数据备份、关于
 */
import React, { useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FontAwesome6 } from '@expo/vector-icons';
import { createStyles } from './styles';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { getOperationLogStats, cleanOldLogs } from '@/services/logService';
import { initDatabase } from '@/services/database';

// 获取文档目录
const getDocumentDirectory = (): string => {
  // @ts-ignore - documentDirectory 存在于 legacy 模块中
  return FileSystem.documentDirectory || '';
};

export default function ProfileScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();

  const menuItems = [
    { icon: 'database', label: '客户等级管理', route: '/customer-level', color: '#8B5CF6' },
    { icon: 'tags', label: '商品分类管理', route: '/category', color: '#10B981' },
    { icon: 'print', label: '蓝牙打印设置', route: '/bluetooth', color: '#3B82F6' },
    { icon: 'chart-pie', label: '统计分析', route: '/stats', color: '#F59E0B' },
    { icon: 'list-check', label: '操作日志', route: '/logs', color: '#6366F1' },
  ];

  const handleBackup = async () => {
    try {
      const docDir = getDocumentDirectory();
      const dbPath = `${docDir}SQLite/jxc.db`;
      const backupPath = `${docDir}backups/jxc_${Date.now()}.db`;
      
      // 创建备份目录
      await FileSystem.makeDirectoryAsync(`${docDir}backups`, { intermediates: true });
      
      // 复制数据库文件
      await FileSystem.copyAsync({ from: dbPath, to: backupPath });
      
      // 分享备份文件
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(backupPath);
      } else {
        Alert.alert('成功', `备份已保存到: ${backupPath}`);
      }
    } catch (error) {
      console.error('Backup error:', error);
      Alert.alert('错误', '备份失败');
    }
  };

  const handleRestore = async () => {
    Alert.alert(
      '确认恢复',
      '恢复数据将覆盖当前所有数据，确定要继续吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          onPress: async () => {
            try {
              const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
              });

              if (result.canceled || !result.assets || result.assets.length === 0) return;

              const fileUri = result.assets[0].uri;
              const docDir = getDocumentDirectory();
              const dbPath = `${docDir}SQLite/jxc.db`;

              // 复制备份文件覆盖当前数据库
              await FileSystem.copyAsync({ from: fileUri, to: dbPath });

              // 重新初始化数据库
              await initDatabase();

              Alert.alert('成功', '数据已恢复，请重启应用');
            } catch (error) {
              console.error('Restore error:', error);
              Alert.alert('错误', '恢复失败');
            }
          },
        },
      ]
    );
  };

  const handleClearLogs = async () => {
    Alert.alert(
      '清理日志',
      '确定要清理90天前的操作日志吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          onPress: async () => {
            try {
              const count = await cleanOldLogs(90);
              Alert.alert('成功', `已清理 ${count} 条日志`);
            } catch (error) {
              console.error('Clear logs error:', error);
              Alert.alert('错误', '清理失败');
            }
          },
        },
      ]
    );
  };

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 应用信息 */}
        <ThemedView level="default" style={styles.appInfo}>
          <View style={styles.appIcon}>
            <FontAwesome6 name="box" size={40} color={theme.primary} />
          </View>
          <ThemedText variant="h3" color={theme.textPrimary}>智慧记进销存</ThemedText>
          <ThemedText variant="small" color={theme.textMuted}>版本 1.0.0</ThemedText>
          <ThemedText variant="small" color={theme.textMuted}>免费 · 无广告 · 离线可用</ThemedText>
        </ThemedView>

        {/* 功能菜单 */}
        <ThemedView level="default" style={styles.section}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => router.push(item.route)}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                <FontAwesome6 name={item.icon} size={20} color={item.color} />
              </View>
              <ThemedText variant="body" color={theme.textPrimary} style={styles.menuLabel}>
                {item.label}
              </ThemedText>
              <FontAwesome6 name="chevron-right" size={16} color={theme.textMuted} />
            </TouchableOpacity>
          ))}
        </ThemedView>

        {/* 数据管理 */}
        <ThemedView level="default" style={styles.section}>
          <ThemedText variant="h4" color={theme.textPrimary} style={styles.sectionTitle}>
            数据管理
          </ThemedText>

          <TouchableOpacity style={styles.actionItem} onPress={handleBackup}>
            <View style={[styles.actionIcon, { backgroundColor: '#10B98120' }]}>
              <FontAwesome6 name="cloud-arrow-up" size={20} color="#10B981" />
            </View>
            <View style={styles.actionContent}>
              <ThemedText variant="body" color={theme.textPrimary}>数据备份</ThemedText>
              <ThemedText variant="small" color={theme.textMuted}>导出数据库文件</ThemedText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={handleRestore}>
            <View style={[styles.actionIcon, { backgroundColor: '#3B82F620' }]}>
              <FontAwesome6 name="cloud-arrow-down" size={20} color="#3B82F6" />
            </View>
            <View style={styles.actionContent}>
              <ThemedText variant="body" color={theme.textPrimary}>数据恢复</ThemedText>
              <ThemedText variant="small" color={theme.textMuted}>从备份文件恢复</ThemedText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={handleClearLogs}>
            <View style={[styles.actionIcon, { backgroundColor: '#F59E0B20' }]}>
              <FontAwesome6 name="broom" size={20} color="#F59E0B" />
            </View>
            <View style={styles.actionContent}>
              <ThemedText variant="body" color={theme.textPrimary}>清理日志</ThemedText>
              <ThemedText variant="small" color={theme.textMuted}>清理90天前的操作日志</ThemedText>
            </View>
          </TouchableOpacity>
        </ThemedView>

        {/* 关于 */}
        <ThemedView level="default" style={styles.section}>
          <ThemedText variant="h4" color={theme.textPrimary} style={styles.sectionTitle}>
            关于
          </ThemedText>
          <ThemedText variant="body" color={theme.textSecondary}>
            智慧记进销存是一款完全免费、无广告、离线可用的进销存管理系统。支持商品多单位管理、客户分级价格、销售开单、库存管理、往来账管理、统计分析等完整功能。
          </ThemedText>
          <ThemedText variant="small" color={theme.textMuted} style={styles.copyright}>
            © 2024 智慧记团队 版权所有
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </Screen>
  );
}
