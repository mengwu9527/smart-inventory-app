import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome6 } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

export default function TabLayout() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: theme.backgroundDefault,
        borderTopColor: theme.border,
        height: Platform.OS === 'web' ? 60 : 50 + insets.bottom,
        paddingBottom: Platform.OS === 'web' ? 0 : insets.bottom,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      tabBarActiveTintColor: theme.primary,
      tabBarInactiveTintColor: theme.textMuted,
      tabBarItemStyle: {
        height: Platform.OS === 'web' ? 60 : undefined,
      },
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '500',
      },
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="house" size={20} color={color} solid />
          ),
        }}
      />
      <Tabs.Screen
        name="product"
        options={{
          title: '商品',
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="box" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sale"
        options={{
          title: '销售',
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="cart-shopping" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: '库存',
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="warehouse" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="user" size={20} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
