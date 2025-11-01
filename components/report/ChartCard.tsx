import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React from 'react';
import { View } from 'react-native';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const ChartCard = React.memo(function ChartCard({
  title,
  subtitle,
  icon,
  children,
}: ChartCardProps) {
  return (
    <ThemedView
      className="bg-white rounded-2xl border border-gray-200 p-4 mb-4"
      style={{
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-1">
          <View className="flex-row items-center">
            {icon && <View className="mr-2">{icon}</View>}
            <ThemedText className="font-bold text-gray-900" style={{ fontSize: 16 }}>
              {title}
            </ThemedText>
          </View>
          {subtitle && (
            <ThemedText className="text-xs text-gray-500 mt-1">
              {subtitle}
            </ThemedText>
          )}
        </View>
      </View>
      
      {children}
    </ThemedView>
  );
});

