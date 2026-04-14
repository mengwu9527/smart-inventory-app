/**
 * 蓝牙打印设置页面
 * 支持设备扫描、连接、测试打印等功能
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { createStyles } from './styles';
import {
  BluetoothDevice,
  PrinterStatus,
  scanBluetoothDevices,
  connectBluetoothDevice,
  disconnectBluetooth,
  getPrinterStatus,
  testPrint,
  initBluetooth,
  checkBluetoothPermission,
} from '@/services/bluetoothService';

export default function BluetoothScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [printerStatus, setPrinterStatus] = useState<PrinterStatus>({ connected: false });
  const [connectingDevice, setConnectingDevice] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // 加载打印机状态
  const loadPrinterStatus = useCallback(() => {
    const status = getPrinterStatus();
    setPrinterStatus(status);
  }, []);

  useEffect(() => {
    loadPrinterStatus();
  }, [loadPrinterStatus]);

  // 扫描蓝牙设备
  const handleScan = async () => {
    setIsScanning(true);
    try {
      const hasPermission = await checkBluetoothPermission();
      if (!hasPermission) {
        Alert.alert('权限不足', '需要蓝牙权限才能扫描设备');
        return;
      }

      const deviceList = await scanBluetoothDevices();
      setDevices(deviceList);
      
      if (deviceList.length === 0) {
        Alert.alert('提示', '未找到蓝牙设备，请确保打印机已开启');
      }
    } catch (error) {
      console.error('Scan error:', error);
      Alert.alert('错误', '扫描设备失败');
    } finally {
      setIsScanning(false);
    }
  };

  // 连接设备
  const handleConnect = async (device: BluetoothDevice) => {
    setConnectingDevice(device.id);
    try {
      const success = await connectBluetoothDevice(device);
      if (success) {
        setPrinterStatus({
          connected: true,
          deviceName: device.name,
          deviceAddress: device.address,
        });
        Alert.alert('成功', `已连接到 ${device.name}`);
      } else {
        Alert.alert('失败', '连接失败，请重试');
      }
    } catch (error) {
      console.error('Connect error:', error);
      Alert.alert('错误', '连接失败');
    } finally {
      setConnectingDevice(null);
    }
  };

  // 断开连接
  const handleDisconnect = async () => {
    Alert.alert(
      '确认断开',
      '确定要断开当前打印机连接吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          onPress: async () => {
            await disconnectBluetooth();
            setPrinterStatus({ connected: false });
            Alert.alert('成功', '已断开连接');
          },
        },
      ]
    );
  };

  // 测试打印
  const handleTestPrint = async () => {
    setIsTesting(true);
    try {
      const success = await testPrint();
      if (success) {
        Alert.alert('成功', '测试打印已发送');
      } else {
        Alert.alert('失败', '打印失败，请检查打印机状态');
      }
    } catch (error) {
      console.error('Test print error:', error);
      Alert.alert('错误', '打印失败');
    } finally {
      setIsTesting(false);
    }
  };

  // 渲染设备项
  const renderDeviceItem = (device: BluetoothDevice) => {
    const isConnecting = connectingDevice === device.id;
    const isCurrentDevice = printerStatus.deviceAddress === device.address;

    return (
      <TouchableOpacity
        key={device.id}
        style={[
          styles.deviceItem,
          isCurrentDevice && styles.deviceItemActive,
        ]}
        onPress={() => !isCurrentDevice && handleConnect(device)}
        disabled={isConnecting || isCurrentDevice}
      >
        <View style={styles.deviceIcon}>
          <FontAwesome6
            name="printer"
            size={24}
            color={isCurrentDevice ? theme.primary : theme.textSecondary}
          />
        </View>
        <View style={styles.deviceInfo}>
          <ThemedText variant="bodyMedium" color={theme.textPrimary}>
            {device.name}
          </ThemedText>
          <ThemedText variant="caption" color={theme.textMuted}>
            {device.address}
          </ThemedText>
          {device.bonded && (
            <View style={styles.bondedTag}>
              <ThemedText variant="caption" color={theme.primary}>
                已配对
              </ThemedText>
            </View>
          )}
        </View>
        <View style={styles.deviceAction}>
          {isConnecting ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : isCurrentDevice ? (
            <View style={styles.connectedBadge}>
              <FontAwesome6 name="check" size={14} color="#fff" />
            </View>
          ) : (
            <TouchableOpacity
              style={styles.connectButton}
              onPress={() => handleConnect(device)}
            >
              <ThemedText variant="caption" color="#fff">
                连接
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle={isDark ? 'light' : 'dark'}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isScanning}
            onRefresh={handleScan}
            colors={[theme.primary]}
          />
        }
      >
        {/* 当前连接状态 */}
        <ThemedView level="default" style={styles.section}>
          <ThemedText variant="h4" color={theme.textPrimary}>
            当前连接
          </ThemedText>
          {printerStatus.connected ? (
            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <FontAwesome6 name="bluetooth" size={20} color={theme.primary} />
                <ThemedText variant="bodyMedium" color={theme.textPrimary}>
                  {printerStatus.deviceName}
                </ThemedText>
              </View>
              <ThemedText variant="body" color={theme.textSecondary}>
                {printerStatus.deviceAddress}
              </ThemedText>
              <View style={styles.statusActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.testButton]}
                  onPress={handleTestPrint}
                  disabled={isTesting}
                >
                  {isTesting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <FontAwesome6 name="print" size={16} color="#fff" />
                      <ThemedText variant="body" color="#fff">测试打印</ThemedText>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.disconnectButton]}
                  onPress={handleDisconnect}
                >
                  <FontAwesome6 name="link-slash" size={16} color={theme.error} />
                  <ThemedText variant="body" color={theme.error}>断开</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.emptyStatus}>
              <FontAwesome6 name="bluetooth" size={40} color={theme.textMuted} />
              <ThemedText variant="body" color={theme.textSecondary}>
                未连接打印机
              </ThemedText>
              <ThemedText variant="caption" color={theme.textMuted}>
                扫描并连接蓝牙打印机以使用打印功能
              </ThemedText>
            </View>
          )}
        </ThemedView>

        {/* 设备列表 */}
        <ThemedView level="default" style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText variant="h4" color={theme.textPrimary}>
              可用设备
            </ThemedText>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={handleScan}
              disabled={isScanning}
            >
              {isScanning ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <>
                  <FontAwesome6 name="rotate" size={16} color={theme.primary} />
                  <ThemedText variant="body" color={theme.primary}>扫描</ThemedText>
                </>
              )}
            </TouchableOpacity>
          </View>

          {devices.length > 0 ? (
            <View style={styles.deviceList}>
              {devices.map(renderDeviceItem)}
            </View>
          ) : (
            <View style={styles.emptyDevices}>
              <FontAwesome6 name="magnifying-glass" size={40} color={theme.textMuted} />
              <ThemedText variant="body" color={theme.textSecondary}>
                点击上方扫描按钮查找设备
              </ThemedText>
            </View>
          )}
        </ThemedView>

        {/* 使用说明 */}
        <ThemedView level="default" style={styles.section}>
          <ThemedText variant="h4" color={theme.textPrimary}>
            使用说明
          </ThemedText>
          <View style={styles.helpList}>
            <View style={styles.helpItem}>
              <FontAwesome6 name="one" size={16} color={theme.primary} />
              <ThemedText variant="body" color={theme.textSecondary}>
                确保蓝牙打印机已开启并处于配对模式
              </ThemedText>
            </View>
            <View style={styles.helpItem}>
              <FontAwesome6 name="two" size={16} color={theme.primary} />
              <ThemedText variant="body" color={theme.textSecondary}>
                点击扫描按钮搜索附近的蓝牙设备
              </ThemedText>
            </View>
            <View style={styles.helpItem}>
              <FontAwesome6 name="three" size={16} color={theme.primary} />
              <ThemedText variant="body" color={theme.textSecondary}>
                选择目标打印机进行连接
              </ThemedText>
            </View>
            <View style={styles.helpItem}>
              <FontAwesome6 name="four" size={16} color={theme.primary} />
              <ThemedText variant="body" color={theme.textSecondary}>
                连接成功后可在销售单页面打印小票
              </ThemedText>
            </View>
          </View>
        </ThemedView>
      </ScrollView>
    </Screen>
  );
}
