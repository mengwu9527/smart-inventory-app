/**
 * 蓝牙打印服务
 * 支持蓝牙设备扫描、连接、ESC/POS打印
 * 
 * 注意：由于 react-native-bluetooth-serial 需要原生模块，
 * 此处提供模拟实现，实际使用时需要安装对应的原生库
 */
import { Platform, PermissionsAndroid, Alert } from 'react-native';

export interface BluetoothDevice {
  id: string;
  name: string;
  address: string;
  bonded?: boolean;
}

export interface PrinterStatus {
  connected: boolean;
  deviceName?: string;
  deviceAddress?: string;
  error?: string;
}

let currentDevice: BluetoothDevice | null = null;
let mockConnected = false;

// 检查蓝牙权限
export async function checkBluetoothPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);

      const allGranted = Object.values(granted).every(
        result => result === PermissionsAndroid.RESULTS.GRANTED
      );

      if (!allGranted) {
        Alert.alert('权限提示', '需要蓝牙和位置权限才能使用打印功能');
        return false;
      }

      return true;
    } catch (err) {
      console.error('Permission check error:', err);
      return false;
    }
  }

  return true;
}

// 初始化蓝牙
export async function initBluetooth(): Promise<boolean> {
  try {
    const hasPermission = await checkBluetoothPermission();
    if (!hasPermission) return false;
    
    // 模拟初始化成功
    console.log('Bluetooth initialized');
    return true;
  } catch (error) {
    console.error('Init bluetooth error:', error);
    return false;
  }
}

// 扫描蓝牙设备
export async function scanBluetoothDevices(): Promise<BluetoothDevice[]> {
  try {
    const hasPermission = await checkBluetoothPermission();
    if (!hasPermission) return [];

    // 返回模拟设备列表
    // 实际使用时需要调用原生蓝牙 API
    return [
      { id: '1', name: '蓝牙打印机 1', address: '00:11:22:33:44:55', bonded: true },
      { id: '2', name: '蓝牙打印机 2', address: '00:11:22:33:44:66', bonded: false },
    ];
  } catch (error) {
    console.error('Scan devices error:', error);
    return [];
  }
}

// 连接蓝牙设备
export async function connectBluetoothDevice(device: BluetoothDevice): Promise<boolean> {
  try {
    const hasPermission = await checkBluetoothPermission();
    if (!hasPermission) return false;

    // 模拟连接
    console.log('Connecting to:', device.name);
    currentDevice = device;
    mockConnected = true;
    return true;
  } catch (error) {
    console.error('Connect error:', error);
    currentDevice = null;
    mockConnected = false;
    return false;
  }
}

// 断开蓝牙连接
export async function disconnectBluetooth(): Promise<void> {
  try {
    console.log('Disconnecting...');
    currentDevice = null;
    mockConnected = false;
  } catch (error) {
    console.error('Disconnect error:', error);
  }
}

// 获取当前连接状态
export function getPrinterStatus(): PrinterStatus {
  return {
    connected: mockConnected,
    deviceName: currentDevice?.name,
    deviceAddress: currentDevice?.address,
  };
}

// 测试打印
export async function testPrint(): Promise<boolean> {
  try {
    if (!currentDevice || !mockConnected) {
      throw new Error('未连接打印机');
    }

    console.log('Test print...');
    // 模拟打印成功
    return true;
  } catch (error) {
    console.error('Test print error:', error);
    return false;
  }
}

// 打印销售小票
export async function printSalesReceipt(data: {
  orderNo: string;
  customerName?: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitName: string;
    unitPrice: number;
    subtotal: number;
  }>;
  totalAmount: number;
  paidAmount: number;
  receivableAmount: number;
  paymentMethod: string;
  operator?: string;
  remark?: string;
  printQRCode?: boolean;
  shopName?: string;
  shopAddress?: string;
  shopPhone?: string;
}): Promise<boolean> {
  try {
    if (!currentDevice || !mockConnected) {
      throw new Error('未连接打印机');
    }

    console.log('Printing receipt:', data.orderNo);
    // 模拟打印成功
    return true;
  } catch (error) {
    console.error('Print error:', error);
    return false;
  }
}

// 打印库存盘点单
export async function printInventoryList(data: {
  title: string;
  items: Array<{
    productName: string;
    unitName: string;
    quantity: number;
  }>;
  operator?: string;
}): Promise<boolean> {
  try {
    if (!currentDevice || !mockConnected) {
      throw new Error('未连接打印机');
    }

    console.log('Printing inventory:', data.title);
    return true;
  } catch (error) {
    console.error('Print error:', error);
    return false;
  }
}
