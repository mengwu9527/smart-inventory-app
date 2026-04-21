import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';

export default function LogsScreen() {
  const { theme } = useTheme();
  
  return (
    <Screen>
      <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View style={{ padding: 16 }}>
          <ThemedText>日志页面</ThemedText>
          <Text style={{ color: theme.colors.textSecondary, marginTop: 8 }}>
            暂无日志记录
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
