/**
 * 打印管理页面
 */
import React, { useMemo, useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FontAwesome6 } from '@expo/vector-icons';
import { createStyles } from './styles';
import { initBluetooth, scanBluetoothDevices, connectBluetoothDevice, disconnectBluetooth, testPrint, BluetoothDevice, getPrinterStatus } from '@/services/bluetoothService';

export default function PrintScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [connected, setConnected] = useState(false);
  const [scanning, setScanning] = useState(false);

  const handleScan = async () => {
    setScanning(true);
    try {
      const success = await initBluetooth();
      if (success) {
        const results = await scanBluetoothDevices();
        setDevices(results);
      } else {
        Alert.alert('错误', '请开启蓝牙');
      }
    } catch (error) {
      Alert.alert('错误', '扫描失败');
    }
    setScanning(false);
  };

  const handleConnect = async (device: BluetoothDevice) => {
    const success = await connectBluetoothDevice(device);
    if (success) {
      setConnected(true);
      Alert.alert('成功', '已连接');
    } else {
      Alert.alert('错误', '连接失败');
    }
  };

  const handleDisconnect = async () => {
    await disconnectBluetooth();
    setConnected(false);
  };

  const handleTestPrint = async () => {
    const success = await testPrint();
    Alert.alert(success ? '成功' : '错误', success ? '打印测试成功' : '打印失败');
  };

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView level="default" style={styles.section}>
          <View style={styles.statusRow}>
            <FontAwesome6 name={connected ? 'check-circle' : 'times-circle'} size={24} color={connected ? '#10B981' : '#EF4444'} />
            <View>
              <ThemedText variant="bodyMedium" color={theme.textPrimary}>{connected ? '已连接' : '未连接'}</ThemedText>
              <ThemedText variant="small" color={theme.textMuted}>{getPrinterStatus().deviceName || '未选择设备'}</ThemedText>
            </View>
          </View>

          <TouchableOpacity style={styles.scanButton} onPress={handleScan} disabled={scanning}>
            <FontAwesome6 name={scanning ? 'spinner' : 'bluetooth'} size={20} color={theme.buttonPrimaryText} />
            <ThemedText variant="bodyMedium" color={theme.buttonPrimaryText}>{scanning ? '扫描中...' : '扫描设备'}</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {devices.length > 0 && (
          <ThemedView level="default" style={styles.section}>
            <ThemedText variant="h4" color={theme.textPrimary}>可用设备</ThemedText>
            {devices.map((device, index) => (
              <TouchableOpacity key={index} style={styles.deviceItem} onPress={() => handleConnect(device)}>
                <FontAwesome6 name="print" size={20} color={theme.textPrimary} />
                <View style={{ flex: 1 }}>
                  <ThemedText variant="body" color={theme.textPrimary}>{device.name}</ThemedText>
                  <ThemedText variant="small" color={theme.textMuted}>{device.address}</ThemedText>
                </View>
                <FontAwesome6 name="chevron-right" size={16} color={theme.textMuted} />
              </TouchableOpacity>
            ))}
          </ThemedView>
        )}

        {connected && (
          <ThemedView level="default" style={styles.section}>
            <TouchableOpacity style={styles.actionButton} onPress={handleTestPrint}>
              <FontAwesome6 name="print" size={20} color={theme.primary} />
              <ThemedText variant="body" color={theme.textPrimary}>打印测试</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleDisconnect}>
              <FontAwesome6 name="link-slash" size={20} color="#EF4444" />
              <ThemedText variant="body" color="#EF4444">断开连接</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}
      </ScrollView>
    </Screen>
  );
}
