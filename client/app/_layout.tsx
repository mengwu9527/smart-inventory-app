import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LogBox, View, ActivityIndicator, Text } from 'react-native';
import Toast from 'react-native-toast-message';
import { AuthProvider } from "@/contexts/AuthContext";
import { ColorSchemeProvider } from '@/hooks/useColorScheme';
import { initDatabase } from '@/services/database';
import { useState } from 'react';

LogBox.ignoreLogs([
  "TurboModuleRegistry.getEnforcing(...): 'RNMapsAirModule' could not be found",
]);

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function setupDatabase() {
      try {
        await initDatabase();
        setDbReady(true);
      } catch (err) {
        console.error('Database initialization failed:', err);
        setError(err instanceof Error ? err.message : '数据库初始化失败');
      }
    }
    setupDatabase();
  }, []);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text style={{ color: 'red', fontSize: 16 }}>{error}</Text>
      </View>
    );
  }

  if (!dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 16, color: '#64748B' }}>正在初始化数据库...</Text>
      </View>
    );
  }

  return (
    <AuthProvider>
      <ColorSchemeProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar style="auto"></StatusBar>
          <Stack screenOptions={{
            animation: 'slide_from_right',
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            headerShown: false
          }}>
            <Stack.Screen name="(tabs)" options={{ title: "" }} />
            <Stack.Screen name="customer" options={{ title: "客户管理" }} />
            <Stack.Screen name="supplier" options={{ title: "供应商管理" }} />
            <Stack.Screen name="purchase" options={{ title: "采购入库" }} />
            <Stack.Screen name="finance" options={{ title: "往来账管理" }} />
            <Stack.Screen name="stats" options={{ title: "统计分析" }} />
            <Stack.Screen name="print" options={{ title: "打印管理" }} />
            <Stack.Screen name="bluetooth" options={{ title: "蓝牙设置" }} />
            <Stack.Screen name="logs" options={{ title: "操作日志" }} />
            <Stack.Screen name="customer-level" options={{ title: "客户等级" }} />
            <Stack.Screen name="category" options={{ title: "商品分类" }} />
            <Stack.Screen name="sale-records" options={{ title: "销售记录" }} />
            <Stack.Screen name="sale-detail" options={{ title: "订单详情" }} />
            <Stack.Screen name="finance-detail" options={{ title: "往来账详情" }} />
          </Stack>
          <Toast />
        </GestureHandlerRootView>
      </ColorSchemeProvider>
    </AuthProvider>
  );
}
